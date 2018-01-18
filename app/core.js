module.exports = (($) => {
	require('./appConf')($);

	$.server.listen(8080, () => {
		console.log('Server is running...');

		require('./game')($);
	});
});