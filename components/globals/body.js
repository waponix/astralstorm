module.exports = () => {
    global._CircleBody = function (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        this._update = (owner) => {
            this.x = owner.x;
            this.y = owner.y;
        }
    };
};