#!/usr/bin/env node

const _ = require( 'lodash' );
const fs = require( 'fs-extra' );
const path = require( 'path' );
const child_process = require( 'child_process' );
const yargs = require( 'yargs' );
const yaml = require( 'js-yaml' );
const chalk = require( 'chalk' );

const Loader = require( './lib/inspect/checks/loader' );
const Reporter = require( './lib/inspect/report' );
const BakerConnector = require( './lib/harness/baker' );
const SSHConnector = require( './lib/harness/ssh' );
const VagrantConnector = require( './lib/harness/vagrant' );

// Register run command
yargs.command( 'verify [env_address] [criteria_path]', 'Verify an instance', ( yargs ) => {

    yargs.positional( 'ssh_key', {
        describe: 'required when using ssh connector. give path to private ssh key',
        type: 'string',
        alias: 'i'
    } );

}, async ( argv ) => {
    // Get id and source directory
    let connector_type = argv.ssh_key ? 'ssh' : argv.container ? 'docker' : 'baker';
    connector_type = argv.vagrant ? 'vagrant' : connector_type;
    let env_address = argv.container || argv.env_address || process.cwd();
    let criteria_path = argv.criteria_path;
    // let vm = argv.vagrant;
    // console.log( env_address );

    // Default to baker_path
    if ( !criteria_path ) {
        // TODO: this needs cleanup, trying to get it to work...
        criteria_path = path.join( argv.ssh_key ? process.cwd() : env_address, 'test', 'opunit.yml' );
        if ( !fs.existsSync( criteria_path ) ) {
            console.error( chalk.red( 'Checks file was not provided, nor was default path found in test/opunit.yml' ) );
            process.exit( 1 );
        }
    }
    env_address = argv.vagrant ? argv.vagrant : env_address;

    await main( env_address, criteria_path, connector_type, argv.ssh_key );
} );

// Turn on help and access argv
yargs.help().argv;

async function main( env_address, criteria_path, connector_type, ssh_key ) {
    await verify( env_address, criteria_path, connector_type, ssh_key );
}

async function verify( env_address, criteria_path, connector_type, ssh_key ) {
    let connector = null;
    if ( connector_type === 'ssh' )
        connector = new SSHConnector( env_address, ssh_key );
    else if ( connector_type === 'baker' )
        connector = new BakerConnector();
    else if ( connector_type === 'vagrant' ) {
        connector = new VagrantConnector();
        await connector.getSshConfig( env_address );
    }
    let reporter = new Reporter();

    try {
        await connector.ready();
    } catch ( err ) {
        console.log( "Host is not running" );
        return;
    }

    let loader = new Loader();
    let checks = await loader.loadChecks( criteria_path );

    console.log();
    console.log( chalk.underline( 'Checks' ) )
    console.log()

    for ( let check of checks ) {
        let instance = new check.module( connector, reporter );
        let context = {
            bakerPath: env_address
        };

        console.log( chalk `\t{bold ${check.name} check}` );
        let results = await instance.check( context, check.args );
        instance.report( results );
    }
    reporter.summary();
}