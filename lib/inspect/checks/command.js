const chalk = require('chalk');
const Check = require('./check');

class CommandCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
    }

    async check(context, args) {
        let result = {};
        let status = true;
        const output = await this.connector.exec(args.exec);

        args.exitCode = args.exitCode || args.code;
        for (const io of ['stdout', 'stderr', 'exitCode']) {
            if (args[io]) {
                status = status && (RegExp(args[io]).test(output[io]));
                result['actual' + io] = output[io];
                result['expected' + io] = args[io];
            }
        }

        return {
            exec: args.exec,
            status,
            ...result
        }
    }

    async report(results) {
        let message = chalk`{gray [${results.exec}]} `
                            + (results.expectedstdout ? chalk`{white expected stdout:} {gray ${results.expectedstdout.trimEnd()}} {white actual stdout:} {gray ${results.actualstdout.trimEnd()}} ` : '')
                            + (results.expectedstderr ? chalk`{white expected stderr:} {gray ${results.expectedstderr.trimEnd()}} {white actual stderr:} {gray ${results.actualstderr.trimEnd()}} ` : '')
                            + (results.expectedexitCode ? chalk`{white expected exit code:} {gray ${results.expectedexitCode}} {white actual exit code:} {gray ${results.actualexitCode}} ` : '');
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = CommandCheck;
