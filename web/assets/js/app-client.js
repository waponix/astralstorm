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

		// var controls = {};
		// $(window).on('keydown keyup', (e) => {
		// 	controls.key = controls.key || {};
		// 	let $key = String.fromCharCode(e.which || e.keyCode).toString().toUpperCase();
		// 	controls.key = Object.assign(controls.key, {[$key]: e.type === 'keydown' ? true : false});
		// 	socket.emit('stream:input', {pid: streamInfo.pid, controls});
		// }).on('mousedown mouseup mousemove', (e) => {
			
		// });
	});

	var app = new PIXI.Application();
	var loader = PIXI.loader;
	var resources = loader.resources;
	var sprite = PIXI.Sprite;

	loader
		.add([
			'img/sprites/cat.png'
		])
		.load(() => {
			var cat = new sprite(resources['img/sprites/cat.png'].texture);
			cat.anchor.set(0.5, 0.5);
			cat.position.set(cat.x + (cat.width / 2), cat.y + (cat.height / 2));

			app.stage.addChild(cat);

			var gameStep = () => {
				if (dataStream)
					
				window.requestAnimationFrame(gameStep);
			}

			window.requestAnimationFrame(gameStep);
		});

	document.body.appendChild(app.view);
})();