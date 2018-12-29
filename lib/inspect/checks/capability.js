const chalk = require('chalk');
const Check = require('./check');

class CapabilityCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        return this.getCapability(context, args.cores, args.memory, args.disks || args.disk, args.virtualization || args.vt);
    }

    async getCapability(context, expectedCores, expectedMemory, expectedDisks, expectedVT) {
        let results = {
            cores: {
                expected: expectedCores,
            },
            memory: {
                expected: expectedMemory,
            },
            disks: {
                expected: expectedDisks && expectedDisks[0].size,
                location: expectedDisks && expectedDisks[0].location,
            },
            vt: {
                expected: expectedVT,
            },
        };

        if (expectedCores) {
            results.cores.actual = await this.connector.exec(context, 'nproc --all');
        }

        if (expectedMemory) {
            results.memory.actual = await this.connector.exec(context, `grep MemTotal /proc/meminfo | awk '{print $2 / 1024}'`);
        }

        if (expectedDisks) {
            results.disks.actual = await this.connector.exec(context, `df --output=avail -h  ${expectedDisks[0].location} | grep -P '\\d+.\\d+' -o`);
        }

        if (expectedVT !== undefined) {
            results.vt.actual = this.connector.checkVT();
        }

        results.cores.status = results.cores.expected <= results.cores.actual;
        results.memory.status = results.memory.expected <= parseFloat(results.memory.actual) + 500;
        results.disks.status = results.disks.expected <= parseFloat(results.disks.actual) + 0.5;
        results.vt.status = results.vt.expected === results.vt.actual;

        return results;
    }

    async report(results) {
        for (let resource of Object.keys(results)) {
            if (results[resource].actual) {
                let message = chalk`{gray [${resource + (results[resource].location || '')}]} {white expected at least:} {gray ${results[resource].expected}} {white actual:} {gray ${results[resource].actual}}`;
                this.reporter.report(message, results[resource].status);
            }
        }
    }
}

// Export factory class
module.exports = CapabilityCheck;
