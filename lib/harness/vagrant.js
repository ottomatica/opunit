const child_process = require('child_process');

const SSHConnector = require( "./ssh" );

class VagrantConnector extends SSHConnector {

    constructor() {
        super('vagrant@', 'privateKey@');
    }

    async getName( context ) {
        return context.bakerPath;
    }

    async tearDown( obj ) {
        if ( obj && obj.child ) {
            // 'SIGINT'
            console.log( `\tTearing down` );
            obj.child.stdout.removeAllListeners( "data" );
            obj.child.stdin.write( '\x03' );
            obj.child.kill();
        }
    }

    async getSshConfig() {
        const self = this;
        return new Promise(function (resolve, reject) {   
            child_process.exec(`vagrant ssh-config`, (error, stdout, stderr) => {
                if( error || stderr) {
                    console.error(`=> ${error}, ${stderr}`);
                    reject(error);
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