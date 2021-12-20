const chalk = require('chalk');
const Check = require('./check');

class envCheck extends Check {

    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }


    async check(context, args) {
        let results = [];

        for (const variable of args) {
            const [env, expected] = variable.split('=');

            const { actual, status } = await this.checkEnv(env, expected);
            results.push({ status, actual, env, expected });
        }

        return results;
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.env}]} {white status:} {gray ${result.status}} ` +
                            chalk`{white expected:} {gray ${result.expected}} ` +
                            chalk`{white actual:} {gray ${result.actual}}`;

            this.reporter.report(message, result.status === true, this.isOptional);
        });
    }

    async checkEnv(env, expectedValue) {
        let actualValue;
        if (this.connector.type === 'local') {
            actualValue = process.env[env];
        } else {
            actualValue = (await this.connector.exec(`echo $${env}`)).stdout.trim();
        }

        return {
            status: actualValue === expectedValue,
            actual: actualValue
        }
    }
}

module.exports = envCheck;
