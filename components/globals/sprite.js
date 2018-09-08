module.exports = () => {
    global._Sprite = function (x, y, data) {
        this.data = data;
        this.scale = {x: 1, y: 1};
        this.offset = {x: 0, y: 0};
        this.angle = 0;
        this.x = x;
        this.y = y;
        this._update = (owner) => {
            this.x = owner.x;
            this.y = owner.y;
        }
    };
};