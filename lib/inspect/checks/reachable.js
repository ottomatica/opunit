const chalk = require('chalk');
const Check = require('./check');
const platform = require('os').platform();
const fs = require('fs-extra');
const uidNumber = require("uid-number");

class reachableCheck extends Check {
    constructor(connector, reporter, options) {
        super(connector, reporter, options);
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
                        actual: permission ? fileExists.actual : undefined,
                        msg: fileExists.msg
                    });
                }
            } else {
                results.push({
                    resource: path,
                    status: false,
                    expected: fileExists.expected,
                    actual: permission ? fileExists.actual : undefined,
                    msg: fileExists.msg
                });
            }
        }
        return results;
    }
    
    async report(results) {
        results.forEach((result) => {
            let message = chalk`{gray [${result.resource}]} {white status:} {gray ${result.status}} ` + 
                            (result.expected ? chalk`{white expected permission:} {gray ${result.expected}} ` : '') +
                            (result.actual ? chalk`{white actual permission:} {gray ${result.actual}} ` : '') +
                            (result.msg ? chalk`{white msg:} {gray ${result.msg}}` : '');

            this.reporter.report(message, result.status === true, this.isOptional);
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
        path = this._fixHomePath(path);
        let fileExists = await this._fileExists(path);

        let status = fileExists;
        let actual = '';
        let expected = ''
        let msg;

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
                            if (usersGroups.includes(actualGroup)){
                                status = status && actualGroupPermission.includes(p);
                                msg = `${user} is in ${actualGroup} group`;
                            }

                            // if user is NOT in the group of file/dir
                            else {
                                status = status && actualOtherPermission.includes(p);
                                if(!status) msg = `${user} is NOT in ${actualGroup} group`;
                            }
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
                const [actualPermission, actualUser, actualGroup] = (await this.connector.exec(`stat -c '%a,%U,%G' ${path}`)).stdout.split(',');
                status = actualPermission == expectedPermission;
                if (user) status = status && (actualUser === user);
                if (group) status = status && (actualGroup === group);
                actual = `${actualPermission} ${actualUser} ${actualGroup}`;
                expected = `${expectedPermission}${user ? ' '+user : ''}${group ? ' '+group : ''}`;
            }
        }
        
        // if file/dir doesn't exist
        else
            actual = 'Not found';

        return {
            status, 
            expected: expected,
            actual: actual + (this._isWin() ? ', user is currently not supported on Windows':''),
            msg
        }
    }

    async _localPathExists(path, expectedPermission, user, group) {

        path = this._fixHomePath(path);
        let fileExists = await this._fileExists(path);
        
        let status = fileExists;
        let actual = '';
        let expected = ''
        let msg;

        if (fileExists) {
            
            let isPartPermission = isNaN(expectedPermission);
            if (expectedPermission && isPartPermission) {

                expected = `${expectedPermission} for ${user ? 'user=' + user : 'group=' + group} `;

                // getting permission as ['r', 'w', 'x']
                expectedPermission = expectedPermission.split('');

                const actualUser = (await this.getUserID(path)) + '';
                const actualGroup = (await this.getGroupID(path)) + '';
                const actualPermission = await this.octal2rwx(path);

                const [actualUserPermission, actualGroupPermission, actualOtherPermission] = actualPermission.slice(1).match(/.{1,3}/g);
                actual = `${actualPermission} ${actualUser} ${actualGroup}`;

                let uid = '';
                if (user) {
                    uid = (await this.convertUsernameToUid(user)) + '';
                }

                // for each rwx in the input partial permission
                for (let p of expectedPermission) {

                    if (user) {

                        // if user = root
                        if (user === 'root') status = status && true;

                        // if user is the owner of the file/dir
                        else if (uid === actualUser) {
                            status = status && actualUserPermission.includes(p);
                        }

                        else {
                            // getting the group memberships for the user
                            let usersGroups = await this.getUserGroups(user);

                            if (usersGroups) {
                                // if user is in the group of file/dir
                                if (usersGroups.includes(actualGroup)){
                                    status = status && actualGroupPermission.includes(p);
                                    msg = `${user} is in group with id of ${actualGroup}`;
                                }

                                // if user is NOT in the group of file/dir
                                else {
                                    status = status && actualOtherPermission.includes(p);
                                    if(!status) msg = `${user} is NOT in group with id of ${actualGroup}`;
                                }
                            }
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
                const actualUser = (await this.getUserID(path)) + '';
                const actualGroup = (await this.getGroupID(path)) + '';
                const actualPermission = await this.getOctalPermission(path);
                
                status = actualPermission == expectedPermission;
                if (user) status = status && (actualUser === user);
                if (group) status = status && (actualGroup === group);
                actual = `${actualPermission} ${actualUser} ${actualGroup}`;
                expected = `${expectedPermission}${user ? ' '+user : ''}${group ? ' '+group : ''}`;
            }
        }
        
        // if file/dir doesn't exist
        else
            actual = 'Not found';

        return {
            status, 
            expected: expected,
            actual: actual + (this._isWin() ? ', user is currently not supported on Windows':''),
            msg
        }
    }

    _isWin() {
        return this.connector.type === 'local' && platform === 'win32';// not supporting user on windows for now
    }
    
    _fixHomePath(path) {
        return path.replace(/^~/, '$HOME');
    }

    async _fileExists(path) {
        return !(await this.connector.exec(`[ -e "${path}" ] || echo '!e'`)).stdout.includes('!e');
    }

    async getOctalPermission(path) {
        let stats = await fs.promises.stat(path);
        let octalPermission = '';
        if (stats)
            octalPermission = (stats.mode & parseInt("777", 8)).toString(8);
        return octalPermission;
    }

    async octal2rwx(path) {
        let result = '';
    
        let octal = await this.getOctalPermission(path);
    
        let valueLetters = [[4, "r"], [2, "w"], [1, "x"]];
    
        for (var i = 0; i < octal.length; i++) {
            let o = octal.charAt(i);
            let permission = parseInt(o, 10);
    
            valueLetters.forEach(vl => {
                let value = vl[0];
                let letter = vl[1];
                if (permission >= value) {
                    result += letter;
                    permission -= value;
                } else {
                    result += "-";
                }
            });
        }
    
        return result;
    }
    
    async getGroupID(path) {
        let stats = await fs.promises.stat(path);
        let groupid = '';
        if (stats)
            groupid = stats.gid;
        return groupid;
    }
    
    async getUserID(path) {
        let stats = await fs.promises.stat(path);
        let userid = '';
        if (stats)
            userid = stats.uid;
        return userid;
    }

    convertUsernameToUid(username) {
        return new Promise(resolve => {
            uidNumber(username, function (er, uid, gid) {
                resolve(uid);
              })
        })
        
    }

    async getUserGroups(user) {
        let groups;
        if (platform === 'darwin' || platform === 'linux') {
            groups = (await this.connector.exec(`id -G ${user}`)).stdout.split("\n")[0].split(' ');
        }
        else if (platform === 'win32') {
            // is there a way to get the group id and not name? what does fs.stat return for gid on windows?
            // groups = (await this.connector.exec(`net user ${user}`)).stdout.split("Local Group Membershops")[1].trim().split("Global Group memberships");
        }

        return groups;
    }
}

module.exports = reachableCheck;
