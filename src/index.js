import THREE from 'three';
import PIXI from 'pixi.js';

import { before, after } from './lib/hooks';
import * as PlayerUtils from './lib/player_utils';
import * as ThreeUtils from './lib/three_utils';
import ObjectGrid from './lib/object_grid';

THREE.ImageUtils.crossOrigin = '';

const GRID_COLS = 10;
const GRID_ROWS = 10;
const TILE_SIZE = 40;

const CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;

var scene = new THREE.Scene();
ThreeUtils.addLightsToScene(scene);

var grid = new ObjectGrid({
	cols: GRID_COLS,
	rows: GRID_ROWS,
	cellSize: TILE_SIZE
});

scene.add(grid);

var renderer = ThreeUtils.createRenderer();
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

// For debugging
// document.body.appendChild(renderer.domElement);

var camera = ThreeUtils.createCamera({
	width: grid.width,
	height: grid.height
});

var baseTexture = new PIXI.BaseTexture(renderer.domElement);

function render() {
	renderer.render(scene, camera);
}

tagpro.ready(function() {
	var tr = tagpro.renderer;

	after(tr, 'createBallSprite', function(player) {
		player.lastAngle = player.angle; // initialize lastAngle

		PlayerUtils.createSphereAsync(player, function(sphere) {
			player.sphere = sphere;

			var rect = grid.add(sphere);

			PlayerUtils.setSprite(player, baseTexture, rect);

			baseTexture.dirty();
		});
	});

	after(tr, 'destroyPlayer', function(player) {
		grid.remove(player.sphere);
		delete player.sphere;
	});

	after(tr, 'updatePlayerSpritePosition', function(player) {
		PlayerUtils.rotateSphere(player);

		player.lastAngle = player.angle;

		baseTexture.dirty();
	});

	// Replace original tagpro.renderer.updatePlayerColor
	tr.updatePlayerColor = function(player) {
		var color = player.team === 1 ? 'red' : 'blue';
		var tileId = color + 'ball';

		if (player.sprites.actualBall.tileId !== tileId) {
			PlayerUtils.updateTexture(player);
			player.sprites.actualBall.tileId = tileId;
		}
	};

	before(tr, 'render', render);
});