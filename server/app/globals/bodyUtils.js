module.exports = ($s) => {
    return {
        createBody: function () {
            return $s.lib.matter.Body.create();
        },
    };
};