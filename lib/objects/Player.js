module.exports = Player;

function Player (config) {
    this.onCreate = function () {
        this.sprite = 'avatar01';
        this.speed = 0;
        this.scale = {
            x: 0.8,
            y: 0.8
        };
        this.x = 100;
        this.y = 100;
    };

    this.moveState = function () {
        if (this.dt) {
            this.speed = pointDis({
                x: this.x,
                y: this.y
            }, {
                x: this.controls.mouse.px,
                y: this.controls.mouse.py
            }) / 5;

            this.speed = Math.min(50, this.speed);

            let lendir = lengthDir(this.speed * this.dt, this.rotation);
            this.x += lendir.x;
            this.y += lendir.y;
        }

        this.direction = pointDir({
            x: this.x,
            y: this.y
        }, {
            x: this.controls.mouse.px,
            y: this.controls.mouse.py
        });
        this.rotation = this.direction;
    };

    this.onStep = function () {
        /*player movement*/
        this.moveState();
    };

    let Object = require(__dirname + '/Object');
    Object.call(this, config);

    return this;
};