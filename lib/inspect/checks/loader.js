const yaml     = require('js-yaml');
const fs       = require('fs');

class Loader {

    constructor() {
    }

    isObject(obj)
    {
        return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]'
    }

    getModuleName(item)
    {
        if( this.isObject(item) )
        {
            return Object.keys(item)[0];            
        }
        if( typeof item === 'string' )
            return item;
        throw new Error(`Invalid check module: ${item}`);
    }

    resolveModule(name)
    {
        let module = require('./' + name);
        return module;
    }

    async loadChecks(filePath)
    {
        let hosts = await yaml.safeLoad(fs.readFileSync(filePath))
        // console.log(JSON.stringify(hosts));

        let checks = [];

        for( let host of hosts )
        {
            let h = host.group;
            for( let check of h.checks )
            {
                let moduleName = this.getModuleName(check);
                let module = this.resolveModule(moduleName);

                let call = {name: moduleName, module: module, host: h.name };
                if( this.isObject(check) )
                    call.args = check[moduleName];

                checks.push( call );
            }
        }

        return checks;
    }
}

module.exports = Loader;