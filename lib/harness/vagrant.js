const child_process = require('child_process');
const chalk  = require('chalk');

const SSHConnector = require( "./ssh" );

class VagrantConnector extends SSHConnector {

    constructor(inCWD, name) {
        super('vagrant@', 'privateKey@');
        this.inCWD = inCWD;
        this.name = name;
    }

    async getName( context ) {
        return this.name;
    }

    async getStatus() {
        let self = this;
        return await this.vagrantIsInstalled() && 
        new Promise(function (resolve, reject) {
            child_process.exec(`vagrant global-status | grep ${self.name}`, (error, stdout, stderr) => {
                if (error || stderr) {
                    // console.error(`=> ${error}, ${stderr}`);
                    resolve(false);
                } else {
                    const data_by_line = stdout.split('\n');
                    const data = data_by_line[0].trim().split(/\s+/);
                    if (data[1] === self.name)
                        resolve({
                            status: data[3],
                            directory: data[4],
                        });
                }
            });
        });
    }

    async ready(){
        await this.getSshConfig();
    }

    async vagrantIsInstalled() {
        return new Promise(function (resolve, reject) { 
            child_process.exec( `vagrant --version`, async function ( error, stdout, stderr ) {
                if( error || stderr ) {
                    console.error(chalk.red(` => Vagrant is not installed so can't check for any matching containers.`));
                    resolve(false);
                }
                resolve(true)
            });
        });
    }

    async getSshConfig() {
        const self = this;
        const path = this.inCWD ? process.cwd() : (await this.getStatus()).directory;
        return new Promise(function (resolve, reject) {   
            child_process.exec( `cd ${path} && vagrant ssh-config`, ( error, stdout, stderr ) => {
                if( error || stderr) {
                    // console.error(`=> ${error}, ${stderr}`);
                    reject(`VM is not running or doesn't exist`);
                }
                else
                {
                    const data_split = stdout.split( '\n' );

                    const host = data_split[ 0 ].trim().split( ' ' )[ 1 ];
                    const hostname = data_split[ 1 ].trim().split( ' ' )[ 1 ];
                    const user = data_split[ 2 ].trim().split( ' ' )[ 1 ];
                    const port = data_split[ 3 ].trim().split( ' ' )[ 1 ];
                    const private_key = data_split[ 7 ].trim().split( ' ' )[ 1 ];
            
                    self.sshConfig = {
                        user: user,
                        port: port,
                        host: host,
                        hostname: hostname,
                        private_key: private_key
                    };
                    resolve(self.sshConfig);
                }
            });
        });
    }
}

module.exports = VagrantConnector;