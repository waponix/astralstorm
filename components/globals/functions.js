let id = require('shortid');

module.exports = () => {
    //array sorter
    global.sort = (array, desc, key) => {
        return array.sort(function (a, b) {
            return desc === true ? ~~(key ? a[key] > b[key] : a > b)
                : ~~(key ? a[key] < b[key] : a < b);
        });
    };
    //get a random number from a range
    global.random = (min, max) => {
        return Math.floor((Math.random() * max) + min);
    };

    //check for collision
    global.collide = (obj1, obj2) => {
        if (!obj1.body && !obj2.body) return false;
        let body1 = obj1.body;
        let body2 = obj2.body;

        let dx = body1.x - body2.x;
        let dy = body1.y - body2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance < body1.radius + body2.radius;
    };

    //helper for creating object instances
    global.createInstance = (objName) => {
        let obj = require('../../objects/' + objName);
        let instance = {
            _instanceOf: objName,
            _id: objName.toLowerCase() + '::' + id.generate()
        };
        let objKey = pluralize(objName);
        _Object.call(instance);
        obj.call(instance);
        if (!World._objects[objKey]) World._objects[objKey] = [];
        World._objects[objKey].push(instance);
        instance._objGroup = objKey;
        if (instance._create) instance._create();
        return instance;
    };

    //destroy object instance
    global.destroy = (object, inMemory = true) => {
        if (object._destroy) object._destroy(inMemory);
    };

    //mainly updates the objects in the game
    global.update = () => {
        for (let a in World._objects) {
            let entities = World._objects[a];
            if (entities.length) {
                for (let i in entities) {
                    entities[i]._update();
                }
            }
        }
    };

    //turn a noun into it's plural form
    global.pluralize = (noun) => {
        noun = noun+ 's';
        noun = noun.replace(/ys$/i, 'ies');
        return noun;
    }
};