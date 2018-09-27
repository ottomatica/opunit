
const chalk = require('chalk');

class Reporter {

    constructor() {
        this.total = 0;
        this.failed = 0;
        this.passed = 0;

        this.checksResults = [];
        
        this.checkMark = '✅';
        this.crossMark = "❌";
    }

    summary()
    {
        if( this.total == 0 )
        {
            console.log('No checks run.')
        }
        else
        {
            let overallPassRate = (this.passed / this.total * 100.0).toFixed(1);

            console.log();
            console.log(chalk.underline('Summary'))
            console.log()
            console.log(chalk.gray(`\t${overallPassRate}% of all checks passed.`) );
            console.log(`\t${chalk.green(this.passed)} ${chalk.gray('passed ·')} ${chalk.red(this.failed)} ${chalk.gray('failed')}`)
        }
    }

    getStatus(test)
    {
        if( test )
        {
            return this.checkMark;
        }
        return this.crossMark;
    }

    report(message, bPassed)
    {
        let status = this.getStatus( bPassed );
        this.checksResults.push( `${status} ${message}` );

        console.log(`\t    ${status}   ${message}` )

        // Update summary
        this.total += 1;
        if( bPassed ) {
            this.passed += 1;           
        }
        else {
            this.failed += 1;
        }

    }
}

// Export factory class
module.exports = Reporter;