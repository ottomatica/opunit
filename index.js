#!/usr/bin/env node
const _        = require('lodash');
const fs       = require('fs-extra');
const path     = require('path');
const child_process = require('child_process');
const yargs    = require('yargs');
const yaml     = require('js-yaml');

const Loader = require('./lib/inspect/loader');

// Register run command
yargs.command('grade <hws_path> <criteria_path>', 'Grade a repo that has grader.yml', (yargs) => {

    yargs.positional('repo_url', {
        describe: 'Repository URL',
        type: 'string'
    });

}, async (argv) => {
    // Get id and source directory
    let hws_path = argv.hws_path;
    let criteria_path = argv.criteria_path;

    await main(hws_path, criteria_path);
});

// Turn on help and access argv
yargs.help().argv;

async function main(hws_path, criteria_path)
{

}

async function verify(hw_path, criteria_path)
{
    let loader = new Loader();
    let checks = await loader.loadChecks(criteria_path);

    for( let check of checks )
    {
        let instance = new check.module();
        let context = { container: `${hw.id}-${check.host}`, 
            host: check.host, hw_path: hw_path, hws_path: hws_path, hw: hw, autogradeYML: autogradeYML };
        
        console.log(`checking ${check.name}`);
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
}
