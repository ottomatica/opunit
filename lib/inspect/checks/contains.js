const Check = require('./check');
const chalk = require('chalk');

class ContainsCheck extends Check {

    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        let expect = true;
        if( args.expect != undefined )
            expect = args.expect;
        return await this.getServiceStatus(context, args.file, args.string, expect);
    }

    async getServiceStatus(context, file, string, expect) {
        let output = (await this.connector.exec(context, `cat ${file} | grep '${string}'`));
        let contains = output.includes(string);

        return {
            file,
            string,
            status: contains == expect,
            expect: expect
        }
    }

    async report(results) {
        let expected = results.expect == false ? "does not" : "";
        let plural = results.expect == false ? "" : "s";
        let message = chalk `{gray [${results.file}]} {white ${expected} contain${plural}} {gray [${results.string}]} {white status:} {gray ${results.status}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = ContainsCheck;
