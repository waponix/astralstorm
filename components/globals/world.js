module.exports = () => {
    global.World = {
        _objects: {},
        elapsed: 0,
        dimension: {
            width: 10000,
            height: 10000
        },
        arrayObjects: function (socket) {
            Viewport._data = socket.viewport;
            let arrayObjects = [];
            for (let g in this._objects) {
                if (g === 'Draw') {
                    let draw = Object.values(this._objects[g]).filter((obj) => {
                        //only draw objects only for the specified sid
                        return !obj.sid || obj.sid === socket.id;
                    }).filter((obj) => {
                        //filter out draw objects for the specified sids
                        let regex = new RegExp(socket.id, 'g');
                        return !obj.filter || !regex.test(obj.filter);
                    });
                    arrayObjects = arrayObjects.concat(draw);
                } else {
                    arrayObjects = arrayObjects.concat(Object.values(this._objects[g]));
                }
            }

            arrayObjects = arrayObjects.filter((obj) => {
                let flag =  (obj.sid && obj.sid === socket.id) || (!obj.onViewport && Viewport.inBound(obj, 100)) || false;
                return flag;
            });

            sort(arrayObjects, 'depth');
            for (let i in arrayObjects) {
                arrayObjects[i] = simplifyObjects(arrayObjects[i]);
            }
            arrayObjects = JSON.stringify(arrayObjects, null, 0);

            return arrayObjects;
        }
    };

    //create a simplified version of the object
    function simplifyObjects(object) {
        let spriteTemplate = {x: 0, y: 0, xPrevious: 0, yPrevious: 0, id: null, _id: null, vars: null,
            angle: 0, alpha: 1, data: null, offset: null, scale: {x: 1 ,y: 1}, _draw: true, _type: undefined,
            onViewport: false};
        let textTemplate = {x: 0, y: 0, _id: null, align: 'left', text: '', color: '#FFFFFF', style: null, _type: undefined,
            angle: 0, alpha: 1, onViewport: false};
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