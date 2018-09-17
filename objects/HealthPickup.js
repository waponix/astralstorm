module.exports = function () {
    let fadeIn = true;
    this.onCreate = function () {
        this.sprite = new _Sprite(this.x, this.y, 'plus_health');
        this.sprite.alpha = 0;
        this.body = new _CircleBody(this.x, this.y, 15);
        this.effect = 100 * 0.03;
        setTimeout(() => {
            let hp = createInstance('HealthPickup');
            hp.x = random(0, World.dimension.width);
            hp.y = random(0, World.dimension.height);
        },random(30 * 1000, 60 * 1000));
    };

    this.onStep = function () {
        if (fadeIn) {
            this.sprite.alpha += 0.01;
            if (this.sprite.alpha > 1) fadeIn = false;
        } else {
            this.sprite.alpha -= 0.01;
            if (this.sprite.alpha < 0.02) fadeIn = true;
        }
    };

    this.onCollision = {
        Player: (player) => {
            player.health += this.effect;
            destroy(this);
        }
    };
};