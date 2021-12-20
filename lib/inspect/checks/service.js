const chalk = require('chalk');
const Check = require('./check');

class ServiceCheck extends Check {
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }

    async check(context, args) {
        return this.getServiceStatus(context, args.name, args.status);
    }

    async getServiceStatus(context, name, expectedStatus) {
        let output = (await this.connector.exec(`systemctl status ${name}`)).stdout;
        let actualStatus = null;
        if (output.includes('Loaded: not-found')) actualStatus = 'none';
        else if (output.includes('Active: inactive')) actualStatus = 'inactive';
        else if (output.includes('Active: active')) actualStatus = 'active';

        return {
            name,
            actualStatus,
            expectedStatus,
            status: actualStatus === expectedStatus,
        };
    }

    async report(results) {
        let message = chalk`{gray [${results.name}]} {white expected:} {gray ${results.expectedStatus}} {white actual:} {gray ${results.actualStatus}}`;
        this.reporter.report(message, results.status, this.isOptional);
    }
}

// Export factory class
module.exports = ServiceCheck;
