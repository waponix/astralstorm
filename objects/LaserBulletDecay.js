module.exports = function () {
    this.onCreate = function () {
        this.sprite = new _Sprite(this.x, this.y, 'laser_bullet_decay');
        this.sprite.vars.length = -25;
        this.speed = 0;
        this.direction = 0;
    };

    this.onDraw = function () {
        this.sprite.vars.length += 1;
        if (this.sprite.vars.length >= 0) destroy(this);
    };

    this.onStep = function () {
        this.speed -= 0.5;
        if (this.speed < 0) this.speed = 0;
        this.x += lengthDirX(this.speed, this.direction);
        this.y += lengthDirY(this.speed, this.direction);
    };
};