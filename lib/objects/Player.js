module.exports = Player;

function Player (config) {
    this.onCreate = function () {
        speed = 5;
        bulletDelay = 50;
    };
    this.onStep = function () {
        /*player movement*/
        if (this.controls.keyPress.D) this.x += speed * this.dt;
        if (this.controls.keyPress.A) this.x -= speed * this.dt;
        if (this.controls.keyPress.S) this.y += speed * this.dt;
        if (this.controls.keyPress.W) this.y -= speed * this.dt;
    };

    let Object = require(__dirname + '/BaseObject');
    Object.call(this, config);

    return this;
};