module.exports = ($s) => {
    return {
        createBody: function () {
            return $s.lib.matter.Bodies.rectangle(0, 0, 30, 30);
        }
    };
};