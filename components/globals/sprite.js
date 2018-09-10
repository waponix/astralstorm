let fs = require('file-system');
module.exports = () => {
    global._Sprite = function (x, y, data) {
        this.data = data;
        this.scale = {x: 1, y: 1};
        this.offset = {x: 0, y: 0};
        this.alpha = 1;
        this.angle = 0;
        this.x = x;
        this.y = y;
        this.vars = {};
        this._update = (owner) => {
            this.x = owner.x;
            this.y = owner.y;
        }
    };

    global._assets = {};
    let sprites = fs.readdirSync('assets/sprites');
    for (let s in sprites) {
        _assets[sprites[s].split('.')[0]] = fs.readFileSync('assets/sprites/' + sprites[s], 'utf-8');
    }
};