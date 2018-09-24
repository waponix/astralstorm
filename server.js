let express = require('express');
let app = express();
let server = require('http').Server(app);
let ss = require('socket.io-stream');
let stringStream = require('string-to-stream');
let io = require('socket.io')(server);
global.sockets = {};

//initialize components
require('./components/globals/init')();

app.use(express.static('public'));
app.use(express.static('assets/audios'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

$socket = null;
$destroySocket = null;

io.on('connection', function (socket) {
    socket.viewport = {};
    socket.emit('assets::load', _assets);
    socket.emit('world::load', World.dimension);

    socket.on('disconnect', function () {
        for (let key in World._objects.Players) {
            let player = World._objects.Players[key];

            if (player.sid === socket.id) {
                delete World._objects.Players[key];
            }
        }
        $destroySocket = Promise.resolve(socket);
    });

    socket.on('player::new', function (data) {
        //create player
        let newPlayer = createInstance('Player');
        newPlayer.id = data.key;
        newPlayer.sid = socket.id;
        newPlayer.socket = socket;
        newPlayer.username = data.username;
    });

    socket.on('io::update', (data) => {
        if (World._objects.Players) {
            let player;
            for (let i in World._objects.Players) {
                if (World._objects.Players[i].id === data.key && World._objects.Players[i].sid === socket.id) {
                    player = World._objects.Players[i];
                }
            }
            if (player) {
                for (let i in data.io) {
                    player._input[i] = data.io[i];
                }
            }
        }
    });

    socket.on('viewport', (viewport) => {
        socket.viewport = viewport;
    });

    $socket = Promise.resolve(socket);
});

server.listen(1140, function () {
    console.log('listening on *:3000');
    let timestamp = Date.now();
    sockets = {};

    setInterval(() => {
        if ($socket && $socket.then) {
            $socket.then((socket) => {
                if (!sockets[socket.id]) sockets[socket.id] = socket;
            });
        }

        if ($destroySocket && $destroySocket.then) {
            $destroySocket.then((socket) => {
                delete sockets[socket.id]
            });
        }

        if (Object.keys(sockets).length) {
            for (let i in sockets) {
                let socket = sockets[i];
                let dataStream = ss.createStream();
                ss(socket).emit('data::stream', dataStream);
                stringStream(World.arrayObjects(socket)).pipe(dataStream);
            }
        }
        clean();
        update(timestamp);
    }, 10);
});