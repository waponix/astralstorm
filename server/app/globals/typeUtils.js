module.exports = ($s) => {
    return {
        isFunc: function (value) {
            return typeof value === 'function';
        },
        isObj: function (value) {
            return typeof value === 'object' && value !== null;
        },
        isString: function (value) {
            return typeof value === 'string';
        },
        isInt: function (value) {
            return typeof value === 'number';
        },
        isNone: function (value) {
            return !value || value === '';
        }
    };
};