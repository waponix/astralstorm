module.exports = Object;

function Object() {
    this.x = 0;
    this.y = 0;
    this.index = 0;
    this.height = 0;
    this.width = 0;
    this.rotation = 0;
    this.mass = 0;
    this.instanceOf = arguments.callee.caller.name;
    this.update = function () {
        if (typeof this.onCreate === 'function') {
            this.onCreate();
            delete this.onCreate;
        }

        if (typeof this.onStep === 'function') {
            this.onStep();
        }
    };
};