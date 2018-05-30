module.exports = _Object;

function _Object() {
    let me = this,
        body = {},
        sprite = {},
        controller = {
            keyPress: {},
            mouse: {},
            arrow: {}
        },
        events = {
            onCreate: function () {},
            onStartStep: function () {},
            onStep: function () {},
            onEndStep: function () {},
            onDestroy: function () {},
            update: function () {
                if (_.isFunc(this.onCreate)) {
                    this.onCreate();
                    this.onCreate = null;
                }
                if (_.isFunc(this.onStartStep)) this.onStartStep();
                if (_.isFunc(this.onStep)) this.onStep();
                if (_.isFunc(this.onEndStep)) this.onEndStep();
            }
        },
        fns = {
            destroy: function () {
                _.destroyInstance(me);
            }
        };

    _.getterSetters(me, require('./_ObjectProperties')(me, body, sprite, controller, events, fns));

    me.id = _.genId();
}
