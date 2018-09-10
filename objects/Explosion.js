module.exports = function () {
    this.onCreate = () => {
        this.sprite = new _Sprite(this.x, this.y, 'explosion_01');
        this.sprite.vars.color = "#00FFFF";
        this.sprite.vars.radius = 0;
        this.sprite.vars.strokeSize = 20;
        this.depth = 20;
    };

    this.onStep = () => {
        this.sprite.vars.dashSize -= 1;
        this.sprite.vars.radius += 1;
        this.sprite.vars.strokeSize -= 0.6;
        if (this.sprite.vars.strokeSize < 0) destroy(this);
    };
};