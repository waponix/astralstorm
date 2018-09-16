let id = require('shortid');
let uuid = require('uuid/v4');

module.exports = () => {
    //array sorter
    global.sort = (array, key, desc = false) => {
        return array.sort(function (a, b) {
            return desc === false ? ~~(key ? a[key] > b[key] : a > b)
                : ~~(key ? a[key] < b[key] : a < b);
        });
    };
    //get a random number from a range
    global.random = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
            _id: id.generate() + ':' + uuid()
        };
        let objKey = pluralize(objName);
        _Object.call(instance);
        obj.call(instance);
        if (!World._objects[objKey]) World._objects[objKey] = {};
        World._objects[objKey][instance._id] = instance;
        if (instance._create) instance._create();
        return instance;
    };

    //destroy object instance
    global.destroy = (object, inMemory = true) => {
        if (object._destroy) object._destroy(inMemory);
    };

    //mainly updates the objects in the game
    global.update = (timestamp) => {
        for (let a in World._objects) {
            let entities = World._objects[a];
            if (Object.keys(entities).length) {
                for (let i in entities) {
                    if (entities[i]._update) entities[i]._update();
                }
            }
        }
        if (timestamp) {
            World.elapsed = Date.now() - timestamp;
        }
    };

    global.clean = () => {
        if (World._objects.Draw) {
            for (let i in World._objects.Draw) {
                destroy(World._objects.Draw[i]);
            }
        }
    };

    //turn a noun into it's plural form
    global.pluralize = (noun) => {
        noun = noun+ 's';
        noun = noun.replace(/ys$/i, 'ies');
        return noun;
    };

    global.pointDistance = (x1, y1, x2, y2) => {
        let x = x2 - x1;
        let y = y2 - y1;
        return Math.sqrt((x * x) + (y * y));
    };

    global.limit = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    global.drawSprite = (spriteName, x, y, options = {}, onViewport = false, sid = null) => {
        let spriteObj = new _Sprite();
        delete spriteObj._update;
        spriteObj._id = id.generate() + ':' + uuid();
        spriteObj.data = spriteName;
        spriteObj.x = x;
        spriteObj.y = y;
        spriteObj.sid = sid;
        spriteObj.onViewport = onViewport;
        if (options) {
            if (options.vars) spriteObj.vars = options.vars;
            if (options.angle) spriteObj.angle = options.angle;
            if (options.alpha) spriteObj.alpha = options.alpha;
            if (options.scale && options.scale.x) spriteObj.scale.x = options.scale.x;
            if (options.scale && options.scale.y) spriteObj.scale.y = options.scale.y;
        }
        if (!World._objects.Draw) World._objects.Draw = {};
        World._objects.Draw[spriteObj._id] = spriteObj;
    };

    global.drawText = (text, x, y, options = {}, onViewport = false, sid = null) => {
        let textObj = new _Text();
        textObj._id = id.generate() + ':' + uuid();
        textObj.text = text;
        textObj.x = x;
        textObj.y = y;
        textObj.sid = sid;
        textObj.onViewport = onViewport;
        if (options) {
            if (options.angle) textObj.angle = options.angle;
            if (options.alpha) textObj.alpha = options.alpha;
            if (options.color) textObj.color = options.color;
            if (options.align) textObj.align = options.align;
            if (options.size) textObj.style.size = options.size;
            if (options.font) textObj.style.font = options.font;
        }
        if (!World._objects.Draw) World._objects.Draw = {};
        World._objects.Draw[textObj._id] = textObj;
    };
};