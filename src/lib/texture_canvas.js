import THREE from 'three';
import PIXI from 'pixi.js';

import * as ThreeUtils from './three_utils';
import { values } from './utils';
import Packer from './packer';

export default class TextureCanvas {
	constructor(config) {
		this.config = config;

		this.playerMap = {};
		this.objectMap = {};

		this.width = tagpro.TILE_SIZE * 10;
		this.height = tagpro.TILE_SIZE * 10;

		this.initThree();

		this.baseTexture = new PIXI.BaseTexture(this.renderer.domElement);

		this.tilePadding = 10;

		this.textureIndexRed = 0;
		this.textureIndexBlue = 0;

		if (config.textureSelection !== 'default') {
			this.shuffleArray(config.texturesRed);
			this.shuffleArray(config.texturesBlue);
		}
	}

	initThree() {
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});

		this.maxAnisotropy = this.renderer.getMaxAnisotropy();

		this.loader = new THREE.TextureLoader();
		this.loader.setCrossOrigin('');

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

		this.loadTexture(texturePath, texture => {
			var sphere = ThreeUtils.createSphereMesh({ texture });

			ThreeUtils.rotateZ(sphere, Math.PI);

			this.scene.add(sphere);

			this.playerMap[player.id] = {
				player,
				sphere,
				w: tagpro.TILE_SIZE + this.tilePadding,
				h: tagpro.TILE_SIZE + this.tilePadding
			};

			this.updateBinPacking();

			this.baseTexture.dirty();
		});
	}

	removePlayer(player) {
		if (!player) {
			return;
		}

		var meta = this.playerMap[player.id];
		this.scene.remove(meta.sphere);

		delete this.playerMap[player.id];

		this.updateBinPacking();
	}

	loadTexture(texturePath, callback) {
		this.loader.load(texturePath, (texture) => {
			if (this.config.useMaxAnisotropy) {
				texture.anisotropy = this.maxAnisotropy;
			}
			else {
				texture.anisotropy = this.customAnisotropy;
			}

			texture.minFilter = this.config.minFilter;

			callback(texture);
		});
	}

	addMarsBall(object, position) {
		var texturePath = this.config.textureMarsBall;

		this.loadTexture(texturePath, texture => {
			var sphere = ThreeUtils.createSphereMesh({
				texture,
				radius: tagpro.TILE_SIZE - 2
			});

			ThreeUtils.rotateZ(sphere, Math.PI);

			this.scene.add(sphere);

			this.objectMap[object.id] = {
				object,
				sphere,
				w: 2 * tagpro.TILE_SIZE + this.tilePadding,
				h: 2 * tagpro.TILE_SIZE + this.tilePadding
			};

			this.updateBinPacking();

			this.baseTexture.dirty();
		});
	}

	updateMarsBall(object, position) {
		var meta = this.objectMap[object.id];

		if (!meta) {
			return;
		}

		this.rotateSphere(object, meta);

		if (object.lx !== 0 || object.ly !== 0) {
			this.baseTexture.dirty();
		}
	}

	updatePosition(player) {
		var meta = this.playerMap[player.id];

		if (!meta) {
			return;
		}

		this.rotateSphere(player, meta);

		this.baseTexture.dirty();
	}

	updateTexture(player) {
		var meta = this.playerMap[player.id];

		if (!meta) {
			this.addPlayer(player);
		}
		else {
			var texturePath = this.getTexturePathForPlayer(player);
			this.loadTexture(texturePath, texture => {
				var material = meta.sphere.material;
				material.map = texture;
				material.needsUpdate = true;
			});
		}
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	updateBinPacking() {
		var metaArray = values(this.playerMap).concat(values(this.objectMap));

		metaArray.forEach(p => {
			delete p.fit;
		});

		var packer = new Packer(this.width, this.height);

		packer.fit(metaArray);

		metaArray.forEach(p => {
			if (!p.fit) {
				// console.log('could not fit', p);
				return;
			}

			// only update if packing changed the position
			if (p.x !== p.fit.x || p.y !== p.fit.y) {
				p.x = p.fit.x;
				p.y = p.fit.y;

				var pos = p.sphere.position;
				pos.x = p.x + p.w / 2;
				pos.y = p.y + p.w / 2;

				let rect = {
					x: p.x,
					y: p.y,
					w: p.w,
					h: p.h
				};

				if (p.player) {
					this.setPlayerSprite(p.player, rect);
				}
				else if (p.object) {
					this.setMarsBallSprite(p.object, rect);
				}
			}
		});
	}

	setPlayerSprite(player, rect) {
		var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
		var texture = new PIXI.Texture(this.baseTexture, frame);

		// console.log('setting live texture for player', player.id, player.name, rect);

		player.sprites.actualBall.pivot.x = this.tilePadding / 2;
		player.sprites.actualBall.pivot.y = this.tilePadding / 2;

		player.sprites.actualBall.setTexture(texture);
	}

	setMarsBallSprite(object, rect) {
		var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
		var texture = new PIXI.Texture(this.baseTexture, frame);

		object.sprite.pivot.x = this.tilePadding / 2;
		object.sprite.pivot.y = this.tilePadding / 2;

		object.sprite.setTexture(texture);
	}

	getTexturePathForPlayer(player) {
		var texture;
		if (player.team === 1) {
			if (this.config.texturesRed.length === 0) {
				return null;
			}

			texture = this.config.texturesRed[this.textureIndexRed % this.config.texturesRed.length];

			if (this.config.textureSelection !== 'singleRandom') {
				this.textureIndexRed += 1;
			}
		}
		else {
			if (this.config.texturesBlue.length === 0) {
				return null;
			}

			texture = this.config.texturesBlue[this.textureIndexBlue % this.config.texturesBlue.length];

			if (this.config.textureSelection !== 'singleRandom') {
				this.textureIndexBlue += 1;
			}
		}

		if (this.config.useCorsProxy) {
			texture = this.config.corsProxy + texture;
		}

		return texture;
	}

	rotateSphere(player, meta) {
		if (!meta.sphere) {
			return;
		}

		ThreeUtils.rotateX(meta.sphere, -(player.lx || 0) * this.config.velocityCoefficient);
		ThreeUtils.rotateY(meta.sphere, (player.ly || 0) * this.config.velocityCoefficient);
		ThreeUtils.rotateZ(meta.sphere, (player.a || 0) * this.config.rotationCoefficient);
	}

	shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}

		return array;
	}
}
