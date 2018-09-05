module.exports = () => {
    //game object defaults;
    global._Object = function () {
        this.x = 0;
        this.y = 0;
        this.w = null;
        this.h = null;
        this.direction = 0;
        this.sprite = null;
        this.body = null;
        this.speed = 0;
        this._draw = true;

        this.controller = {
            keyPress: {},
            mouse: {X: 0, Y: 0}
        };

        this._destroy = (inMemory = true) => {
            let index = World._objects[this._objGroup].find((obj) => {
                return obj._id === this._id;
            });
            if (index < 0) return;
            if (this.onDestroy) this.onDestroy();
            if (inMemory) {
                World._objects[this._objGroup].splice(index, 1);
            } else {
                this._draw = false;
            }
        };

        this._create = () => {
            if (this.onCreate) this.onCreate();
        };

        this._update = () => {
            if (this.sprite) {
                this.body.x = this.x;
                this.body.y = this.y;
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
            if (this.onStep) this.onStep();
        };
    }
};