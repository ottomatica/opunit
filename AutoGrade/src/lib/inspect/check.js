const DockerTools = require('../harness/dockertools');

class Check {

    constructor() {
        this.tools = new DockerTools();
    }
}

// Export factory class
module.exports = Check;