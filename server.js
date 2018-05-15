/**
 * AstralStorm server script
 * @author Eric Bermejo Reyes | eric.bermejo.reyes@gmail.com
 */

let server = {};

(function ($s) {
    require('./lib/components/instanceFns')($s);
    require('./lib/components/utilFns')();

    let config = require('./lib/config');
    let gameStep = config.gameStep;

    $s.express = require('express');
    $s.app = $s.express();

    $s.http = require('http').Server($s.app);
    $s.io = require('socket.io')($s.http);

    $s.obj = {
        Player: require('./lib/objects/Player'),
    };

    let startTime = Date.now();
    $s.step = function () {
        $s.world.elapse = Date.now() - startTime;
        update($s.world);
        $s.io.emit('dataStream', minifyWorld($s.world));
    };

    $s.http.listen(config.port, '0.0.0.0', function () {
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
            world: config.world,
            resource: config.resource
        });

        $c
            .once('disconnect', function () {
                delete $s.world[this.id];
            })
            .on('input', function (controls) {
                if ($s.world[this.id] && $s.world[this.id].id === controls.id) Object.assign($s.world[this.id].controls, controls.events);
            })
            .on('tick', function (dt) {
                if ($s.world[this.id] && $s.world[this.id].id === dt.id) $s.world[this.id].dt = dt.delta;
            });
    });

    function init() {
        console.log('$server running at ' + config.port);
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
        let hash = require('shorthash');
        let world = JSON.parse(JSON.stringify($s.world));
        for (let i in world) {
            if (world[i].id) {
                for (let pi in world[i]) {
                    if (world[i].preserve && world[i].preserve.indexOf(pi) < 0) {
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
}(server));