$(document).ready(function () {
    'use strict';
    window.playerKey = null;
    window._objects = null;
    window._world = null;
    window._assets = null;

    let game = new Canvas('#game-world', {width: $(window).width(), height: $(window).height()});
    let socket = io();

    socket.once('assets::load', (data) => {
        window._assets = data;
    });
    socket.once('world::load', (data) => {
        window._world = data;
    });

    $('#homescreen #join-button').on('click', () => {
        let username = $('#homescreen #username').val();
        if (username) {
            window.playerKey = username + random(1000, 1000000);
            socket.emit('player::new', {key: window.playerKey, username});
            game.pointerLock();
            $('#homescreen').hide();
        } else if (!$('#homescreen #username').hasClass('field-empty')){
            $('#homescreen #username').addClass('field-empty');
        }
    });

    $('#homescreen #username').on('keydown', (e) => {
        if (e.which === 13) {
            $('#homescreen #join-button').triggerHandler('click');
        }
    });

    $(game.elem).on('click', () => {
        if (!document.pointerLockElement) {
            game.pointerLock();
        }
    });

    window._input = {
        mouse: {X: 0, Y: 0},
        viewport: {X: 0, Y: 0, width: game.elem.width, height: game.elem.height}
    };

    //event listeners for user input
    $(document).on('keydown keyup mousedown mouseup click', (e) => {
        if (document.pointerLockElement === game.elem || document.mozPointerLockElement === game.elem) {
            let key = String.fromCharCode(e.which || e.keyCode).toUpperCase();
            let mouseKey = ['L', 'M', 'R'];
            if (!window._input.keyPress) window._input.keyPress = {};
            switch (e.type) {
                case 'keydown':
                    e.preventDefault();
                    window._input.keyPress[key] = true;
                    break;
                case 'keyup':
                    delete window._input.keyPress[key];
                    break;
                case 'mousedown':
                    window._input.mouse[mouseKey[(e.which || e.keyCode) - 1]] = true;
                    break;
                case 'mouseup':
                    delete window._input.mouse[mouseKey[(e.which || e.keyCode) - 1]];
            }
        }
    });

    window.mouseX = game.elem.width * 0.5;
    window.mouseY = game.elem.height * 0.5;

    game.elem.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === game.elem || document.mozPointerLockElement === game.elem) {
            window.mouseX += e.movementX;
            window.mouseY += e.movementY;
        }
    }, false);

    window._reader = null;

    ss(socket).on('data::stream', (dataStream) => {
        let decoder = new TextDecoder("utf-8");
        let dataString = '';
        dataStream.on('data', (chunk) => {
            dataString += decoder.decode(chunk);
        }).on('end', () => window._reader = Promise.resolve(dataString));
    });

    /*DISPLAY MANAGEMENT*/
    requestAnimationFrame(step);

    function step(tick) {
        socket.emit('io::update', {key: window.playerKey, io: window._input});

        if (window._reader && window._reader.then) {
            window._reader.then((data) => {
                window._objects = JSON.parse(data);

                if (!window._assets) return;

                let main = window._objects ? window._objects.find((obj) => {
                    return obj.id === window.playerKey;
                }) : null;

                if (!!main) game.follow(main);

                if (!!main && main.destroyed && $('#homescreen').is(':hidden')) {
                    $('#homescreen').fadeIn();
                    game.exitPointerLock();
                }

                game.clear();

                game.ctx.strokeStyle = '#002024';
                game.ctx.setLineDash([2, 2]);
                //draw background
                for (let i = 0; i <= window._world.width; i += 100) {
                    game.ctx.beginPath();
                    game.ctx.moveTo(i, 0);
                    game.ctx.lineTo(i, window._world.height);
                    game.ctx.stroke();
                }
                for (let i = 0; i <= window._world.height; i += 100) {
                    game.ctx.beginPath();
                    game.ctx.moveTo(0, i);
                    game.ctx.lineTo(window._world.width, i);
                    game.ctx.stroke();
                }

                for (let i in window._objects) {
                    let object = window._objects[i];
                    //draw objects;
                    if (!object.onViewport) game.draw(object);
                }

                game.restore();

                for (let i in window._objects) {
                    let object = window._objects[i];
                    //draw objects;
                    if (object.onViewport) game.draw(object);
                }
            });
        }
        requestAnimationFrame(step);
    };
});

