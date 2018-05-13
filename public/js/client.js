/**
 * AstralStorm client script
 * @author Eric Bermejo Reyes | eric.bermejo.reyes@gmail.com
 */

let client = {};

(function ($c) {
    let dataPreviewer = $('pre#data');
    let activity = false;

    $c.io = io();

    /*Player input listeners*/
    $c.inputListeners = function () {
        $c.events = $c.events || {keyPress: {}, mouse: {}, arrow: {}};

        $(window)
            .on('keydown keyup', keyPressEvent)
            .on('mousemove mousedown mouseup', mouseEvent)
            .on('keydown keyup mousemove mousedown mouseup', activeEvent);

        function keyPressEvent(e) {
            const isAlphaNum = RegExp('[a-z|A-Z|0-9]');
            if (isAlphaNum.test(String.fromCharCode(e.which || e.keyCode))) {
                switch (e.type) {
                    case 'keydown':
                        $c.events.keyPress[String.fromCharCode(e.which || e.keyCode).toUpperCase()] = true; break;
                    case 'keyup':
                        delete $c.events.keyPress[String.fromCharCode(e.which || e.keyCode).toUpperCase()]; break;
                }
            }
        }

        function mouseEvent(e) {
            const mouseButton = ['L', 'M', 'R'];
            switch (e.type) {
                case 'mousemove':
                    $c.events.mouse.pX = e.pageX;
                    $c.events.mouse.pY = e.pageY;
                    $c.events.mouse.cX = e.clientX;
                    $c.events.mouse.cY = e.clientY;
                    break;
                case 'mousedown':
                    $c.events.mouse[mouseButton[e.which - 1]] = true; break;
                case 'mouseup':
                    delete $c.events.mouse[mouseButton[e.which - 1]]; break;
            }
        }

        function activeEvent() {
            if (!activity) {
                activity = true;
                setTimeout(function () {
                    activity = false;
                }, 5000);
            }
        }
    };

    $c.dataStream = dataStream();

    $c.init = function () {
        this.inputListeners();
        $c.world = {};
        $c.io.once('init', function (data) {
            $c.id = data.id;
            $c.app = new PIXI.Application();
            viewport()
            load(data.resource);
            window.requestAnimationFrame($c.step);
        });
    };

    /*The game step*/
    $c.step = function (tick) {
        $c.dataStream.then(function ($data) {
            tick = performance.now();
            let delta = Math.round((tick - $c.lastTick));
            $c.lastTick = tick;

            if (activity) $c.io.emit('input', {
                id: $c.id,
                events: $c.events
            });
            $c.io.emit('tick', {
                id: $c.id,
                delta: delta
            });
            $c.dataStream = dataStream();

            objectsHandler($data);
            dataPreviewer.text(JSON.stringify($data, null, 2));
        });
        window.requestAnimationFrame($c.step);
    };

    function load(resource) {
        loaded = false;
        PIXI.loader
            .add(resource)
            .load(setup);
    }

    function setup() {
        loaded = true;
    }

    function objectsHandler(objectStack) {
        for (let key in objectStack) {
            let object = objectStack[key].id ? objectStack[key] : null;
            if (object) {
                if (keyExistOnWorld(key)) {
                    //update object
                    Object.assign($c.world[key], object);
                } else {
                    //when all resources are loaded create instance for new object
                    if (loaded) {
                        createInstance(key, object);
                    }
                }
            }
        }

        //scan for non-existing objects then remove from world
        for (let key in $c.world) {
            if (!keyExistOnStack(key, objectStack)) {
                $c.app.stage.removeChild($c.world[key]);
                delete $c.world[key];
            }
        }
    }

    function keyExistOnWorld(key) {
        return !!$c.world[key];
    }

    function keyExistOnStack(key, stack) {
        return !!stack[key];
    }

    function createInstance(key, obj) {
        $c.world[key] = new PIXI.Sprite(PIXI.loader.resources[obj.sprite].texture);
        Object.assign($c.world[key], obj);

        $c.app.stage.addChild($c.world[key]);
    }

    function dataStream() {
        return new Promise(function (res) {
            $c.io.once('dataStream', function ($data) {
                res($data);
            });
        });
    }

    function viewport() {
        document.body.appendChild($c.app.view);
        $c.app.renderer.view.style.position = "absolute";
        $c.app.renderer.view.style.display = "block";
        $c.app.renderer.autoResize = true;
        viewportResize();
    }

    function viewportResize() {
        if ($c.app) $c.app.renderer.resize(window.innerWidth, window.innerHeight);
    }
}(client));

client.init();