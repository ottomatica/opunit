const child_process = require('child_process');

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

    async getStatus(name) {
        return new Promise(function (resolve, reject) {
            child_process.exec(`vagrant global-status | grep ${name}`, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`=> ${error}, ${stderr}`);
                    reject(error);
                } else {
                    const data_by_line = stdout.split('\n');
                    const data = data_by_line[0].trim().split(/\s+/);
                    if (data[1] === name)
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

    async getSshConfig() {
        const self = this;
        const path = this.inCWD ? process.cwd() : (await this.getStatus(this.name)).directory;
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