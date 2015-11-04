// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.4.9
// @author        Kera
// @grant         GM_addStyle
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_listValues
// @namespace     https://github.com/keratagpro/tagpro-balls-3d/
// @icon          https://keratagpro.github.io/tagpro-balls-3d/ball.png
// @downloadUrl   https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.meta.js
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @require       https://cdnjs.cloudflare.com/ajax/libs/ractive/0.7.3/ractive.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.min.js
// ==/UserScript==

tagpro.ready(function() {
(function ($,Ractive,THREE,PIXI) { 'use strict';

	$ = 'default' in $ ? $['default'] : $;
	Ractive = 'default' in Ractive ? Ractive['default'] : Ractive;
	THREE = 'default' in THREE ? THREE['default'] : THREE;
	PIXI = 'default' in PIXI ? PIXI['default'] : PIXI;

	var babelHelpers = {};

	babelHelpers.createClass = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	function before(obj, methodName, callback) {
		var orig = obj[methodName];
		obj[methodName] = function () {
			callback.apply(this, arguments);
			return orig.apply(this, arguments);
		};
	}

	function after(obj, methodName, callback) {
		var orig = obj[methodName];
		obj[methodName] = function () {
			var result = orig.apply(this, arguments);
			callback.apply(this, arguments);
			return result;
		};
	}

	var Storage = (function () {
		function Storage() {
			babelHelpers.classCallCheck(this, Storage);
		}

		babelHelpers.createClass(Storage, null, [{
			key: "getItem",
			value: function getItem(key) {
				return JSON.parse(GM_getValue(key));
			}
		}, {
			key: "setItem",
			value: function setItem(key, value) {
				GM_setValue(key, JSON.stringify(value));
			}
		}, {
			key: "removeItem",
			value: function removeItem(key) {
				GM_deleteValue(key);
			}
		}, {
			key: "clear",
			value: function clear() {
				var _this = this;

				var keys = GM_listValues();
				keys.forEach(function (key) {
					return _this.removeItem(key);
				});
			}
		}, {
			key: "all",
			value: function all() {
				var _this2 = this;

				var keys = GM_listValues();

				return keys.reduce(function (map, key) {
					map[key] = _this2.getItem(key);
					return map;
				}, {});
			}
		}]);
		return Storage;
	})();

	var templateUrl = 'https://keratagpro.github.io/tagpro-balls-3d/textures';

	var defaultRed = [templateUrl + '/planets/mars.jpg', templateUrl + '/planets/jupiter.jpg', templateUrl + '/planets/venus.jpg', templateUrl + '/planets/mercury.jpg'];

	var defaultBlue = [templateUrl + '/planets/earth.jpg', templateUrl + '/planets/neptune.jpg', templateUrl + '/planets/pluto.jpg', templateUrl + '/planets/moon.jpg'];

	var defaults = {
		texturesRed: defaultRed,
		texturesBlue: defaultBlue,
		textureMarsBall: templateUrl + '/planets/mars.jpg',
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

	var config = $.extend(true, {}, defaults, Storage.all());

	// var rotWorldMatrix;
	var quaternion = new THREE.Quaternion();

	var vecX = new THREE.Vector3(0, 1, 0);
	var vecY = new THREE.Vector3(1, 0, 0);
	var vecZ = new THREE.Vector3(0, 0, 1);

	function addLightsToScene(scene) {
		var light = new THREE.AmbientLight(config.ambientLightColor);
		scene.add(light);

		light = new THREE.DirectionalLight(config.lightColor, config.lightIntensity);
		light.position.set.apply(light.position, config.lightPosition);

		scene.add(light);
	}

	function createSphereMesh(options) {
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
			map: options.texture
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

	function createCamera(options) {
		var camera = new THREE.OrthographicCamera(-options.width / 2, options.width / 2, -options.height / 2, options.height / 2, 1, 1000);

		camera.position.z = 900;

		// camera.up = new THREE.Vector3(0, 1, 0);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		camera.position.x = options.width / 2;
		camera.position.y = options.height / 2;

		return camera;
	}

	// Rotate an object around an arbitrary axis in world space      

	function rotateAroundWorldAxis(object, axis, radians) {
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

	function rotateX(object, radians) {
		rotateAroundWorldAxis(object, vecX, radians);
	}

	function rotateY(object, radians) {
		rotateAroundWorldAxis(object, vecY, radians);
	}

	function rotateZ(object, radians) {
		rotateAroundWorldAxis(object, vecZ, radians);
	}

	function injectCSS(src) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = src;
		(document.head || document.body).appendChild(link);
	}

	function injectScript(src) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		document.body.appendChild(script);
	}

	function isFrontPage() {
		return location.pathname === '/';
	}

	function isGame() {
		return tagpro.state > 0;
	}

	function isEvent() {
		if ($('script[src*="event"]').length !== 0) {
			return true;
		}

		if ($('#event-tiles').length !== 0) {
			return true;
		}

		return false;
	}

	function isHalloweenEvent() {
		return $('script[src*="halloween"').length !== 0;
	}

	function values(object) {
		var result = [];
		for (var property in object) {
			result.push(object[property]);
		}
		return result;
	}

	var Packer = (function () {
		function Packer(w, h) {
			babelHelpers.classCallCheck(this, Packer);

			this.root = { x: 0, y: 0, w: w, h: h };
		}

		babelHelpers.createClass(Packer, [{
			key: "fit",
			value: function fit(blocks) {
				var n, node, block;
				for (n = 0; n < blocks.length; n++) {
					block = blocks[n];
					node = this.findNode(this.root, block.w, block.h);
					if (node) {
						block.fit = this.splitNode(node, block.w, block.h);
					}
				}
			}
		}, {
			key: "findNode",
			value: function findNode(root, w, h) {
				if (root.used) {
					return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
				} else if (w <= root.w && h <= root.h) {
					return root;
				} else {
					return null;
				}
			}
		}, {
			key: "splitNode",
			value: function splitNode(node, w, h) {
				node.used = true;
				node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
				node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h };
				return node;
			}
		}]);
		return Packer;
	})();

	var TextureCanvas = (function () {
		function TextureCanvas(config) {
			babelHelpers.classCallCheck(this, TextureCanvas);

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

		babelHelpers.createClass(TextureCanvas, [{
			key: 'initThree',
			value: function initThree() {
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

				addLightsToScene(this.scene);

				this.camera = createCamera({
					width: this.width,
					height: this.height
				});
			}
		}, {
			key: 'addPlayer',
			value: function addPlayer(player) {
				var _this = this;

				var texturePath = this.getTexturePathForPlayer(player);
				var color = player.team === 1 ? this.config.outlineColorRed : this.config.outlineColorBlue;

				this.loadTexture(texturePath, function (texture) {
					var sphere = createSphereMesh({
						texture: texture,
						outlineColor: color
					});

					rotateZ(sphere, Math.PI);

					_this.scene.add(sphere);

					_this.playerMap[player.id] = {
						player: player,
						sphere: sphere,
						w: tagpro.TILE_SIZE + _this.tilePadding,
						h: tagpro.TILE_SIZE + _this.tilePadding
					};

					_this.updateBinPacking();

					_this.baseTexture.dirty();
				});
			}
		}, {
			key: 'removePlayer',
			value: function removePlayer(player) {
				if (!player) {
					return;
				}

				var meta = this.playerMap[player.id];
				this.scene.remove(meta.sphere);

				delete this.playerMap[player.id];

				this.updateBinPacking();
			}
		}, {
			key: 'loadTexture',
			value: function loadTexture(texturePath, callback) {
				var _this2 = this;

				this.loader.load(texturePath, function (texture) {
					if (_this2.config.useMaxAnisotropy) {
						texture.anisotropy = _this2.maxAnisotropy;
					} else {
						texture.anisotropy = _this2.customAnisotropy;
					}

					texture.minFilter = _this2.config.minFilter;

					callback(texture);
				});
			}
		}, {
			key: 'addMarsBall',
			value: function addMarsBall(object, position) {
				var _this3 = this;

				var texturePath = this.config.textureMarsBall;

				this.loadTexture(texturePath, function (texture) {
					var sphere = createSphereMesh({
						texture: texture,
						radius: tagpro.TILE_SIZE - 2
					});

					rotateZ(sphere, Math.PI);

					_this3.scene.add(sphere);

					_this3.objectMap[object.id] = {
						object: object,
						sphere: sphere,
						w: 2 * tagpro.TILE_SIZE + _this3.tilePadding,
						h: 2 * tagpro.TILE_SIZE + _this3.tilePadding
					};

					_this3.updateBinPacking();

					_this3.baseTexture.dirty();
				});
			}
		}, {
			key: 'updateMarsBall',
			value: function updateMarsBall(object, position) {
				var meta = this.objectMap[object.id];

				if (!meta) {
					return;
				}

				this.rotateSphere(object, meta);

				if (object.lx !== 0 || object.ly !== 0) {
					this.baseTexture.dirty();
				}
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				var meta = this.playerMap[player.id];

				if (!meta) {
					return;
				}

				this.rotateSphere(player, meta);

				this.baseTexture.dirty();
			}
		}, {
			key: 'updateTexture',
			value: function updateTexture(player) {
				var meta = this.playerMap[player.id];

				if (!meta) {
					this.addPlayer(player);
				} else {
					var texturePath = this.getTexturePathForPlayer(player);
					this.loadTexture(texturePath, function (texture) {
						var material = meta.sphere.material;
						material.map = texture;
						material.needsUpdate = true;
					});
				}
			}
		}, {
			key: 'render',
			value: function render() {
				this.renderer.render(this.scene, this.camera);
			}
		}, {
			key: 'updateBinPacking',
			value: function updateBinPacking() {
				var _this4 = this;

				var metaArray = values(this.playerMap).concat(values(this.objectMap));

				metaArray.forEach(function (p) {
					delete p.fit;
				});

				var packer = new Packer(this.width, this.height);

				packer.fit(metaArray);

				metaArray.forEach(function (p) {
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

						var rect = {
							x: p.x,
							y: p.y,
							w: p.w,
							h: p.h
						};

						if (p.player) {
							_this4.setPlayerSprite(p.player, rect);
						} else if (p.object) {
							_this4.setMarsBallSprite(p.object, rect);
						}
					}
				});
			}
		}, {
			key: 'setPlayerSprite',
			value: function setPlayerSprite(player, rect) {
				var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
				var texture = new PIXI.Texture(this.baseTexture, frame);

				// console.log('setting live texture for player', player.id, player.name, rect);

				player.sprites.actualBall.pivot.x = this.tilePadding / 2;
				player.sprites.actualBall.pivot.y = this.tilePadding / 2;

				player.sprites.actualBall.setTexture(texture);
			}
		}, {
			key: 'setMarsBallSprite',
			value: function setMarsBallSprite(object, rect) {
				var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
				var texture = new PIXI.Texture(this.baseTexture, frame);

				object.sprite.pivot.x = this.tilePadding / 2;
				object.sprite.pivot.y = this.tilePadding / 2;

				object.sprite.setTexture(texture);
			}
		}, {
			key: 'getTexturePathForPlayer',
			value: function getTexturePathForPlayer(player) {
				var texture;
				if (player.team === 1) {
					if (this.config.texturesRed.length === 0) {
						return null;
					}

					texture = this.config.texturesRed[this.textureIndexRed % this.config.texturesRed.length];

					if (this.config.textureSelection !== 'singleRandom') {
						this.textureIndexRed += 1;
					}
				} else {
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
		}, {
			key: 'rotateSphere',
			value: function rotateSphere(player, meta) {
				if (!meta.sphere) {
					return;
				}

				rotateX(meta.sphere, -(player.lx || 0) * this.config.velocityCoefficient);
				rotateY(meta.sphere, (player.ly || 0) * this.config.velocityCoefficient);
				rotateZ(meta.sphere, (player.a || 0) * this.config.rotationCoefficient);
			}
		}, {
			key: 'shuffleArray',
			value: function shuffleArray(array) {
				for (var i = array.length - 1; i > 0; i--) {
					var j = Math.floor(Math.random() * (i + 1));
					var temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}

				return array;
			}
		}]);
		return TextureCanvas;
	})();

	function inject3D(config) {
		var texture = new TextureCanvas(config);

		var tr = tagpro.renderer;

		before(tr, 'render', function () {
			texture.render();
		});

		after(tr, 'drawMarsball', function (object, position) {
			texture.addMarsBall(object, position);
		});

		after(tr, 'updateMarsBall', function (object, position) {
			texture.updateMarsBall(object, position);
		});

		after(tr, 'createBallSprite', function (player) {
			// console.log('adding ball to canvas', player.id, player.name);
			texture.addPlayer(player);
		});

		after(tr, 'destroyPlayer', function (player) {
			// console.log('removing ball from canvas', player.id, player.name);
			texture.removePlayer(player);
		});

		after(tr, 'updatePlayerSpritePosition', function (player) {
			texture.updatePosition(player);
		});

		// Replace original tagpro.renderer.updatePlayerColor
		tr.updatePlayerColor = function (player) {
			var color = player.team === 1 ? 'red' : 'blue';
			var tileId = color + 'ball';

			if (player.sprites.actualBall.tileId !== tileId) {
				// console.log('player changed team', player.id, player.name);
				texture.updateTexture(player);
				player.sprites.actualBall.tileId = tileId;
			}
		};
	}

	function initSelectize() {
		injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.legacy.min.css');
		injectScript('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/js/standalone/selectize.min.js');

		return new Promise(function (resolve, reject) {
			(function checkSelectize() {
				if (typeof Selectize !== 'undefined') {
					resolve();
				} else {
					setTimeout(checkSelectize, 500);
				}
			})();
		});
	}

	function createSelectizes(textures, ractive) {
		$('.texture-select').each(function () {
			var values = this.value.split(',');
			values = values.map(createOption);

			textures = textures.concat(values);

			createSelectize(this, textures, ractive);
		});
	}

	function createOption(text) {
		var idx = text.lastIndexOf('/');
		if (idx < 0) {
			return false;
		}

		var name = text.substring(text.lastIndexOf('/') + 1);
		return {
			name: name,
			text: text,
			path: text
		};
	}

	function createSelectize(elem, textures, ractive) {
		var optgroups = textures.reduce(function (tags, val) {
			if (tags.indexOf(val.tag) < 0) {
				tags.push(val.tag);
			}

			return tags;
		}, []).map(function (tag) {
			return { tag: tag };
		});

		var selectize = $(elem).selectize({
			plugins: ['remove_button', 'optgroup_columns', {
				name: 'restore_on_backspace',
				options: {
					text: function text(option) {
						return option[this.settings.valueField];
					}
				}
			}],
			copyClassesToDropdown: false,
			persist: false,
			hideSelected: false,
			options: textures,
			labelField: 'name',
			valueField: 'path',
			searchField: ['name', 'path'],
			create: createOption,
			optgroups: optgroups,
			optgroupValueField: 'tag',
			optgroupLabelField: 'tag',
			optgroupField: 'tag',
			dropdownDirection: 'up',
			render: {
				item: function item(_item, escape) {
					return '<div>' + '<img class="option-item-image" src="' + _item.path + '" />' + (_item.name ? '<span class="name">' + escape(_item.name) + '</span>' : '') + '</div>';
				},
				option: function option(item, escape) {
					return '<div>' + '<div class="option-thumbnail"><img src="' + item.path + '" /></div>' + (item.name ? '<span class="option-label">' + escape(item.name) + '</span>' : '') + '</div>';
				}
			},
			onChange: function onChange(val) {
				ractive.updateModel();
			}
		});
	}

	var Preview = Ractive.extend({
		template: '<canvas class="options-3d-preview-ball"></canvas>',
		data: {
			size: tagpro.TILE_SIZE,
			team: 1 // 1 - red, 2 - blue
		},
		onrender: function onrender() {
			var _this = this;

			var width = this.get('size');
			var height = this.get('size');

			var renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true,
				canvas: this.find('canvas')
			});

			renderer.setSize(width, height);

			var scene = new THREE.Scene();

			addLightsToScene(scene);

			var camera = createCamera({ width: width, height: height });

			var loader = new THREE.TextureLoader();
			loader.setCrossOrigin('');

			var texture = this.get('texture');

			if (this.get('options.useCorsProxy')) {
				texture = this.get('options.corsProxy') + texture;
			}

			loader.load(texture, function (texture) {
				if (_this.get('options.useMaxAnisotropy')) {
					texture.anisotropy = renderer.getMaxAnisotropy();
				} else {
					texture.anisotropy = _this.get('options.customAnisotropy');
				}

				texture.minFilter = _this.get('options.minFilter');
				texture.needsUpdate = true;

				var geometry = new THREE.SphereGeometry(_this.get('radius') || _this.get('options.sphereRadius'), _this.get('options.sphereWidthSegments'), _this.get('options.sphereHeightSegments'));

				var material = new THREE.MeshPhongMaterial({
					shading: _this.get('options.sphereShading'),
					map: texture
				});

				_this.observe('texture', function (val) {
					if (this.get('options.useCorsProxy')) {
						val = this.get('options.corsProxy') + val;
					}

					loader.load(val, function (texture) {
						material.map = texture;
						material.needsUpdate = true;
					});
				});

				var sphere = new THREE.Mesh(geometry, material);
				sphere.position.x = width / 2;
				sphere.position.y = height / 2;

				if (_this.get('options.drawOutline')) {
					var outlineMaterial = new THREE.MeshBasicMaterial({
						color: _this.get('team') === 1 ? _this.get('options.outlineColorRed') : _this.get('options.outlineColorBlue'),
						side: THREE.FrontSide
					});

					var outline = new THREE.Mesh(geometry, outlineMaterial);
					outline.position = sphere.position;
					outline.scale.multiplyScalar(1.05);
					sphere.add(outline);
				}

				rotateZ(sphere, Math.PI);

				scene.add(sphere);

				function render() {
					rotateX(sphere, 0.02);
					rotateY(sphere, 0.02);
					rotateZ(sphere, 0.02);

					renderer.render(scene, camera);
					window.requestAnimationFrame(render);
				}

				window.requestAnimationFrame(render);
			});
		}
	});

	var TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

	var Options = Ractive.extend({
		data: {
			showAdvanced: false,
			isChanged: function isChanged() {
				for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
					options[_key] = arguments[_key];
				}

				for (var i = 0; i < options.length; i++) {
					var val = this.get('options.' + options[i]);
					var def = defaults[options[i]];

					if (val.toString() !== def.toString()) {
						return true;
					}
				}
				return false;
			},
			options: config,
			textureFilters: [{ label: 'Nearest', value: THREE.NearestFilter }, { label: 'NearestMipMapNearest', value: THREE.NearestMipMapNearestFilter }, { label: 'NearestMipMapLinear', value: THREE.NearestMipMapLinearFilter }, { label: 'Linear', value: THREE.LinearFilter }, { label: 'LinearMipMapNearest', value: THREE.LinearMipMapNearestFilter }, { label: 'LinearMipMapLinear', value: THREE.LinearMipMapLinearFilter }],
			materialShadings: [{ label: 'Flat', value: THREE.FlatShading }, { label: 'Smooth', value: THREE.SmoothShading }]
		},
		resetOption: function resetOption() {
			var _this = this;

			for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				options[_key2] = arguments[_key2];
			}

			options.forEach(function (option) {
				return _this.set('options.' + option, defaults[option]);
			});
			this.event.original.preventDefault();
		},
		preset: function preset(_preset) {
			var red = this.find('#texturesRed').selectize;
			var blue = this.find('#texturesBlue').selectize;

			if (_preset === 'default') {
				red.setValue(this.getTexturesByName(['mars']));

				blue.setValue(this.getTexturesByName(['earth']));
			} else if (_preset === 'planets') {
				red.setValue(this.getTexturesByName(['mars', 'jupiter', 'venus', 'mercury']));

				blue.setValue(this.getTexturesByName(['earth', 'neptune', 'pluto', 'moon']));
			} else if (_preset === 'pool') {
				red.setValue(this.getTexturesByName(['ball-01', 'ball-02', 'ball-03', 'ball-04', 'ball-05', 'ball-06']));

				blue.setValue(this.getTexturesByName(['ball-09', 'ball-10', 'ball-11', 'ball-12', 'ball-13', 'ball-14']));
			} else if (_preset === 'basketvsbeach') {
				red.setValue(this.getTexturesByName(['basket-ball']));

				blue.setValue(this.getTexturesByName(['beach-ball']));
			}
		},
		getTexturesByName: function getTexturesByName(names) {
			return this.get('textures').filter(function (texture) {
				return names.includes(texture.name);
			}).map(function (texture) {
				return texture.path;
			});
		},
		template: '<div class="options-3d">\n\t<div class="options-3d-header">\n\t\t<a href="#" class="close" on-click="close">&times;</a>\n\t\t<div class="actions">\n\t\t\t<button class="reset" on-click="reset-options">Reset</button>\n\t\t</div>\n\t\t<h1>\n\t\t\t<span class="text-3d">Balls 3D</span> Settings\n\t\t</h1>\n\t</div>\n\n\t{{#with options}}\n\t<div class="options-3d-content">\n\t\t<div class="options-3d-preview">\n\t\t\t<label class="options-3d-label options-3d-preview-red">\n\t\t\t\t{{#each options.texturesRed}}\n\t\t\t\t\t<Preview texture="{{.}}" />\n\t\t\t\t{{/each}}\n\t\t\t</label>\n\n\t\t\t<label class="options-3d-label options-3d-preview-blue">\n\t\t\t\t{{#each options.texturesBlue}}\n\t\t\t\t\t<Preview texture="{{.}}" team="2" />\n\t\t\t\t{{/each}}\n\t\t\t</label>\n\t\t</div>\n\n\t\t<label class="options-3d-label">\n\t\t\tRed textures\n\t\t\t<input id="texturesRed" type="text" name="red-textures" class="texture-select" value="{{redTexturesString}}" />\n\t\t</label>\n\n\t\t<label class="options-3d-label">\n\t\t\tBlue textures\n\t\t\t<input id="texturesBlue" type="text" name="blue-textures" class="texture-select" value="{{blueTexturesString}}" />\n\t\t</label>\n\n\t\t<div class="options-3d-label">\n\t\t\tPresets\n\t\t\t<button on-click="preset(\'default\')">Mars vs. Earth</button>\n\t\t\t<button on-click="preset(\'planets\')">Planets</button>\n\t\t\t<button on-click="preset(\'pool\')">Pool</button>\n\t\t\t<button on-click="preset(\'basketvsbeach\')">Basket vs. Beach</button>\n\t\t</div>\n\n\t\t<label class="options-3d-label">\n\t\t\t<input type="checkbox" checked="{{showAdvanced}}">\n\t\t\tShow advanced options\n\t\t</label>\n\n\t\t{{#if showAdvanced}}\n\t\t\t<fieldset>\n\t\t\t\t<legend>Misc options</legend>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'useCorsProxy\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'useCorsProxy\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tEnable custom textures\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="checkbox" checked="{{useCorsProxy}}">\n\t\t\t\t\t<small class="options-3d-muted">(Proxy all textures through crossorigin.me)</small>\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'disableForEvents\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'disableForEvents\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tDisable for special events\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="checkbox" checked="{{disableForEvents}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'textureSelection\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'textureSelection\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tTexture order\n\t\t\t\t\t</span>\n\t\t\t\t\t<select value="{{textureSelection}}">\n\t\t\t\t\t\t<option value="default">sequential</option>\n\t\t\t\t\t\t<option value="random">random</option>\n\t\t\t\t\t\t<option value="singleRandom">random (one per team)</option>\n\t\t\t\t\t</select>\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'velocityCoefficient\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'velocityCoefficient\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tVelocity coefficient\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="range" min="0" max="0.2" step="0.01" value="{{velocityCoefficient}}"> {{velocityCoefficient}}\n\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'rotationCoefficient\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'rotationCoefficient\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tRotation coefficient\n\t\t\t\t\t\t</span>\n\t\t\t\t\t<input type="range" min="0" max="0.03" step="0.001" value="{{rotationCoefficient}}"> {{rotationCoefficient}}\n\t\t\t\t</label>\n\t\t\t</fieldset>\n\n\t\t\t<fieldset>\n\t\t\t\t<legend>3D options</legend>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'drawOutline\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'drawOutline\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tDraw ball outlines\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="checkbox" checked="{{drawOutline}}">\n\t\t\t\t\t<small class="options-3d-muted">(Draw borders around balls)</small>\n\t\t\t\t</label>\n\n\t\t\t\t<div class="options-3d-label {{isChanged(\'outlineColor\', \'outlineColorRed\', \'outlineColorBlue\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'outlineColor\', \'outlineColorRed\', \'outlineColorBlue\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tBall outline colors\n\t\t\t\t\t</span>\n\t\t\t\t\t<label>\n\t\t\t\t\t\tRed\n\t\t\t\t\t\t<input type="color" value="{{outlineColorRedHex}}">\n\t\t\t\t\t</label>\n\t\t\t\t\t<label>\n\t\t\t\t\t\tBlue\n\t\t\t\t\t\t<input type="color" value="{{outlineColorBlueHex}}">\n\t\t\t\t\t</label>\n\t\t\t\t\t<label>\n\t\t\t\t\t\tMars\n\t\t\t\t\t\t<input type="color" value="{{outlineColorHex}}">\n\t\t\t\t\t</label>\n\t\t\t\t</div>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'ambientLightColor\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'ambientLightColor\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tAmbient light color\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="color" value="{{ambientLightColorHex}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'lightColor\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'lightColor\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tDirectional light color\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="color" value="{{lightColorHex}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'lightPosition\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'lightPosition\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tDirectional light position\n\t\t\t\t\t</span>\n\t\t\t\t\tx <input type="number" min="-1000" max="1000" value="{{lightPosition.0}}">\n\t\t\t\t\ty <input type="number" min="-1000" max="1000" value="{{lightPosition.1}}">\n\t\t\t\t\tz <input type="number" min="-1000" max="1000" value="{{lightPosition.2}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'lightIntensity\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'lightIntensity\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tDirectional light intensity\n\t\t\t\t\t</span>\n\t\t\t\t\t<input type="range" min="0" max="2" step="0.1" value="{{lightIntensity}}"> {{lightIntensity}}\n\t\t\t\t</label>\n\n\t\t\t\t<div class="options-3d-label {{isChanged(\'useMaxAnisotropy\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'useMaxAnisotropy\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tTexture.anisotropy\n\t\t\t\t\t</span>\n\t\t\t\t\t<label>\n\t\t\t\t\t\t<input type="radio" name="{{useMaxAnisotropy}}" value="{{true}}" checked> Max\n\t\t\t\t\t</label>\n\t\t\t\t\t<label>\n\t\t\t\t\t\t<input type="radio" name="{{useMaxAnisotropy}}" value="{{false}}"> Custom\n\t\t\t\t\t</label>\n\t\t\t\t\t{{#if !useMaxAnisotropy}}\n\t\t\t\t\t\t<input type="range" min="1" max="16" value="{{customAnisotropy}}"> {{customAnisotropy}}\n\t\t\t\t\t{{/if}}\n\t\t\t\t</div>\n\n\t\t\t\t<label class="options-3d-label {{isChanged(\'minFilter\') ? \'changed\' : \'\'}}">\n\t\t\t\t\t<span>\n\t\t\t\t\t\t<a href="#" class="reset" on-click="resetOption(\'minFilter\')" title="Reset to default">&times;</a>\n\t\t\t\t\t\tTexture.minFilter\n\t\t\t\t\t</span>\n\t\t\t\t\t<select value="{{minFilter}}">\n\t\t\t\t\t\t{{#each textureFilters}}\n\t\t\t\t\t\t\t<option value="{{value}}">{{label}}</option>\n\t\t\t\t\t\t{{/each}}\n\t\t\t\t\t</select>\n\t\t\t\t</label>\n\t\t\t</fieldset>\n\t\t{{/if}}\n\t</div>\n\t{{/with}}\n</div>\n',
		css: '.options-3d-preview {\n\tdisplay: flex;\n}\n\n.options-3d-muted {\n\tcolor: #aaa;\n}\n\n.options-3d-preview-red,\n.options-3d-preview-blue {\n\tflex: 1;\n\ttext-align: center;\n\tpadding: 3px;\n}\n\n.options-3d-preview-red {\n\tbackground-color: rgba(255, 0, 0, 0.2);\n}\n\n.options-3d-preview-blue {\n\tbackground-color: rgba(0, 0, 255, 0.2);\n}\n\n.options-3d-preview-ball {\n\tvertical-align: middle;\n}\n\n.options-3d {\n\tmargin: 10px auto;\n\twidth: 570px;\n\tbackground-color: #eee;\n\tcolor: #000;\n\tborder-radius: 5px;\n\tborder: 2px solid #333;\n}\n\n\t.options-3d-header {\n\t\tborder-bottom: 1px solid #333;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-header .actions {\n\t\tfloat: right;\n\t\tpadding: 5px;\n\t\tmargin-right: 15px;\n\t}\n\n\t.options-3d-header .text-3d {\n\t\tposition: relative;\n\t\ttop: -3px;\n\t\tleft: -3px;\n\t}\n\n\t.options-3d-header .close {\n\t\tfloat: right;\n\t\ttext-decoration: none;\n\t\tcolor: #333;\n\t\tline-height: 20px;\n\t\tfont-size: 20px;\n\t\tpadding: 5px;\n\t}\n\n\t.options-3d h1,\n\t.options-3d h2,\n\t.options-3d h3 {\n\t\ttext-align: left;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\n\t\t/* override tagpro styles */\n\t\tbackground: none;\n\t\twidth: auto;\n\t\theight: auto;\n\t}\n\n\t.options-3d h1 { font-size: 26px; }\n\t.options-3d h2 { font-size: 14px; }\n\t.options-3d h3 { font-size: 12px; }\n\n\t.options-3d h1 > span,\n\t.options-3d h2 > span,\n\t.options-3d h3 > span {\n\t\tdisplay: inline;\n\t}\n\n.options-3d-content {\n\tpadding: 5px 10px;\n\toverflow: auto;\n}\n\n\t.options-3d-content a {\n\t\tcolor: black;\n\t}\n\n.options-3d-label {\n\tpadding: 5px;\n\tdisplay: block;\n}\n\n\t.options-3d-label > span > .reset {\n\t\tdisplay: none;\n\t}\n\n\t.options-3d-label.changed > span > .reset {\n\t\tdisplay: block;\n\t\tfloat: left;\n\t\ttext-decoration: none;\n\t\tcolor: #aaa;\n\t}\n\n\t.options-3d-label > span {\n\t\tdisplay: inline-block;\n\t\twidth: 180px;\n\t\ttext-align: right;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-label.changed > span {\n\t\tfont-style: italic;\n\t}\n\n\t.options-3d-label > input {\n\t\tvertical-align: middle;\n\t}\n\n.options-3d .texture {\n\tdisplay: inline-block;\n\twidth: 100px;\n\theight: 100px;\n\tmargin: 5px;\n}\n\n.options-3d .texture img {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.options-3d .texture-input {\n\twidth: 100%;\n\tbox-sizing: border-box;\n}\n\n.option-thumbnail {\n\tposition: relative;\n\twidth: 50px;\n\theight: 50px;\n\toverflow: hidden;\n\tdisplay: inline-block;\n\tvertical-align: middle;\n\tmargin-right: 5px;\n}\n\n\t.option-thumbnail img {\n\t\tposition: absolute;\n\t\tleft: 50%;\n\t\ttop: 50%;\n\t\theight: 100%;\n\t\twidth: auto;\n\t\ttransform: translate(-50%, -50%);\n\t}\n\n.option-item-image {\n\twidth: 20px;\n\theight: 20px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.selectize-control {\n\tposition: static;\n}\n\n.selectize-dropdown [data-selectable] {\n\twhite-space: nowrap;\n\t/*display: inline-block;*/\n}',
		noCssTransform: true,
		computed: {
			blueTexturesString: {
				get: '${options.texturesBlue}.join(",")',
				set: function set(val) {
					this.set('options.texturesBlue', val.split(',').filter(function (v) {
						return !!v;
					}));
				}
			},
			redTexturesString: {
				get: '${options.texturesRed}.join(",")',
				set: function set(val) {
					this.set('options.texturesRed', val.split(',').filter(function (v) {
						return !!v;
					}));
				}
			},
			ambientLightColorHex: {
				get: function get() {
					var val = this.get('options.ambientLightColor');
					var color = new THREE.Color(val);
					return '#' + color.getHexString();
				},
				set: function set(val) {
					var color = new THREE.Color(val);
					this.set('options.ambientLightColor', color.getHex());
				}
			},
			lightColorHex: {
				get: function get() {
					var val = this.get('options.lightColor');
					var color = new THREE.Color(val);
					return '#' + color.getHexString();
				},
				set: function set(val) {
					var color = new THREE.Color(val);
					this.set('options.lightColor', color.getHex());
				}
			},
			outlineColorHex: {
				get: function get() {
					var val = this.get('options.outlineColor');
					var color = new THREE.Color(val);
					return '#' + color.getHexString();
				},
				set: function set(val) {
					var color = new THREE.Color(val);
					this.set('options.outlineColor', color.getHex());
				}
			},
			outlineColorRedHex: {
				get: function get() {
					var val = this.get('options.outlineColorRed');
					var color = new THREE.Color(val);
					return '#' + color.getHexString();
				},
				set: function set(val) {
					var color = new THREE.Color(val);
					this.set('options.outlineColorRed', color.getHex());
				}
			},
			outlineColorBlueHex: {
				get: function get() {
					var val = this.get('options.outlineColorBlue');
					var color = new THREE.Color(val);
					return '#' + color.getHexString();
				},
				set: function set(val) {
					var color = new THREE.Color(val);
					this.set('options.outlineColorBlue', color.getHex());
				}
			}
		},
		oninit: function oninit() {
			this.observe('options.*', function (val, oldVal, keypath) {
				var key = keypath.replace('options.', '');

				if (val === defaults[key]) {
					Storage.removeItem(key);
				} else {
					Storage.setItem(key, val);
				}
			}, { init: false });

			this.on('reset-options', function () {
				Storage.clear();
				this.set('options', $.extend(true, {}, defaults));

				$('input.texture-select').each(function () {
					this.selectize.setValue(this.value.split(','), true);
				});
			});
		},
		onrender: function onrender() {
			var _this2 = this;

			$.getJSON(TEXTURES_URL).done(function (textures) {
				_this2.set('textures', textures);
				createSelectizes(textures, _this2);
			});
		},
		components: {
			Preview: Preview
		}
	});

	var DEFAULTS = {
		duration: 300,
		easing: 'easeInOut'
	};

	var PROPS = ['height', 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom', 'marginTop', 'marginBottom'];

	var COLLAPSED = {
		height: 0,
		borderTopWidth: 0,
		borderBottomWidth: 0,
		paddingTop: 0,
		paddingBottom: 0,
		marginTop: 0,
		marginBottom: 0
	};
	function slide(t, params) {
		var targetStyle;

		params = t.processParams(params, DEFAULTS);

		if (t.isIntro) {
			targetStyle = t.getStyle(PROPS);
			t.setStyle(COLLAPSED);
		} else {
			// make style explicit, so we're not transitioning to 'auto'
			t.setStyle(t.getStyle(PROPS));
			targetStyle = COLLAPSED;
		}

		t.setStyle('overflowY', 'hidden');

		t.animateStyle(targetStyle, params).then(t.complete);
	}

	function initOptions() {
		var $existingLink = $('a:contains("Map Statistics")');

		var $elem = $('<div id="balls3d-options"></div>').insertAfter($existingLink.closest('.section'));

		var $optionsLink = $('<a href="#" class="balls3d-button">3D settings</a>');
		$optionsLink.insertBefore($existingLink);

		tagpro.balls3d = new Ractive({
			el: $elem,
			data: {
				showOptions: false
			},
			template: '{{#if showOptions}}<div intro-outro="slide"><Options /></div>{{/if}}',
			components: {
				Options: Options
			},
			oninit: function oninit() {
				this.on('Options.close', function () {
					this.set('showOptions', false);
					return false;
				});

				this.observe('showOptions', function (val) {
					$optionsLink.toggleClass('active', val);
				});
			},
			transitions: {
				slide: slide
			}
		});

		$optionsLink.on('click', function () {
			tagpro.balls3d.toggle('showOptions');
			return false;
		});
	}

	tagpro.ready(function () {
		// Check if is in game
		if (isGame()) {
			if (config.disableForEvents && isEvent()) {
				console.log('Disabling 3D for event!');
				return;
			}

			if (isHalloweenEvent()) {
				config.textureMarsBall = 'https://keratagpro.github.io/tagpro-balls-3d/textures/misc/eye.jpg';
				config.texturesBlue = ['https://keratagpro.github.io/tagpro-balls-3d/textures/misc/zombie.jpg'];
			}

			inject3D(config);
		} else if (isFrontPage()) {
			GM_addStyle('\n\t\t\tbody {\n\t\t\t\toverflow: visible;\n\t\t\t}\n\n\t\t\t.text-3d {\n\t\t\t\tcolor: #ACE600;\n\t\t\t\ttext-shadow: 1px 1px #608100, 2px 2px #608100, 3px 3px #608100;\n\t\t\t}\n\n\t\t\t.balls3d-button {\n\t\t\t\tmargin-left: 10px;\n\t\t\t\tmargin-right: 10px;\n\t\t\t}\n\n\t\t\t.balls3d-button.active {\n\t\t\t\ttext-decoration: underline;\n\t\t\t}\n\t\t');

			initSelectize().then(initOptions);
		}
	});

})($,Ractive,THREE,this.PIXI || {});
});