const chalk = require('chalk');
const Check = require('./check');

class reachableCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let results = [];

        for (let i = 0; i < args.length; i++) {
            if ((await this.connector.pathExists(args[i], context)) || (await this.connector.isReachable(args[i], context))) {
                if(!(await this.connector.pathExists(args[i], context)) && (await this.connector.isReachable(args[i], context)) == "Docker"){
                    results.push({
                        resource: args[i],
                        status: "Docker Connector does not support reachable checks for the argument provided",
                    });
                }
                else{
                    results.push({
                        resource: args[i],
                        status: true,
                    });
                }
            } else {
                results.push({
                    resource: args[i],
                    status: false,
                });
            }
        }
        return results;
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}}`;
            this.reporter.report(message, result.status === true);
        });
    }
}

module.exports = reachableCheck;
