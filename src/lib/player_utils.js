import defaults from 'defaults';
import THREE from 'three';

import * as ThreeUtils from './three_utils';

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;

var vecY = new THREE.Vector3(1, 0, 0);
var vecX = new THREE.Vector3(0, 1, 0);
var vecZ = new THREE.Vector3(0, 0, 1);

export function createSphereAsync(player, callback) {
	loadTextureAsync(player, function(texture) {
		var sphere = ThreeUtils.createSphere(texture);
		callback(sphere);
	});
};

export function rotateSphere(player) {
	if (!player.sphere) {
		return;
	}

	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecX, -(player.lx || 0) * velocityCoefficient);
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecY, (player.ly || 0) * velocityCoefficient);

	var theta = player.angle - player.lastAngle;
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecZ, theta * rotationCoefficient);
}

export function setSprite(player, baseTexture, rect) {
	var frame = new PIXI.Rectangle(rect.x, rect.y, rect.width, rect.height);
	var texture = new PIXI.Texture(baseTexture, frame);

	player.sprites.actualBall.setTexture(texture);
}

export function loadTextureAsync(player, callback) {
	var texturePath = getTexturePath(player);
	ThreeUtils.loadTextureAsync(texturePath, callback);
}

export function updateTexture(player) {
	loadTextureAsync(player, function(texture) {
		player.sphere.material = ThreeUtils.createMaterial(texture);
	})
};

export function getTexturePath(player) {
	var rootPath = "http://keratagpro.github.io/tagpro-balls-3d/textures/";

	var texturePath = player.team === 1 ?
		"planets/mars.jpg" :
		"planets/earth.jpg";

	return rootPath + texturePath;
}