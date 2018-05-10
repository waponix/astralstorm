module.exports = Bullet;

function Bullet(config) {
    let BaseObject = require(__dirname + '/BaseObject');
    BaseObject.call(this, config);

    return this;
}