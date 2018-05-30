module.exports = ($s) => {
    app.call($s);
};

function app() {
    let $s = this;

    $s.engine = _.engine.create();
    $s.world = new Map();
    $s.phyWorld = $s.engine.world;
    $s.phyWorld.gravity = {x: 0 , y: 0};

    $s.step = function step() {
        _.update();
        if (_.getBodies($s.phyWorld)[0]) {
            $s.io.emit('d::s', _.getBodies($s.phyWorld)[0].position);
        }
    };

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

    setInterval($s.step, 0);
}