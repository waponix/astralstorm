module.exports = (($) => {

	function player() {
		var body = new $.p2.Body({mass: 10, position: [0, 0]});
		var shape = new $.p2.Box({width: 0.1, height: 0.1});
		body.addShape(shape);

		this.x = body.position[0];
		this.y = body.position[1];
		this.rotation = body.angle;
		this.score = 0;
		this.stats = {};
		this.destroyed = false;
		this.health = 100;
		this.team = null;

		this.controls = {
			key: {},
			mouse: {}
		};

		this.body = () => { return body; };

		this.update = () => {

			if (this.controls.key.D) body.position[0] += 1;
			if (this.controls.key.A) body.position[0] -= 1;
			if (this.controls.key.W) body.position[1] += 1;
			if (this.controls.key.S) body.position[1] -= 1;

			this.x = body.position[0];
			this.y = body.position[1];
			this.rotation = body.angle;
		}
	}

	return player;

});