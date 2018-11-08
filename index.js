#!/usr/bin/env node
const fs       = require('fs-extra');
const path     = require('path');
const child_process = require('child_process');
const yargs    = require('yargs');
const yaml     = require('js-yaml');
const chalk    = require('chalk');

const Loader = require('./lib/inspect/checks/loader');
const Reporter = require('./lib/inspect/report');
const BakerConnector = require('./lib/harness/baker');
const SSHConnector = require('./lib/harness/ssh');
const DockerConnector = require('./lib/harness/docker');
const VagrantConnector = require( './lib/harness/vagrant' );

// Register run command
yargs.command('verify [env_address]', 'Verify an instance', (yargs) => {
    yargs.positional('criteria_path', {
        describe: 'path to the opunit.yml file, default is cwd/test/opunit.yml',
        type: 'string',
        alias: 'c'
    });

    yargs.positional('ssh_key', {
        describe: 'required when using ssh connector. give path to private ssh key',
        type: 'string',
    });

    yargs.positional('container', {
        describe: 'required when using docker connector. give name or id of your container',
        type: 'string',
        alias: 't'
    });

    yargs.positional('inventory', {
        describe: 'path to inventory file',
        type: 'string',
        alias: 'i'
    });

}, async (argv) => {

    if(argv.inventory) {
        let inventory = yaml.safeLoad(await fs.readFile(argv.inventory, 'utf8'));
        for(let group of inventory) {
            let connector_type = Object.keys(group)[0];

            for(let i = 0; i < group[connector_type].length; i++) {

                console.log('\n', group[connector_type][i], '\n');
                let env_address = group[connector_type][i].target || group[connector_type][i].instance;
                let criteria_path = group[connector_type][i].criteria_path || argv.criteria_path;
                
                if (!criteria_path) {
                    criteria_path =  path.join(process.cwd(), 'test', 'opunit.yml');
                    if( !fs.existsSync(criteria_path) )
                    {
                        console.error(chalk.red(`${connector_type}: criteria file (opunit.yml) was not provided, nor was default path found in test/opunit.yml`));
                        console.error(chalk.red(`Skipping...`));
                        continue;
                    }
                }
    
                await main(env_address, criteria_path, connector_type, {ssh_key: group.ssh ? (group.ssh[i].private_key || group.ssh[i].ssh_key) : undefined, container: group.docker ? group.docker[i].name || group.docker[i].id : undefined});
            }
        }
    }

    else {
        let connector = await selectConnector(argv);
        let env_address = argv.env_address || process.cwd();
        let criteria_path = argv.criteria_path;

        // Default to baker_path
        if (!criteria_path) {
            // TODO: this needs cleanup, trying to get it to work...
            criteria_path = path.join(process.cwd(), 'test', 'opunit.yml');
            if( !fs.existsSync(criteria_path) )
            {
                console.error(chalk.red('Checks file was not provided, nor was default path found in test/opunit.yml'));
                process.exit(1);
            }
        }

        await main(env_address, criteria_path, connector, {ssh_key: argv.ssh_key, container: argv.container});
    }
});

// Turn on help and access argv
yargs.help().argv;

async function main(env_address, criteria_path, connector, args)
{
    await verify(env_address, criteria_path, connector, args);
}

async function verify(env_address, criteria_path, connector)
{

    let reporter  = new Reporter();

    let context = { bakerPath: env_address };

    let loader = new Loader();
    let checks = await loader.loadChecks(criteria_path);

    console.log();
    console.log(chalk.underline('Checks'))
    console.log()

    for( let check of checks )
    {
        let instance = new check.module(connector, reporter);
        
        console.log(chalk`\t{bold ${check.name} check}`);
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
    reporter.summary();
}

async function selectConnector(argv) {

    const cwd = process.cwd();
    let connector = null;

    if (!argv.env_address && await fs.exists(path.join(cwd, 'Baker.yml'))) {
        connector = new BakerConnector();
    }

    else if (!argv.env_address && await fs.exists(path.join(cwd, 'Vagrantfile'))) {
        connector = new VagrantConnector(true);
    }

    else if (argv.env_address && argv.env_address.match(/[@:]+/)) {
        connector = new SSHConnector(argv.env_address, argv.ssh_key);
    }

    else if ( argv.env_address && await vagrantVMExists( argv.env_address ) ) {
        connector = new VagrantConnector( false, argv.env_address );
    }

    else if (argv.env_address && await (new DockerConnector(argv.env_address)).containerExists()) {
        connector = new DockerConnector(argv.env_address || argv.container);
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

async function vagrantVMExists( env_address ) {
    return new Promise( function ( resolve, reject ) {
        child_process.exec( `vagrant global-status`, ( error, stdout, stderr ) => {
            if ( error || stderr ) {
                console.error( `=> ${error}, ${stderr}` );
                reject( error );
            } else {
                const data_by_line = stdout.split( '\n' );
                let does_exist = false;

                for ( data of data_by_line ) {
                    data = data.trim().split( ' ' ).filter( function ( item ) {
                        return item != '';
                    } );

                    if ( data[ 1 ] === env_address ) {
                        does_exist = true;
                        break;
                    }
                }
                resolve( does_exist );
            }
        } );
    } );
}
