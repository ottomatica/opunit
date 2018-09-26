const fs            = require('fs-extra');
const path          = require('path');
const child_process = require('child_process');
const _             = require('lodash');

class Ansible {

    constructor() {
    }

    async playbook(hw_path, autogradeYML, verbose)
    {
        //console.log(`Executing playbook for ${path.basename(hw_path)}`);
        let outputPath = `${path.basename(hw_path)}.json`;
        // print to stdout and file output if verbose, otherwise redirect all output to file.
        let outputStyle = verbose ? `| tee ${outputPath}` : `> ${outputPath}`
        child_process.execSync(`cd ${hw_path} && ANSIBLE_STDOUT_CALLBACK=json ansible-playbook -i autograder-inventory -u ${autogradeYML.ansible_user} ${autogradeYML.ansible_playbook} ${outputStyle}`, {stdio:[0,1,2]});
        let output = fs.readFileSync( path.resolve( hw_path,outputPath ));
        return JSON.parse(output.toString());
    }

    makeInventory(hw_path, hw, autogradeYML)
    {
        // Reset any previous entry
        fs.writeFileSync(path.resolve(hw_path, `autograder-inventory`), "" );

        // Create inventory and docker container for each host
        for( host of autogradeYML.ansible_hosts )
        {
            // Add host:
            fs.appendFileSync(
                path.resolve(hw_path, `autograder-inventory`), 
                `
                [${host}]
                ${hw.id}-${host} ansible_connection=docker ansible_python_interpreter=/usr/bin/python3
                `);
        }
    }
}

// Export factory class
module.exports = Ansible;