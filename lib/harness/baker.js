const fs            = require('fs-extra');
const path          = require('path');
const child_process = require('child_process');
const _             = require('lodash');

const yaml           = require('js-yaml');

class BakerConnector {

    constructor() {
        this._bakerDoc = null;
    }

    async getOrLoadBakerYaml(context)
    {
        if( !context.bakerPath )
        {
            throw new Error("No bakerPath provided in context object");
        }
        if( !this._bakerDoc ) 
        {
            this._bakerDoc = yaml.safeLoad(await fs.readFile(path.join(context.bakerPath, 'baker.yml'), 'utf8'));
        }
        return this._bakerDoc;
    }

    async getName(context)
    {
        let doc = await this.getOrLoadBakerYaml(context);
        if( doc && doc.name)
        {
            return doc.name;
        }
        throw new Error(`No name defined in baker file in ${context.bakerPath}`);
    }

    async getContainerIp(context)
    {
        let doc = await this.getOrLoadBakerYaml(context);
        if( doc.vm && doc.vm.ip)
        {
            return doc.vm.ip;
        }
        throw new Error(`No ip defined in baker file in ${context.bakerPath}`);
    }
}

// Export factory class
module.exports = BakerConnector;