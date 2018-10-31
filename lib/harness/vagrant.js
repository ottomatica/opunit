const SSHConnector = require( "./ssh" );
const path = require( 'path' );
const bakerForMacPath = process.platform === 'darwin' ? path.join( require( 'os' ).homedir(), 'Library', 'Baker', 'BakerForMac' ) : undefined;
const privateKey = process.platform === 'darwin' ? path.join( bakerForMacPath, 'baker_rsa' ) : path.join( boxes, 'baker_rsa' );
const child_process = require( 'child_process' );
const VBexe = process.platform === 'win32' ? '"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe"' : 'VBoxManage';

class VagrantConnector extends SSHConnector {

    constructor() {
        super( 'vagrant@', privateKey );
    }

    async getSshConfig( machine ) {
        let vmInfo = await this._VBoxProvider_info( machine );
        let port = null;
        Object.keys( vmInfo ).forEach( key => {
            if ( vmInfo[ key ].includes( 'guestssh' ) ) {
                port = parseInt( vmInfo[ key ].split( ',' )[ 3 ] );
            }
        } );
        this.sshConfig = {
            user: 'vagrant',
            port: port,
            host: machine,
            hostname: '127.0.0.1',
            private_key: privateKey
        };
        return this.sshConfig;
    }

    async _VBoxProvider_info( vmname ) {
        return new Promise( function ( resolve, reject ) {
            child_process.exec( `${VBexe} showvminfo ${vmname} --machinereadable`, ( error, stdout, stderr ) => {
                if ( error && stderr.indexOf( 'VBOX_E_OBJECT_NOT_FOUND' ) != -1 ) {
                    resolve( {
                        VMState: 'not_found'
                    } );
                } else if ( error ) {
                    console.error( `=> ${error}, ${stderr}` );
                    reject( error );
                } else {
                    let properties = {};
                    let lines = stdout.split( '\n' );
                    for ( let i = 0; i < lines.length - 1; i++ ) {
                        let lineSplit = lines[ i ].split( '=' );
                        let name = lineSplit[ 0 ].trim();
                        let id = lineSplit[ 1 ].trim();
                        properties[ name ] = id;
                    }
                    resolve( properties );
                }
            } );
        } );
    }
}

module.exports = VagrantConnector;