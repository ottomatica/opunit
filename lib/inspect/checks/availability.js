const got     = require('got');
const chalk   = require('chalk');
const Check   = require('./check');

class AvailabilityCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let ip = await this.connector.getContainerIp(context);

        // ports
        args.port = args.port.toString();
        const extractedPorts = args.port.match(/\d+/g);
        const portOperators = args.port.match(/\|\||or|\&\&|and/g);
        
        let state = null;
        if (args.setup) {
            state = await this.connector.setup(context, args.setup);
        }
        
        let finalResult = null;
        for (const port of extractedPorts) {
            let address = `${port == 443 ? 'https' : 'http'}://${ip}:${port}/${args.url === '/' ? '' : args.url}`;
            let statusCode = await this.endpoint(address);
            let result = {
                host: await this.connector.getName(context),
                address,
                statusCode,
                status: statusCode == args.status,
                expected: args.status,
            };

            if(finalResult) {

                let andor = portOperators.shift();
                if (andor == 'or' || andor == '||') {
                    if (finalResult.status) {
                        break;
                    }
                    finalResult = result;
                }
                else if (andor == 'and' || andor == '&&') {
                    if (!finalResult.status) {
                        break;
                    }
                    finalResult = result;
                }
            }
            else
                finalResult = result;
        }

        await this.connector.tearDown(state);

        return finalResult;
    }

    async endpoint(address) {
        return this.requestStatus(address);
    }

    async requestStatus(address) {
        try {
            return (await got(address, {followRedirect: true, rejectUnauthorized: false, timeout: this.timeout})).statusCode;
        } catch (err) {
            return err.errorCode || err;
        }
    }

    async report(results) {
        let message = chalk`{gray [${results.host}] ${results.address}} {white expected:} {gray ${results.expected}} {white actual:} {gray ${results.statusCode}}`;
        this.reporter.report(message, results.status);
    }
}

module.exports = AvailabilityCheck;
