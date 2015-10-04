import assign from 'object-assign';
import defaults from 'defaults';
import THREE from 'three';

var rotWorldMatrix;

export function createRenderer(options) {
	options = defaults(options, {
		alpha: true,
		antialias: true
	})

	return new THREE.WebGLRenderer(options);
};

export function addLightsToScene(scene, options) {
	options = defaults(options, {
		ambientColor: 0x888888,
		color: 0xcccccc,
		position: [-200, -200, -400],
		intensity: 1
	});

	var light = new THREE.AmbientLight(options.ambientColor);
	scene.add(light);

	var light = new THREE.DirectionalLight(options.hex, options.intensity);
	light.position.set.apply(light.position, options.position);

	scene.add(light);
}

export function createSphere(texture) {
	var options = {
		radius: 19,
		widthSegments: 16,
		heightSegments: 12,
	};

	var geometry = new THREE.SphereGeometry(options.radius, options.widthSegments, options.heightSegments);

	var material = new THREE.MeshPhongMaterial({
		shading: THREE.SmoothShading,
		map: texture
	});

	return new THREE.Mesh(geometry, material);
};

export function loadTextureAsync(texturePath, callback) {
	THREE.ImageUtils.loadTexture(texturePath, undefined, function(texture) {
		texture.anisotropy = 1;
		texture.minFilter = THREE.LinearFilter;

		callback(texture);
	});
};

export function createCamera(options) {
	options = defaults(options, {
		width: 400,
		height: 400
	});

	var camera = new THREE.OrthographicCamera(
		-options.width/2, options.width/2,
		-options.height/2, options.height/2,
		1, 1000);

	camera.position.z = 900;

	// camera.up = new THREE.Vector3(0, 1, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	camera.position.x = options.width / 2;
	camera.position.y = options.height / 2;

	return camera;
}

// Rotate an object around an arbitrary axis in world space       
export function rotateAroundWorldAxis(object, axis, radians) {
	if (radians === 0 || isNaN(radians)) {
		return;
	}

	rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}