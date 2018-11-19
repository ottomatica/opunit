const child_process = require('child_process');
const chalk  = require('chalk');
const path = require( 'path' );
const fs = require( 'fs-extra' );
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

    async getContainerIp( context ) {
        const status = await this.getStatus();
        const dir = status ? status.directory : process.cwd();

        return await fs.readFile( path.join(dir, './Vagrantfile'), 'utf8', ( err, data ) => {
            if ( err ) throw err;
            // might be useful in cases of clusters
            var count = ( data.match( /ip/g ) || [] ).length;

            // no ip address in file
            if ( count === 0 ) return;

            const data_lines = data.split( '\n' );
            // extract line with 'ip' string
            const ip_line = data_lines.find( e => ~e.indexOf( 'ip' ) ).trim().split( /\s+/ );
            // find index of 'ip'
            const i = ip_line.findIndex( item => item.includes( 'ip' ) );
            // true for instances where format is ip  : 'w.x.y.z' as opposed to ip: 'w.x.y.z'
            const ip = ip_line[ i ] === 'ip' ? ip_line[ i + 2 ] : ip_line[ i + 1 ];
            
            return ip;
        } );
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