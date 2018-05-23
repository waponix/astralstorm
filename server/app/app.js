module.exports = ($s) => {
    app.call($s);
};

function app() {
    let $s = this;

    $s.world = new Map();

    $s.step = step;

    $s.app.use($s.lib.express.static('client/resources'));

    $s.app.get('/', (req, res) => {
        res.sendFile(__dirname.replace(/[\\|\/]server[\\|\/]app/, '/client/client.html'));
    });

    $s.io.on('connect', ($c) => {
        $.createInstance('Player', $c.id);
    });

    $s.server.listen($s.c.server.port, () => {
        console.log('game running at port ' + $s.c.server.port);
        setInterval($s.step, $s.c.world.step);
    });

    function step() {
        $.update();
    }
}