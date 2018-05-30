/**
 * AstralStorm client script
 * @author Eric Bermejo Reyes | eric.bermejo.reyes@gmail.com
 */

let client = {};

(function ($c) {
    let dataHolder = $('pre#data');
    let activity = false;

    $c.io = io();

    $c.eventListener = function () {
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
        this.eventListener();
        $c.io.once('s::c', function () {
            window.requestAnimationFrame($c.step);
        });
    };

    /*The game step*/
    $c.step = function (tick) {
        if (activity) $c.io.emit('p::i', $c.events);

        $c.dataStream.then(function ($data) {
            tick = performance.now();
            let delta = Math.round((tick - $c.lastTick));
            $c.lastTick = tick;
            dataHolder.text(JSON.stringify($data, null, 2));
            $c.dataStream = dataStream();
        });
        window.requestAnimationFrame($c.step);
    };


    function dataStream() {
        return new Promise(function (res) {
            $c.io.once('d::s', function ($data) {
                res($data);
            });
        });
    }
}(client));

client.init();