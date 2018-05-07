module.exports = BaseObject;

let uuid = require('uuid');

function BaseObject (config) {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.scale = {
        x: 1,
        y: 1,
    };
    this.rotation = 0;
    this.direction = 0;

    if (config && typeof config === 'object') {
        Object.assign(this, config);
    };

    this.id = uuid();
    this.instanceOf = arguments.callee.caller.name;
    this.controls = {
        keyPress: {},
        mouse: {},
        arrow: {}
    };
    this.event = function () {
        if (this.onCreate) {
            this.onCreate();
            delete this.onCreate;
        }
        if (this.onStep) this.onStep();
    };

    this.update = function () {
        this.event();
    };

    return this;
};