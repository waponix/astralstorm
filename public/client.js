$(document).ready(function (initial) {
    addEventListener("beforeunload", function (e) {
        let confirmationMessage = 'Are you sure you want to leave?';

        e.returnValue = confirmationMessage;
        return confirmationMessage;
    });

    let game = new Canvas('#game-world', {width: $(window).width(), height: $(window).height()});
    let socket = io();

    playerKey = null;
    _objects = null;
    _world = null;
    _assets = null;

    //pointer lock canvas on click
    document.onclick = () => {
        let name = '';
        if (!playerKey) {
            name = promptIGN('Enter your name: ').toUpperCase().substr(0, 10);
            playerKey = name + random(1000, 1000000);
            socket.emit('player::new', {key: playerKey, name});
        }
        pointerLock(game.elem);
    };

    socket.once('assets::load', (data) => {
        _assets = data;
    });
    socket.once('world::load', (data) => {
        _world = data;
    });

    socket.on('objects::update', function (data) {
        _objects = data;
    });

    _input = {
        mouse: {X: game.elem.width * 0.5, Y: game.elem.height * 0.5}
    };

    //event listeners for user input
    $(document).on('keydown keyup mousedown mouseup', (e) => {
        if (document.pointerLockElement === game.elem || document.mozPointerLockElement === game.elem) {
            let key = String.fromCharCode(e.which || e.keyCode).toUpperCase();
            let mouseKey = ['L', 'M', 'R'];
            if (!_input.keyPress) _input.keyPress = {};
            switch (e.type) {
                case 'keydown':
                    e.preventDefault();
                    _input.keyPress[key] = true;
                    break;
                case 'keyup':
                    delete _input.keyPress[key];
                    break;
                case 'mousedown':
                    _input.mouse[mouseKey[(e.which || e.keyCode) - 1]] = true;
                    break;
                case 'mouseup':
                    delete _input.mouse[mouseKey[(e.which || e.keyCode) - 1]];
            }
        }
    });

    mouseX = game.elem.width * 0.5;
    mouseY = game.elem.height * 0.5;

    game.elem.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === game.elem || document.mozPointerLockElement === game.elem) {
            mouseX += e.movementX;
            mouseY += e.movementY;
        }
    }, false);

    /*DISPLAY MANAGEMENT*/
    requestAnimationFrame(step);

    function step(tick) {
        requestAnimationFrame(step);
        if (!playerKey && !_objects && !_assets) return;

        let main = _objects ? _objects.find((obj) => {
            return obj.id === playerKey;
        }) : null;

        if (!!main) game.follow(main);

        socket.emit('io::update', {key: playerKey, io: _input});

        game.clear();

        game.ctx.strokeStyle = '#0f0f0f';
        // game.ctx.setLineDash([2, 10]);
        //draw background
        for (let i = 0; i <= _world.width; i += 100) {
            game.ctx.beginPath();
            game.ctx.moveTo(i, 0);
            game.ctx.lineTo(i, _world.height);
            game.ctx.stroke();
        }

        for (let i = 0; i <= _world.height; i += 100) {
            game.ctx.beginPath();
            game.ctx.moveTo(0, i);
            game.ctx.lineTo(_world.width, i);
            game.ctx.stroke();
        }

        for (let i in _objects) {
            let data = _objects[i];
            //draw objects;
            game.drawPath(data);
        }

        game.restore();

        if (!!main && !main.destroyed) {
            //draw player cursor
            let mColor = '#FFFFFF';
            game.ctx.setLineDash([]);
            game.ctx.save();
            game.ctx.translate(mouseX, mouseY);
            game.draw(0 - 10, 0, 20, 1, mColor);
            game.draw(0, 0 - 10, 1, 20, mColor);
            game.draw(0 - 15, 0 - 15, 10, 1, mColor);
            game.draw(0 + 5, 0 + 15, 10, 1, mColor);
            game.draw(0 + 5, 0 - 15, 10, 1, mColor);
            game.draw(0 - 15, 0 + 15, 10, 1, mColor);
            game.draw(0 - 15, 0 - 15, 1, 10, mColor);
            game.draw(0 + 15, 0 + 5, 1, 10, mColor);
            game.draw(0 + 15, 0 - 15, 1, 10, mColor);
            game.draw(0 - 15, 0 + 5, 1, 10, mColor);
            game.ctx.strokeStyle = mColor;
            game.ctx.beginPath();
            game.ctx.lineWidth = 1;
            game.ctx.arc(0 + 0.5, 0 + 0.5, 5, 0, 2 * Math.PI);
            game.ctx.stroke();
            game.ctx.restore();
        }
    };
});

