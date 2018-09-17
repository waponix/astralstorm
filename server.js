let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let ss = require('socket.io-stream');
let stringStream = require('string-to-stream');

//initialize components
require('./components/globals/init')();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

$socket = null;
$destroySocket = null;

io.on('connection', function (socket) {
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

    $socket = Promise.resolve(socket);
});

server.listen(3000, function () {
    console.log('listening on *:3000');
    let timestamp = Date.now();
    let sockets = {};

    setInterval(() => {
        //always call update first before anything else
        update(timestamp);

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
    }, 10);
});