
class Check {
    constructor(connector, reporter, options) {
        this.connector = connector;
        this.reporter = reporter;
        this.isOptional = false;

        if( options && options.optional ) {
            this.isOptional = true;
        }
    }

    setIsOptional( option ) {
        this.isOptional = option;
    }
}

// Export factory class
module.exports = Check;
