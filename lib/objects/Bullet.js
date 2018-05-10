module.exports = Bullet;

function Bullet(config) {
    this.onStep = function () {
        this.x += 1;
        if (this.x > 1000) destroy(this);
    };

    let BaseObject = require(__dirname + '/BaseObject');
    BaseObject.call(this, config);

    return this;
}