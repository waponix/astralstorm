(() => {
	var fn = ((fn) => {
		fn.each = (array, callback) => {
			for (var ai in array) {
				callback.length > 1 ? callback(ai, array[ai]) : callback(array[ai]);
			}
		};
		return fn;
	})({});

	var socket = io();

	var streamInfo = null;
	var dataStream = null;

	var streamInfoWait = new Promise((res) => {
		socket.on('stream:info', (i) => {
			res(i);
		});
	});

	streamInfoWait.then((info) => {
		streamInfo = info;
		socket.on(streamInfo.sid, (data) => {
			dataStream = data;
		});

		var controls = {};
		$(window).on('keydown keyup', (e) => {
			controls.key = controls.key || {};
			let $key = String.fromCharCode(e.which || e.keyCode).toString().toUpperCase();
			controls.key = Object.assign(controls.key, {[$key]: e.type === 'keydown' ? true : false});
			socket.emit('stream:input', {pid: streamInfo.pid, controls});
		}).on('mousedown mouseup mousemove', (e) => {
			
		});
	});

	var world;
	var app;

	world = new p2.World({gravity: [0, 0]});

	app = new PIXI.Application({
		width: $(window).width(),
		height: $(window).height()
	});

	var rect = new PIXI.Graphics();
	rect.beginFill(0x00ff00);
	rect.drawRect(0, 0, 20, 20);

	app.stage.addChild(rect);

	document.body.appendChild(app.view);

	var gameStep = () => {
		if (dataStream)
			fn.each(dataStream, (data) => {
				rect.x = data.x;
				rect.y = data.y;
				rect.rotation = data.rotation;
				console.log(data.controls.key);
			});
		window.requestAnimationFrame(gameStep);
	}

	window.requestAnimationFrame(gameStep);
})();