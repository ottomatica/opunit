const child_process = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const si = require('systeminformation');
const checkDiskSpace = require('check-disk-space');
const Utils = require('../utils/utils');

class LocalConnector {
    async getContainerIp() {
        return 'localhost';
    }

    async getName() {
        return 'localhost';
    }

    async ready() {
        // If using local connector, localhost is always ready
        return true;
    }

    async setup(context, setup) {
        return new Promise(((resolve, reject) => {
            if (setup && setup.cmd) {
                console.log(`\tSetup: ${setup.cmd}`);
                let child = child_process.spawn(`${setup.cmd}`, {
                    shell: true,
                });

                child.stderr.on('data', (error) => {
                    console.error(error);
                    reject({ error });
                });

                child.stdout.on('data', (data) => {
                    console.log('\n\n\n\n\n', data);
                    if (setup.wait_for) {
                        if (data.indexOf(setup.wait_for) !== -1) {
                            console.log(`\tResolved wait_for condition: Stdout matches "${setup.wait_for}"`);
                            resolve({ child });
                        }
                    }
                });
            }
        }));
    }

    async tearDown(obj) {
        if (obj && obj.child) {
            // 'SIGINT'
            console.log('\tTearing down');
            obj.child.stdout.removeAllListeners('data');
            obj.child.stdin.write('\x03');
            obj.child.kill();
        }
    }

    async exec(context, cmd) {
        return new Promise(((resolve, reject) => {
            child_process.exec(cmd, (error, stdout, stderr) => {
                if (error || stderr) {
                    // console.error(`=> ${error}, ${stderr}`);
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            });
        }));
    }

    async pathExists(destPath, context) {
        return fs.pathExists(Utils.resolvePath(destPath));
    }

    async contains(context, file, string, expect) {
        if (await this.pathExists(file)) {
            return expect === (await fs.readFile(Utils.resolvePath(file))).includes(string);
        }
        throw Error('file doesn\'t exist');
    }

    checkVirt() {
        let status = null;
        if (os.platform() === 'win32') {
            let output = child_process.execSync('systeminfo');
            if (output && output.toString().indexOf('Virtualization Enabled In Firmware: Yes') !== -1) {
                status = true;
            } else {
                status = false;
            }
        } else if (os.platform() === 'darwin') {
            let output = child_process.execSync('sysctl -a | grep machdep.cpu.features');
            if (output && output.toString().indexOf('VMX') !== -1) {
                status = true;
            } else {
                status = false;
            }
        }
        return status;
    }

    async getCPUCores(_context) {
        return (await si.cpu()).cores;
    }

    async getMemory(_context) {
        return Math.floor((await si.mem()).total / 1000000);
    }

    async getDiskSpace(_context, diskLocation) {
        return Math.floor((await checkDiskSpace(diskLocation)).free / 1000000);
    }
}

// Export factory class
module.exports = LocalConnector;