/*FUNCTIONS*/
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*Objects*/
function Canvas(target, o) {
    this.elem = document.createElement('canvas');
    this.ctx = this.elem.getContext('2d');
    this.elem.width = o.width;
    this.elem.height = o.height;
    this.pan = {x: 0, y: 0};
    this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

    this.draw2 = function (x, y, w, h, fillStyle, lineWidth, strokeStyle) {
        if (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(x, y, w, h);
        }
        if (strokeStyle && lineWidth) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(x, y, w, h);
        }
    };

    this.save = () => {
        this.ctx.save();
    };

    this.restore = () => {
        this.ctx.restore();
    };

    this.inBound = (obj) => {
        let offset = 100;
        return obj.x <= this.bound.w + offset && obj.x >= this.bound.x - offset && obj.y <= this.bound.h + offset && obj.y >= this.bound.y - offset;
    };

    this.draw = (object) => {
        switch (object._type) {
            case 'sprite': this.drawSprite(object); break;
            case 'text': this.drawText(object); break;
        }
    };

    this.drawSprite = (object) => {
        if (!object._draw) return;
        if (!object.data) return;
        if (!window._assets || !window._assets[object.data]) return;
        if (!object.onViewport && !this.inBound(object)) return;
        let sprite = object;
        sprite.data = JSON.parse(window._assets[sprite.data]);
        let dataString = JSON.stringify(sprite.data);

        //replace the placeholders with the proper values
        if (Object.keys(sprite.vars).length) {
            for (let i in sprite.vars) {
                let regex = new RegExp('\:' + i, 'g');
                dataString = dataString.replace(regex, sprite.vars[i]);
            }
            sprite.data = JSON.parse(dataString);
        }

        let eval = (strExp) => {
            return new Function('return ' + strExp + ';');
        };

        let parser = (datas) => {
            let regex = new RegExp('^eq:');
            for (let i in datas) {
                let data = datas[i];
                if (typeof data === 'object') {
                    parser(data);
                } else if (typeof data === 'string' && regex.test(data)) {
                    datas[i] = eval(data.replace(regex, ''))();
                }
            }
        };
        //parse equations inside the path map
        parser(sprite.data);

        this.save();
        this.ctx.translate(sprite.x, sprite.y);
        this.ctx.scale(sprite.scale.x, sprite.scale.y);
        this.ctx.rotate(sprite.angle * Math.PI / 180);
        this.ctx.globalAlpha = sprite.alpha;
        for (let key in sprite.data) {
            let a = null, v = null;

            if (typeof sprite.data[key] === 'object') {
                a = Object.keys(sprite.data[key])[0];
                v = sprite.data[key][a];
            } else {
                a = sprite.data[key];
            }

            switch(a) {
                case 'ga': this.ctx.globalAlpha = v; break;
                case 'fs': this.ctx.fillStyle = v; break;
                case 'f': this.ctx.fill(); break;
                case 'ss': this.ctx.strokeStyle = v; break;
                case 's': this.ctx.stroke(); break;
                case 'lw': this.ctx.lineWidth = v; break;
                case 'sld': this.ctx.setLineDash([v[0], v[1]]); break;
                case 'gco': this.ctx.globalCompositeOperation = v; break;
                case 'bp': this.ctx.beginPath(); break;
                case 'cp': this.ctx.closePath(); break;
                case 'mt': this.ctx.moveTo(v[0], v[1]); break;
                case 'lt': this.ctx.lineTo(v[0], v[1]); break;
                case 'a': this.ctx.arc(v[0], v[1], v[2], v[3], v[4], v[5]); break;
                case 'at': this.ctx.arcTo(v[0], v[1], v[2], v[3], v[4]); break;
                case 'qct': this.ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]); break;
                case 'bct': this.ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]); break;
                case 'r': this.ctx.rotate(v); break;
            }
        }
        this.restore();
    };

    this.drawText = (object) => {
        this.ctx.save();
        this.ctx.translate(object.x, object.y);
        this.ctx.rotate(object.angle);
        this.ctx.globalAlpha = object.alpha;
        this.ctx.fillStyle = object.color;
        this.ctx.textAlign = object.align;
        this.ctx.font = Object.values(object.style).join(' ');
        this.ctx.fillText(object.text, 0, 0);
        this.ctx.restore();
    };

    this.clear = function () {
        let square = 200;
        for (let xi = 0; xi <= this.elem.width; xi += square) {
            for (let yi = 0; yi <= this.elem.height; yi += square) {
                this.ctx.clearRect(this.bound.x + xi, this.bound.y + yi, square, square);
            }
        }
    };

    //make the viewport follow an object always call this.restore at the very end of each step
    this.follow = function (object) {
        let xSpeed = object.xPrevious - object.x;
        let ySpeed = object.yPrevious - object.y;

        this.save();

        let target = {
            x: (object.x - ($(window).width() * 0.5)) + xSpeed,
            y: (object.y - ($(window).height() * 0.5)) + ySpeed
        };

        this.pan = target;

        this.pan.x = Math.min(Math.max(0, this.pan.x), window._world.width - $(window).width());
        this.pan.y = Math.min(Math.max(0, this.pan.y), window._world.height - $(window).height());

        window._input.mouse.X = this.pan.x + window.mouseX;
        window._input.mouse.Y = this.pan.y + window.mouseY;

        window._input.mouse.X = Math.max(this.bound.x, Math.min(window._input.mouse.X, this.bound.w));
        window._input.mouse.Y = Math.max(this.bound.y, Math.min(window._input.mouse.Y, this.bound.h));

        window.mouseX = Math.max(0, Math.min(window.mouseX, this.elem.width));
        window.mouseY = Math.max(0, Math.min(window.mouseY, this.elem.height));

        window._input.viewport.X = window.mouseX;
        window._input.viewport.Y = window.mouseY;

        this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

        this.ctx.translate(0 - this.pan.x, 0 - this.pan.y);
    };

    this.pointerLock = function () {
        this.elem.requestPointerLock = this.elem.requestPointerLock || this.elem.mozRequestPointerLock;
        this.elem.requestPointerLock();
    };

    this.exitPointerLock = function () {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        if (document.pointerLockElement === this.elem) document.exitPointerLock();
    };

    document.body.appendChild(this.elem);
}