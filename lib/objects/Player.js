module.exports = Player;

function Player (config) {
    this.onCreate = function () {
        this.sprite = 'avatar01';
        this.speed = 0;
        this.x = 100;
        this.y = 100;
    };

    this.moveState = function () {
        // if (this.controls.keyPress.D) this.x += this.speed * this.dt;
        // if (this.controls.keyPress.A) this.x -= this.speed * this.dt;
        // if (this.controls.keyPress.S) this.y += this.speed * this.dt;
        // if (this.controls.keyPress.W) this.y -= this.speed * this.dt;

        if (this.dt) {
            this.speed = Math.sqrt(Math.pow(this.controls.mouse.px - this.x, 2) + Math.pow(this.controls.mouse.py - this.y, 2));
            this.x += (this.speed * this.dt) * Math.cos(this.rotation);
            this.y += (this.speed * this.dt) * Math.sin(this.rotation);
        }

        this.direction = Math.atan2(this.controls.mouse.py - this.y, this.controls.mouse.px - this.x);
        this.rotation = this.direction;
    };

    this.onStep = function () {
        /*player movement*/
        this.moveState();
    };

    let Object = require(__dirname + '/BaseObject');
    Object.call(this, config);

    return this;
};