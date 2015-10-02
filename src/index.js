import THREE from 'three';
import after from './lib/after_hook';
import createBall from './lib/ball';

THREE.ImageUtils.crossOrigin = '';

const TILE_SIZE = 40;
const TILES_HORIZONTAL = 10;
const TILES_VERTICAL = 10;

const CANVAS_WIDTH = TILE_SIZE * TILES_HORIZONTAL;
const CANVAS_HEIGHT = TILE_SIZE * TILES_VERTICAL;

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;

var vecY = new THREE.Vector3(1, 0, 0);
var vecX = new THREE.Vector3(0, -1, 0);
var vecZ = new THREE.Vector3(0, 0, 1);

var renderer3d = createRenderer();
var camera3d = createCamera();
var scene3d = createScene();

var container = new THREE.Object3D();
container.position.x = -CANVAS_WIDTH/2;
container.position.y = -CANVAS_HEIGHT/2;
scene3d.add(container);

var baseTexture3d = new PIXI.BaseTexture(renderer3d.domElement);

function createRenderer() {
	var renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});

	renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

	return renderer;
}

function createCamera() {
	var camera = new THREE.OrthographicCamera(
		-CANVAS_WIDTH/2, CANVAS_WIDTH/2,
		-CANVAS_HEIGHT/2, CANVAS_HEIGHT/2,
		1, 1000);

	camera.position.z = 900;

	camera.up = new THREE.Vector3(0, 1, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	return camera;
}

function createScene() {
	var scene = new THREE.Scene();

	addLights(scene);

	return scene;
}

function getSpherePositionForPlayer(player) {
	var id = player.id - 1; // I hope tagpro.players is a number starting from 1.

	return {
		x: (id % TILES_HORIZONTAL) * TILE_SIZE,
		y: ~~(id / TILES_HORIZONTAL) * TILE_SIZE // ~~ is basically Math.floor
	};
}

function addLights(scene) {
	var light = new THREE.AmbientLight(0x888888);
	scene.add(light);

	var light = new THREE.DirectionalLight(0xcccccc, 1);
	light.position.set(200, -200, 500);
	scene.add(light);
}

function getSphereTextureForPlayer(player, callback) {
	var texturePath = (player.team === 1) ?
		'http://jeromeetienne.github.io/threex.planets/images/marsmap1k.jpg' : 
		'http://jeromeetienne.github.io/threex.planets/images/earthmap1k.jpg';

	var texture = THREE.ImageUtils.loadTexture(texturePath, undefined, callback);
	texture.anisotropy = renderer3d.getMaxAnisotropy();
	texture.minFilter = THREE.LinearFilter;

	return texture;
}

function render3d() {
	renderer3d.render(scene3d, camera3d);
}

function createSphereForPlayer(player) {
	var texture = getSphereTextureForPlayer(player, render3d);
	return createBall(texture);
}

function addSphereToScene(scene, sphere, position) {
	sphere.position.x = position.x + TILE_SIZE / 2;
	sphere.position.y = position.y + TILE_SIZE / 2;

	scene.add(sphere);
}

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
	var rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}

tagpro.ready(function() {
	var tr = tagpro.renderer;

	after(tr, 'createBallSprite', function(player) {
		var sphere = createSphereForPlayer(player);
		player.sphere = sphere;

		var position = getSpherePositionForPlayer(player);
		addSphereToScene(container, sphere, position);

		var frame = new PIXI.Rectangle(position.x, position.y, TILE_SIZE, TILE_SIZE);
		var texture = new PIXI.Texture(baseTexture3d, frame);
		player.sprites.actualBall.setTexture(texture);
		baseTexture3d.dirty();

		player.lastAngle = player.angle; // initialize lastAngle
	});

	after(tr, 'updatePlayerSpritePosition', function(player) {
		rotateAroundWorldAxis(player.sphere, vecX, player.lx * velocityCoefficient);
		rotateAroundWorldAxis(player.sphere, vecY, player.ly * velocityCoefficient);

		var theta = player.angle - player.lastAngle;
		player.lastAngle = player.angle;

		rotateAroundWorldAxis(player.sphere, vecZ, theta * rotationCoefficient);

		baseTexture3d.dirty();
	});

	// Replace original tagpro.renderer.updatePlayerColor
	tr.updatePlayerColor = function(player) {
		var color = player.team === 1 ? 'red' : 'blue';
		var tileId = color + 'ball';

		if (player.sprites.actualBall.tileId !== tileId) {
			player.sphere.material.map = getSphereTextureForPlayer(player);
			// NOTE: material.needsUpdate() ? baseTexture3d.dirty() ?
			player.sprites.actualBall.tileId = tileId;
		}
	}

	after(tr, 'render', function() {
		render3d();
	});

	after(tr, 'destroyPlayer', function(player) {
		container.remove(player.sphere);

		delete player.sphere;
	})

	render3d();
});
