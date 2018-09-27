
class Check {

    constructor(connector) {
        this.connector = connector;

        this.checkMark = "✅";
        this.crossMark = "❌";
    }

    getStatus(test)
    {
        if( test )
        {
            return this.checkMark;
        }
        return this.crossMark;
    }
}

// Export factory class
module.exports = Check;