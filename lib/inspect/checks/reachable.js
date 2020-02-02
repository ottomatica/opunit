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
            let permission = args[i].permission || '';
            let path = args[i].path || args[i];

            if ((await this.connector.pathExists(path, permission, context)) || (await this.connector.isReachable(path, context))) {
                if(!(await this.connector.pathExists(path, permission, context)) && (await this.connector.isReachable(path, context)) == "Docker"){
                    results.push({
                        resource: path,
                        status: "Docker Connector does not support reachable checks for the argument provided",
                    });
                }
                else{
                    results.push({
                        resource: path,
                        status: true,
                    });
                }
            } else {
                results.push({
                    resource: path,
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
