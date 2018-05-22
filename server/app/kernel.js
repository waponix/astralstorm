module.exports = ($s) => {
    require('./lib')($s);
    $s.app = $s.lib.express();
    $s.server = $s.lib.http.createServer($s.app);
    $s.io = $s.lib.sio.listen($s.server);
    $s.c = JSON.parse($s.lib.fs.readFileSync('./server/app/config.json', 'utf-8'));
    loader.call($s);
    console.log(new $s.obj.Player());
    require('./app')($s);
};

function loader() {
    let $s = this;
    $s.obj = $s.obj || {};
    $s.spr = $s.spr || {};

    $s.lib.fs.recurseSync('server/app/objects', ['*.js'], (path, rel, filename) => {
        $s.obj[filename.replace('.js', '')] = require('./objects/' + filename);
    });

    $s.lib.fs.recurseSync('server/app/sprites', ['*.js'], (path, rel, filename) => {
        $s.spr[filename.replace('.js', '')] = require('./sprites/' + filename);
    });
}