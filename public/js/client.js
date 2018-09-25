$(document).ready(function () {
    let playerKey = null;
    let _objects = null;
    let _world = null;
    let _assets = null;
    let layers = {};
    let _dFlag = null;
    let _input = {mouse: {X: 0, Y: 0}};
    let mouseX = null;
    let mouseY = null;
    let _reader = null;
    let _deltaTime = Date.now() / 1000;
    let socket = io();

    //process loaded assets
    socket.once('assets::load', (data) => {
        soundManager.setup({
            debugMode: false
        });
        _assets = data;
        //load every audio resource
        for (let i in _assets.audios) {
            _assets.audios[i] = soundManager.createSound(_assets.audios[i]);
        }
        soundManager.onready(() => {
            socket.once('world::load', (data) => {
                _world = data;

                let width = 1280;
                let height = 720;

                layers.background = new Canvas('#game-world', {width: width, height: height});
                layers.activeground = new Canvas('#game-world', {width: width, height: height, transparent: true});
                layers.foreground = new Canvas('#game-world', {width: width, height: height, transparent: true});

                mouseX = layers.activeground.elem.width * 0.5;
                mouseY = layers.activeground.elem.height * 0.5;

                $('#homescreen #join-button').on('click', () => {
                    let username = $('#homescreen #username').val();
                    if (username && !playerKey) {
                        playerKey = username + random(1000, 1000000);
                        socket.emit('player::new', {key: playerKey, username});
                        layers.foreground.pointerLock();
                        $('#homescreen').hide();
                        socket.once('dFlag', (flag) => _dFlag = Promise.resolve(flag));
                    } else if (!$('#homescreen #username').hasClass('field-empty')) {
                        $('#homescreen #username').addClass('field-empty');
                    }
                });

                $('#homescreen #username').on('keydown', (e) => {
                    if (e.which === 13) {
                        $('#homescreen #join-button').triggerHandler('click');
                    }
                });

                $(layers.foreground.elem).on('click', () => {
                    if (!document.pointerLockElement) {
                        layers.foreground.pointerLock();
                    }
                });

                //event listeners for user input
                $(document).on('keydown keyup mousedown mouseup click', (e) => {
                    if (document.pointerLockElement === layers.foreground.elem || document.mozPointerLockElement === layers.foreground.elem) {
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

                layers.foreground.elem.addEventListener('mousemove', (e) => {
                    if (document.pointerLockElement === layers.foreground.elem || document.mozPointerLockElement === layers.foreground.elem) {
                        mouseX += e.movementX;
                        mouseY += e.movementY;
                    }
                }, false);

                ss(socket).on('data::stream', (dataStream) => {
                    let decoder = new TextDecoder("utf-8");
                    let dataString = '';
                    dataStream.on('data', (chunk) => {
                        dataString += decoder.decode(chunk);
                    }).on('end', () => _reader = Promise.resolve(dataString));
                });

                /*DISPLAY MANAGEMENT*/
                requestAnimationFrame(step);

                function step(tick) {
                    socket.emit('io::update', {key: playerKey, io: _input});
                    socket.emit('viewport', {
                        x: layers.activeground.pan.x,
                        y: layers.activeground.pan.y,
                        width: layers.activeground.elem.width,
                        height: layers.activeground.elem.height,
                        mouseX: mouseX,
                        mouseY: mouseY
                    });

                    if (_dFlag && _dFlag.then) {
                        _dFlag.then((flag) => {
                            if (flag && $('#homescreen').is(':hidden')) {
                                playerKey = null;
                                _dFlag = null;
                                $('#homescreen').fadeIn();
                                layers.foreground.exitPointerLock();
                            }
                        });
                    }

                    if (_reader && _reader.then) {
                        _reader.then((data) => {
                            _deltaTime = (tick / 1000) - _deltaTime;

                            _objects = JSON.parse(data);

                            if (!_assets) return;

                            let main = _objects.find((obj) => {
                                return obj.id === playerKey;
                            });

                            if (!!main) {
                                layers.background.follow(main);
                                layers.activeground.follow(main);
                            }

                            layers.background.clear();
                            layers.activeground.clear();
                            layers.foreground.clear();

                            layers.background.ctx.strokeStyle = '#002024';
                            layers.background.ctx.setLineDash([2, 2]);
                            //draw background
                            for (let i = 0; i <= _world.width; i += 100) {
                                layers.background.ctx.beginPath();
                                layers.background.ctx.moveTo(i, 0);
                                layers.background.ctx.lineTo(i, _world.height);
                                layers.background.ctx.stroke();
                            }
                            for (let i = 0; i <= _world.height; i += 100) {
                                layers.background.ctx.beginPath();
                                layers.background.ctx.moveTo(0, i);
                                layers.background.ctx.lineTo(_world.width, i);
                                layers.background.ctx.stroke();
                            }

                            for (let i in _objects) {
                                let object = _objects[i];
                                //draw objects;
                                if (!object.onViewport) layers.activeground.draw(object);
                            }

                            layers.background.restore();
                            layers.activeground.restore();

                            for (let i in _objects) {
                                let object = _objects[i];
                                //draw objects;
                                if (object.onViewport && object._type === 'sprite') layers.foreground.draw(object);
                            }
                            for (let i in _objects) {
                                let object = _objects[i];
                                //draw objects;
                                if (object.onViewport && object._type === 'text') layers.foreground.draw(object);
                            }

                            _deltaTime = tick / 1000;
                        });
                    }
                    requestAnimationFrame(step);
                };

                socket.on('audio::play', (audio) => {
                    if (!_assets.audios[audio.audio]) return;
                    if (audio.loop) {
                        if (!_assets.audios[audio.audio].playState) {
                            _assets.audios[audio.audio].setVolume(audio.volume).play({
                                loops: 0
                            });
                        }
                    } else {
                        _assets.audios[audio.audio].setVolume(audio.volume).play();
                    }
                });

                socket.on('audio::stop', (audio) => {
                    if (!_assets.audios[audio]) return;
                    if (_assets.audios[audio].playState) _assets.audios[audio].stop();
                });

                /*FUNCTIONS*/
                function random(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                /*Objects*/

                function Canvas(target, o) {
                    let clearBounds = [];
                    this.elem = document.createElement('canvas');
                    this.ctx = this.elem.getContext('2d', {alpha: o.transparent || false});
                    this.elem.width = o.width;
                    this.elem.height = o.height;
                    this.pan = {x: 0, y: 0};
                    this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

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
                            case 'sprite':
                                this.drawSprite(object);
                                break;
                            case 'text':
                                this.drawText(object);
                        }
                    };

                    this.drawSprite = (object) => {
                        let points = {
                            xs: [],
                            ys: [],
                            addPoint: function (x, y) {
                                this.xs.push(x);
                                this.ys.push(y);
                            },
                            getBoundingBox: function () {
                                this.xs.sort((a, b) => {return a - b;});
                                this.ys.sort((a, b) => {return a - b;});
                                return {
                                    x: object.x,
                                    y: object.y,
                                    x1: this.xs.shift(),
                                    y1: this.ys.shift(),
                                    x2: this.xs.pop(),
                                    y2: this.ys.pop(),
                                    a: object.angle,
                                    s: object.scale
                                };
                            }
                        };
                        if (!object._draw) return;
                        if (!object.data) return;
                        if (!_assets || !_assets.sprites[object.data]) return;
                        if (!object.onViewport && !this.inBound(object)) return;
                        let sprite = object;
                        sprite.data = JSON.parse(_assets.sprites[sprite.data]);
                        let dataString = JSON.stringify(sprite.data);

                        sprite.x = Math.floor(sprite.x);
                        sprite.y = Math.floor(sprite.y);
                        sprite.angle = Math.floor(sprite.angle);

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

                            switch (a) {
                                case 'ga':
                                    this.ctx.globalAlpha = v;
                                    break;
                                case 'fs':
                                    this.ctx.fillStyle = v;
                                    break;
                                case 'f':
                                    this.ctx.fill();
                                    break;
                                case 'ss':
                                    this.ctx.strokeStyle = v;
                                    break;
                                case 's':
                                    this.ctx.stroke();
                                    break;
                                case 'lw':
                                    this.ctx.lineWidth = v;
                                    break;
                                case 'sld':
                                    this.ctx.setLineDash([v[0], v[1]]);
                                    break;
                                case 'gco':
                                    this.ctx.globalCompositeOperation = v;
                                    break;
                                case 'sb':
                                    this.ctx.shadowBlur = v;
                                    break;
                                case 'sc':
                                    this.ctx.shadowColor = v;
                                    break;
                                case 'so':
                                    this.ctx.shadowOffsetX = v[0];
                                    this.ctx.shadowOffsetY = v[1];
                                    break;
                                case 'bp':
                                    this.ctx.beginPath();
                                    break;
                                case 'cp':
                                    this.ctx.closePath();
                                    break;
                                case 'mt':
                                    this.ctx.moveTo(v[0], v[1]);
                                    points.addPoint(v[0], v[1]);
                                    break;
                                case 'lt':
                                    this.ctx.lineTo(v[0], v[1]);
                                    points.addPoint(v[0], v[1]);
                                    break;
                                case 'a':
                                    this.ctx.arc(v[0], v[1], v[2], v[3], v[4], v[5]);
                                    points.addPoint(v[2], v[2]);
                                    break;
                                case 'at':
                                    this.ctx.arcTo(v[0], v[1], v[2], v[3], v[4]);
                                    points.addPoint(v[0], v[1]);
                                    points.addPoint(v[2], v[3]);
                                    points.addPoint(v[4], v[4]);
                                    break;
                                case 'qct':
                                    this.ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]);
                                    points.addPoint(v[0], v[1]);
                                    points.addPoint(v[1], v[2]);
                                    break;
                                case 'bct':
                                    this.ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]);
                                    points.addPoint(v[0], v[1]);
                                    points.addPoint(v[2], v[3]);
                                    points.addPoint(v[4], v[5]);
                                    break;
                                case 'r':
                                    this.ctx.rotate(v);
                                    break;
                            }
                        }
                        clearBounds.push(points.getBoundingBox());
                        this.restore();
                    };

                    this.drawText = (object) => {
                        this.save();
                        this.ctx.translate(object.x, object.y);
                        this.ctx.rotate(object.angle);
                        this.ctx.globalAlpha = object.alpha;
                        this.ctx.fillStyle = object.color;
                        this.ctx.textAlign = object.align;
                        this.ctx.font = Object.values(object.style).join(' ');
                        this.ctx.fillText(object.text, 0, 0);
                        this.restore();
                    };

                    this.clear = function () {
                        while (clearBounds.length) {
                            let clear = clearBounds.pop();
                            this.ctx.save();
                            this.ctx.translate(clear.x, clear.y);
                            this.ctx.scale(clear.s.x, clear.s.y);
                            this.ctx.rotate(clear.a);
                            this.ctx.clearRect(clear.x1 - 50, clear.y1 - 50, clear.x2 + 50, clear.y2 + 50);
                            this.restore();
                        };
                        /*let square = 200;
                        for (let xi = 0; xi <= this.elem.width; xi += square) {
                            for (let yi = 0; yi <= this.elem.height; yi += square) {
                                this.ctx.clearRect(this.bound.x + xi, this.bound.y + yi, square, square);
                            }
                        }*/
                    };

                    //make the viewport follow an object always call this.restore at the very end of each step
                    this.follow = function (object) {
                        let xSpeed = object.xPrevious - object.x;
                        let ySpeed = object.yPrevious - object.y;

                        this.save();

                        let target = {
                            x: (object.x - (this.elem.width * 0.5)) + xSpeed,
                            y: (object.y - (this.elem.height * 0.5)) + ySpeed
                        };

                        this.pan = target;

                        this.pan.x = Math.min(Math.max(0, this.pan.x), _world.width - this.elem.width);
                        this.pan.y = Math.min(Math.max(0, this.pan.y), _world.height - this.elem.height);

                        _input.mouse.X = this.pan.x + mouseX;
                        _input.mouse.Y = this.pan.y + mouseY;

                        _input.mouse.X = Math.max(this.bound.x, Math.min(_input.mouse.X, this.bound.w));
                        _input.mouse.Y = Math.max(this.bound.y, Math.min(_input.mouse.Y, this.bound.h));

                        mouseX = Math.max(0, Math.min(mouseX, this.elem.width));
                        mouseY = Math.max(0, Math.min(mouseY, this.elem.height));

                        this.bound = {x: this.pan.x, y: this.pan.y, w: this.pan.x + this.elem.width, h: this.pan.y + this.elem.height};

                        this.ctx.translate(0 - this.pan.x, 0 - this.pan.y);
                    };

                    this.pointerLock = function () {
                        this.elem.requestPointerLock = this.elem.requestPointerLock || this.elem.mozRequestPointerLock;
                        this.elem.requestPointerLock();
                    };

                    this.exitPointerLock = function () {
                        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                        if (document.pointerLockElement === this.elem) {
                            soundManager.stopAll();
                            document.exitPointerLock();
                        }
                    };

                    let scaleX = window.innerWidth / this.elem.width;
                    let scaleY = window.innerHeight / this.elem.height;

                    let scaleToFit = Math.min(scaleX, scaleY);
                    let scaleToCover = Math.max(scaleX, scaleY);

                    this.elem.style.transformOrigin = 'calc(vw / 2) calc(vh / 2)'; //scale from top left
                    this.elem.style.transform = 'scale(' + scaleToFit + ')';

                    document.body.appendChild(this.elem);
                }
            });
        });
    });
});