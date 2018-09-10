module.exports = () => {
    global.World = {
        _objects: {},
        elapsed: 0,
        dimension: {
            width: 10000,
            height: 10000
        },
        arrayObjects: function () {
            let arrayObjects = [];
            for (let g in this._objects) {
                arrayObjects = arrayObjects.concat(Object.values(this._objects[g]));
            }
            sort(arrayObjects, 'depth');
            return JSON.stringify(arrayObjects, null, 0);
        }
    };
};