const path = require('path');
const os = require('os');

class Utils {
    static resolvePath(destPath) {
        if (!destPath) return destPath;
        if (destPath.slice(0, 2) !== '~/') return path.resolve(destPath);
        return path.resolve(path.join(os.homedir(), destPath.slice(2)));
    }
}

module.exports = Utils;
