module.exports = (me, body, sprite, controller, events, fns) => {
    return {
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
                return events.update;
            }
        },
        onCreate: {
            get() {
                return events.onCreate;
            },
            set(val) {
                events.onCreate = val;
            }
        },
        onStartStep: {
            get() {
                return events.onStartStep;
            },
            set(val) {
                events.onStartStep = val;
            }
        },
        onStep: {
            get() {
                return events.onStep;
            },
            set(val) {
                events.onStep = val;
            }
        },
        onEndStep: {
            get() {
                return events.onEndStep;
            },
            set(val) {
                events.onEndStep = val;
            }
        },
        onDestroy: {
            get() {
                return events.onDestroy;
            },
            set(val) {
                events.onDestroy = val;
            }
        },
        destroy: {
            get() {
                return fns.destroy;
            }
        },
        init: {
            get() {
                return fns.init;
            },
            set(func) {
                fns.init = func;
            }
        }
    };
};