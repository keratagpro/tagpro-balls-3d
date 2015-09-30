// ==UserScript==
// @name          TagPro Balls 3D
// @namespace     http://github.com/keratagpro/
// @description   Draws 3D balls on top of the TagPro canvas using THREE.js.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://*.newcompte.fr:*
// @author        Kera
// @version       0.1
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min.js
// @grant         GM_addStyle
// ==/UserScript==

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libBall = require('./lib/ball');

var _libBall2 = _interopRequireDefault(_libBall);

var w = 1280;
var h = 800;
var aspect = w / h;
var zoom = 1;

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;
var vecY = new THREE.Vector3(1, 0, 0);
var vecX = new THREE.Vector3(0, -1, 0);
var vecZ = new THREE.Vector3(0, 0, 1);

GM_addStyle("#canvas3d { display: block; pointer-events: none; position: absolute; }");

tagpro.ready(function () {
	var camera = createCamera();
	tagpro.threeCamera = camera;

	var renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});

	renderer.setSize(w, h);
	document.body.appendChild(renderer.domElement);
	renderer.domElement.id = 'canvas3d';

	var scene = new THREE.Scene();

	addLights(scene);

	THREE.ImageUtils.crossOrigin = '';

	var textureEarth = THREE.ImageUtils.loadTexture('http://jeromeetienne.github.io/threex.planets/images/earthmap1k.jpg', undefined, render);
	textureEarth.anisotropy = renderer.getMaxAnisotropy();
	textureEarth.minFilter = THREE.NearestFilter;

	var textureMars = THREE.ImageUtils.loadTexture('http://jeromeetienne.github.io/threex.planets/images/marsmap1k.jpg', undefined, render);
	textureMars.anisotropy = renderer.getMaxAnisotropy();
	textureMars.minFilter = THREE.NearestFilter;

	// var earth = createBall(textureEarth);
	// earth.position.x = 500;
	// earth.position.y = 300;
	// scene.add(earth);

	// var mars = createBall(textureMars);
	// mars.position.x = -500;
	// mars.position.y = -300;
	// scene.add(mars);

	// var geometry = new THREE.PlaneGeometry( 32 * 40, 20 * 40, 32, 20 );
	// var material = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.DoubleSide, wireframe: true } );
	// var plane = new THREE.Mesh( geometry, material );
	// geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -16 * 40, 10 * 40, 0 ) );
	// scene.add( plane );

	var origPlayerSprite = tagpro.renderer.createPlayerSprite;
	tagpro.renderer.createPlayerSprite = function (player) {
		origPlayerSprite(player);

		player.lastAngle = player.angle; // initialize lastAngle

		var texture = player.team === 2 ? textureEarth : textureMars;
		player.sphere = (0, _libBall2['default'])(texture);

		scene.add(player.sphere);
	};

	var origUpdateSpritePos = tagpro.renderer.updatePlayerSpritePosition;
	tagpro.renderer.updatePlayerSpritePosition = function (player) {
		origUpdateSpritePos(player);

		player.sphere.material.visible = !player.dead;

		player.sphere.position.x = -player.x;
		player.sphere.position.y = player.y;

		rotateAroundWorldAxis(player.sphere, vecX, player.lx * velocityCoefficient);
		rotateAroundWorldAxis(player.sphere, vecY, -player.ly * velocityCoefficient);

		var theta = player.angle - player.lastAngle;
		player.lastAngle = player.angle;

		rotateAroundWorldAxis(player.sphere, vecZ, -theta * rotationCoefficient);
	};

	var origChatResize = tagpro.chat.resize;
	tagpro.chat.resize = function () {
		origChatResize();

		var cnv = tagpro.renderer.canvas;
		$(renderer.domElement).css({
			left: cnv.offsetLeft,
			top: cnv.offsetTop,
			width: null,
			height: null
		}).attr({
			width: cnv.width,
			height: cnv.height
		});

		renderer.setSize(cnv.width, cnv.height);
	};

	var origCameraPosition = tagpro.renderer.updateCameraPosition;
	tagpro.renderer.updateCameraPosition = function (player) {
		origCameraPosition(player);

		setCameraPosition(camera, player);

		if (tagpro.zoom !== zoom) {
			zoom = tagpro.zoom;
			camera.zoom = zoom;
			camera.updateProjectionMatrix();
		}
	};

	var origRender = tagpro.renderer.render;
	tagpro.renderer.render = function (stage) {
		origRender(stage);

		render();
	};

	var origDestroyPlayer = tagpro.renderer.destroyPlayer;
	tagpro.renderer.destroyPlayer = function (player) {
		scene.remove(player.sphere);

		origDestroyPlayer(player);
	};

	var rotWorldMatrix;

	// Rotate an object around an arbitrary axis in world space      
	function rotateAroundWorldAxis(object, axis, radians) {
		rotWorldMatrix = new THREE.Matrix4();
		rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
		rotWorldMatrix.multiply(object.matrix); // pre-multiply
		object.matrix = rotWorldMatrix;
		object.rotation.setFromRotationMatrix(object.matrix);
	}

	function render() {
		renderer.render(scene, camera);
	};

	render();
});

function createCamera() {
	var tiles = 20 / 2; // vertical tile count / 2
	var d = tiles * (40 / zoom); // tile size
	var camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
	camera.position.z = 900;
	camera.up = new THREE.Vector3(0, -1, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	camera.updateProjectionMatrix();

	return camera;
}

function setCameraPosition(camera, player) {
	camera.position.x = -player.x;
	camera.position.y = player.y;
	camera.lookAt(player.sphere.position);
}

function addLights(scene) {
	var light = new THREE.AmbientLight(0x888888);
	scene.add(light);

	var light = new THREE.DirectionalLight(0xcccccc, 1);
	light.position.set(500, -500, 500);
	scene.add(light);
}

},{"./lib/ball":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = createBall;
var radius = 19;
var widthSegments = 16;
var heightSegments = 12;

function createBall(texture) {
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

	var material = new THREE.MeshPhongMaterial({
		shading: THREE.SmoothShading,
		map: texture
	});

	return new THREE.Mesh(geometry, material);
}

module.exports = exports["default"];

},{}]},{},[1]);
