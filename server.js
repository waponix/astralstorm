/**
 * AstralStorm server script
 * @author Eric Bermejo Reyes | eric.bermejo.reyes@gmail.com
 */

let server = {};

(function ($s) {
    let gameStep = 16 / 1000;
    let config = require('./lib/config');

    $s.express = require('express');
    $s.app = $s.express();

    $s.http = require('http').Server($s.app);
    $s.io = require('socket.io')($s.http);

    $s.obj = {
        Player: require('./lib/objects/Player'),
        Bullet: require('./lib/objects/Bullet')
    };

    let startTime = Date.now();
    $s.step = function () {
        $s.world.elapse = Date.now() - startTime;
        update($s.world);
        $s.io.emit('dataStream', minifyWorld($s.world));
    };

    $s.http.listen(config.port, function () {
        init();
    });

    $s.app
        .use($s.express.static('public'))
        .get('/', function (req, res) {
            res.sendFile(__dirname + '/client.html');
        });

    $s.io.on('connect', function ($c) {
        createInstance('Player', null, $c.id);

        $c.emit('init', {
            id: $s.world[$c.id].id,
            world: config.world
        });

        $c
            .once('disconnect', function () {
                delete $s.world[this.id];
            })
            .on('input', function (controls) {
                if ($s.world[this.id]) Object.assign($s.world[this.id].controls, controls);
            })
            .on('tick', function (dt) {
                if ($s.world[this.id]) $s.world[this.id].dt = dt;
            });
    });

    function init() {
        console.log('$server running at 3000');
        $s.world = config.world;
        setInterval($s.step, gameStep);
    }

    function update(obj) {
        for (let i in obj) {
            if (obj[i].update) obj[i].update();
        }
    }

    function minifyWorld() {
        'use strict';
        let preserve = [
            'id',
            'instanceOf',
            'x',
            'y',
            'width',
            'height',
            'rotation',
            'scale'
        ];
        let hash = require('shorthash');
        let world = JSON.parse(JSON.stringify($s.world));
        for (let i in world) {
            if (world[i].instanceOf) {
                for (let pi in world[i]) {
                    if (preserve.indexOf(pi) < 0) {
                        delete world[i][pi];
                    } else {
                        Object.defineProperty(world[i], pi, {writable: false});
                    }
                }
                world[hash.unique(i)] = world[i];
                delete world[i];
            } else {
                Object.defineProperty(world, i, {writable: false});
            }
        }
        return world;
    }

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
}(server));