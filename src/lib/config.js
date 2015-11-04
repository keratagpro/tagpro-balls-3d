import $ from 'jquery';
import THREE from 'three';

import Storage from './storage';

const templateUrl = 'https://keratagpro.github.io/tagpro-balls-3d/textures';

var defaultRed = [
	`${templateUrl}/planets/mars.jpg`,
	`${templateUrl}/planets/jupiter.jpg`,
	`${templateUrl}/planets/venus.jpg`,
	`${templateUrl}/planets/mercury.jpg`
];

var defaultBlue = [
	`${templateUrl}/planets/earth.jpg`,
	`${templateUrl}/planets/neptune.jpg`,
	`${templateUrl}/planets/pluto.jpg`,
	`${templateUrl}/planets/moon.jpg`
];

export var defaults = {
	texturesRed: defaultRed,
	texturesBlue: defaultBlue,
	textureMarsBall: `${templateUrl}/planets/mars.jpg`,
	textureSelection: 'default',
	velocityCoefficient: 0.1,
	rotationCoefficient: 0.015,
	ambientLightColor: 0x888888,
	lightColor: 0xcccccc,
	lightPosition: [-200, -200, -400],
	lightIntensity: 0.8,
	useMaxAnisotropy: true,
	customAnisotropy: 1,
	minFilter: THREE.LinearMipMapLinearFilter,
	sphereRadius: 19,
	sphereWidthSegments: 16,
	sphereHeightSegments: 12,
	sphereShading: THREE.SmoothShading,
	useCorsProxy: false,
	corsProxy: 'https://crossorigin.me/',
	disableForEvents: true,
	drawOutline: false,
	outlineColor: 0x000000,
	outlineColorRed: 0xff0000,
	outlineColorBlue: 0x0000ff
};

export default $.extend(true, {}, defaults, Storage.all());