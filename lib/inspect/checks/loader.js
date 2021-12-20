const yaml     = require('js-yaml');
const fs       = require('fs');

class Loader {
    isObject(obj) {
        return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
    }

    getModuleName(item) {
        if (this.isObject(item)) {
            return Object.keys(item)[0];
        }

        if (typeof item === 'string') {
            return item;
        }

        throw new Error(`Invalid check module: ${item}`);
    }

    resolveModule(name) {
        let module = require('./' + name);
        return module;
    }

    async loadChecks(filePath) {
        let hosts = await yaml.safeLoad(fs.readFileSync(filePath));

        let groups = [];

        for (let host of hosts) {
            let g = host.group;
            let checks = [];
            let any = [];

            if( g.checks ) {
                for (let check of g.checks ) {
                    let call = this.extractChunk(check, g.name)
                    checks.push(call);
                }    
            }
            if( g.any ) {
                for (let check of g.any ) {
                    let call = this.extractChunk(check, g.name)
                    any.push(call);
                }    
            }

            groups.push( {description: g.description, checks: checks, any: any} );
        }

        return groups;
    }

    extractChunk( check, name ) {
        let moduleName = this.getModuleName(check);
        let module = this.resolveModule(moduleName);

        let call = { name: moduleName, module: module, host: name };
        if (this.isObject(check)) {
            call.args = check[moduleName];
        }
        return call;
    }
}

module.exports = Loader;
