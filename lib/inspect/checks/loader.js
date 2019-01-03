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
            for (let check of g.checks) {
                let moduleName = this.getModuleName(check);
                let module = this.resolveModule(moduleName);

                let call = { name: moduleName, module: module, host: g.name };
                if (this.isObject(check)) {
                    call.args = check[moduleName];
                }

                checks.push(call);
            }
            groups.push( {description: g.description, checks: checks} );
        }

        return groups;
    }
}

module.exports = Loader;
