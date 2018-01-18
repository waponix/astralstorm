module.exports = (($, $socket) => {
	var streams = null;
	var players = null;
	var sockets = null;
	var timestep = 1 / 60;

	$.game = {
		world: new $.p2.World({gravity: [0, -9.82]})
	};
	
	$.io.on('connection', ($socket) => {
		streams = streams || {};
		players = players || {};
		sockets = sockets || {};
		
		streams[$socket.id] = {sid: 'stream:'+$.genId(), pid: $socket.id};
		players[$socket.id] = new player();
		sockets[$socket.id] = $socket;
		
		$socket.emit('stream:info', streams[$socket.id]);

		$socket.on('disconnect', () => {
			delete streams[$socket.id];
			delete players[$socket.id];
			delete sockets[$socket.id];
		});

		$socket.on('stream:input', (input) => {
			if (players[input.pid])
				var controls = input.controls;
				if (players[input.pid]) players[input.pid] = Object.assign(players[input.pid], {controls});
		});
	});

	setInterval(() => {	
		$.game.world.step(timestep);
		if (sockets) 
			$.fn.each(sockets, (id, socket) => {
				socket.emit(streams[id].sid, players)
				if (players) players[id].update();
			});
	}, 1000 * timestep);

	function player() {
		var objectType = 'player';

		this.x = Math.floor((Math.random() * 100) + 1);
		this.y = Math.floor((Math.random() * 100) + 1);
		this.direction = 0;
		this.rotation = 0;
		this.controls = {
			key: {},
			mouse: {}
		};
		this.dimension = {
			width: 20,
			height: 20
		};
		this.update = function () {
			if (this.controls.key.A) this.x -= 1;
			if (this.controls.key.D) this.x += 1;
			if (this.controls.key.W) this.y -= 1;
			if (this.controls.key.S) this.y += 1;
		};
	};
});