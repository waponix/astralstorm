module.exports = () => {
    global._CircleBody = function (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    };
};