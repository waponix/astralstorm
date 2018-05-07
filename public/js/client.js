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
                    $c.controls.mouse[mouseButton[e.which - 1]] = true;
                    break;
                case 'mouseup':
                    delete $c.controls.mouse[mouseButton[e.which - 1]];
                    break;
            }
        }

        function activeEvent() {
            activity = true;
            setTimeout(function () {
                activity = false;
            }, 1000);
        }
    };

    $c.dataStream = dataStream();

    /*The game step*/
    let lastTick = Date.now();
    $c.step = function (tick) {
        tick = Date.now();
        let delta = (tick - lastTick) / 1000;
        lastTick = tick;
        $c.dataStream.then(function ($data) {

            dataPreviewer.text(JSON.stringify($data, null, 2));

            if (activity) $c.io.emit('input', $c.controls);
            $c.io.emit('tick', delta);
            $c.dataStream = dataStream();
        });

        window.requestAnimationFrame($c.step);
    };

    $c.init = function () {
        this.inputListeners();
        window.requestAnimationFrame($c.step);
    };

    function dataStream()
    {
        return new Promise(function (res) {
            $c.io.once('dataStream', function ($data) {
                res($data);
            });
        });
    }
}(client));


client.init();