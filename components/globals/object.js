module.exports = () => {
    //game object defaults;
    global._Object = function () {
        this.x = 0;
        this.y = 0;
        this.w = null;
        this.h = null;
        this.direction = 0;
        this.sprite = null;
        this.speed = 0;
        this._draw = false;

        this.controller = {
            keyPress: {},
            mouse: {X: 0, Y: 0}
        };

        this._destroy = () => {
            let index = World._objects[this._objGroup].find((obj) => {
                return obj._id === this._id;
            });
            World._objects[this._objGroup].splice(index, 1);
        };

        this._create = () => {
            if (this.onCreate) this.onCreate();
            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
        };

        this._update = () => {
            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
            if (this.onStep) this.onStep();
        };
    }
};