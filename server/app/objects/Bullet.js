module.exports = _.defineObject('Bullet', function () {
    let me = this;
    me.body = _.createBody(me);

    me.onCreate = function () {
        timer = 0;
    };

    me.onStep = function () {
        me.position = me.owner.body.position;
        timer += 1;
        if (timer > 5000) me.destroy();
    };
});