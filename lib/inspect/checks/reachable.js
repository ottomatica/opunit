const chalk = require('chalk');
const Check = require('./check');
const platform = require('os').platform();
const fs = require('fs-extra');

class reachableCheck extends Check {
    constructor(connector, reporter) {
        super(connector, reporter);
        this.timeout = 3000;
    }

    async check(context, args) {
        let results = [];

        for (let i = 0; i < args.length; i++) {
            let user = args[i].user;
            let group = args[i].group;
            let permission = args[i].permission;
            let path = args[i].path || args[i];

            // TODO: error if both user and group are used

            let fileExists = await this.pathExists(path, permission, user, group, context);
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
                        expected: fileExists.expected,
                        actual: permission ? fileExists.actual : undefined
                    });
                }
            } else {
                results.push({
                    resource: path,
                    status: false,
                    expected: fileExists.expected,
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

    async pathExists(path, expectedPermission, user, group) {
        if(this.connector.type === 'local')
            return this._localPathExists(path, expectedPermission, user, group);
        else
            return this._sshPathExists(path, expectedPermission, user, group);
    }

    /**
     * 
     * @param {string} path path to the file
     * @param {string} expectedPermission check read/write/execute permission `rwx`
     */
    async _sshPathExists(path, expectedPermission, user, group) {
        let isWin = this.connector.type === 'local' && platform === 'win32'; // not supporting user on windows for now
        let fileExists = !(await this.connector.exec(`[ -e "${path}" ] || echo '!e'`)).stdout.includes('!e');

        let status = fileExists;
        let actual = '';
        let expected = ''

        if (fileExists) {

            let isPartPermission = isNaN(expectedPermission);
            if (expectedPermission && isPartPermission) {

                expected = `${expectedPermission} for ${user ? 'user=' + user : 'group=' + group} `;

                // getting permission as ['r', 'w', 'x']
                expectedPermission = expectedPermission.split('');

                const [actualUser, actualGroup, actualPermission] = (await this.connector.exec(`stat ${path} --printf "%U,%G,%A\n"`)).stdout.split(',');
                const [actualUserPermission, actualGroupPermission, actualOtherPermission] = actualPermission.slice(1).match(/.{1,3}/g);
                actual = `${actualPermission} ${actualUser} ${actualGroup}`;

                // for each rwx in the input partial permission
                for (let p of expectedPermission) {

                    if (user) {

                        // if user = root
                        if (user === 'root') status = status && true;

                        // if user is the owner of the file/dir
                        else if (user === actualUser) {
                            status = status && actualUserPermission.includes(p);
                        }

                        else {
                            // getting the group memberships for the user
                            let usersGroups = (await this.connector.exec(`groups ${user}`)).stdout.split(':')[1].trim().split(' ');

                            // if user is in the group of file/dir
                            if (usersGroups.includes(actualGroup))
                                status = status && actualGroupPermission.includes(p);

                            // if user is NOT in the group of file/dir
                            else
                                status = status && actualOtherPermission.includes(p);
                        }

                    }

                    else if (group) {

                        // if group is the group of the file/dir
                        if (group === actualGroup) {
                            status = status && actualGroupPermission.includes(p);
                        }

                        // if group is NOT the group of the file.dir (it's "other")
                        else {
                            status = status && actualOtherPermission.includes(p);
                        }

                    }
                }
            }

            // full permission (octal)
            else if (expectedPermission) {
                const actualPermission = (await this.connector.exec(`stat -c '%a' ${path}`)).stdout;
                status = actualPermission == expectedPermission;
                actual = actualPermission;
                expected = expectedPermission;
            }
        }
        
        // if file/dir doesn't exist
        else
            actual = 'Not found';

        return {
            status, 
            expected: expected,
            actual: actual + (isWin ? ', user is currently not supported on Windows':'')
        }
    }

    async _localPathExists(path, expectedPermission, user, group) {
        let status = await fs.exists(path)
        return {status, actual: 'permission is currently not supported in this connector'};
    }
}

module.exports = reachableCheck;
