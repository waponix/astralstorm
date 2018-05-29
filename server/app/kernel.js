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
                Object.assign(globals, require('./globals/' + filename)($s));
            }
        }
    ]);

    global._ = globals;
    global.document = {
        createElement: function(){
            // Canvas
            return {
                getContext: function() {
                    return {};
                }
            };
        }
    };
    global.window = {};

    recurseDirs([
        {
            path: 'server/app/objects',
            filter: ['*.js'],
            callback: (path, rel, filename) => {
                $s.obj.set(filename.replace('.js', ''), require('./objects/' + filename));
            }
        },
        {
            path: 'server/app/sprites',
            filter: ['*.js'],
            callback: (path, rel, filename) => {
                $s.spr.set(filename.replace('.js', ''), require('./sprites/' + filename));
            }
        },
    ]);

    function recurseDirs(dirs) {
        for (let dir of dirs) {
            if ($s.lib.fs.existsSync(dir.path)) $s.lib.fs.recurseSync(dir.path, dir.filter, dir.callback);
        }
    }
}