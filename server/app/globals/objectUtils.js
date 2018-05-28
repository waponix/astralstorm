module.exports = ($s) => {
    return {
        createInstance: function () {
            let
                objName = arguments[0] || null,
                setup = arguments[2] || (typeof arguments[1] === 'object' ? arguments[1] : {}),
                key = $s.lib.hash.unique((arguments.length > 1 ? (typeof arguments[1] !== 'object' ? arguments[1] : $s.lib.uuid()) : $s.lib.uuid()));
            let o = $s.obj.get(objName);
            if (!$s.world.has(key)) {
                $s.world.set(key, Object.assign(new o({ref: key}), setup));
            }
        },
        getInstance: function (instance) {
            let ref = _.isObj(instance) ? instance.ref : instance;
            let hashRef = $s.lib.hash.unique(ref);
            switch (true) {
                case $s.world.has(ref): return $s.world.get(ref); break;
                case $s.world.has(hashRef): return $s.world.get(hashRef); break;
            }
        },
        destroyInstance: function (instance) {
            if (_.isObj(instance) && $.isFunc(instance.onDestroy)) instance.onDestroy();
            let ref = _.isObj(instance) ? instance.ref : instance;
            let hashRef = $s.lib.hash.unique(ref);
            switch (true) {
                case $s.world.has(ref): $s.world.delete(ref); break;
                case $s.world.has(hashRef): $s.world.delete(hashRef); break;
            }
        },
        update: function () {
            if (arguments.callee.caller.name === 'step') {
                let objs = $s.world[Symbol.iterator]();
                for (let obj of objs) {
                    obj[1].update();
                }
            }
        },
        genId: function () {
            return $s.lib.uuid();
        },
        defineObject: function () {
            let
                objName = arguments[0] || null,
                extend = !_.isNone(arguments[2]) ? arguments[1] : null,
                construct = arguments[2] || arguments[1] || null;
                !extend ? extend = $s.obj._Object : extend = $s.obj.get(extend);
            let obj = {[objName]: function () {
                let me = this, ref = arguments[0] ? arguments[0].ref : null;
                if (ref) {
                    Object.defineProperty(me, 'ref', {
                        get() {
                            return ref;
                        }
                    });
                }
                if (extend) extend.call(me);
                if (construct) construct.call(me);
            }};
            obj = obj[objName];
            return obj;
        }
    };
};