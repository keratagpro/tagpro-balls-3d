// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.2.0
// @author        Kera
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min.js
// @namespace     http://github.com/keratagpro/
// @downloadUrl   https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.meta.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

// HACK: browserify-shim tries to find libraries from window.### and global.###
window.THREE = window.THREE || THREE;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _libAfter_hook = require('./lib/after_hook');

var _libAfter_hook2 = _interopRequireDefault(_libAfter_hook);

var _libBall = require('./lib/ball');

var _libBall2 = _interopRequireDefault(_libBall);

_three2['default'].ImageUtils.crossOrigin = '';

var TILE_SIZE = 40;
var TILES_HORIZONTAL = 10;
var TILES_VERTICAL = 10;

var CANVAS_WIDTH = TILE_SIZE * TILES_HORIZONTAL;
var CANVAS_HEIGHT = TILE_SIZE * TILES_VERTICAL;

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;

var vecY = new _three2['default'].Vector3(1, 0, 0);
var vecX = new _three2['default'].Vector3(0, -1, 0);
var vecZ = new _three2['default'].Vector3(0, 0, 1);

var renderer3d = createRenderer();
var camera3d = createCamera();
var scene3d = createScene();

var container = new _three2['default'].Object3D();
container.position.x = -CANVAS_WIDTH / 2;
container.position.y = -CANVAS_HEIGHT / 2;
scene3d.add(container);

var baseTexture3d = new PIXI.BaseTexture(renderer3d.domElement);

function createRenderer() {
	var renderer = new _three2['default'].WebGLRenderer({
		alpha: true,
		antialias: true
	});

	renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

	return renderer;
}

function createCamera() {
	var camera = new _three2['default'].OrthographicCamera(-CANVAS_WIDTH / 2, CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 2, 1, 1000);

	camera.position.z = 900;

	camera.up = new _three2['default'].Vector3(0, 1, 0);
	camera.lookAt(new _three2['default'].Vector3(0, 0, 0));

	return camera;
}

function createScene() {
	var scene = new _three2['default'].Scene();

	addLights(scene);

	return scene;
}

function getSpherePositionForPlayer(player) {
	var id = player.id - 1; // I hope tagpro.players is a number starting from 1.

	return {
		x: id % TILES_HORIZONTAL * TILE_SIZE,
		y: ~ ~(id / TILES_HORIZONTAL) * TILE_SIZE // ~~ is basically Math.floor
	};
}

function addLights(scene) {
	var light = new _three2['default'].AmbientLight(0x888888);
	scene.add(light);

	var light = new _three2['default'].DirectionalLight(0xcccccc, 1);
	light.position.set(500, -500, 500);
	scene.add(light);
}

function getSphereTextureForPlayer(player, callback) {
	var texturePath = player.team === 1 ? 'http://jeromeetienne.github.io/threex.planets/images/marsmap1k.jpg' : 'http://jeromeetienne.github.io/threex.planets/images/earthmap1k.jpg';

	var texture = _three2['default'].ImageUtils.loadTexture(texturePath, undefined, callback);
	texture.anisotropy = renderer3d.getMaxAnisotropy();
	texture.minFilter = _three2['default'].LinearFilter;

	return texture;
}

function render3d() {
	renderer3d.render(scene3d, camera3d);
}

function createSphereForPlayer(player) {
	var texture = getSphereTextureForPlayer(player, render3d);
	return (0, _libBall2['default'])(texture);
}

function addSphereToScene(scene, sphere, position) {
	sphere.position.x = position.x + TILE_SIZE / 2;
	sphere.position.y = position.y + TILE_SIZE / 2;

	scene.add(sphere);
}

// Rotate an object around an arbitrary axis in world space      
function rotateAroundWorldAxis(object, axis, radians) {
	var rotWorldMatrix = new _three2['default'].Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}

tagpro.ready(function () {
	var tr = tagpro.renderer;

	(0, _libAfter_hook2['default'])(tr, 'createBallSprite', function (player) {
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

	(0, _libAfter_hook2['default'])(tr, 'updatePlayerSpritePosition', function (player) {
		// player.sphere.material.visible = !player.dead;

		rotateAroundWorldAxis(player.sphere, vecX, player.lx * velocityCoefficient);
		rotateAroundWorldAxis(player.sphere, vecY, player.ly * velocityCoefficient);

		var theta = player.angle - player.lastAngle;
		player.lastAngle = player.angle;

		rotateAroundWorldAxis(player.sphere, vecZ, theta * rotationCoefficient);

		baseTexture3d.dirty();
	});

	(0, _libAfter_hook2['default'])(tr, 'render', function () {
		render3d();
	});

	(0, _libAfter_hook2['default'])(tr, 'destroyPlayer', function (player) {
		scene.remove(player.sphere);

		delete player.sphere;
	});

	render3d();
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/after_hook":2,"./lib/ball":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = after;

function after(obj, methodName, callback) {
	var orig = obj[methodName];
	console.log('hooking', methodName);
	obj[methodName] = function () {
		var result = orig.apply(this, arguments);
		callback.apply(this, arguments);
		return result;
	};
}

;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = createBall;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var radius = 19;
var widthSegments = 16;
var heightSegments = 12;

function createBall(texture) {
	var geometry = new _three2['default'].SphereGeometry(radius, widthSegments, heightSegments);

	var material = new _three2['default'].MeshPhongMaterial({
		shading: _three2['default'].SmoothShading,
		map: texture
	});

	return new _three2['default'].Mesh(geometry, material);
}

module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
