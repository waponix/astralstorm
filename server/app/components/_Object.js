module.exports = _Object;

function _Object() {
    let me = this,
        body = {},
        sprite = {},
        controller = {
            keyPresse: {},
            mouse: {},
            arrow: {}
        },
        func = {
            onCreate: function () {},
            onStartStep: function () {},
            onStep: function () {},
            onEndStep: function () {},
            onDestroy: function () {},
            update: function () {
                if (_.isFunc(this.onCreate)) {
                    this.onCreate();
                    delete this.onCreate;
                }
                if (_.isFunc(this.onStartStep)) this.onStartStep();
                if (_.isFunc(this.onStep)) this.onStep();
                if (_.isFunc(this.onEndStep)) this.onEndStep();
                me.body.update();
            }
        };

    Object.defineProperties(me, {
        body: {
            get() {
                return body;
            },
            set(val) {
                body = val;
            }
        },
        sprite: {
            get() {
                return sprite;
            },
            set(val) {
                sprite = val;
            }
        },
        controller: {
            get() {
                return controller;
            },
            set(val) {
                controller = val;
            }
        },
        update: {
            get() {
                return func.update;
            }
        },
        onCreate: {
            get() {
                return func.onCreate;
            },
            set(val) {
                func.onCreate = val;
            }
        },
        onStartStep: {
            get() {
                return func.onStartStep;
            },
            set(val) {
                func.onStartStep = val;
            }
        },
        onStep: {
            get() {
                return func.onStep;
            },
            set(val) {
                func.onStep = val;
            }
        },
        onEndStep: {
            get() {
                return func.onEndStep;
            },
            set(val) {
                func.onEndStep = val;
            }
        },
        onDestroy: {
            get() {
                return func.onDestroy;
            },
            set(val) {
                func.onDestroy = val;
            }
        }
    });
}
