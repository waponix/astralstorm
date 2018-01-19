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

	// p2.js aliases
	var world, boxBody, boxShape, planeBody, planeShape;
	// pixi.js aliases
	var renderer, stage, stage, graphics, sprite, zoom, container,

	world = new p2.World();
	boxShape = new p2.Box({width: 2, height: 1});
	boxBody = new p2.Body({
		mass: 1,
		position: [0, 2]
	});
	world.addBody(boxBody);

	planeShape = new p2.Plane({mass: 1});
    planeBody = new p2.Body({position: [0, 1], width: 600});
    planeBody.addShape(planeShape);
    world.addBody(planeBody);

	zoom = 100;

	renderer = new PIXI.autoDetectRenderer(600, 400);
	stage = new PIXI.Stage(0x000000);
	container = new PIXI.DisplayObjectContainer();
	stage.addChild(container);

	document.body.appendChild(renderer.view);

	container.position.x = renderer.width / 2;
	container.position.y = renderer.height / 2;
	container.scale.x = zoom;
	container.scale.y = - zoom;

	graphics = new PIXI.Graphics();
	graphics.beginFill(0x00ff00);
	graphics.drawRect(-boxShape.width / 2, -boxShape.height / 2, boxShape.width, boxShape.height);

	container.addChild(graphics);

	var gameStep = () => {	
		if (dataStream)
			world.step(1 / 60);

			graphics.position.x = boxBody.position[0];
			graphics.position.y = boxBody.position[1];
			graphics.rotation = boxBody.angle;

			renderer.render(stage);
		window.requestAnimationFrame(gameStep);
	}

	window.requestAnimationFrame(gameStep);
})();