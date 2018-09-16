module.exports = function () {
    this.onCreate = function () {
        this.owner = null;
        this.radius = 2.5;
        this.speed = 15;
        this.sprite = new _Sprite(this.x, this.y, 'bullet_01');
        this.sprite.vars.color = "#FFFF00";
        this.body = new _CircleBody(this.x, this.y, 10);
        this.damage = 5;
        this.range = 700;
    };

    this.onStep = function () {
        this.sprite.angle = this.direction;
        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

        let distanceFromOwner = pointDistance(this.owner.x, this.owner.y, this.x, this.y);

        if (this.x > World.dimension.width || this.x < 0 || this.y > World.dimension.height || this.y < 0 || distanceFromOwner > this.range) destroy(this);
    };

    this.onCollision = {
        'Player': (player) => {
            if (player._id === this.owner._id && !player.destroyed) return
            player.sprite.vars.color = "#FF6600";
            player.health -= this.damage;
            setTimeout(() => player.sprite.vars.color = player.originalColor, 100);
            destroy(this);
        }
    };

    this.onDestroy = function () {
        let explosion = createInstance('Explosion');
        explosion.x = this.x;
        explosion.y = this.y;
    };
};