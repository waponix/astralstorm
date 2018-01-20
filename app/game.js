module.exports = (($, $socket) => {
	var streams = null;
	var objects = null;
	var sockets = null;
	var timestep = 1 / 60;

	var game = {
		world: new $.p2.World({gravity: [0, 0]}),
		rid: 'room:'+$.genId()
	};

	var player = require('./objects/player')($);
	
	$.io.on('connection', ($socket) => {
		streams = streams || {};
		objects = objects || {};
		sockets = sockets || {};
		
		streams[$socket.id] = {sid: 'stream:'+$.genId(), rid: game.rid, pid: $socket.id};
		objects[$socket.id] = new player();
		sockets[$socket.id] = $socket;

		game.world.addBody(objects[$socket.id].body());
		
		$socket.emit('stream:info', streams[$socket.id]);

		$socket.on('disconnect', () => {
			delete streams[$socket.id];
			delete objects[$socket.id];
			delete sockets[$socket.id];
		});

		$socket.on('stream:input', (input) => {
			if (objects[input.pid])
				var controls = input.controls;
				if (objects[input.pid]) objects[input.pid] = Object.assign(objects[input.pid], {controls});
		});
	});

	setInterval(() => {	
		game.world.step(timestep);
		if (streams)
			$.fn.update(objects);
			$.fn.broadcast(streams, sockets, objects);
	}, 1000 * timestep);
});