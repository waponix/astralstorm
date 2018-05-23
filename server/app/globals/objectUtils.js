module.exports = ($s) => {
    return {
        createInstance: function () {
            let
                objName = arguments[0] || null,
                setup = arguments[2] || (typeof arguments[1] === 'object' ? arguments[1] : {}),
                key = $s.lib.hash.unique((arguments.length > 1 ? (typeof arguments[1] !== 'object' ? arguments[1] : $s.lib.uuid()) : $s.lib.uuid()));
            console.log($s.obj);
            let obj = $s.obj.get(objName);
            if (!$s.world.has(key)) {
                let instance = $s.world
                                .set(key, Object.assign(new obj(), setup))
                                .get(key);
                Object.defineProperty(instance, 'ref', {
                    get() {
                        return key;
                    }
                });
            }
        },
        getInstance: function (instance) {
            return $s.world.get(instance.ref);
        },
        destroyInstance: function (instance) {
            if ($.isFunc(instance.onDestroy)) instance.onDestroy();
            return $s.world.delete(instance.ref);
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
                let me = this;
                if (extend) extend.call(me);
                if (construct) construct.call(me);
            }};
            obj = obj[objName];
            return obj;
        }
    };
};