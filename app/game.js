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

		// $socket.on('stream:input', (input) => {
		// 	if (players[input.pid])
		// 		var controls = input.controls;
		// 		if (players[input.pid]) players[input.pid] = Object.assign(players[input.pid], {controls});
		// });
	});

	setInterval(() => {	
		$.game.world.step(timestep);
		
	}, 1000 * timestep);

	function player() {
		this.body = new $.p2.Body({
			mass: 5,
			position: [100, 100]
		});

		this.shape = new $.p2.Circle({radius: 1});
		this.body.addShape(this.shape);
	};
});