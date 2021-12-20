const chalk = require('chalk');
const path = require('path');
const Check = require('./check');

class ContainsCheck extends Check {

    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }


    async check(context, args) {
        let expect = args.expect != undefined ? args.expect : true;
        return this.getContainsStatus(context, args.file, args.string, args.jq, args.query, expect);
    }

    async getContainsStatus(context, file, string, jq, query, expect) {

        let message = 'NA';
        let status;

        // if given a jq query
        if (jq) {
            // checking if jq is in $PATH
            let hasjq = (await this.connector.exec(`which jq`)).exitCode == 0;

            if (hasjq) {
                let queryResult = (await this.connector.exec(`jq -r "${jq}" ${file}`)).stdout.trim();
                status = (queryResult === string) === expect;
            }

            else {
                status = false;
                message = 'error: jq is not installed on the target machine.'
            }
        }

        // if given a query
        else if(query) {
            let cat = await this.connector.exec(`cat ${file}`);
            let readFileError = cat.stderr;

            if(readFileError) {
                status = false,
                message = `error: can't read the file.`
            }
            else {

                let readJSON = null;
                try {
                    readJSON = JSON.parse(cat.stdout);
                    let queryResult = readJSON;

                    const queryProperties = query.replace(/^\./, '').split('.');
                    
                    for(const p of queryProperties) {
                        queryResult = queryResult[p];
                    }
                    
                    status = (queryResult === string) === expect;

                } catch (err) {
                    status = false;
                    message = `error: can't parse the JSON file.`
                }


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
            query,
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
        let message = chalk`{gray [${results.file}]}${results.jq || results.query ? chalk` {white query:} {gray ${results.jq || results.query}} ` : ''}{white ${expected} contain${plural}:} {gray [${results_string}]} {white status:} {gray ${results.status}} {white message:} {gray ${results.message}}`;
        this.reporter.report(message, results.status, this.isOptional);
    }
}

// Export factory class
module.exports = ContainsCheck;
