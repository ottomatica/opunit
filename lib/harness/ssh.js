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

    async getName( context ) {
        return context.bakerPath.split('@')[0];
    }

    async getContainerIp(context) {
        return this.sshConfig.hostname;
    }

    async ready() {
        await this._JSSSHExec( "baker ssh", this.sshConfig, 5000, false, {count: 5} );
        return true;
    }

    async setup( context, setup ) {
        const cmd = `echo $$; exec ${setup.cmd}`;
        return this.pid = (await this._JSSSHExec( cmd, this.sshConfig, 5000, false, {
            setup: setup
        } ));
    }
 
    async tearDown(obj) {
        if (obj && obj.child) {
            // 'SIGINT'
            console.log(`\tTearing down`);
            await this.exec( '', `kill ${this.pid}` );
        }
    }

    async exec(context, cmd) {
        return await this._JSSSHExec(cmd, this.sshConfig);
    }

    async _JSSSHExec( cmd, sshConfig, timeout = 5000, verbose = false, options = {
        count: 20
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
                                if ( options.setup && buffer.includes( options.setup.wait_for ) ) {
                                    c.end();
                                    resolve( { 
                                        // format will be PID\nsetup.wait_for\n
                                        child: buffer.split( '\n' )[ 0 ]
                                    });
                                }
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
                    if ( options.count == 0 ) { 
                        console.error( chalk.red( ' => Host is not ready' ) );
                        return process.exit( 1 );
                    } else {
                        options.count -= 1;
                    }
                    if( err.message.indexOf('ECONNREFUSED') > 0 )
                    {
                        // Give vm 5 more seconds to get ready
                        console.log(`Waiting 5 seconds for ${sshConfig.hostname}:${sshConfig.port} to be ready`);
                        setTimeout(async function()
                        {
                            resolve( await self._JSSSHExec(cmd, sshConfig, timeout, verbose, options) );
                        }, timeout);
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
