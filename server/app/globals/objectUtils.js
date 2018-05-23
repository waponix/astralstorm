module.exports = ($s) => {
    return {
        createInstance: function () {
            let
                objName = arguments[0] || null,
                setup = arguments[2] || (typeof arguments[1] === 'object' ? arguments[1] : {}),
                key = $s.lib.hash.unique((arguments.length > 1 ? (typeof arguments[1] !== 'object' ? arguments[1] : $s.lib.uuid()) : $s.lib.uuid()));
            let object = $s.obj.get(objName);
            if (!$s.world.has(key)) {
                $s.world.set(key, Object.assign(new object(), {key: key}, setup));
            }
        },
        getInstance: function (instance) {
            return $s.world.get(instance.key);
        },
        destroyInstance: function (instance) {
            if ($.isFunc(instance.onDestroy)) instance.onDestroy();
            return $s.world.delete(instance.key);
        },
        update: function () {
            let bodies;
            if (arguments.callee.caller.name === 'step')
            bodies = $s.world[Symbol.iterator]();
            for (let body of bodies) {
                body[1].update();
            }
        },
        genId: function () {
            return $s.lib.uuid();
        }
    };
};