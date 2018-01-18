module.exports = (($) => {
	require('./lib/fns')($);
	$.express = require('express');
	$.app = $.express();
	$.server = require('http').Server($.app);
	$.io = require('socket.io').listen($.server);
	$.genId = require('uuid/v4');
	$.p2 = require('p2');

	$.app.set('views', './web/views');
	$.app.set('view engine', 'twig');

	require('./router')($);

	$.app.use($.router);
});