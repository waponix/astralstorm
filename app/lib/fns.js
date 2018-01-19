module.exports = (($) => {
	$.fn = {};
	$.fn.each = (array, callback) => {
		for (var ai in array) {
			callback.length > 1 ? callback(ai, array[ai]) : callback(array[ai]);
		}
		return this;
	};

	$.fn.update = (objects) => {
		$.fn.each(objects, (object) => object.update());
	};

	$.fn.broadcast = (streams, sockets, objects) => {
		$.fn.each(streams, (pid, stream) => sockets[pid].emit(stream.sid, objects));
	};
});