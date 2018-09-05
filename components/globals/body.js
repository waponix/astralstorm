module.exports = () => {
    global._SphereBody = function (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    };
};