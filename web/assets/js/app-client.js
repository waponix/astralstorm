(() => {
	var fn = ((fn) => {
		fn.each = (array, callback) => {
			for (var ai in array) {
				callback.length > 1 ? callback(ai, array[ai]) : callback(array[ai]);
			}
		};
		return fn;
	})({});
		

	var $view = (() => {
		var self = {};
		var canvas = document.createElement('canvas');
		canvas.id = 'game-view';

		document.body.append(canvas);

		self.getContext = () => {
			return canvas.getContext('2d');
		};

		self.clear = () => {
			self.getContext().clearRect(0, 0, canvas.width, canvas.height);
		};

		return self;
	})();

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
			if (e.type === 'mousemove')
				controls.mouse.x = e.pageX;
				controls.mouse.y = e.pageY;
			else
				controls.mouse[e.which] = e.type === 'mousedown' ? true :false;
			socket.emit('stream:input', {pid: streamInfo.pid, controls});
		});
	});

	var gameStep = () => {
		if (dataStream)
		
			$view.clear();
			
			fn.each(dataStream, (pid, data) => {
				//if (pid === streamInfo.pid)
					$view.getContext().fillStyle = "#ffffff";
					$view.getContext().fillRect(data.x, data.y, data.dimension.width, data.dimension.height);
			});

		window.requestAnimationFrame(gameStep);
	}

	window.requestAnimationFrame(gameStep);
})();