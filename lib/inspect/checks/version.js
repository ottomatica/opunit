const Check = require('./check');
const semver = require('semver');

class VersionCheck extends Check {

    constructor(connector,reporter) {
        super(connector,reporter);
    }

    async check(context, args)
    {
        return await this.verifyRange( context, args.cmd, args.range );
    }

    async verifyRange(context, cmd, expectedRange)
    {
        let output = (await this.connector.exec(context,cmd)).trim();
        // output currently has extra newline
        // output = output.split('\n')[0];

        let status = false;
        for(let o of output.split(/(\s+)/g)){
            // _ is used in several version ids, but is not semver friendly.
            // " is in output of some version output
            o = o.replace(/_/g, '-').replace(/"/g, '');
            // Only check tokens with numbers
            if( o.match(/[0-9]+/) ) 
            {
                // console.log(o) // <- For debugging, helpful for seeing what partial tokens are being matched.
                // Some versions, such as google chrome, have four version units. This will ignore anything after 3rd version unit.
                o = semver.coerce(o);

                if(semver.valid(o) && 
                (semver.satisfies(o, expectedRange) || semver.gtr(o, expectedRange)) ) {
                    output = o;
                    status = true;
                    // Use first valid version found
                    break;
                }
            }
        }

        let results = {
            cmd: cmd,
            actual: output,
            expected: expectedRange,
            status: status
        }
        return results;
    }

    async report(results)
    {
        let message = `${results.cmd}: ${results.actual} > ${results.expected} => ${results.status} `;
        this.reporter.report(message, results.status);
    }
}

// Export factory class
module.exports = VersionCheck;