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
            if ((await this.checkFile(context, args[i])) || (await this.checkDomain(context, args[i])) || (await this.checkURL(context, args[i]))) {
                results.push({
                    resource: args[i],
                    status: true,
                });
            } else {
                results.push({
                    resource: args[i],
                    status: false,
                });
            }
        }

        return results;
    }

    async checkFile(context, path) {
        let exists = await this.connector.pathExists(path, context);
    }

    async checkDomain(context, url) {
        try {
        return !(
            (await this.connector.exec(context, `ping -c 3 ${url}`)).includes('nknown host')
                    || (await this.connector.exec(context, `ping -c 3 ${url}`)).includes('cannot resolve')
            );
        }
        catch(ex)
        {
            return false;
        }
    }

    async checkURL(context, url) {
        try
        {
            return (await this.connector.exec(context, `curl -Is ${url} | head -1`)).includes('200 OK');
        }
        catch(ex)
        {
            return false;
        }
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}}`;
            this.reporter.report(message, result.status === true);
        });
    }
}

module.exports = reachableCheck;
