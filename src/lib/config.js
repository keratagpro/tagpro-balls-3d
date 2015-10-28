import $ from 'jquery';
import THREE from 'three';

import Storage from './storage';

const rootUrl = 'http://keratagpro.github.io/tagpro-balls-3d';

export var defaults = {
	texturesRed: [`${rootUrl}/textures/planets/mars.jpg`],
	texturesBlue: [`${rootUrl}/textures/planets/earth.jpg`],
	velocityCoefficient: 1.0,
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

export default $.extend(true, {}, defaults, Storage.all());