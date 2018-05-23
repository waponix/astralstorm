module.exports = Object;

function Object() {
    let me = this;
    me.x = 0;
    me.y = 0;
    me.index = 0;
    me.height = 0;
    me.width = 0;
    me.rotation = 0;
    me.mass = 0;
    me.instanceOf = arguments.callee.caller.name;
    me.id = $.genId();
    me.controls = {
        keyPress: {},
        mouse: {},
        arrow: {}
    };

    me.update = function () {
        if (typeof me.onStartStep === 'function') me.onStartStep();
        if (typeof me.onStep === 'function') me.onStep();
        if (typeof me.onEndStep === 'function') me.onEndStep();
    };

    if (typeof this.onCreate === 'function') {
        this.onCreate();
    }
};