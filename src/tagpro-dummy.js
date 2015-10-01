window.GM_addStyle = function() {};

var canvas = document.querySelector('canvas');
var canvas3d;
var baseTexture;

var pixiRenderer = PIXI.autoDetectRenderer(1280, 800, {
	view: canvas,
	antialias: true,
	transparent: true
});

var stage = new PIXI.Stage(0x000000);
var container = new PIXI.DisplayObjectContainer();
stage.addChild(container);

var texture = PIXI.Texture.fromImage('textures/sports/soft-ball.jpg');

var sprite = new PIXI.Sprite(texture);
sprite.anchor.x = 0.5;
sprite.anchor.y = 0.5;
sprite.position.x = 200;
sprite.position.y = 150;
container.addChild(sprite);

var sprite2 = new PIXI.Sprite(texture);
sprite2.anchor.x = 0.5;
sprite2.anchor.y = 0.5;
sprite2.position.x = 300;
sprite2.position.y = 150;
container.addChild(sprite2);

var tagpro = window.tagpro = {
	ready: function(callback) {
		document.addEventListener('DOMContentLoaded', callback);
	},
	renderer: {
		canvas: canvas,
		createPlayerSprite: function(player) {},
		updateCameraPosition: function() {},
		updatePlayerSpritePosition: function(player) {},
		updatePlayerColor: function(player) {},
		render: function(stage) {
			pixiRenderer.render(stage);
		}
	},
	zoom: 1,
	chat: {
		resize: function() {}
	},
	players: {
		"1": { x: 600, y: 400, lx: 0, ly: 0, angle: 0, team: 1 },
		"2": { x: -50, y: -50, lx: 0, ly: 0, angle: 0, team: 2 },
		"3": { x: -50, y: 50, lx: 0, ly: 0, angle: 0, team: 1 },
		"4": { x: 50, y: 50, lx: 0, ly: 0, angle: 0, team: 2 },
		"5": { x: 50, y: -50, lx: 0, ly: 0, angle: 0, team: 2 }
	}
};

var updateInterval = 50;

var velocityMultiplier = 0.1;
function randomMovement(player) {
	var lxd = Math.random() * 2 - 1;
	var lyd = Math.random() * 2 - 1;

	player.lx += Math.min(1, Math.max(-1, lxd * velocityMultiplier));
	player.ly += Math.min(1, Math.max(-1, lyd * velocityMultiplier));

	player.x += player.lx * 1;
	player.y += player.ly * 1;

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

	_.each(tagpro.players, function(player, key) {
		if (key !== "1")
			randomMovement(player);

		tagpro.renderer.updatePlayerSpritePosition(player);
		tagpro.renderer.updatePlayerColor(player);
	})

	// renderTexture.render(canvas3d);
	// console.log(sprite.texture);

	baseTexture.dirty();
	// baseTexture._dirty[0] = true;
	// PIXI.texturesToUpdate.push(baseTexture);

	// tagpro.zoom += 0.001;
	tagpro.renderer.updateCameraPosition(tagpro.players["1"]);
	tagpro.renderer.render(stage);
}

tagpro.ready(function() {
	setTimeout(function() {
		canvas3d = document.querySelector('#canvas3d');
		baseTexture = new PIXI.BaseTexture(canvas3d);
		var texture2 = new PIXI.Texture(baseTexture, new PIXI.Rectangle(16*40 - 20, 10 * 40 - 20, 40, 40));
		sprite.setTexture(texture2);

		var texture3 = new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 0, 40, 40));
		sprite2.setTexture(texture3);

		_.each(tagpro.players, function(player) {
			console.log('creating player', player);
			tagpro.renderer.createPlayerSprite(player);
		});

		step();
	}, 1000);
});

var keyboard = new THREEx.KeyboardState();

var player1 = tagpro.players["1"];
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
