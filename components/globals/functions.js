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
        if (obj1._id === obj2._id) return false;
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
            _id: id()
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

        if (World._audios) {
            for (let i in World._audios) {
                destroy(World._audios[i]);
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

    global.pointDirection = (x1, y1, x2, y2) => {
        let x = x2 - x1;
        let y = y2 - y1;
        return Math.atan2(y, x) / Math.PI * 180;
    };

    global.limit = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    global.drawSprite = (spriteName, x, y, options = {}, onViewport = false, sid = null, exceptSid = null) => {
        let spriteObj = new _Sprite();
        delete spriteObj._update;
        spriteObj._id = id();
        spriteObj.data = spriteName;
        spriteObj.x = x;
        spriteObj.y = y;
        spriteObj.sid = sid;
        if (exceptSid && Array.isArray(exceptSid)) {
            exceptSid = exceptSid.join(',');
        }
        spriteObj.filter = exceptSid;
        spriteObj.onViewport = onViewport;
        if (options) {
            if (options.depth) spriteObj.depth = options.depth;
            if (options.vars) spriteObj.vars = options.vars;
            if (options.angle) spriteObj.angle = options.angle;
            if (options.alpha) spriteObj.alpha = options.alpha;
            if (options.scale && options.scale.x) spriteObj.scale.x = options.scale.x;
            if (options.scale && options.scale.y) spriteObj.scale.y = options.scale.y;
        }
        if (!World._objects.Draw) World._objects.Draw = {};
        World._objects.Draw[spriteObj._id] = spriteObj;
    };

    global.drawText = (text, x, y, options = {}, onViewport = false, sid = null, exceptSid = null) => {
        let textObj = new _Text();
        textObj._id = id();
        textObj.text = text;
        textObj.x = x;
        textObj.y = y;
        textObj.sid = sid;
        if (exceptSid && Array.isArray(exceptSid)) {
            exceptSid = exceptSid.join(',');
        }
        textObj.filter = exceptSid;
        textObj.onViewport = onViewport;
        if (options) {
            if (options.depth) textObj.depth = options.depth;
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

    global.play = (audio, x, y, loop = false) => {
        for (let s in sockets) {
            let socket = sockets[s];
            let player = getPlayerBySocketId(socket.id);
            if (player) {
                let distanceFromPlayer = pointDistance(x, y, player.x, player.y);
                let silence = distanceFromPlayer / 20;
                let vol = Math.floor(100 - silence);
                if (vol <= 0) return;
                let sound = {
                    audio: audio,
                    volume: vol
                };
                socket.emit('play::audio', sound);
            }
        }
    };

    function getPlayerBySocketId(sid) {
        if (World._objects.Players) {
            let player = Object.values(World._objects.Players).find((player) => {
                return player.sid === sid;
            });

            return player;
        }
    }

    global.id = () => {
        return id.generate() + ':' + uuid();
    };

    global.instancesPos = (instanceName, exceptSid = '') => {
        if (Array.isArray(exceptSid)) exceptSid = exceptSid.join();
        let exceptions = new RegExp(exceptSid);
        let instances = World._objects[pluralize(instanceName)];
        let positions = [];

        for (let i in instances) {
            if (!instances[i].sid || (instances[i].sid && !exceptions.test(instances[i].sid))) {
                positions.push({x: instances[i].x, y: instances[i].y});
            }
        }

        return positions;
    };

    global.runScript = (scriptName, $this) => {
        require('../../scripts/' + scriptName).call($this);
    };

    global.lengthDirX = (len, dir) => {
        return len * Math.cos(dir * Math.PI / 180);
    };

    global.lengthDirY = (len, dir) => {
        return len * Math.sin(dir * Math.PI / 180);
    };
};