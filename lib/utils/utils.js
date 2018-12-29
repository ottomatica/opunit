const path = require('path');
const os = require('os');

class Utils {
    static resolvePath(destPath) {
        if (!destPath) return destPath;
        if (destPath[0] !== '~') return path.resolve(destPath);
        return path.join(os.homedir(), path.resolve(destPath.slice(1)));
    }
}

module.exports = Utils;
