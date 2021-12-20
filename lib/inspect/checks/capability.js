const chalk = require('chalk');
const Check = require('./check');

class CapabilityCheck extends Check {

    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }

    async check(context, args) {
        let expected = {
            cores: args.cores,
            memory: args.memory,
            disk: args.disks || args.disk,
            virt: args.virtualization || args.virt,
        };
        return this.getCapability(context, expected);
    }

    async getCapability(context, expected) {
        let results = {
            cores: {
                expected: expected.cores,
            },
            memory: {
                expected: expected.memory,
                unit: 'GB',
            },
            disks: {
                expected: expected.disk && expected.disk[0].size,
                location: expected.disk && expected.disk[0].location,
                unit: 'GB',
            },
            virt: {
                expected: expected.virt,
            },
        };

        if (expected.cores) {
            results.cores.actual = await this.connector.getCPUCores(context);
        }

        if (expected.memory) {
            results.memory.actual = await this.connector.getMemory(context);
        }

        if (expected.disk) {
            results.disks.actual = await this.connector.getDiskSpace(context, expected.disk[0].location);
        }

        if (expected.virt !== undefined) {
            results.virt.actual = await this.connector.checkVirt();
            if (this.connector.type === 'local' && require('os').platform() === 'win32') {
                if (this.connector.checkHyperV())
                    results.virt.message = "VirtualBox cannot run when Hyper-V is enabled."
            }
        }

        results.cores.status = results.cores.expected <= results.cores.actual;
        results.memory.status = results.memory.expected <= parseFloat(results.memory.actual) + 0.05;
        results.disks.status = results.disks.expected <= parseFloat(results.disks.actual) + 0.5;
        results.virt.status = results.virt.expected === results.virt.actual;

        return results;
    }

    async report(results) {
        for (let resource of Object.keys(results)) {
            if (results[resource].actual !== undefined) {
                const actualIsBoolean = typeof results[resource].expected === 'boolean';
                let message = chalk`{gray [${resource + (results[resource].location || '')}]} {white expected${actualIsBoolean ? '' : ' at least'}:} ` +
                                chalk`{gray ${results[resource].expected}${results[resource].unit || ''}} {white actual:} {gray ${results[resource].actual}${results[resource].unit || ''}} ` +
                                (results[resource].message ? chalk`{white message:} {gray ${results[resource].message}}` : '');
                this.reporter.report(message, results[resource].status, this.isOptional);
            }
        }
    }
}

// Export factory class
module.exports = CapabilityCheck;
