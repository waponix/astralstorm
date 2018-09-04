module.exports = () => {
    global._Sprite = function (data) {
        this.data = data;
        this.scale = {x: 1, y: 1};
        this.offset = {x: 0, y: 0};
        this.angle = 0;
        this.x = 0;
        this.y = 0;
    };
};