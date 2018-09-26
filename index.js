#!/usr/bin/env node
const _        = require('lodash');
const fs       = require('fs-extra');
const path     = require('path');
const child_process = require('child_process');
const yargs    = require('yargs');
const yaml     = require('js-yaml');

const Loader = require('./lib/inspect/loader');
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

    let loader = new Loader();
    let checks = await loader.loadChecks(criteria_path);

    for( let check of checks )
    {
        let instance = new check.module(connector);
        let context = { bakerPath: baker_path };
        
        console.log(`checking ${check.name}`);
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
}
