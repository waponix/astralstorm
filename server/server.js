(() => {
    let $s = this;
    require('./app/kernel')($s);

    $s.app.use($s.lib.express.static('client/resources'));

    $s.app.get('/', (req, res) => {
        res.sendFile(__dirname.replace(/[\\|\/]server/, '/client/client.html'));
    });

    $s.server.listen($s.c.server.port, () => {
        console.log('game running at port ' + $s.c.server.port);
        require('./app/app')($s);
    });
})();