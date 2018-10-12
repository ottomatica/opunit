const Check = require('./check');
const chalk = require('chalk');

class reachanbleCheck extends Check {

    constructor(connector, reporter) {
        super(connector,reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let results = [];

        for(let i = 0; i < args.length; i++) {
            if((await this.checkFile(context, args[i])) || (await this.checkDomain(context, args[i])) || (await this.checkURL(context, args[i]))){
                results.push({
                    resource: args[i],
                    status: true
                });
            }
            
            else {
                results.push({
                    resource: args[i],
                    status: false
                });
            }
        }

        return results;
    }

    async checkFile(context, path) {
        return ! (await this.connector.exec(context, `ls ${path}`)).includes('cannot access');
    }

    async checkDomain(context, url) {
        return ! (
                    (await this.connector.exec(context, `ping -c 3 ${url}`)).includes('unknown host') ||
                    (await this.connector.exec(context, `ping -c 3 ${url}`)).includes('cannot resolve')
                );
    }

    async checkURL(context, url) {
        return (await this.connector.exec(context, `curl -Is ${url} | head -1`)).includes('200 OK');
    }

    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}}`;
            this.reporter.report(message, result.status == true);
        })
    }

}

module.exports = reachanbleCheck;