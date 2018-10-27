const fs            = require('fs-extra');
const path          = require('path');
const child_process = require('child_process');
const _             = require('lodash');

const yaml           = require('js-yaml');
const Client         = require('ssh2').Client;

const boxes = path.join(require('os').homedir(), '.baker');
const bakerForMacPath = process.platform === 'darwin' ? path.join(require('os').homedir(), 'Library', 'Baker', 'BakerForMac') : undefined;
const privateKey = process.platform === 'darwin' ? path.join(bakerForMacPath, 'baker_rsa') : path.join(boxes, 'baker_rsa');
const VBexe = process.platform === 'win32' ? '"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe"' : 'VBoxManage';

class BakerConnector {

    constructor() {
        this._bakerDoc = null;
    }

    async getOrLoadBakerYaml(context)
    {
        if( !context.bakerPath )
        {
            throw new Error("No bakerPath provided in context object");
        }
        if( !this._bakerDoc ) 
        {
            this._bakerDoc = yaml.safeLoad(await fs.readFile(path.join(context.bakerPath, 'baker.yml'), 'utf8'));
        }
        return this._bakerDoc;
    }

    async getName(context)
    {
        let doc = await this.getOrLoadBakerYaml(context);
        if( doc && doc.name)
        {
            return doc.name;
        }
        throw new Error(`No name defined in baker file in ${context.bakerPath}`);
    }

    async getContainerIp(context)
    {
        let doc = await this.getOrLoadBakerYaml(context);
        if( doc.vm && doc.vm.ip)
        {
            return doc.vm.ip;
        }
        throw new Error(`No ip defined in baker file in ${context.bakerPath}`);
    }

    async getSSHConfig(machine, nodeName) {
        let vmInfo = await this._VBoxProvider_info(machine);
        let port = null;
        Object.keys(vmInfo).forEach(key => {
            if(vmInfo[key].includes('guestssh')){
                port = parseInt( vmInfo[key].split(',')[3]);
            }
        });
        return {user: 'vagrant', port: port, host: machine, hostname: '127.0.0.1', private_key: privateKey};
    }

    async _VBoxProvider_info(vmname) {
        return new Promise(function (resolve, reject) {   
            child_process.exec(`${VBexe} showvminfo ${vmname} --machinereadable`, (error, stdout, stderr) => {
                if(error && stderr.indexOf('VBOX_E_OBJECT_NOT_FOUND') != -1) {
                    resolve({VMState:'not_found'});
                }
                else if( error )
                {
                    console.error(`=> ${error}, ${stderr}`);
                    reject(error);
                }
                else
                {
                    let properties = {};
                    let lines = stdout.split('\n');
                    for (let i = 0; i < lines.length-1; i++) {
                        let lineSplit = lines[i].split('=');
                        let name= lineSplit[0].trim();
                        let id = lineSplit[1].trim();
                        properties[name]=id;
                    }
                    resolve(properties);
                }
            });
        });
    }

    /**
     * Returns State of a VM
     * @param {String} VMName
     */
    async getState(VMName) {
        let vmInfo = await this._VBoxProvider_info(VMName);
        return vmInfo.VMState.replace(/"/g,'');
    }

    async setup(context, setup)
    {
        return new Promise( function(resolve, reject)
        {
            if( setup && setup.cmd )
            {
                console.log(`\tSetup: ${setup.cmd}`);
                let child = child_process.spawn(`cd ${context.bakerPath} && ${setup.cmd}`, { shell: true });

                child.stderr.on('data', function (error) {
                    console.error(error);
                    reject({ error: error });
                })

                child.stdout.on('data', function(data) {
                    if( setup.wait_for )
                    {
                        if( data.indexOf(setup.wait_for) != -1 )
                        {
                            console.log(`\tResolved wait_for condition: Stdout matches "${setup.wait_for}"`);
                            resolve({child: child});
                        }
                    }            
                });
            }
        });
    }

    async tearDown(obj)
    {
        if( obj && obj.child)
        {
            // 'SIGINT'
            console.log(`\tTearing down`);
            obj.child.stdout.removeAllListeners("data");
            obj.child.stdin.write('\x03');
            obj.child.kill();            
        }
    }

    async ready(){
        // TODO: check if baker env is ready to be used (status == 'running')
        return;
    }

    async exec(context, cmd) {
        let name = await this.getName(context)
        let config = await this.getSSHConfig(name);

        return await this._JSSSHExec(cmd, config);
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
module.exports = BakerConnector;
