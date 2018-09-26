const fs            = require('fs-extra');
const path          = require('path');
const child_process = require('child_process');
const _             = require('lodash');

class Repos {

    constructor() {
    }

    async clonerepo(hw, hw_path)
    {
        if(!fs.existsSync(hw_path))
            child_process.execSync(`echo "cloning ${hw.repo}" && cd .homeworks && git clone ${hw.repo} ${hw_path}`);
    }
}

// Export factory class
module.exports = Repos;