module.exports = function () {
    let colors = ["#220000", "#FF0000", "#FF4400", "#FF8800", "#FFFF55"];

    this.onCreate = () => {
        this.sprite = new _Sprite(this.x, this.y, 'explosion_01');
        this.sprite.vars.color = colors[4];
        this.sprite.vars.radius = 0;
        this.sprite.vars.strokeSize = 20;
        this.depth = 20;
    };

    this.onStep = () => {
        this.sprite.vars.dashSize -= 1;
        this.sprite.vars.radius += 1;
        this.sprite.vars.strokeSize -= 0.6;

        let percent = (this.sprite.vars.strokeSize / 20) * 100;

        if (percent < 35) {
            this.sprite.vars.color = colors[0];
        } else if (percent < 50) {
            this.sprite.vars.color = colors[1];
        } else if (percent < 65) {
            this.sprite.vars.color = colors[2];
        } else if (percent < 85) {
            this.sprite.vars.color = colors[3];
        }
        if (this.sprite.vars.strokeSize < 0) destroy(this);
    };
};