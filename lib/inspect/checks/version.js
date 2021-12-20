const semver = require('semver');
const Check  = require('./check');

class VersionCheck extends Check {
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
    }


    async check(context, args) {
        return this.verifyRange(context, args.cmd, args.range);
    }

    async verifyRange(context, cmd, expectedRange) {
        let output = '';
        let exitCode = '';
        try {
            output = (await this.connector.exec(cmd));
        } catch (err) {
            return {
                cmd,
                actual: err,
                expected: expectedRange,
                status: false,
            };
        }
        exitCode = output.exitCode;
        output = output.stdout.length !== 0 ? output.stdout.trim() : output.stderr.trim(); 
        let result = this.tryMatch(expectedRange, output, /[0-9]+\.[0-9]+\.[0-9]+/);
        if( !result.status )
        {
            // If we fail to match, try with less restrictive number set (e.g. ViM 8.0):
            result = this.tryMatch(expectedRange, output, /[0-9]+\.[0-9]+/)
        }

        let results = {
            cmd,
            actual: result.matchedVersion,
            expected: expectedRange,
            status: result.status,
            exitCode: exitCode,
        };
        return results;
    }

    tryMatch(expectedRange, output, matchRegex)
    {
        let status = false;
        for (let o of output.split(/[^-_.a-zA-Z0-9]+/g)) {
            // _ is used in several version ids, but is not semver friendly.
            // " is in output of some version output
            o = o.replace(/_/g, '-').replace(/"/g, '');
            // console.log(o)
            // Only check tokens with numbers
            if (o.match(matchRegex)) {
                // console.log(o) // <- For debugging, helpful for seeing what partial tokens are being matched.
                // Some versions, such as google chrome, have four version units. This will ignore anything after 3rd version unit.
                o = semver.coerce(o);

                if (semver.valid(o)
                        && (semver.satisfies(o, expectedRange) || semver.gtr(o, expectedRange))) {
                    output = o;
                    // Use first valid version found
                    return {matchedVersion: o, status: true};
                }
            }
        }
        return {matchedVersion: output, status: false};
    }

    async report(results) {
        let message = `${results.cmd}: ${results.actual} > ${results.expected} => ${results.status} `;
        message = message.concat((results.exitCode == '127' ? `Error : Command '${results.cmd.split(/\s+/g)[0]}' not found`: ''));
        this.reporter.report(message, results.status, this.isOptional);
    }
}

// Export factory class
module.exports = VersionCheck;
