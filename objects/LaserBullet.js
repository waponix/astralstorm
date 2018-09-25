module.exports = function () {
    let collide = false;
    this.onCreate = function () {
        this.owner = null;
        this.radius = 2.5;
        this.speed = 20;
        this.sprite = new _Sprite(this.x, this.y, 'bullet_01');
        this.sprite.vars.color = "#00FFFF";
        this.body = new _CircleBody(this.x, this.y, 1);
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
        Player: (player) => {
            if (player._id === this.owner._id) return;
            collide = true;
            audioPlay('hit.wav', this.x, this.y);
            player.sprite.vars.color = "#FF6600";
            player.health -= this.damage;
            setTimeout(() => player.sprite.vars.color = player.originalColor, 100);
            destroy(this);
        }
    };

    this.onDestroy = function () {
        if (collide) {
            let explosion = createInstance('Explosion');
            explosion.x = this.x;
            explosion.y = this.y;
        } else {
            let decay = createInstance('LaserBulletDecay');
            decay.x = this.x;
            decay.y = this.y;
            decay.speed = this.speed;
            decay.direction = this.direction;
            decay.sprite.angle = this.direction;
            decay.sprite.vars.color = this.sprite.vars.color;
        }
    };
};