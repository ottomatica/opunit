
const chalk = require('chalk');
const process = require('process');
const os    = require('os');

class Reporter {
    constructor() {
        this.total = 0;
        this.failed = 0;
        this.passed = 0;
        this.skipped = 0;

        this.checksResults = [];

        if (os.platform() === 'win32') {
            // ✔
            this.checkMark = chalk`{green √}`;
            this.crossMark = chalk`{red ×}`;
            this.optional  = chalk`{yellow !}`;
        } else {
            // ❌
            this.checkMark = chalk`{green ✔}`;
            this.crossMark = chalk`{red ✖}`;
            this.optional = chalk`{yellow ⚠️}`;
        }
    }

    summary() {

        let finalTally = this.total - this.skipped;

        if (finalTally === 0) {
            console.log('No checks run.');
        } else {
            let overallPassRate = (this.passed / finalTally * 100.0).toFixed(1);

            // set exitCode to 1 if anything failed
            if (this.failed > 0) process.exitCode = 1;

            console.log();
            console.log(chalk.underline('Summary'));
            console.log();
            console.log(chalk.gray(`\t${overallPassRate}% of all checks passed.`));
            console.log(`\t${chalk.green(this.passed)} ${chalk.gray('passed ·')} ${chalk.red(this.failed)} ${chalk.gray('failed ·')} ${chalk.white(this.skipped)} ${chalk.gray("skipped")} `);
        }
    }

    getStatus(test, optional) {

        // Give optional sign if failed test, otherwise allow pass signal to be used.
        if( optional && !test) return this.optional;

        if (test) {
            return this.checkMark;
        }
        return this.crossMark;
    }

    report(message, bPassed, isOptional) {

        let status = this.getStatus(bPassed, isOptional);
        this.checksResults.push(`${status} ${message}`);

        console.log(`\t    ${status}   ${message}`);

        // Update summary
        this.total += 1;
        if (bPassed) {
            this.passed += 1;
        } else if (isOptional ) {
            this.skipped += 1;
        } else {
            this.failed += 1;
        }
    }
}

// Export factory class
module.exports = Reporter;
