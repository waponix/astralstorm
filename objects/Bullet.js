module.exports = function () {
    this.onCreate = () => {
        this.owner = null;
        this.radius = 2.5;
        this.speed = 15;
        this.sprite = new _Sprite(this.x, this.y, 'bullet01');
        this.body = new _CircleBody(this.x, this.y, 10);
        this.damage = 5;
    };

    this.onStep = () => {
        this.sprite.angle = this.direction;
        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

        if (this.x > World.dimension.width || this.x < 0 || this.y > World.dimension.height || this.y < 0) destroy(this);
    };

    this.onCollision = {
        'Player': (player) => {
            if (player._id === this.owner._id || !player._draw) return;
            player.health -= this.damage;
            destroy(this);
        }
    };
};