import after from './lib/after_hook';
import createBall from './lib/ball';

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

tagpro.ready(function() {
	var camera = createCamera();
	tagpro.threeCamera = camera;

	var tr = tagpro.renderer;

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

	var textureEarth = THREE.ImageUtils.loadTexture(
		'textures/planets/earthmap1k.jpg',
		undefined,
		render);
	textureEarth.anisotropy = renderer.getMaxAnisotropy();
	textureEarth.minFilter = THREE.LinearFilter;

	var textureMars = THREE.ImageUtils.loadTexture(
		'textures/planets/marsmap1k.jpg',
		undefined,
		render);
	textureMars.anisotropy = renderer.getMaxAnisotropy();
	textureMars.minFilter = THREE.LinearFilter;

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

	after(tr, 'createPlayerSprite', function(player) {
		console.log('create', player);

		player.lastAngle = player.angle; // initialize lastAngle

		var texture = player.team === 2 ? textureEarth : textureMars;
		player.sphere = createBall(texture);

		scene.add(player.sphere);
	});

	after(tr, 'updatePlayerSpritePosition', function(player) {
		player.sphere.material.visible = !player.dead;

		player.sphere.position.x = -player.x;
		player.sphere.position.y = player.y;

		rotateAroundWorldAxis(player.sphere, vecX, player.lx * velocityCoefficient);
		rotateAroundWorldAxis(player.sphere, vecY, -player.ly * velocityCoefficient);

		var theta = player.angle - player.lastAngle;
		player.lastAngle = player.angle;

		rotateAroundWorldAxis(player.sphere, vecZ, -theta * rotationCoefficient);
	});

	after(tr, 'updatePlayerColor', function(player) {
		var color = player.team == 1 ? 'red' : 'blue';
		var tileId = color + 'ball';


	});

	after(tagpro.chat, 'resize', function() {
		var cnv = tr.canvas;
		renderer.setSize(cnv.width, cnv.height);
	});

	var origCameraPosition = tr.updateCameraPosition;
	tr.updateCameraPosition = function(player) {
		origCameraPosition(player);

		setCameraPosition(camera, player);

		if (tagpro.zoom !== zoom) {
			zoom = tagpro.zoom;
			camera.zoom = zoom;
			camera.updateProjectionMatrix();
		}
	};

	var origRender = tr.render;
	tr.render = function(stage) {
		origRender(stage);

		render();
	}

	var origDestroyPlayer = tr.destroyPlayer;
	tr.destroyPlayer = function(player) {
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
	var camera = new THREE.OrthographicCamera(
		-d * aspect, d * aspect,
		d, -d,
		1, 1000);
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
