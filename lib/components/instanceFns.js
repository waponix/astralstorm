module.exports = function ($s) {
    global.createInstance = function (objectName, config, key) {
        if (key) {
            $s.world[key] = new $s.obj[objectName](config);
        } else {
            $s.world[Date.now()] = new $s.obj[objectName](config);
        }

        return true;
    }

    global.destroy = function (obj) {
        for (let key in $s.world) {
            if ($s.world[key] === obj) {
                if (obj.onDestroy) obj.onDestroy();
                delete $s.world[key];
            }
        }
    }
};