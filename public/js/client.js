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
                    $c.events.mouse.px = e.pageX;
                    $c.events.mouse.py = e.pageY;
                    $c.events.mouse.cx = e.clientX;
                    $c.events.mouse.cy = e.clientY;
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
        $c.objects = {};
        $c.fObjects = {};
        $c.bObjects = {};
        $c.io.once('init', function (data) {
            $c.id = data.id;
            $c.app = new PIXI.Application();
            viewport();
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
                delta: delta / 1000
            });
            $c.dataStream = dataStream();

            objectsHandler($data);
            dataPreviewer.text(JSON.stringify($data, null, 2));
        });
        window.requestAnimationFrame($c.step);
    };

    function load(resource) {
        loaded = false;
        $c.foreground = new PIXI.Container();
        $c.background = new PIXI.Container();
        $c.world = new PIXI.Container();
        PIXI.loader
            .add(resource)
            .load(setup);
    }

    function setup() {
        loaded = true;

        let textInfo = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 14
        });

        $c.fObjects.gameTime = new PIXI.Text('', textInfo);

        $c.foreground.addChild($c.fObjects.gameTime);
        $c.app.stage.addChild($c.background);
        $c.app.stage.addChild($c.world);
        $c.app.stage.addChild($c.foreground);
    }

    function objectsHandler(objectStack) {
        if (loaded) {
            let gt = new Date(objectStack.elapse);
            gt.H = gt.getUTCHours() < 10 ? '0' + gt.getUTCHours() : gt.getUTCHours();
            gt.M = gt.getUTCMinutes() < 10 ? '0' + gt.getUTCMinutes() : gt.getUTCMinutes();
            gt.S = gt.getUTCSeconds() < 10 ? '0' + gt.getUTCSeconds() : gt.getUTCSeconds();
            $c.fObjects.gameTime.text = gt.H + ':' + gt.M + ':' +gt.S;

            for (let key in objectStack) {
                let object = objectStack[key].id ? objectStack[key] : null;
                if (object) {
                    if (keyExistsOnObject(key)) {
                        //update object
                        Object.assign($c.objects[key], object);
                    } else {
                        //when all resources are loaded create instance for world
                        createInstance(key, object);
                    }
                }
            }

            //scan for non-existing objects then remove from world
            for (let key in $c.objects) {
                if (!keyExistOnStack(key, objectStack)) {
                    $c.world.removeChild($c.objects[key]);
                    delete $c.objects[key];
                }
            }
        }
    }

    function keyExistsOnObject(key) {
        return !!$c.objects[key];
    }

    function keyExistOnStack(key, stack) {
        return !!stack[key];
    }

    function createInstance(key, obj) {
        $c.objects[key] = new PIXI.Sprite(PIXI.loader.resources[obj.sprite].texture);
        Object.assign($c.objects[key], obj);

        $c.world.addChild($c.objects[key]);
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