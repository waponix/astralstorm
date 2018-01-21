(() => {
	var fn = ((fn) => {
		fn.each = (array, callback) => {
			for (var ai in array) {
				callback.length > 1 ? callback(ai, array[ai]) : callback(array[ai]);
			}
			return fn;
		};

		return fn;
	})({});

	function Graphic(stream) {
		console.log(stream);
		var graphic = new PIXI.Graphics();
		graphic.beginFill(0x00ff00);
		graphic.drawRect(stream.x, stream.y, stream.width, stream.height);
		graphic.pivot.set = [10, 10];
		return graphic;
	};

	var socket = io();

	var streamInfo = null;
	var dataStream = null;
	var objects = null;

	var streamInfoWait = new Promise((res) => {
		socket.on('stream:info', (i) => res(i));
	});

	var app = new PIXI.Application({
		width: 1320,
		height: 600
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

	app.stage.scale.x = 1;
	app.stage.scale.y = -1;

	document.body.appendChild(app.view);

	var gameStep = () => {
		if (dataStream)
			fn.each(dataStream, (pid, stream) => {
				objects = objects || {};
				if (!objects[pid]) {
					objects[pid] = {pid: pid, graphic: Graphic(stream)};
					app.stage.addChild(objects[pid].graphic);
				} else {
					objects[pid].graphic.x = stream.x;
					objects[pid].graphic.y = stream.y;
					objects[pid].graphic.rotation = stream.rotation;
				}
			});

			fn.each(objects, (pid, object) => {
				if (!dataStream[pid])
					app.stage.removeChild(object.graphic);
			});
		window.requestAnimationFrame(gameStep);
	}

	window.requestAnimationFrame(gameStep);
})();