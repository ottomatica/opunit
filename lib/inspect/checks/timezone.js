const chalk = require('chalk');
const Check = require('./check');

class TimezoneCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        let actual = await this.connector.exec(context, 'date +"%Z"');

        return {
            actual,
            expected: args,
            status: actual.toLowerCase().includes(args.toLowerCase()),
        };
    }

    async report(results) {
        let message = chalk`{gray [Time Zone]} {white expected:} {gray ${results.expected}} {white actual:} {gray ${results.actual}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = TimezoneCheck;
