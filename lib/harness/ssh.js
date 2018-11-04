const fs            = require('fs-extra');
const child_process = require('child_process');
const Client         = require('ssh2').Client;
const chalk = require( 'chalk' );

class SSHConnector {

    constructor(userHost, private_key) {
        let userHostSplit = userHost.split(/[@:]+/);
        // TODO: better validation
        if (userHostSplit.length < 2)
            throw new Error(`Couldn't parse provided host information. Correct format is 'user@hostname:port'`);
        this.sshConfig = {
            user: userHostSplit[0],
            hostname: userHostSplit[1],
            port: userHostSplit[2] ? userHostSplit[2] : 22,
            private_key
        };
    }

    async getContainerIp(context) {
        return this.sshConfig.hostname;
    }

    async ready() {
        await this._JSSSHExec( "baker ssh", this.sshConfig );
        return true;
    }

    async setup(context, setup) {
        return new Promise(function (resolve, reject) {

            if (setup && setup.cmd) {
                console.log(`\tSetup: ${setup.cmd}`);
                let child = child_process.spawn(`${setup.cmd}`, { shell: true });

                child.stderr.on('data', function (error) {
                    console.error(error);
                    reject({ error: error });
                })

                child.stdout.on('data', function (data) {
                    if (setup.wait_for) {
                        if (data.indexOf(setup.wait_for) != -1) {
                            console.log(`\tResolved wait_for condition: Stdout matches "${setup.wait_for}"`);
                            resolve({ child: child });
                        }
                    }
                });
            }
        });
    }
 
    async exec(context, cmd) {
        return await this._JSSSHExec(cmd, this.sshConfig);
    }

    async _JSSSHExec( cmd, sshConfig, timeout = 5000, verbose = false, options = {
        count: 0
    } ) {
        let buffer = "";
        return new Promise((resolve, reject) => {
            var c = new Client();
            const self = this;
            c
                .on('ready', function () {
                    c.exec(cmd, options, function (err, stream) {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }
                        stream
                            .on('close', function (code, signal) {
                                c.end();
                                resolve(buffer);
                            })
                            .on('data', function (data) {
                                if (verbose) {
                                    process.stdout.write( data );
                                }
                                buffer += data;
                            })
                            .stderr.on('data', function (data) {
                                if( verbose )
                                {
                                    process.stderr.write( data );
                                }
                                // We add stderr to same output.
                                buffer += data;
                            });
                    });
                }).on('error', function(err)
                {
                    if ( options.count === 6 ) { 
                        console.error( chalk.red( ' => Host is not ready' ) );
                        return process.exit( 1 );
                    } else {
                        options.count += 1;
                    }
                    if( err.message.indexOf('ECONNREFUSED') > 0 )
                    {
                        // Give vm 5 more seconds to get ready
                        console.log(`Waiting 5 seconds for ${sshConfig.hostname}:${sshConfig.port} to be ready`);
                        setTimeout(async function()
                        {
                            resolve( await self._JSSSHExec(cmd, sshConfig, timeout, verbose, options) );
                        }, 5000);
                    }
                    else
                    {
                        reject(err);
                    }
                })
                .connect({
                    host: sshConfig.hostname,
                    port: sshConfig.port,
                    username: sshConfig.user,
                    privateKey: fs.readFileSync(sshConfig.private_key),
                    readyTimeout: timeout
                });
        });
    }
}

// Export factory class
module.exports = SSHConnector;
