module.exports = _.defineObject('Player', function () {
    let me = this;
    me.body = _.createBody(me);

    me.onCreate = function () {
        _.createInstance('Bullet', {owner: me});
    };

    me.onStep = function () {
        let x = me.body.position.x;
        let y = me.body.position.y;

        if (me.controller.keyPress.D) x += 1;
        if (me.controller.keyPress.A) x -= 1;
        if (me.controller.keyPress.S) y += 1;
        if (me.controller.keyPress.W) y -= 1;

        let position = _.vector.create(x, y);

        _.body.setPosition(me.body, position);
    };
});