let fs = require('file-system');
let $path = require('path');
module.exports = () => {
    global._Sprite = function (x, y, data) {
        this._id = null;
        this.data = data;
        this.scale = {x: 1, y: 1};
        this.offset = {x: 0, y: 0};
        this.alpha = 1;
        this.angle = 0;
        this.x = x;
        this.y = y;
        this.vars = {};
        this.depth = 0;
        this._type = 'sprite';
        this.sid = null;
        this.onViewport = false;
        this._update = (owner) => {
            this.x = owner.x;
            this.y = owner.y;
            this.depth = owner.depth;
        };
        this._destroy = () => {
            delete World._objects.Draw[this._id];
        };
    };

    //prepare sprites and add to _assets group
    deepScanSprites('assets/sprites');

    function deepScanSprites(path) {
        let paths = fs.readdirSync(path);
        for (let i in paths) {
            let file = $path.join(path, paths[i]);
            if (fs.lstatSync(file).isDirectory()) {
                deepScanSprites(file);
            } else if (fs.lstatSync(file).isFile()) {
                _assets.sprites[paths[i].split('.')[0]] = fs.readFileSync(file, 'utf-8');
            }
        }
    };
};