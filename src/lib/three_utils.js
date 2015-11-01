import $ from 'jquery';
import THREE from 'three';

import config from './config';

// var rotWorldMatrix;
var quaternion = new THREE.Quaternion();

var vecX = new THREE.Vector3(0, 1, 0);
var vecY = new THREE.Vector3(1, 0, 0);
var vecZ = new THREE.Vector3(0, 0, 1);

export function addLightsToScene(scene) {
	var light = new THREE.AmbientLight(config.ambientLightColor);
	scene.add(light);

	light = new THREE.DirectionalLight(config.lightColor, config.lightIntensity);
	light.position.set.apply(light.position, config.lightPosition);

	scene.add(light);
}

export function createSphereMesh(options) {
	options = $.extend({
		radius: config.sphereRadius,
		widthSegments: config.sphereWidthSegments,
		heightSegments: config.sphereHeightSegments,
		shading: config.sphereShading,
		texture: null,
		drawOutline: config.drawOutline,
		outlineColor: config.outlineColor,
		outlineScale: 1.05
	}, options);

	var geometry = new THREE.SphereGeometry(options.radius, options.widthSegments, options.heightSegments);

	var material = new THREE.MeshPhongMaterial({
		shading: options.shading,
		map: options.texture,
	});

	var mesh = new THREE.Mesh(geometry, material);

	if (options.drawOutline) {
		var outlineMaterial = new THREE.MeshBasicMaterial({
			color: options.outlineColor,
			side: THREE.FrontSide
		});

		var outline = new THREE.Mesh(geometry, outlineMaterial);
		outline.scale.multiplyScalar(options.outlineScale);
		mesh.add(outline);
	}

	return mesh;
}

export function createCamera(options) {
	var camera = new THREE.OrthographicCamera(
		-options.width / 2, options.width / 2,
		-options.height / 2, options.height / 2,
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

	quaternion.setFromAxisAngle(axis, radians);
	object.quaternion.multiplyQuaternions(quaternion, object.quaternion);

	// rotWorldMatrix = new THREE.Matrix4();
	// rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	// rotWorldMatrix.multiply(object.matrix); // pre-multiply
	// object.matrix = rotWorldMatrix;
	// object.rotation.setFromRotationMatrix(object.matrix);
}

export function rotateX(object, radians) {
	rotateAroundWorldAxis(object, vecX, radians);
}

export function rotateY(object, radians) {
	rotateAroundWorldAxis(object, vecY, radians);
}

export function rotateZ(object, radians) {
	rotateAroundWorldAxis(object, vecZ, radians);
}