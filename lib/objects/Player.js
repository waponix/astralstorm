module.exports = Player;

function Player (config) {
    this.onCreate = function () {
        this.speed = 5;
        this.bulletDelay = 20;
    };
    this.onStep = function () {
        /*player movement*/
        if (this.controls.keyPress.D) this.x += this.speed * this.dt;
        if (this.controls.keyPress.A) this.x -= this.speed * this.dt;
        if (this.controls.keyPress.S) this.y += this.speed * this.dt;
        if (this.controls.keyPress.W) this.y -= this.speed * this.dt;

        if (this.controls.mouse.L) {
            if (this.controls.mouseTime.L % 50 === 0) createInstance('Bullet', {owner: this.id});
        }
    };

    let Object = require(__dirname + '/BaseObject');
    Object.call(this, config);

    return this;
};