
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');

class Profile {
    async get(repo, filename) {
        return new Promise(((resolve, reject) => {
            let filepath = `https://raw.githubusercontent.com/${repo}/master/${filename}`;
            https.get(filepath, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Cannot find ${filename}`));
                } else {
                    let dir = path.join(os.homedir(), 'opunit');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    let file = path.join(dir, `${repo.replace('/', '-')}-${filename}`);
                    let stream = fs.createWriteStream(file);

                    stream.on('finish', () => {
                        console.log(`Using profile ${repo}:${filename}`);
                        resolve(file);
                    });
                    res.pipe(stream);
                }
            })
                .on('error', reject);
        }));
    }
}

// Export factory class
module.exports = Profile;
