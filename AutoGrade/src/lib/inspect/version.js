const Check = require('../inspect/check');
const semver = require('semver');

class VersionCheck extends Check {

    constructor() {
        super();
    }

    async check(context, args)
    {
        return await this.verifyRange( context.container, args.cmd, args.range );
    }

    async verifyRange(container, cmd, expectedRange)
    {
        let output = (await this.tools.exec(container, cmd)).trim();
        // output currently has extra newline
        // output = output.split('\n')[0];

        let status = false;
        for(let o of output.split(/\s+/g)){
            // _ is used in several version ids, but is not semver friendly.
            // " is in output of some version output
            o = o.replace(/_/g, '-').replace(/"/g, '');
            //console.log(o);
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
        console.log( `${results.cmd}: ${results.actual} > ${results.expected} => ${results.status} `);
    }
}

// Export factory class
module.exports = VersionCheck;