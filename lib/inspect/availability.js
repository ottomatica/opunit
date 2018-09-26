const request = require('request');
const Check = require('./check');

class AvailabilityCheck extends Check {

    constructor(connector) {
        super(connector);
        this.timeout = 3000;
    }

    async check(context, args)
    {
        let ip = await this.connector.getContainerIp(context);
        let address = `http://${ip}:${args.port}`;
        let status = await this.endpoint(address, args.status);
        let results = 
        {
            host: context.host,
            address: address,
            status: status,
            expected: args.status
        };
        return results;
    }

    async endpoint(address, expectedStatus )
    {
        return await this.requestStatus(address);
    }

    async requestStatus(address) {
        var self = this;
        return new Promise(function (resolve, reject) 
        {
            request(address, {timeout: self.timeout}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(response.statusCode);
                }
                else if( error.code === 'TEIMEDOUT' ) {
                    resolve(error.code);
                }
                else
                {
                    resolve(error);
                }
            });
        });
    }

    async report(results)
    {
        console.log( `${results.host}: ${results.address} expected: ${results.expected} actual: ${results.status}`);
    }

}

module.exports = AvailabilityCheck;