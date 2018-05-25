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
        isNum: function (value) {
            return typeof value === 'number' || isNaN(value);
        },
        isBool: function (value) {
            return typeof value === 'boolean';
        },
        isNone: function (value) {
            return !value || value === '';
        }
    };
};