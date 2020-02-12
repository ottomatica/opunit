const chalk = require('chalk');
const Check = require('./check');

/**
 * This checks if known files have a valid format
 */
class validCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        let results = [];

        for (let arg of args) {
            const type = Object.keys(arg)[0]; // json, yaml, ...
            const filePath = arg[type];

            // json files
            if (type === 'json') {
                // try to read the file
                const readFile = (await this.connector.exec(`cat ${filePath}`));
                let valid;

                // if was able to read the file
                if (readFile.exitCode == 0)
                    valid = this._validateJSON(readFile.stdout);

                else
                    valid = readFile.stderr.includes('No such file') ? 'No such file or directory' : readFile.stderr;

                results.push({ type, filePath, valid });
            }
        }
        return results;
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.filePath}]} {white valid:} {gray ${result.valid}}`;
            this.reporter.report(message, result.valid === true);
        });
    }

    _validateJSON(JSONText) {
        try {
            JSON.parse(JSONText);
            return true;
        } catch (err) {
            return false;
        }
    }

    _validateYAML(YAMLText) {
        // TODO
    }
}

module.exports = validCheck;
