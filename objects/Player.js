module.exports = function () {
    let rotX = 0, rotY = 0;
    let destruct = new Timer(1000);
    let curRot = 0;

    this.onCreate = function () {
        this.health = 100;
        this.destroyed = false;
        this.fireRate = new Timer(0.02, true);
        this.fireRate.zeroOut();
        this.depth = 10;
        this.x = random(0, World.dimension.width);
        this.y = random(0,  World.dimension.height);
        this._draw = false;
        setTimeout(() => this._draw = true, 200);

        this.body = new _CircleBody(this.x, this.y, 20);

        this.sprite = new _Sprite(this.x, this.y, 'craft_01');
        this.sprite.angle = this.direction;
        this.originalColor = 'rgba(' + random(150, 255) + ', ' + random(150, 255) + ', ' + random(150, 255) + ')';
        this.sprite.vars.color = this.originalColor;
    };

    this.onDraw = function () {
        //draw game UI's for the player
        //write the game elapsed time
        let pos = {x: 0, y: 0};
        pos.x = Viewport.width() * 0.5;
        pos.y = 0;
        drawSprite('ui_timebar', pos.x, pos.y, null, true, this.sid);
        let gameTime = new Date(World.elapsed);
        pos.y = 15;
        gameTime = ('0' + gameTime.getMinutes()).substr(-2) + ':' + ('0' + gameTime.getSeconds()).substr(-2);
        drawText(gameTime, pos.x, pos.y, {
            align: 'center',
            size: '10px',
            color: '#FFFFFF',
            alpha: 1
        }, true, this.sid);

        //draw the health bar
        let barColor = ['#00FF00', '#BBFF00', '#FFAA00', '#FF2200'];
        let stat = barColor[0];
        if (this.health <= 35) {
            stat = barColor[3];
        } else if (this.health <= 50) {
            stat = barColor[2];
        } else if (this.health <=75) {
            stat = barColor[1];
        }
        drawSprite('ui_healthbar', 5, 5, {
            vars: {
                hp: this.health,
                stat: stat
            }
        }, true, this.sid);
        drawText(this.username.substr(0,10), 80, 30, {
            size: '10px',
            color: '#FFFFFF',
            align: 'center',
            font: 'Segoe UI Light'
        }, true, this.sid);

        //draw username on top of player
        drawText(this.username.substr(0,10), this.x + 10, this.y - (this.body.radius + 20), {
            size: '12px',
            font: 'Segoe UI Light',
            align: 'center'
        }, false, null, this.sid);
        drawSprite('ui_mini_healthbar', this.x, this.y - (this.body.radius + 5), {
            vars: {
                hp: this.health,
                stat: stat
            }
        }, false, null, this.sid);

        //mouse cursor;
        curRot += 2;
        drawSprite('ui_cursor', Viewport.mouseX(), Viewport.mouseY(), {
            vars: {color: '#00FFFF'},
            angle: curRot
        }, true, this.sid);
    };

    this.onStep = function () {
        if (this.health <= 0) {
            this.health = 0;
            destroy(this);
        } else if (this.health >= 100) {
            this.health = 100;
        }

        rotX = this._input.mouse.X - this.x;
        rotY = this._input.mouse.Y - this.y;

        this.direction = Math.atan2(rotY, rotX) / Math.PI * 180;

        let distanceFromPointer = pointDistance(this.x, this.y, this._input.mouse.X, this._input.mouse.Y);
        this.speed = distanceFromPointer / 50;
        this.speed = limit(this.speed, this.speed, 8);

        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);
        this.x = (this.x <= 0) ? 0 : this.x;
        this.y = (this.y <= 0) ? 0 : this.y;
        this.x = (this.x >= World.dimension.width) ? World.dimension.width : this.x;
        this.y = (this.y >= World.dimension.height) ? World.dimension.height : this.y;

        this.sprite.x = this.x;
        this.sprite.y = this.y;

        this.fireRate.tick();
        if (this._input.mouse.L && this.fireRate.timedOut()) {
            let bullet = createInstance('Bullet');
            bullet.owner = this;
            bullet.x = this.x + this.body.radius * Math.cos(this.direction * Math.PI / 180);
            bullet.y = this.y + this.body.radius * Math.sin(this.direction * Math.PI / 180);
            bullet.direction = this.direction;
            this.fireRate.reset();
        }

        this.sprite.angle = this.direction;
    };

    this.onDestroy = function () {
        this.destroyed = true;
        let explosion = createInstance('Explosion');
        explosion.x = this.x;
        explosion.y = this.y;
        explosion.sprite.vars.strokeSize = 30;
        explosion.sprite.vars.strokeMax = explosion.sprite.vars.strokeSize;
        explosion.sprite.vars.radius = 5;
        //create more explosions;
        for (let i = 0; i < 15; i++) {
            let delay = random(50, 400);
            setTimeout(() => {
                explosion = createInstance('Explosion');
                explosion.x = random(this.x - 40, this.x + 40);
                explosion.y = random(this.y - 40, this.y + 40);
                explosion.sprite.vars.strokeSize = random(10, 20);
                explosion.sprite.vars.strokeMax = explosion.sprite.vars.strokeSize;
                explosion.sprite.vars.radius = random(0, 10);
            }, delay);
        }
        this.socket.emit('dFlag', true);
    };
};