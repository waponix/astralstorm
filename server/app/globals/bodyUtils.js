module.exports = ($s) => {
    return {
        body: $s.lib.matter.Body,
        bodies: $s.lib.matter.Bodies,
        engine: $s.lib.matter.Engine,
        world: $s.lib.matter.World,
        constraint: $s.lib.matter.Constraint,
        composite: $s.lib.matter.Composite,
        composites: $s.lib.matter.Composites,
        events: $s.lib.matter.Events,
        vector: $s.lib.matter.Vector,
        createBody: function (obj, options = {}) {
            let body = this.body.create(options);
            this.getterSetters(body, {ref: {value: obj.ref}});
            return body;
        },
        destroyBody: function(body) {
            this.composite.remove($s.phyWorld, body, true);
        },
        getBodies: function (composite) {
            return this.composite.allBodies(composite);
        }
    };
};