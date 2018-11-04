const SSHConnector = require( "./ssh" );
const path = require( 'path' );
const bakerForMacPath = process.platform === 'darwin' ? path.join( require( 'os' ).homedir(), 'Library', 'Baker', 'BakerForMac' ) : undefined;
const privateKey = process.platform === 'darwin' ? path.join( bakerForMacPath, 'baker_rsa' ) : path.join( boxes, 'baker_rsa' );
const cmd = require( 'node-cmd' );

class VagrantConnector extends SSHConnector {

    constructor() {
        super( 'vagrant@', privateKey );
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

    async sleep( ms ) {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    }

    async getSshConfig() {
        var vagrantData = null;

        cmd.get(
            'vagrant ssh-config',
            function ( err, data, stderr ) {
                vagrantData = data;
            }
        );

        await sleep( 4000 );

        const data_split = vagrantData.split( '\n' );

        const host = data_split[ 0 ].trim().split( ' ' )[ 1 ];
        const hostname = data_split[ 1 ].trim().split( ' ' )[ 1 ];
        const user = data_split[ 2 ].trim().split( ' ' )[ 1 ];
        const port = data_split[ 3 ].trim().split( ' ' )[ 1 ];
        const private_key = data_split[ 7 ].trim().split( ' ' )[ 1 ];

        this.sshConfig = {
            user: user,
            port: port,
            host: host,
            hostname: hostname,
            private_key: private_key
        };
        return this.sshConfig;
    }
}

module.exports = VagrantConnector;