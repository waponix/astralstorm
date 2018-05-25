module.exports = _Object;

function _Object() {
    let me = this;

    define
        ('onCreate', function () {})
        ('onStep', function () {})
        ('onStartStep', function () {})
        ('onEndStep', function () {})
        ('onDestroy', function () {})
        ('update', function () {
            if (_.isFunc(me.onCreate)) {
                me.onCreate();
                me.onCreate = null;
            }
            if (_.isFunc(me.onStartStep)) me.onStartStep();
            if (_.isFunc(me.onStep)) me.onStep();
            if (_.isFunc(me.onEndStep)) me.onEndStep();
        });

    function define(prop, val = null, options = {}) {
        let o = Object.assign({
                get: true,
                set: true,
                enumerable: !_.isFunc(val)
            }, options),
            scope = {};

        if (_.isBool(o.set) && o.set) {
            o.set = (value) => {
                scope[prop] = value;
            };
        } else if(!_.isFunc(o.set)) {
            delete o.set;
        }

        if (_.isBool(o.get) && o.get) {
            o.get = () => {
                return scope[prop];
            }
        } else if(!_.isFunc(o.get)) {
            delete o.get;
        }

        Object.defineProperty(me, prop, o);

        return define;
    };
};