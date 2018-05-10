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
        $c.controls = $c.controls || {keyPress: {}, mouse: {}, arrow: {}};

        $(window)
            .on('keydown keyup', keyPressEvent)
            .on('mousemove mousedown mouseup', mouseEvent)
            .on('keydown keyup mousemove mousedown mouseup', activeEvent);

        function keyPressEvent(e) {
            const isAlphaNum = RegExp('[a-z|A-Z|0-9]');
            if (isAlphaNum.test(String.fromCharCode(e.which || e.keyCode))) {
                switch (e.type) {
                    case 'keydown':
                        $c.controls.keyPress[String.fromCharCode(e.which || e.keyCode).toUpperCase()] = true; break;
                    case 'keyup':
                        delete $c.controls.keyPress[String.fromCharCode(e.which || e.keyCode).toUpperCase()]; break;
                }
            }
        }

        function mouseEvent(e) {
            const mouseButton = ['L', 'M', 'R'];
            switch (e.type) {
                case 'mousemove':
                    $c.controls.mouse.pX = e.pageX;
                    $c.controls.mouse.pY = e.pageY;
                    $c.controls.mouse.cX = e.clientX;
                    $c.controls.mouse.cY = e.clientY;
                    break;
                case 'mousedown':
                    $c.controls.mouse[mouseButton[e.which - 1]] = true; break;
                case 'mouseup':
                    delete $c.controls.mouse[mouseButton[e.which - 1]]; break;
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

    /*The game step*/
    let lastTick = Date.now();
    $c.init = function () {
        this.inputListeners();
        $c.io.once('init', function (data) {
            $c.id = data.id;
            $c.app = new PIXI.Application({width: data.world.view.width, height: data.world.view.height});
            viewport();
        });
        PIXI.loader.add('avatar01', 'sprites/avatar_01.svg').load((loader, resources) => {
            player = new PIXI.Sprite(resources.avatar01.texture);
            player.x = 100;
            player.y = 100;
            player.anchor.x = 0.5;
            player.anchor.y = 0.5;

            console.log(player);

            $c.app.stage.addChild(player);
        });
        window.requestAnimationFrame($c.step);
    };

    $c.step = function (tick) {
        tick = Date.now();
        let delta = (tick - lastTick) / 1000;
        lastTick = tick;
        $c.dataStream.then(function ($data) {
            if (activity) $c.io.emit('input', $c.controls);
            $c.io.emit('tick', delta);
            $c.dataStream = dataStream();
            for (let i in $data) {
                if ($c.id) {
                    if ($data[i].id === $c.id) {
                        player.x = $data[i].x;
                        player.y = $data[i].y;
                    }
                }
            }
            dataPreviewer.text(JSON.stringify($data, null, 2));
        });
        window.requestAnimationFrame($c.step);
    };

    function dataStream() {
        return new Promise(function (res) {
            $c.io.once('dataStream', function ($data) {
                res($data);
            });
        });
    }

    function viewport() {
        document.body.appendChild($c.app.view);
    }
}(client));

client.init();