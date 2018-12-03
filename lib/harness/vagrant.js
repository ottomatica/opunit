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
        return this.name ? this.name : this.sshConfig.host;
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

        let data = await fs.readFile( path.join( dir, 'Vagrantfile' ), 'utf8' );

        // might be useful in cases of clusters
        var count = ( data.match( /ip/g ) || [] ).length;
        // no ip address in file OR error getting data
        if ( count === 0 || !data) return;

        // break the output up line-by-line
        const data_lines = data.split( '\n' );
        // extract line that contains 'ip' substring
        const ip_line = data_lines.find( e => ~e.indexOf( 'ip' ) ).trim().split( /\s+/ );
        // get index of the string that contains 'ip'
        const i = ip_line.findIndex( item => item.includes( 'ip' ) );
        // if ip:'w.x.y.z' (all one string), split by ':' and get [1], else assume [i + 1] is the address
        return ip_line[ i ].length > 3 ? ip_line[ i ].split( ':' )[ 1 ].replace( /["-']/g, '' ) : ip_line[ i + 1 ].replace( /["-']/g, '' );
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