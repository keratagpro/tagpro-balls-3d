import defaults from 'defaults';
import THREE from 'three';

import * as ThreeUtils from './three_utils';
import ObjectGrid from './object_grid';

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;

var vecY = new THREE.Vector3(1, 0, 0);
var vecX = new THREE.Vector3(0, 1, 0);
var vecZ = new THREE.Vector3(0, 0, 1);

export function createSphere(player) {
	return ThreeUtils.createBall({
		map: getTexture(player)
	});
};

export function rotateSphere(player) {
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecX, -player.lx * velocityCoefficient);
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecY, player.ly * velocityCoefficient);

	var theta = player.angle - player.lastAngle;
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecZ, theta * rotationCoefficient);

	player.lastAngle = player.angle;
}

export function createGrid() {
	return new ObjectGrid({
		cols: 10,
		rows: 10,
		cellSize: 40
	});
};

export function setSprite(player, baseTexture, rect) {
	var frame = new PIXI.Rectangle(rect.x, rect.y, rect.width, rect.height);
	var texture = new PIXI.Texture(baseTexture, frame);

	player.sprites.actualBall.setTexture(texture);
}

export function getTexture(player) {
	var texturePath = getTexturePath(player);

	return ThreeUtils.createTexture(texturePath);
}
export function updateTexture(player) {
	player.sphere.material.map = getTexture(player);
};

export function getTexturePath(player) {
	var rootPath = "http://keratagpro.github.io/tagpro-balls-3d/textures/";

	var texturePath = player.team === 1 ?
		"planets/mars.jpg" :
		"planets/earth.jpg";

	return rootPath + texturePath;
}