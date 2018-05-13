module.exports = Player;

function Player (config) {
    this.onCreate = function () {
        this.sprite = 'avatar01';
        this.speed = 0.02;
        this.bulletDelay = 50;
    };
    this.onStep = function () {
        /*player movement*/
        if (this.controls.keyPress.D) this.x += this.speed * this.dt;
        if (this.controls.keyPress.A) this.x -= this.speed * this.dt;
        if (this.controls.keyPress.S) this.y += this.speed * this.dt;
        if (this.controls.keyPress.W) this.y -= this.speed * this.dt;
    };

    let Object = require(__dirname + '/BaseObject');
    Object.call(this, config);

    return this;
};