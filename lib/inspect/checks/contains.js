const Check = require('./check');
const chalk = require('chalk');

class ContainsCheck extends Check {

    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        return await this.getServiceStatus(context, args.file, args.string);
    }

    async getServiceStatus(context, file, string) {
        let output = (await this.connector.exec(context, `cat ${file} | grep '${string}'`));

        return {
            file,
            string,
            status: output.includes(string)
        }
    }

    async report(results) {
        let message = chalk `{gray [${results.file}]} {white contains} {gray [${results.string}]} {white status:} {gray ${results.status}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = ContainsCheck;
