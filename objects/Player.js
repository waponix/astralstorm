module.exports = function () {
    this.onCreate = () => {
        this.health = 100;
        this.destroyed = false;
        this.fireRate = new Timer(0.02, true);
        this.fireRate.zeroOut();
        this.sprite = new _Sprite(this.x, this.y, 'craft01');
        this.body = new _CircleBody(this.x, this.y, 20);
        this.sprite.angle = this.direction;
    };

    this.onStep = () => {
        if (this.health <= 0) destroy(this, false);
        if (this.destroyed) return;

        let rotX = this._input.mouse.X - this.x;
        let rotY = this._input.mouse.Y - this.y;

        this.direction = Math.atan2(rotY, rotX) / Math.PI * 180;
        if (this.direction < 0) {
            this.direction = 360 + this.direction;
        }

        let dis = (Math.sqrt((rotX * rotX) + (rotY * rotY)) / 50 < 8) ? Math.sqrt((rotX * rotX) + (rotY * rotY)) / 50 : 8;
        this.speed = dis;
        this.speed = this.speed > 10 ? 10 : this.speed;
        this.x = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.y = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);
        this.x = (this.x <= 70) ? 70 : this.x;
        this.y = (this.y <= 70) ? 70 : this.y;
        this.x = (this.x >= 1366 - 70) ? 1366 - 70 : this.x;
        this.y = (this.y >= 768 - 70) ? 768 - 70 : this.y;

        this.sprite.x = this.x;
        this.sprite.y = this.y;

        this.fireRate.tick();
        if (this._input.mouse.L && this.fireRate.timedOut()) {
            let bullet = createInstance('Bullet');
            bullet.owner = this;
            bullet.x = this.x;
            bullet.y = this.y;
            bullet.direction = this.direction;
            this.fireRate.reset();
        }

        this.sprite.angle = this.direction;
    };

    this.onDestroy = () => {
        this.destroyed = true;
    };
};