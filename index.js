#!/usr/bin/env node
const fs       = require('fs-extra');
const path     = require('path');
const yargs    = require('yargs');
const yaml     = require('js-yaml');
const chalk    = require('chalk');

const Profile = require('./lib/profile');
const Loader = require('./lib/inspect/checks/loader');
const Reporter = require('./lib/inspect/report');
const Connector = require('infra.connectors');

async function verify(env_address, criteria_path, connector) {
    let reporter  = new Reporter();

    let context = { bakerPath: env_address };

    let loader = new Loader();
    let groups = await loader.loadChecks(criteria_path);

    console.log();
    console.log(chalk.underline('Checks'));

    for (let group of groups) {
        console.log(chalk`\n\t{bold ${group.description}\n}`);

        for (let check of group.checks) {
            let instance = new check.module(connector, reporter);

            console.log(chalk`\t{white ${check.name} check}`);
            let results = await instance.check(context, check.args);
            if (check.args && check.args.comment) {
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
    let opts = {};
    let optsCheck = {inCWD: false}; 
    let name;

    if (connectorType === 'baker') {
        name = path.join(connectorInfo.target, 'baker.yml');
    } else if (connectorType === 'vagrant') {
        name = connectorInfo.name;
        opts['inCWD'] = false;
    } else if (connectorType === 'docker') {
        name = connectorInfo.name;
    } else if (connectorType === 'ssh') {
        name = connectorInfo.target; 
        opts['private_key'] = connectorInfo.private_key;
    }

    if((await fs.exists(path.join(connectorInfo.target, 'baker.yml'))) || ((await (Connector.getConnector('vagrant', name, optsCheck)).getStatus(connectorInfo.name)).status === 'running')
        || (await (Connector.getConnector('docker', name, opts)).containerExists()) || (connectorInfo.target.match(/[@:]+/))){
            connector = Connector.getConnector(connectorType, name, opts);
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
    let name;
    let opts = {};
    let optsCheck = {inCWD: false}; 
    let connectorTypeLocal;
    
    if (argv.env_address === 'local' || argv.env_address === 'localhost') {
        connectorTypeLocal = 'local';
    } else if (!argv.env_address && await fs.exists(path.join(cwd, 'baker.yml'))) {
        connectorTypeLocal = 'baker';
        name = path.join(cwd, 'baker.yml');
    } else if (!argv.env_address && await fs.exists(path.join(cwd, 'Vagrantfile'))) {
        connectorTypeLocal = 'vagrant';
        name = path.join(cwd, 'Vagrantfile');
        opts['inCWD'] = true;
    } else if (argv.env_address && await fs.exists(path.resolve(argv.env_address))) {
        connectorTypeLocal = 'baker';
        name = path.resolve(argv.env_address);
    } else if (argv.env_address && argv.env_address.match(/[@:]+/)) {
        //connector = new SSHConnector(argv.env_address, argv.ssh_key);
        connectorTypeLocal = 'ssh';
        name = argv.env_address;
        opts['privateKey'] = argv.ssh_key;
    } else if (argv.env_address && (await (Connector.getConnector('vagrant', argv.env_address, optsCheck)).getStatus(argv.env_address)).status === 'running') {
        connectorTypeLocal = 'vagrant';
        opts['inCWD'] = false;
        name = argv.env_address;
    } else if (argv.env_address && await (await (Connector.getConnector('docker', argv.env_address, opts)).containerExists())) {
        name = (argv.env_address || argv.container);
    }

    connector = Connector.getConnector(connectorTypeLocal, name, opts);

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

    await verify('local', file, Connector.getConnector('local', '', {}));
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
