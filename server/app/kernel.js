module.exports = ($s) => {
    require('./lib')($s);
    $s.app = $s.lib.express();
    $s.server = $s.lib.http.createServer($s.app);
    $s.io = $s.lib.sio.listen($s.server);
    $s.c = JSON.parse($s.lib.fs.readFileSync('./server/app/config.json', 'utf-8'));
    loader.call($s);
};

function loader() {
    let
        $s = this,
        globals = {},
        _Object = require('./components/_Object');

    $s.obj = $s.obj || new Map();
    $s.spr = $s.spr || new Map();

    Object.defineProperty($s.obj, '_Object', {
        get() {
            return _Object;
        }
    });

    recurseDirs([
        {
            path: 'server/app/globals',
            filter: ['*.js'],
            callback: (path, rel, filename) => {
                let file = pathMerge(__dirname, path);
                if (filename) Object.assign(globals, require(file)($s));
            }
        }
    ]);

    global._ = globals;

    recurseDirs([
        {
            path: 'server/app/objects',
            filter: ['*.js'],
            callback: (path, rel, filename) => {
                let file = pathMerge(__dirname, path);
                if (filename) $s.obj.set(filename.replace('.js', ''), require(file));
            }
        },
        {
            path: 'server/app/sprites',
            filter: ['*.js'],
            callback: (path, rel, filename) => {
                let file = pathMerge(__dirname, path);
                if (filename) $s.spr.set(filename.replace('.js', ''), require(file));
            }
        },
    ]);

    function recurseDirs(dirs) {
        for (let dir of dirs) {
            if ($s.lib.fs.existsSync(dir.path)) $s.lib.fs.recurseSync(dir.path, dir.filter, dir.callback);
        }
    }

    function pathMerge (str1, str2) {
        let rep = str2.split(/\\|\//);
        rep.forEach((r, key) => {
            rep[key] = new RegExp('[\\|\/]?' + r + '[\\|\/]?');
            str1 = str1.replace(rep[key], '');
        });
        return $s.lib.path.join(str1, str2);
    }
}