module.exports = () => {
    global.World = {
        _objects: {},
        elapsed: 0,
        dimension: {
            width: 10000,
            height: 10000
        },
        viewport: {
            width: 1366,
            height: 768
        }
    };
};