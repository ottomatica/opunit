const Check = require('./check');
const semver = require('semver');

class VersionCheck extends Check {

    constructor(connector) {
        super(connector);
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
        for(let o of output.split(/\s+/g)){
            // _ is used in several version ids, but is not semver friendly.
            // " is in output of some version output
            o = o.replace(/_/g, '-').replace(/"/g, '');
            if(semver.valid(o) && 
               (semver.satisfies(o, expectedRange) || semver.gtr(o, expectedRange)) ) {
                output = o;
                status = true;
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
        let status = this.getStatus( results.status );
        console.log( `${status}  ${results.cmd}: ${results.actual} > ${results.expected} => ${results.status} `);
    }
}

// Export factory class
module.exports = VersionCheck;