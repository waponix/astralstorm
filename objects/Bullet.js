module.exports = function () {
    this.onCreate = () => {
        this.owner = null;
        this.radius = 2.5;
        this.speed = 15;
        this.sprite = new _Sprite('bullet01');
    };

    this.onStep = () => {
        this.sprite.angle = this.direction;
        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

        if (this.x > World.viewport.width || this.x < 0 || this.y > World.viewport.height || this.y < 0) destroy(this);
    };
};