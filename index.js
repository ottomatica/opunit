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

// Register run command
yargs.command('verify <baker_path> <criteria_path>', 'Verify an instance', (yargs) => {

    // yargs.positional('repo_url', {
    //     describe: 'Repository URL',
    //     type: 'string'
    // });

}, async (argv) => {
    // Get id and source directory
    let baker_path = argv.baker_path;
    let criteria_path = argv.criteria_path;

    // Default to baker_path
    if( !criteria_path )
    {
        criteria_path = path.join(baker_path, 'opunit.yml');
    }

    await main(baker_path, criteria_path);
});

// Turn on help and access argv
yargs.help().argv;

async function main(baker_path, criteria_path)
{
    await verify(baker_path, criteria_path);
}

async function verify(baker_path, criteria_path)
{
    let connector = new BakerConnector();
    let reporter  = new Reporter();

    let loader = new Loader();
    let checks = await loader.loadChecks(criteria_path);

    console.log();
    console.log(chalk.underline('Checks'))
    console.log()

    for( let check of checks )
    {
        let instance = new check.module(connector, reporter);
        let context = { bakerPath: baker_path };
        
        console.log(chalk`\t{bold ${check.name} check}`);
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
    reporter.summary();
}
