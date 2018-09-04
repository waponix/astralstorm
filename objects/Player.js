module.exports = function () {
    this.onCreate = () => {
        this.health = 100;
        this.rank = 0;
        this.score = 0;
        this.color = 'rgb(' + random(150, 255) + ', ' + random(150, 255) + ', ' + random(150, 255) + ')';
        this.fireRate = 20;
        this.trigger = 0;
        this.sprite = new _Sprite('craft01');
        this.sprite.angle = this.direction;
    };

    this.onStep = () => {
        let rotX = this.controller.mouse.X - this.x;
        let rotY = this.controller.mouse.Y - this.y;

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

        if (this.controller.mouse.L) {
            if (this.trigger === 0) {
                let bullet = createInstance('Bullet');
                bullet.owner = this;
                bullet.x = this.x;
                bullet.y = this.y;
                bullet.direction = this.direction;
            }
            this.trigger = this.trigger < 0 ?  this.fireRate : this.trigger - 1;
        } else {
            this.trigger = 0;
        }

        this.sprite.angle = this.direction;
    };
};