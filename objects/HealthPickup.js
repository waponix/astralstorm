module.exports = function () {
    let fadeIn = true;
    this.onCreate = function () {
        this.sprite = new _Sprite(this.x, this.y, 'plus_health');
        this.sprite.alpha = 0;
        this.sprite.scale = {x: 0.4, y:0.4};
        this.body = new _CircleBody(this.x, this.y, 5);
        this.effect = 100 * 0.01;
    };

    this.onStep = function () {
        if (fadeIn) {
            this.sprite.alpha += 0.01;
            if (this.sprite.alpha > 1) fadeIn = false;
        } else {
            this.sprite.alpha -= 0.01;
            if (this.sprite.alpha < 0.05) fadeIn = true;
        }
    };

    this.onCollision = {
        Player: (player) => {
            player.health += this.effect;
            player.sprite.vars.color = '#00FF00';
            setTimeout(() => player.sprite.vars.color = player.originalColor, 100);
            destroy(this);
        }
    };
};