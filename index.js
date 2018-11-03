#!/usr/bin/env node
const _        = require('lodash');
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
        alias: 'i'
    });

    yargs.positional('container', {
        describe: 'required when using docker connector. give name or id of your container',
        type: 'string',
        alias: 't'
    });
}, async (argv) => {
    // Get id and source directory
    let connector_type = argv.ssh_key ? 'ssh' : argv.container ? 'docker' : 'baker';
    let env_address = argv.container || argv.env_address || process.cwd();
    let criteria_path = argv.criteria_path;

    // Default to baker_path
    if (!criteria_path) {
        // TODO: this needs cleanup, trying to get it to work...
        criteria_path = path.join(argv.ssh_key || argv.docker ? process.cwd() : env_address, 'test', 'opunit.yml');
        if( !fs.existsSync(criteria_path) )
        {
            console.error(chalk.red('Checks file was not provided, nor was default path found in test/opunit.yml'));
            process.exit(1);
        }
    }

    await main(env_address, criteria_path, connector_type, {ssh_key: argv.ssh_key, container: argv.container});
});

// Turn on help and access argv
yargs.help().argv;

async function main(env_address, criteria_path, connector_type, args)
{
    await verify(env_address, criteria_path, connector_type, args);
}

async function verify(env_address, criteria_path, connector_type, args)
{
    let connector = null;
    if (connector_type === 'ssh')
        connector = new SSHConnector(env_address, args.ssh_key);
    else if (connector_type === 'baker')
        connector = new BakerConnector();
    else if (connector_type === 'docker')
        connector = new DockerConnector(args.container);
    let reporter  = new Reporter();

    try {
        await connector.ready();
    } catch (error) {
        console.error(chalk.red(` => ${error}`));
        process.exit(1);
    }

    let loader = new Loader();
    let checks = await loader.loadChecks(criteria_path);

    console.log();
    console.log(chalk.underline('Checks'))
    console.log()

    for( let check of checks )
    {
        let instance = new check.module(connector, reporter);
        let context = { bakerPath: env_address };
        
        console.log(chalk`\t{bold ${check.name} check}`);
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
    reporter.summary();
}
