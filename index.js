#!/usr/bin/env node
const fs       = require('fs-extra');
const path     = require('path');
const yargs    = require('yargs');
const yaml     = require('js-yaml');
const chalk    = require('chalk');

const Profile = require('./lib/profile');
const Loader = require('./lib/inspect/checks/loader');
const Reporter = require('./lib/inspect/report');
const BakerConnector = require('./lib/harness/baker');
const SSHConnector = require('./lib/harness/ssh');
const DockerConnector = require('./lib/harness/docker');
const VagrantConnector = require('./lib/harness/vagrant');
const LocalConnector = require('./lib/harness/local');

async function verify(env_address, criteria_path, connector) {
    let reporter  = new Reporter();

    let context = { bakerPath: env_address };

    let loader = new Loader();
    let groups = await loader.loadChecks(criteria_path);

    console.log();
    console.log(chalk.underline('Checks'));

    for (let group of groups) {

        console.log(chalk`\n\t{bold ${group.description}\n}`);

        for( let check of group.checks ) {
            let instance = new check.module(connector, reporter);

            console.log(chalk`\t{white ${check.name} check}`);
            let results = await instance.check(context, check.args);
            if( check.args && check.args.comment )
            {
                console.log(chalk`\t\t{italic.gray ${check.args.comment}}`);
            }
            instance.report(results);
        }
    }
    reporter.summary();
}

async function main(env_address, criteria_path, connector) {
    await verify(env_address, criteria_path, connector);
}

async function selectConnectorFromInventory(connectorType, connectorInfo, argv) {
    // TODO: is this always needed?
    let env_address = connectorInfo.target || connectorInfo.instance || connectorInfo.name;
    let criteria_path = connectorInfo.criteria_path || argv.criteria_path;

    if (!criteria_path) {
        criteria_path = path.join(process.cwd(), 'test', 'opunit.yml');
        if (!fs.existsSync(criteria_path)) {
            console.error(chalk.red(`${connectorType}: criteria file (opunit.yml) was not provided, nor was default path found in test/opunit.yml`));
            console.error(chalk.red('Skipping...'));
            process.exit(1);
        }
    }

    let connector = null;

    if (connectorType === 'baker' && await fs.exists(path.join(connectorInfo.target, 'Baker.yml'))) {
        connector = new BakerConnector();
    } else if (connectorType === 'vagrant' && (await (new VagrantConnector(false, connectorInfo.name)).getStatus(connectorInfo.name)).status === 'running') {
        connector = new VagrantConnector(false, connectorInfo.name);
    } else if (connectorType === 'docker' && await (new DockerConnector(connectorInfo.name)).containerExists()) {
        connector = new DockerConnector(connectorInfo.name);
    } else if (connectorType === 'ssh' && connectorInfo.target.match(/[@:]+/)) {
        connector = new SSHConnector(connectorInfo.target, connectorInfo.private_key);
    }

    if (!connector) {
        console.error(chalk.red(' => No running environment could be found with the given parameters:'), connectorType, connectorInfo);
        console.error(chalk.red(' => Skipping...'));
        return [null, null, null];
    }

    try {
        // TODO: refactoring
        let context = { bakerPath: connectorInfo.target };
        await connector.ready(context);
    } catch (error) {
        console.error(chalk.red(` => ${error}`));
        console.error(chalk.red(' => Skipping...'));
        return [null, null, null];
    }

    return [connector, env_address, criteria_path];
}

async function selectConnector(argv) {
    const cwd = process.cwd();
    let connector = null;

    if (argv.env_address === 'local' || argv.env_address === 'localhost') {
        connector = new LocalConnector();
    } else if (!argv.env_address && await fs.exists(path.join(cwd, 'Baker.yml'))) {
        connector = new BakerConnector();
    } else if (!argv.env_address && await fs.exists(path.join(cwd, 'Vagrantfile'))) {
        connector = new VagrantConnector(true);
    } else if (argv.env_address && argv.env_address.match(/[@:]+/)) {
        connector = new SSHConnector(argv.env_address, argv.ssh_key);
    } else if (argv.env_address && (await (new VagrantConnector(false, argv.env_address)).getStatus(argv.env_address)).status === 'running') {
        connector = new VagrantConnector(false, argv.env_address);
    } else if (argv.env_address && await (new DockerConnector(argv.env_address)).containerExists()) {
        connector = new DockerConnector(argv.env_address || argv.container);
    }

    if (!connector) {
        console.error(chalk.red(' => No running environment could be found with the given name'));
        process.exit(1);
    }

    try {
        let context = { bakerPath: argv.env_address || process.cwd() };
        await connector.ready(context);
    } catch (error) {
        console.error(chalk.red(` => ${error}`));
        process.exit(1);
    }

    return connector;
}


// Register run command
yargs.command('profile <address>', 'Run check against specified profile ', (yargs) => { }, async (argv) => {
    let profile = new Profile();
    let repo = argv.address.split(':')[0];
    let yml = argv.address.split(':')[1];

    // let file = await profile.get('CSC-DevOps/profile', '326.yml')
    let file = await profile.get(repo, yml);

    await verify('local', file, new LocalConnector());
});

yargs.command('verify [env_address]', 'Verify an instance', (yargs) => {
    yargs.positional('criteria_path', {
        describe: 'path to the opunit.yml file, default is cwd/test/opunit.yml',
        type: 'string',
        alias: 'c',
    });

    yargs.positional('ssh_key', {
        describe: 'required when using ssh connector. give path to private ssh key',
        type: 'string',
    });

    yargs.positional('container', {
        describe: 'required when using docker connector. give name or id of your container',
        type: 'string',
        alias: 't',
    });

    yargs.positional('inventory', {
        describe: 'path to inventory file',
        type: 'string',
        alias: 'i',
    });
}, async (argv) => {
    if (argv.inventory) {
        let inventory = yaml.safeLoad(await fs.readFile(argv.inventory, 'utf8'));
        for (let group of inventory) {
            let connectorType = Object.keys(group)[0];

            for (let connectorInfo of group[connectorType]) {
                console.log('\n===================================');
                console.log(`Connector: ${connectorType}`);
                console.log(`Info: ${JSON.stringify(connectorInfo)}`);
                console.log('===================================');

                let [connector, env_address, criteria_path] = await selectConnectorFromInventory(connectorType, connectorInfo, argv);

                if (connector && env_address && criteria_path) {
                    await main(env_address, criteria_path, connector);
                }
            }
        }
    } else {
        let connector = await selectConnector(argv);
        let env_address = argv.env_address || process.cwd();
        let { criteria_path } = argv;

        // Default to baker_path
        if (!criteria_path) {
            // TODO: this needs cleanup, trying to get it to work...
            criteria_path = path.join(process.cwd(), 'test', 'opunit.yml');
            if (!fs.existsSync(criteria_path)) {
                console.error(chalk.red('Checks file was not provided, nor was default path found in test/opunit.yml'));
                process.exit(1);
            }
        }

        await main(env_address, criteria_path, connector, { ssh_key: argv.ssh_key, container: argv.container });
    }
});

// Turn on help and access argv
yargs.help().argv;
