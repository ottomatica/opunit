const chalk = require('chalk');
const Check = require('./check');
const platform = require('os').platform();
const fs = require('fs-extra');
const uidNumber = require("uid-number");
const file = require('fs-extra/lib/ensure/file');

class resolvableCheck extends Check {
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
        this.timeout = 3000;
    }

    async check(context, args) {
        let results = [];

        for (let i = 0; i < args.length; i++) {
            let path = args[i].path || args[i];
            let expect = args[i].expect != undefined ? args[i].expect : true;

            let isReachable = await this.connector.isReachable(path, context);

            results.push({
                resource: path,
                status: expect === isReachable,
                expect: expect,
            });
        }
        return results;
    }
    
    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}} {white expected:} {gray ${result.expect}}`;
            this.reporter.report(message, result.status === true, this.isOptional);
        });
    }

}

module.exports = resolvableCheck;
