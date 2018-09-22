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

        Object.defineProperties(this, {
            width: {get() {return data.width;}},
            height: {get() {return data.height;}},
            x: {get() {return data.x;}},
            y: {get() {return data.y;}},
            mouseX: {get() {return data.mouseX;}},
            mouseY: {get() {return data.mouseY;}},
            _data: {set(vData) {data = Object.assign(data, vData);}, enumerable: false}
        });

        this.inBound = function (obj, offset = 0) {
            let bound = {
                x: this.x,
                y: this.y,
                w: this.x + this.width,
                h: this.y + this.height
            };
            return obj.x <= bound.w + offset && obj.x >= bound.x - offset && obj.y <= bound.h + offset && obj.y >= bound.y - offset;
        };
    };
};