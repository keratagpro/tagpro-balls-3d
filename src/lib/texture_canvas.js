import THREE from 'three';
import PIXI from 'pixi.js';

import * as ThreeUtils from './three_utils';
import Packer from './packer';
import config from './config';

THREE.ImageUtils.crossOrigin = '';

var textureIndexRed = 0;
var textureIndexBlue = 0;

export default class TextureCanvas {
	constructor(options) {
		this.metaMap = {};

		this.width = tagpro.TILE_SIZE * 10;
		this.height = tagpro.TILE_SIZE * 10;

		this.initThree(options);

		this.baseTexture = new PIXI.BaseTexture(this.renderer.domElement);

		this.packer = new Packer(this.width, this.height);
	}

	initThree(options) {
		this.renderer = THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});

		this.renderer.setSize(this.width, this.height);

		document.querySelector('#assets').appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();

		ThreeUtils.addLightsToScene(this.scene);

		this.camera = ThreeUtils.createCamera({
			width: this.width,
			height: this.height
		});
	}

	addPlayer(player) {
		var texture = this.getTextureForPlayer(player);
		
		var sphere = ThreeUtils.createSphereMesh({ texture });

		this.metaMap[player.id] = {
			player,
			sphere,
			angle: player.angle,
			w: tagpro.TILE_SIZE,
			h: tagpro.TILE_SIZE
		};

		this.updateBinPacking();

		this.baseTexture.dirty();
	}

	removePlayer(player) {
		if (!player) {
			return;
		}

		var meta = this.metaMap[player.id];
		this.scene.remove(meta.sphere);

		delete this.metaMap[player.id];

		this.updateBinPacking();
	}

	updatePosition(player) {
		var meta = this.metaMap[player.id];

		this.rotateSphere(player, meta);

		meta.angle = player.angle;

		this.baseTexture.dirty();
	}

	updateTexture(player) {
		var material = this.metaMap[player.id].sphere.material;
		material.map = this.getTextureForPlayer(player);
		material.needsUpdate = true;
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	updateBinPacking() {
		var metaArray = Object.keys(this.metaMap).map(key => this.metaMap[key]);

		metaArray.forEach(p => {
			delete p.fit;
		});

		this.packer.fit(metaArray);

		metaArray.forEach(p => {
			if (!p.fit) {
				return;
			}

			// only update if packing changed the position
			if (p.x !== p.fit.x || p.y !== p.fit.y) {
				this.setPlayerSprite(p.original, p.fit);

				p.x = p.fit.x;
				p.y = p.fit.y;
			}
		});
	}

	setPlayerSprite(player, rect) {
		var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
		var texture = new PIXI.Texture(this.baseTexture, frame);

		player.sprites.actualBall.setTexture(texture);
	}

	getTextureForPlayer(player) {
		var texture;
		if (player.team === 1) {
			texture = config.texturesRed[textureIndexRed % config.texturesRed.length];
			textureIndexRed += 1;
		}
		else {
			texture = config.texturesBlue[textureIndexBlue % config.texturesBlue.length];
			textureIndexBlue += 1;
		}

		return texture;
	}

	rotateSphere(player, meta) {
		if (!meta.sphere) {
			return;
		}

		ThreeUtils.rotateX(meta.sphere, -(player.lx || 0) * config.velocityCoefficient);
		ThreeUtils.rotateY(meta.sphere, (player.ly || 0) * config.velocityCoefficient);

		var theta = player.angle - meta.angle;
		ThreeUtils.rotateZ(meta.sphere, theta * config.rotationCoefficient);
	}
}
