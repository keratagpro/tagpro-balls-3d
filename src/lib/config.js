import $ from 'jquery';
import THREE from 'three';

import Storage from './storage';

const rootUrl = 'https://keratagpro.github.io/tagpro-balls-3d';

export var defaults = {
	texturesRed: [`${rootUrl}/textures/planets/mars.jpg`],
	texturesBlue: [`${rootUrl}/textures/planets/earth.jpg`],
	textureMarsBall: `${rootUrl}/textures/planets/mars.jpg`,
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