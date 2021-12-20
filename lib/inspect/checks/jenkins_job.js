const chalk = require('chalk');
const Check = require('./check');

class JenkinsJobCheck extends Check {
    
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }

    async check(context, args) {
        return this.getJobStatus(context, args);
    }

    async getJobStatus(context, args) {

        let host;
        if (this.connector.type === 'local')
            host = args.host || '127.0.0.1';
        else
            host = args.host || this.connector.sshConfig.hostname;

        const port = args.port || 8080;
        const baseUrl = `${port == 443 ? 'https' : 'http'}://${args.user}:${args.pass}@${host}:${port}`;
        const jenkins = require('jenkins')({ baseUrl, crumbIssuer: true, promisify: true });

        let jobStatus;
        let lastSuccessfulBuild;
        let lastBuild;
        let status;
        let msg;

        try {
            jobStatus = await jenkins.job.get(args.name);
            lastSuccessfulBuild = jobStatus.lastSuccessfulBuild;
            lastBuild = jobStatus.builds[0];
        } catch (err) {
            status = 'N/A';
            if (err.message.includes('not found'))
                msg = 'Job not found.';
            else
                msg = err
        }

        if (jobStatus && !lastBuild) {
            status = 'N/A';
            msg = 'No builds found.';
        }

        if (!status && lastSuccessfulBuild && (lastBuild.number == lastSuccessfulBuild.number))
            status = 'success';
        else
            status = 'failure';

        return {
            name: args.name,
            expectedStatus: args.status,
            actualStatus: status,
            msg,
            status: status === args.status
        }
    }

    async report(results) {
        let message = chalk`{gray [${results.name}]} {white expected:} {gray ${results.expectedStatus}} {white actual:} {gray ${results.actualStatus}}` +
            (results.msg ? chalk` {white message:} {gray ${results.msg}}` : '');

        this.reporter.report(message, results.status, this.isOptional);
    }
}

module.exports = JenkinsJobCheck;
