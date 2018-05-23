module.exports = _Object;

function _Object() {
    let me = this,
        onStep = null,
        onStartStep = null,
        onEndStep = null,
        onDestroy = null,
        controls = {
            keyPress: {},
            mouse: {},
            arrow: {}
        };
    me.x = 0;
    me.y = 0;
    me.index = 0;
    me.height = 0;
    me.width = 0;
    me.rotation = 0;
    me.mass = 0;

    Object.defineProperties(me, {
        id: {value: _.genId()},
        instanceOf: {value: arguments.callee.caller.name},
        controls: {
            get() {
                return controls;
            },
            set(ctrl) {
                Object.assign(controls, ctrl);
            }
        },
        update: {
            get() {
                return update;
            }
        },
        onCreate: {
            set(func) {
                func.call(me);
            }
        },
        onStep: {
            get() {
                return onStep;
            },
            set(func) {
                onStep = func;
            }
        },
        onStartStep: {
            get() {
                return onStartStep;
            },
            set(func) {
                onStartStep = func;
            }
        },
        onEndStep: {
            get() {
                return onEndStep;
            },
            set(func) {
                onEndStep = func;
            }
        },
        onDestroy: {
            get() {
                return onDestroy;
            },
            set(func) {
                onDestroy = func;
            }
        }
    });

    function update () {
        if (typeof me.onStartStep === 'function') me.onStartStep();
        if (typeof me.onStep === 'function') me.onStep();
        if (typeof me.onEndStep === 'function') me.onEndStep();
    };
};