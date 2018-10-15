const fs            = require('fs-extra');
const child_process = require('child_process');
const Client         = require('ssh2').Client;

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

    async ready(){
        // TODO: check if the host is ready for ssh
        return;
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

    async _JSSSHExec( cmd, sshConfig, timeout=20000, verbose=false, options={} ) 
    {
        let buffer = "";
        return new Promise((resolve, reject) => {
            var c = new Client();
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
                    if( err.message.indexOf('ECONNREFUSED') > 0 )
                    {
                        // Give vm 5 more seconds to get ready
                        console.log(`Waiting 5 seconds for ${sshConfig.hostname}:${sshConfig.port} to be ready`);
                        setTimeout(async function()
                        {
                            resolve( await this._JSSSHExec(cmd, sshConfig, timeout, verbose, options) );
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
