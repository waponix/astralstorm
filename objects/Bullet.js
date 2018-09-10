module.exports = function () {
    this.onCreate = () => {
        this.owner = null;
        this.radius = 2.5;
        this.speed = 15;
        this.sprite = new _Sprite(this.x, this.y, 'bullet_01');
        this.sprite.vars.color = "#FFFF00";
        this.body = new _CircleBody(this.x, this.y, 10);
        this.damage = 20;
    };

    this.onStep = () => {
        this.sprite.angle = this.direction;
        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

        let distanceFromOwner = pointDistance(this.owner.x, this.owner.y, this.x, this.y);

        if (this.x > World.dimension.width || this.x < 0 || this.y > World.dimension.height || this.y < 0 || distanceFromOwner > 800) destroy(this);
    };

    this.onCollision = {
        'Player': (player) => {
            if (player._id === this.owner._id || !player._draw) return;
            player.sprite.vars.mainColor = "#FF6600";
            player.health -= this.damage;
            setTimeout(() => player.sprite.vars.mainColor = player.originalColor, 100);
            destroy(this);
        }
    };

    this.onDestroy = () => {
        let explosion = createInstance('Explosion');
        explosion.x = this.x;
        explosion.y = this.y;
    };
};