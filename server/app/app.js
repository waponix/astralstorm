module.exports = ($s) => {
    app.call($s);
};

function app() {
    let $s = this;

    $s.engine = _.engine.create();
    $s.world = new Map();
    $s.phyWorld = $s.engine.world;
    $s.runner = _.runner.create();

    $s.step = function step() {
        _.update();
    };

    $s.app.use($s.lib.express.static('client/resources'));

    $s.app.get('/', (req, res) => {
        res.sendFile(__dirname.replace(/[\\|\/]server[\\|\/]app/, '/client/client.html'));
    });

    $s.io.on('connect', ($c) => {
        let player = _.createInstance('Player', $c.id);
        _.world.addBody($s.phyWorld, player.body);

        $c.emit('s::c', player.id);

        $c.on('p::i', (e) => {
            Object.assign(player.controller, e);
        });

        $c.on('disconnect', () => {
            _.destroyInstance(player);
        });
    });

    $s.server.listen($s.c.server.port, () => {
        console.log('game running at port ' + $s.c.server.port);
        _.runner.run($s.runner, $s.engine);
        setInterval($s.step, $s.c.world.step);
    });
}