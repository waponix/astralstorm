let conf = {
    port: 1994,
    gameStep: 16 / 1000,
    world: {
        width: 10000,
        height: 10000,
    },
    resource: Object.assign(
        [],
        require(__dirname + '/resources/sprites')
    )
};

module.exports = conf;