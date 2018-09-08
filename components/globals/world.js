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
                let objects = this._objects[g];
                arrayObjects = arrayObjects.concat(objects);
            }
            sort(arrayObjects, 'depth');
            return arrayObjects;
        }
    };
};