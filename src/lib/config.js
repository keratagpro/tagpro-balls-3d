import THREE from 'three';

const rootUrl = 'https://keratagpro.github.io/tagpro-balls-3d';

var defaults = {
	texturesRed: [`${rootUrl}/textures/planets/mars.jpg`],
	texturesBlue: [`${rootUrl}/textures/planets/earth.jpg`],
	velocityCoefficient: 0.1,
	rotationCoefficient: 1.0,
	ambientLightColor: 0x888888,
	lightColor: 0xcccccc,
	lightPosition: [-200, -200, -400],
	lightIntensity: 0.8,
	anisotropy: 1,
	minFilter: THREE.LinearFilter,
	sphereRadius: 19,
	sphereWidthSegments: 16,
	sphereHeightSegments: 12,
	sphereShading: THREE.SmoothShading
};

export default defaults;