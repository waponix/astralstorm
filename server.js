let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let ss = require('socket.io-stream');
let fs = require('file-system');

//initialize components
require('./components/globals/init')();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.emit('assets::load', _assets);
    socket.emit('world::load', World.dimension);

    /*for (let i = 0; i < 10; i+=1) {
        let dummy = createInstance('Player');
        dummy._input.mouse.X = random(0, World.dimension.width);
        dummy._input.mouse.Y = random(0, World.dimension.height);
    }*/

    socket.on('disconnect', function () {
        for (let key in World._objects.Players) {
            let player = World._objects.Players[key];

            if (player.socketId === socket.id) {
                delete World._objects.Players[key];
            }
        }
    });

    socket.on('player::new', function (data) {
        //create player
        let newPlayer = createInstance('Player');
        newPlayer.id = data.key;
        newPlayer.socketId = socket.id;
        newPlayer.username = data.name;
    });

    socket.on('io::update', (data) => {
        if (World._objects.Players) {
            let player;
            for (let i in World._objects.Players) {
                if (World._objects.Players[i].id === data.key && World._objects.Players[i].socketId === socket.id) {
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

    let dataStream = stream(socket);

    setInterval(() => {
        if (Object.keys(World._objects).length < 1) return;
        dataStream.then(() => {
            dataStream = stream(socket);
        });
    }, 10);

    function stream(socket) {
        return new Promise((res) => {
            let stringStream = require('string-to-stream');
            let dataStream = ss.createStream({
                highWaterMark: 8,
                objectMode: true,
            });

            ss(socket).emit('data::stream', dataStream);
            stringStream(World.arrayObjects()).pipe(dataStream);
            dataStream.on('end', () => res());
        });
    }
});

server.listen(3000, function () {
    console.log('listening on *:3000');
});