/*FUNCTIONS*/
function random(min, max) {
    return Math.floor((Math.random() * max) + min);
}

function promptIGN(msg) {
    let IGN = prompt(msg);
    return IGN ? IGN : promptIGN(msg);
}

function pointerLock(canvas) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
}

/*Objects*/
function Canvas(target, o) {
    this.elem = document.querySelector(target);
    this.ctx = this.elem.getContext('2d');
    this.pan = {x: 0, y: 0};
    this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

    this.elem.width = o.width;
    this.elem.height = o.height;

    this.draw = function (x, y, w, h, fillStyle, lineWidth, strokeStyle) {
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

    this.drawPath = (object) => {
        if (!object._draw) return;
        if (!object.sprite) return;
        if (!_assets || !_assets[object.sprite.data]) return;
        let sprite = object.sprite;
        sprite.data = _assets[sprite.data];
        this.save();
        this.ctx.translate(sprite.x, sprite.y);
        this.ctx.scale(sprite.scale.x, sprite.scale.y);
        this.ctx.rotate(sprite.angle * Math.PI / 180);
        for (let key in sprite.data) {
            let a = null, v = null;

            if (typeof sprite.data[key] === 'object') {
                a = Object.keys(sprite.data[key])[0];
                v = sprite.data[key][a];
            } else {
                a = sprite.data[key];
            }

            switch(a) {
                case 'fs': this.ctx.fillStyle = v; break;
                case 'f': this.ctx.fill(); break;
                case 'ss': this.ctx.strokeStyle = v; break;
                case 's': this.ctx.stroke(); break;
                case 'lw': this.ctx.lineWidth = v; break;
                case 'gco': this.ctx.globalCompositeOperation = v; break;
                case 'bp': this.ctx.beginPath(); break;
                case 'cp': this.ctx.closePath(); break;
                case 'mt': this.ctx.moveTo(v[0], v[1]); break;
                case 'lt': this.ctx.lineTo(v[0], v[1]); break;
                case 'a': this.ctx.arc(v[0], v[1], v[2], v[3], v[4], v[5]); break;
                case 'at': this.ctx.arcTo(v[0], v[1], v[2], v[3], v[4]); break;
                case 'qct': this.ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]); break;
                case 'bct': this.ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]); break;
            }
        }
        this.restore();
    };

    this.write = (text, x, y, font, fillStyle) => {

        if (text && fillStyle && font) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.font = font;
            this.ctx.fillText(text, x, y);
        }
    };

    this.clear = function () {
        this.ctx.clearRect(this.bound.x, this.bound.y, this.elem.width, this.elem.height);
    };

    //make the viewport follow an object always call this.restore at the very end of each step
    this.follow = function (object) {
        let xSpeed = object.xPrevious - object.x;
        let ySpeed = object.yPrevious - object.y;
        this.save();
        this.pan.x = Math.min(Math.max(0, (object.x - ($(window).width() * 0.5)) + xSpeed), _world.width - $(window).width());
        this.pan.y = Math.min(Math.max(0, (object.y - ($(window).height() * 0.5)) + ySpeed), _world.height - $(window).height());

        _input.mouse.X = this.pan.x + mouseX;
        _input.mouse.Y = this.pan.y + mouseY;

        _input.mouse.X = Math.max(this.bound.x, Math.min(_input.mouse.X, this.bound.w));
        _input.mouse.Y = Math.max(this.bound.y, Math.min(_input.mouse.Y, this.bound.h));

        mouseX = Math.max(0, Math.min(mouseX, this.elem.width));
        mouseY = Math.max(0, Math.min(mouseY, this.elem.height));

        this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

        this.ctx.translate(0 - this.pan.x, 0 - this.pan.y);
    };
}