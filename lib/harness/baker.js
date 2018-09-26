const fs            = require('fs-extra');
const path          = require('path');
const child_process = require('child_process');
const _             = require('lodash');

const yaml           = require('js-yaml');

class BakerConnector {

    constructor() {
    }

    async getContainerIp(context)
    {
        if( !context.bakerPath )
        {
            throw new Error("No bakerPath provided in context object");
        }
        let doc = yaml.safeLoad(await fs.readFile(path.join(context.bakerPath, 'baker.yml'), 'utf8'));

        if( doc.vm && doc.vm.ip)
        {
            return doc.vm.ip;
        }
        throw new Error(`No ip defined in baker file in ${context.bakerPath}`);
    }
}

// Export factory class
module.exports = BakerConnector;