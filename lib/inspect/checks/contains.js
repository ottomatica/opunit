const chalk = require('chalk');
const Check = require('./check');
const path = require('path');

class ContainsCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        let expect = args.expect || true;
        return this.getServiceStatus(context, args.file, args.string, expect);
    }

    async getServiceStatus(context, file, string, expect = true) {
        let message = 'NA';
        let status;
        try {
            status = await this.connector.contains(context, file, string, expect);
        } catch (error) {
            message = error;
            status = false;
        }

        return {
            file: `...${path.basename(file)}`,
            string,
            message,
            status,
            expect,
        };
    }

    async report(results) {
        let expected = results.expect === false ? 'does not' : '';
        let plural = results.expect === false ? '' : 's';
        let message = chalk`{gray [${results.file}]} {white ${expected} contain${plural}} {gray [${results.string}]} {white status:} {gray ${results.status}} {white message:} {gray ${results.message}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = ContainsCheck;
