const child_process = require('child_process');

class LocalConnector {

    constructor() {}

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
        return new Promise(function (resolve, reject) {

            if (setup && setup.cmd) {
                console.log(`\tSetup: ${setup.cmd}`);
                let child = child_process.spawn(`${setup.cmd}`, {
                    shell: true
                });

                child.stderr.on('data', function (error) {
                    console.error(error);
                    reject({ error: error });
                })

                child.stdout.on('data', function (data) {
                    console.log('\n\n\n\n\n', data)
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

    async tearDown(obj) {
        if (obj && obj.child) {
            // 'SIGINT'
            console.log(`\tTearing down`);
            obj.child.stdout.removeAllListeners("data");
            obj.child.stdin.write('\x03');
            obj.child.kill();
        }
    }

    async exec(context, cmd) {
        return new Promise(function (resolve, reject) {
            child_process.exec(cmd, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`=> ${error}, ${stderr}`);
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

}

// Export factory class
module.exports = LocalConnector;
