let express = require('express');
let fs = require('fs');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let assets = {
    craft01: JSON.parse(fs.readFileSync('assets/sprites/craft_01.json', 'utf-8')),
    bullet01: JSON.parse(fs.readFileSync('assets/sprites/bullet_01.json', 'utf-8'))
};

//initialize components
require('./components/globals/init')();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.emit('assets::load', assets);

    socket.on('disconnect', function () {
        for (let key in World._objects.Players) {
            let player = World._objects.Players[key];

            if (player.socketId === socket.id) {
                World._objects.Players.splice(key, 1);
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
            let player = World._objects.Players.find((player) => {
                if (!player) return false;
                return player.id === data.key && player.socketId === socket.id;
            });
            if (player) {
                for (let i in data.io) {
                    player._input[i] = data.io[i];
                }
            }
        }
    });
});

server.listen(3000, function () {
    console.log('listening on *:3000');

    setInterval(function () {
        if (!Object.keys(World._objects).length) return;
        update();
        io.emit('objects::update', World._objects);
    }, 10);
});