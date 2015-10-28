import THREE from 'three';
import PIXI from 'pixi.js';

import * as ThreeUtils from './three_utils';
import Packer from './packer';
import config, { defaults } from './config';

THREE.ImageUtils.crossOrigin = '';

var textureIndexRed = 0;
var textureIndexBlue = 0;
var tilePadding = 15;

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
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});

		this.renderer.setSize(this.width, this.height);

		var container = document.createElement('div');
		container.id = 'balls3d-assets';
		container.style.visibility = 'hidden';
		container.appendChild(this.renderer.domElement);
		document.body.appendChild(container);

		this.scene = new THREE.Scene();

		ThreeUtils.addLightsToScene(this.scene);

		this.camera = ThreeUtils.createCamera({
			width: this.width,
			height: this.height
		});
	}

	addPlayer(player) {
		var texturePath = this.getTexturePathForPlayer(player);
		ThreeUtils.loadTextureAsync(texturePath, texture => {
			var sphere = ThreeUtils.createSphereMesh(texture);

			this.scene.add(sphere);

			this.metaMap[player.id] = {
				player,
				sphere,
				angle: player.angle,
				w: tagpro.TILE_SIZE + tilePadding,
				h: tagpro.TILE_SIZE + tilePadding
			};

			this.updateBinPacking();

			this.baseTexture.dirty();
		});
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

		if (!meta) {
			return;
		}

		this.rotateSphere(player, meta);

		meta.angle = player.angle;

		this.baseTexture.dirty();
	}

	updateTexture(player) {
		var texturePath = this.getTexturePathForPlayer(player);
		ThreeUtils.loadTextureAsync(texturePath, texture => {
			var material = this.metaMap[player.id].sphere.material;
			material.map = texture;
			material.needsUpdate = true;
		});
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
				p.x = p.fit.x;
				p.y = p.fit.y;

				var pos = p.sphere.position;
				pos.x = p.x + p.w / 2;
				pos.y = p.y + p.w / 2;

				this.setPlayerSprite(p.player, {
					x: p.x,
					y: p.y,
					w: p.w,
					h: p.h
				});
			}
		});
	}

	setPlayerSprite(player, rect) {
		var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
		var texture = new PIXI.Texture(this.baseTexture, frame);

		if (tagpro.TILE_SIZE !== rect.w || tagpro.TILE_SIZE !== rect.h) {
			player.sprites.actualBall.position.x = (tagpro.TILE_SIZE - rect.w) / 2;
			player.sprites.actualBall.position.y = (tagpro.TILE_SIZE - rect.h) / 2;
		}

		player.sprites.actualBall.setTexture(texture);
	}

	getTexturePathForPlayer(player) {
		var texture;
		if (player.team === 1) {
			texture = config.texturesRed[textureIndexRed % config.texturesRed.length] || defaults.texturesRed[0];
			textureIndexRed += 1;
		}
		else {
			texture = config.texturesBlue[textureIndexBlue % config.texturesBlue.length] || defaults.texturesBlue[0];
			textureIndexBlue += 1;
		}

		return texture;
	}

	rotateSphere(player, meta) {
		if (!meta.sphere) {
			return;
		}

		ThreeUtils.rotateX(meta.sphere, -(player.lx || 0) * 0.1 * config.velocityCoefficient);
		ThreeUtils.rotateY(meta.sphere, (player.ly || 0) * 0.1 * config.velocityCoefficient);

		var theta = player.angle - meta.angle;
		ThreeUtils.rotateZ(meta.sphere, theta * config.rotationCoefficient);
	}
}
