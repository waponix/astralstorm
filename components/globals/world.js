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
            arrayObjects = JSON.stringify(arrayObjects, null, 0);

            if (World._objects.Draw) {
                for (let i in World._objects.Draw) {
                    destroy(World._objects.Draw[i]);
                }
            }

            return arrayObjects;
        }
    };

    global.drawBag = [];

    //create a simplified version of the object
    function simplifyObjects(object) {
        let spriteTemplate = {x: 0, y: 0, xPrevious: 0, yPrevious: 0, id: null, _id: null, vars: null,
            angle: 0, alpha: 1, data: null, offset: null, scale: {x: 1 ,y: 1}, _draw: true, _type: undefined,
            onlyFor: null, onViewport: false};
        let textTemplate = {x: 0, y: 0, _id: null, text: '', color: '#FFFFFF', style: null, _type: undefined,
            angle: 0, alpha: 1, onlyFor: null, onViewport: false};
        let template = [];

        switch (object._type) {
            case 'text': template = textTemplate; break;
            default: template = spriteTemplate;
        }

        for (let i in template) {
            if (object[i]) template[i] = object[i];
            if (object.sprite && object.sprite[i]) template[i] = object.sprite[i];
        }

        object = template;

        return object;
    }
};