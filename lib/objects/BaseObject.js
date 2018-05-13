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
    this.anchor = {
        x: 0.5,
        y: 0.5
    }
    this.rotation = 0;
    this.direction = 0;

    if (config && typeof config === 'object') {
        Object.assign(this, config);
    };

    this.id = uuid();
    this.instanceOf = arguments.callee.caller.name;
    this.controls = {
        keyPress: {},
        keyPressTime: {},
        mouse: {
            px: 0,
            py: 0,
            cx: 0,
            cy: 0
        },
        mouseTime: {},
        arrow: {},
        arrowTime: {},
    };
    this.dt = 0;
    this.event = function () {
        if (this.onCreate) {
            this.onCreate();
            delete this.onCreate;
        }
        if (this.onStep) this.onStep();
    };

    this.update = function () {
        controlDuration(this.controls);
        this.event();
    };

    return this;
};

function controlDuration(controls) {
    for (let i in controls.keyPress) {
        controls.keyPressTime[i] = controls.keyPressTime[i] || 0;
        controls.keyPressTime[i]++;
    }
    for (let i in controls.keyPressTime) {
        if (!controls.keyPress[i]) delete controls.keyPressTime[i];
    }

    let mouseKey = ['L', 'M', 'R'];
    for (let i in mouseKey) {
        controls.mouseTime[mouseKey[i]] = controls.mouseTime[mouseKey[i]] || 0;
        controls.mouseTime[mouseKey[i]]++;
    }
    for (let i in controls.mouseTime) {
        if (!controls.mouse[i]) delete controls.mouseTime[i];
    }
}