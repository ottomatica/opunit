const request = require('request');
const chalk   = require('chalk');
const Check   = require('./check');

class AvailabilityCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let ip = await this.connector.getContainerIp(context);
        let address = `http://${ip}:${args.port}/${args.url === '/' ? '' : args.url}`;

        let state = null;
        if (args.setup) {
            state = await this.connector.setup(context, args.setup);
        }

        let status = await this.endpoint(address, args.status);
        let results = {
            host: await this.connector.getName(context),
            address,
            status,
            expected: args.status,
        };

        await this.connector.tearDown(state);

        return results;
    }

    async endpoint(address, expectedStatus) {
        return this.requestStatus(address);
    }

    async requestStatus(address) {
        const self = this;
        return new Promise(((resolve, reject) => {
            request(address, { timeout: self.timeout }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(response.statusCode);
                } else if (error && error.code) {
                    resolve(error.code);
                } else {
                    resolve(error);
                }
            });
        }));
    }

    async report(results) {
        let message = chalk`{gray [${results.host}] ${results.address}} {white expected:} {gray ${results.expected}} {white actual:} {gray ${results.status}}`;
        this.reporter.report(message, results.expected === results.status);
    }
}

module.exports = AvailabilityCheck;
