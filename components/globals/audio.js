let fs = require('file-system');
let $path = require('path');
module.exports = () => {
    //prepare audios and add to _assets group
    deepScanAudios('assets/audios');

    function deepScanAudios(path) {
        let paths = fs.readdirSync(path);
        for (let i in paths) {
            let file = $path.join(path, paths[i]);
            if (fs.lstatSync(file).isDirectory()) {
                deepScanAudios(file);
            } else if (fs.lstatSync(file).isFile()) {
                _assets.audios[paths[i]] = {url: paths[i]};
            }
        }
    };
};