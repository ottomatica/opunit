const Check = require('./check');
const chalk = require('chalk');

class CapabilityCheck extends Check {

    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        return await this.getCapability(context, args.cores, args.memory, args.disks || args.disk);
    }

    async getCapability(context, expectedCores, expectedMemory, expectedDisk) {
        let results = {
            cores: {
                expected: expectedCores
            },
            memory: {
                expected: expectedMemory
            }
        };

        if (expectedCores) {
            results.cores.actual = await this.connector.exec(context, `nproc --all`);
        }

        if (expectedMemory)
            results.memory.actual = await this.connector.exec(context, `grep MemTotal /proc/meminfo | awk '{print $2 / 1024}'`);

        results.cores.status = results.cores.expected <= results.cores.actual;
        results.memory.status = results.memory.expected <= parseFloat(results.memory.actual) + 500;

        return results;
    }

    async report(results) {
        for (let resource of Object.keys(results)) {
            if (results[resource].actual) {
                let message = chalk `{gray [${resource}]} {white expected:} {gray ${results[resource].expected}} {white actual:} {gray ${results[resource].actual}}`;
                this.reporter.report(message, results[resource].status);
            }
        }
    }

}

// Export factory class
module.exports = CapabilityCheck;
