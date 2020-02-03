const chalk = require('chalk');
const Check = require('./check');

class reachableCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let results = [];

        for (let i = 0; i < args.length; i++) {
            let permission = args[i].permission;
            let path = args[i].path || args[i];

            let fileExists = await this.pathExists(path, permission, context);
            let isReachable = await this.connector.isReachable(path, context);

            if (fileExists.status || isReachable) {
                if(!fileExists && isReachable == "Docker"){
                    results.push({
                        resource: path,
                        status: "Docker Connector does not support reachable checks for the argument provided",
                    });
                }
                else{
                    results.push({
                        resource: path,
                        status: true,
                        expected: permission,
                        actual: permission ? fileExists.actual : undefined
                    });
                }
            } else {
                results.push({
                    resource: path,
                    status: false,
                    expected: permission,
                    actual: permission ? fileExists.actual : undefined
                });
            }
        }
        return results;
    }
    
    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}} ` + 
                            (result.expected ? chalk`{white expected permission:} {gray ${result.expected}} ` : '') +
                            (result.actual ? chalk`{white actual permission:} {gray ${result.actual}}` : '');

            this.reporter.report(message, result.status === true);
        });
    }


    /**
     * 
     * @param {string} path path to the file
     * @param {string} permission check read/write/execute permission `rwx`
     */
    async pathExists(path, permission) {

        let fileExists = !(await this.connector.exec(`[ -e "${path}" ] || echo '!e'`)).stdout.includes('!e');
        let actualPermission;
        if(fileExists && permission)
            actualPermission = (await this.connector.exec(`stat -c '%a' ${path}`)).stdout;

        let status = fileExists && permission ? actualPermission == permission : fileExists;

        return {
            status, 
            expected: permission,
            actual: fileExists ? actualPermission : 'Not found'
        }
    }
}

module.exports = reachableCheck;
