const chalk = require('chalk');
const path = require('path');
const Check = require('./check');

class ContainsCheck extends Check {
    async check(context, args) {
        let expect = args.expect != undefined ? args.expect : true;
        return this.getContainsStatus(context, args.file, args.string, args.jq, expect);
    }

    async getContainsStatus(context, file, string, jq, expect) {

        let message = 'NA';
        let status;

        // if given a jq query
        if (jq) {
            // checking if jq is in $PATH
            let hasjq = (await this.connector.exec(`which jq`)).exitCode == 0;

            if (hasjq) {
                let queryResult = (await this.connector.exec(`jq -r "${jq}" ${file}`)).stdout;
                status = (queryResult === string) === expect;
            }

            else {
                status = false;
                message = 'error: jq is not installed on the target machine.'
            }
        }

        // if just matching string in the file
        else {
            try {
                status = await this.connector.contains(context, file, string, expect);
            } catch (error) {
                message = error;
                status = false;
            }
        }

        return {
            file: `...${path.basename(file)}`,
            jq,
            string,
            message,
            status,
            expect,
        };
    }

    async report(results) {
        let expected = results.expect === false ? 'does not' : '';
        let plural = results.expect === false ? '' : 's';

        // Escape carriage returns and line breaks.
        let results_string = results.string.replace('\r', '\\r').replace('\n', '\\n');
        let message = chalk`{gray [${results.file}]} {white jq query:} {gray ${results.jq}} {white ${expected} contain${plural}:} {gray [${results_string}]} {white status:} {gray ${results.status}} {white message:} {gray ${results.message}}`;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = ContainsCheck;
