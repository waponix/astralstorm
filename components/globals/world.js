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
            for (let i in arrayObjects) {
                arrayObjects[i] = simplifyObjects(arrayObjects[i]);
            }
            return JSON.stringify(arrayObjects, null, 0);
        }
    };

    //create a simplified version of the object
    function simplifyObjects(object) {
        let template = {
            x: 0,
            y: 0,
            xPrevious: 0,
            yPrevious: 0,
            id: null,
            _id: null,
            vars: null,
            angle: 0,
            alpha: null,
            data: null,
            offset: null,
            scale: null,
            _draw: true,
            destroyed: false
        };

        for (let i in template) {
            if (object[i]) template[i] = object[i];
            if (object.sprite[i]) template[i] = object.sprite[i];
        }

        object = template;

        return object;
    }
};