module.exports = (($) => {
	$.router = $.express.Router();

	$.router.use($.express.static('web/assets'));

	$.router.get('/game', (req, res) => {
	
		res.render('index.twig');
	
	});

	$.router.use((req, res, next) => {

		res.status(404);
		res.send('404 page not found');
		next();
	
	});
});