
const https  = require('https');
const fs     = require('fs');
const path   = require('path');

class Profile {

    constructor() {}

    async get(repo, filename) {

        return new Promise(function(resolve, reject)
        {
            var filepath = 'https://raw.githubusercontent.com/' + repo + '/master/' + filename;
            https.get(filepath, function(res) {
                if (res.statusCode !== 200) {
                    reject(new Error('Cannot find ' + filename));
                } else {

                    let dir = path.join(require('os').homedir(), 'opunit');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    let file = path.join(dir, repo.replace('/','-') + '-' + filename);
                    var stream = fs.createWriteStream(file);

                    stream.on('finish', function()
                    {
                        console.log(`Using profile ${repo}:${filename}`);
                        resolve(file);
                    });
                    res.pipe(stream);

                }
            })
            .on('error', reject);
        });
    }

}

// Export factory class
module.exports = Profile;

