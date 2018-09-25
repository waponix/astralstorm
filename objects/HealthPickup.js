module.exports = function () {
    let fadeIn = true;
    this.onCreate = function () {
        this.sprite = new _Sprite(this.x, this.y, 'plus_health');
        this.sprite.alpha = 0.3;
        this.body = new _CircleBody(this.x, this.y, 10);
        this.effect = 100 * 0.15;
    };

    this.onStep = function () {
        if (fadeIn) {
            this.sprite.alpha += 0.01;
            if (this.sprite.alpha > 1) fadeIn = false;
        } else {
            this.sprite.alpha -= 0.01;
            if (this.sprite.alpha < 0.3) fadeIn = true;
        }
    };

    this.onCollision = {
        Player: (player) => {
            audioPlay('life_up.wav', this.x, this.y);
            player.health += this.effect;
            player.sprite.vars.color = '#00FF00';
            setTimeout(() => player.sprite.vars.color = player.originalColor, 100);
            destroy(this);
        }
    };
};