module.exports = () => {
    global.Viewport = new Viewport();

    function Viewport () {
        let data = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            mouseX: 0,
            mouseY: 0
        };

        this.width = function () {
                return data.width;
            };
        this.height = function () {
                return data.height;
            };
        this.x = function () {
                return data.x;
            };
        this.y = function () {
                return data.y;
            };
        this.mouseX = function () {
                return data.mouseX;
            };
        this.mouseY = function () {
                return data.mouseY;
            };
        this.inBound = function (obj, offset = 0) {
            let bound = {
                x: data.x,
                y: data.y,
                w: data.x + data.width,
                h: data.y + data.height
            };
            return obj.x <= bound.w + offset && obj.x >= bound.x - offset && obj.y <= bound.h + offset && obj.y >= bound.y - offset;
        };
        this.setData = function (vData) {
            data = Object.assign(data, vData);
        }
    };
};