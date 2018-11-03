const Check = require('./check');
const chalk = require('chalk');

class ContainsCheck extends Check {

    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        return await this.getServiceStatus(context, args.file, args.regex);
    }

    async getServiceStatus(context, file, regex) {
        let output = (await this.connector.exec(context, `cat ${file} | grep '${regex}'`));

        return {
            file,
            regex,
            status: output.includes(regex)
        }
    }

    async report(results) {
        let message = chalk `{gray [${results.file}]} {white contains} {gray [${results.regex}]} {white status:} {gray ${results.status}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = ContainsCheck;
