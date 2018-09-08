module.exports = () => {
    //game object defaults;
    global._Object = function () {
        this.x = 0;
        this.y = 0;
        this.xPrevious = this.x;
        this.yPrevious = this.y;
        this.w = null;
        this.h = null;
        this.direction = 0;
        this.sprite = null;
        this.body = null;
        this.speed = 0;
        this._draw = true;
        this.depth = 0;

        this._input = {
            keyPress: {},
            mouse: {X: 0, Y: 0}
        };

        this._destroy = (inMemory) => {
            let index = World._objects[this._objGroup].find((obj) => {
                return obj._id === this._id;
            });
            if (index < 0) return;
            if (this.onDestroy) this.onDestroy();
            if (inMemory) {
                //totaly remove object from stack
                World._objects[this._objGroup].splice(index, 1);
            } else {
                //only restrict the object from being drawn
                this._draw = false;
            }
        };

        this._create = () => {
            if (this.onCreate) this.onCreate();
        };

        this._update = () => {
            //run collision checking
            if (this.onCollision) {
                for(let obj in this.onCollision) {
                    let groupName = pluralize(obj);
                    if (World._objects[groupName]) {
                        let objGroup = World._objects[groupName];

                        for (let i in objGroup) {
                            let entity = objGroup[i];
                            if (entity._id !== this._id) {
                                if (collide(this, entity)) this.onCollision[obj](entity);
                            }
                        }
                    }
                }
            }
            //update body
            if (this.body) {
                this.body._update(this);
            }
            //update sprite
            if (this.sprite) {
                this.sprite._update(this);
            }

            this.xPrevious = this.x;
            this.yPrevious = this.y;
            if (this.onStep) this.onStep();
        };
    };

    global.Timer = function (value) {
        value = value * 1000;
        let count = value;
        this.tick = () => {
            count = count > 0 ? count - 1 : 0;
            return this;
        };
        this.timedOut = () => {
            return count <= 0;
        };
        this.zeroOut = () => {
            count = 0;
            return this;
        };
        this.reset = () => {
            count = value;
            return this;
        };
    };

    global.UI = function () {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.sprite = null;
    };
};