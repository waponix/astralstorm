module.exports = function () {
    global.pointDir = function (p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    };
    global.pointDis = function (p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };
    global.lengthDirX = function (len, dir) {
        return (len) * Math.cos(dir);
    };
    global.lengthDirY = function (len, dir) {
        return (len) * Math.sin(dir);
    };
    global.lengthDir = function (len, dir) {
        return {
            x: lengthDirX(len, dir),
            y: lengthDirY(len, dir)
        };
    };
};