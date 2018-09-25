module.exports = function () {
    this.onCreate = function () {
        this.health = 100;
        this.destroyed = false;
        this.fireRate = new Timer(0.015, true);
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
        this.sprite.vars.power = 0;
        this.curRot = 0;
        this.radarRot = 0;
        this.maxSpeed = 7;
    };

    let power = 0;
    this.onDraw = function () {
        this.sprite.vars.power = random(-20 - (this.speed * 1.2), -20 - (this.speed * 2));
        runScript('playerGUI', this);
    };

    let slow = false;
    this.onStep = function () {
        if (this.health <= 0) {
            this.health = 0;
            destroy(this);
        } else if (this.health >= 100) {
            this.health = 100;
        }

        this.direction = pointDirection(this.x, this.y, this._input.mouse.X, this._input.mouse.Y);

        let distanceFromPointer = pointDistance(this.x, this.y, this._input.mouse.X, this._input.mouse.Y);
        this.speed = distanceFromPointer / 50;
        this.speed = limit(this.speed, this.speed, this.maxSpeed);

        if (this.speed < this.maxSpeed * 0.3 && slow) {
            audioStop('boost_loop.wav');
            audioPlay('boost_end.wav', this.x, this.y, false, {volume: 5}, this.sid);
            if (slow) slow = false;
        } else if (this.speed >= this.maxSpeed * 0.3) {
            audioStop('boost_end.wav');
            audioPlay('boost_loop.wav', this.x, this.y, true, {volume: 5}, this.sid);
            if (!slow) slow = true;
        }

        this.x = this.x + lengthDirX(this.speed, this.direction);
        this.y = this.y + lengthDirY(this.speed, this.direction);
        this.x = (this.x <= 0) ? 0 : this.x;
        this.y = (this.y <= 0) ? 0 : this.y;
        this.x = (this.x >= World.dimension.width) ? World.dimension.width : this.x;
        this.y = (this.y >= World.dimension.height) ? World.dimension.height : this.y;

        this.sprite.x = this.x;
        this.sprite.y = this.y;

        this.fireRate.tick();
        if (this._input.mouse.L && this.fireRate.timedOut()) {
            audioPlay('laser.wav', this.x, this.y);
            let bullet = createInstance('LaserBullet');
            bullet.owner = this;
            bullet.x = this.x + this.body.radius * Math.cos(this.direction * Math.PI / 180);
            bullet.y = this.y + this.body.radius * Math.sin(this.direction * Math.PI / 180);
            bullet.direction = this.direction;
            this.fireRate.reset();
        }

        this.sprite.angle = this.direction;
    };

    this.onDestroy = function () {
        audioPlay('explosion.wav', this.x, this.y);
        this.destroyed = true;
        let explosion = createInstance('Explosion', this.x, this.y);
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
        let drop = createInstance('HealthPickup');
        drop.x = this.x;
        drop.y = this.y;
    };
};