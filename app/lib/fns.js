module.exports = (($) => {
	$.fn = {};
	$.fn.each = (array, callback) => {
		for (var ai in array) {
			callback.length > 1 ? callback(ai, array[ai]) : callback(array[ai]);
		}
	};
});