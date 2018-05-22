module.exports = ($s) => {
    app.call($s);
};

function app() {
    let $s = this;

    $s.world = {};

    $s.step = function () {

    };

    $s.app.get('/', (req, res) => {
        res.sendFile(__dirname.replace(/[\\|\/]server[\\|\/]app/, '/client/client.html'));
    });

    $s.io.on('connect', ($c) => {

    });

    $s.server.listen($s.c.server.port, () => {
        console.log('game running at port ' + $s.c.server.port);
        let loop = setInterval($s.step, $s.c.world.step);
    });
}