#!/usr/bin/env node
const _        = require('lodash');
const Bluebird = require('bluebird');
const fs       = require('fs-extra');
const path     = require('path');
const child_process = require('child_process');
const yargs    = require('yargs');
const yaml     = require('js-yaml');

const Loader = require('./lib/inspect/loader');

const DockerTools = require('./lib/harness/dockertools');
const Ansible = require('./lib/harness/ansible');
const Repos = require('./lib/harness/repos');

let tools = new DockerTools();
let ansible = new Ansible();
let repos = new Repos();

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
    let homeworks = require(hws_path);
    
    // Remove previous containers
    await tools.removeContainers();

    for( let hw of homeworks )
    {
        await grade(hw, criteria_path);
    }
}

async function grade(hw, criteria_path)
{
    // Prepare local directory for storing homework projects
    let hws_path  = path.resolve(process.cwd(), `.homeworks`);
    let hw_path  = path.resolve(hws_path, `hw-${hw.id}`);
    fs.mkdirpSync(hws_path);

    // Retrieve student repo and clone locally.
    await repos.clonerepo(hw, hw_path);

    // Parse autograde requirements
    let autogradeYML = yaml.safeLoad(fs.readFileSync(`${hw_path}/.autograde.yml`))
    console.log(JSON.stringify(autogradeYML));

    const dockerImage = 'phusion/passenger-full:latest';
    // Ensure image exists
    await tools.pull(dockerImage);
    
    // Create docker container for each host
    for( host of autogradeYML.ansible_hosts )
    {
        // Create and start container
        await tools.run(dockerImage, '/bin/bash', `${hw.id}-${host}`);
    }

    // Create inventory
    ansible.makeInventory(hw_path, hw, autogradeYML);

    // Run student playbook against inventory
    await ansible.playbook(hw_path, autogradeYML, false);

    // Grade....
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
