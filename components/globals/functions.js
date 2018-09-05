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
    global.collide = (obj1, obj2, filter) => {
        let result = {};
        result.result = false;
        let keys = Object.keys(obj2);

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let col1 = obj1.collide;
            let col2 = obj2[key].collide;

            let dx = col1.x - col2.x;
            let dy = col1.y - col2.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (key != filter && distance < col1.radius + col2.radius) {
                result.key = key;
                result.x = col1.x;
                result.y = col2.y;
                result.result = true;
            }
        }

        return result;
    };

    //helper for creating object instances
    global.createInstance = (objName) => {
        let obj = require('../../objects/' + objName);
        let instance = {
            _instanceOf: objName,
            _id: id.generate()
        };
        let objKey = objName + 's';
        objKey = objKey.replace(/ys$/i, 'ies');
        _Object.call(instance);
        obj.call(instance);
        if (!World._objects[objKey]) World._objects[objKey] = [];
        World._objects[objKey].push(instance);
        instance._objGroup = objKey;
        if (instance._create) instance._create();
        return instance;
    };

    //destroy object instance
    global.destroy = (object) => {
        if (object._destroy) object._destroy();
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
};