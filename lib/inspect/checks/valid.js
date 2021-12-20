const chalk = require('chalk');
const Check = require('./check');
const yaml = require('js-yaml');
const fs = require('fs-extra');

/**
 * This checks if known files have a valid format
 */
class validCheck extends Check {
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }

    async check(context, args) {
        let results = [];

        for (let arg of args) {
            const type = Object.keys(arg)[0]; // json, yaml, ...
            const filePath = arg[type];

            // try to read the file
            let readFile;
            let readFileError;

            // local connector
            if (this.connector.type === 'local') {
                try {
                    readFile = await fs.readFile(filePath, { encoding: 'utf8' });
                }
                catch (err) {
                    readFileError = err.message;
                }
            }

            // other ssh connectors
            else {
                let cat = await this.connector.exec(`cat ${filePath}`);
                readFile = cat.stdout;
                readFileError = cat.stderr;
            }

            let valid;

            // if was able to read the file
            if (!readFileError) {

                if (type === 'json')
                    valid = this._validateJSON(readFile);

                else if (type === 'yaml' || type === 'yml')
                    valid = this._validateYAML(readFile);

            }

            // if wasn't able to read the file
            else
                valid = readFileError.includes('o such file') ? 'No such file or directory' : readFileError;

            results.push({ type, filePath, valid });
        }
        return results;
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.filePath}]} {white valid:} {gray ${result.valid}}`;
            this.reporter.report(message, result.valid === true, this.isOptional);
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
        try {
            yaml.safeLoad(YAMLText);
            return true;
        } catch (err) {
            return false;
        }
    }
}

module.exports = validCheck;
