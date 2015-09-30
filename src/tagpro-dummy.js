window.GM_addStyle = function() {};

var tagpro = window.tagpro = {
	ready: function(callback) {
		document.addEventListener('DOMContentLoaded', callback);
	},
	renderer: {
		updateCameraPosition: function() {},
		updatePlayerSpritePosition: function(player) {},
		render: function(stage) {}
	},
	zoom: 1,
	chat: {
		resize: function() {}
	}
};

var updateInterval = 50;

var players = [
	{ x: 600, y: 400, lx: 0, ly: 0, angle: 0, team: 1 },
	{ x: -50, y: -50, lx: 0, ly: 0, angle: 0, team: 2 },
	{ x: -50, y: 50, lx: 0, ly: 0, angle: 0, team: 1 },
	{ x: 50, y: 50, lx: 0, ly: 0, angle: 0, team: 2 },
	{ x: 50, y: -50, lx: 0, ly: 0, angle: 0, team: 2 },
];

var velocityMultiplier = 0.01;
function randomMovement(player) {
	var lxd = Math.random() * 2 - 1;
	var lyd = Math.random() * 2 - 1;

	player.lx += Math.min(1, Math.max(-1, lxd * velocityMultiplier));
	player.ly += Math.min(1, Math.max(-1, lyd * velocityMultiplier));

	player.x += player.lx * 10;
	player.y += player.ly * 10;

	var yMax = 38 * 20;
	var xMax = 38 * 32;

	if (player.x < 0) player.x = xMax;
	if (player.x > xMax) player.x = 0;
	if (player.y < 0) player.y = yMax;
	if (player.y > yMax) player.y = 0;

	// player.angle += Math.random() * 0.0001;
}

function step() {
	window.requestAnimationFrame(step);

	handleInput();

	players.forEach(function(player, i) {
		if (i !== 0)
			randomMovement(player);
		tagpro.renderer.updatePlayerSpritePosition(player);
	})

	// tagpro.zoom += 0.001;
	tagpro.renderer.updateCameraPosition(players[0]);
	tagpro.renderer.render(null);
}

tagpro.ready(function() {
	step();
});

var keyboard = new THREEx.KeyboardState();

var player1 = players[0];
function handleInput() {
	if (keyboard.pressed('left')) {
		player1.lx = -1;
		player1.x -= 1;
	}
	else if (keyboard.pressed('right')) {
		player1.lx = 1;
		player1.x += 1;
	}
	else {
		player1.lx = 0;
	}

	if (keyboard.pressed('up')) {
		player1.ly = -1;
		player1.y -= 1;
	}
	else if (keyboard.pressed('down')) {
		player1.ly = 1;
		player1.y += 1;
	}
	else {
		player1.ly = 0;
	}

	if (keyboard.pressed('q')) {
		player1.angle -= 0.1;
	}
	else if (keyboard.pressed('e')) {
		player1.angle += 0.1;
	}

	if (keyboard.pressed('n')) {
		tagpro.zoom *= 1.01;
	}
	else if (keyboard.pressed('m')) {
		tagpro.zoom /= 1.01;
	}
}
