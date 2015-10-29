// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.4.0
// @author        Kera
// @grant         GM_addStyle
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_listValues
// @namespace     http://github.com/keratagpro/tagpro-balls-3d/
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

	var rootUrl = 'http://keratagpro.github.io/tagpro-balls-3d';

	var defaults = {
		texturesRed: [rootUrl + '/textures/planets/mars.jpg'],
		texturesBlue: [rootUrl + '/textures/planets/earth.jpg'],
		textureSelection: 'default',
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
		sphereShading: THREE.SmoothShading,
		useCorsProxy: true,
		corsProxy: 'https://crossorigin.me/'
	};

	var config = $.extend(true, {}, defaults, Storage.all());

	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('');

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

	function createSphereMesh(texture) {
		var geometry = new THREE.SphereGeometry(config.sphereRadius, config.sphereWidthSegments, config.sphereHeightSegments);

		var material = new THREE.MeshPhongMaterial({
			shading: config.sphereShading,
			map: texture
		});

		return new THREE.Mesh(geometry, material);
	}

	function loadTextureAsync(texturePath, callback) {
		loader.load(texturePath, function (texture) {
			texture.anisotropy = config.anisotropy;
			texture.minFilter = config.minFilter;

			callback(texture);
		});
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

			this.metaMap = {};

			this.width = tagpro.TILE_SIZE * 10;
			this.height = tagpro.TILE_SIZE * 10;

			this.initThree();

			this.baseTexture = new PIXI.BaseTexture(this.renderer.domElement);

			this.packer = new Packer(this.width, this.height);

			this.tilePadding = 15;

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
				loadTextureAsync(texturePath, function (texture) {
					var sphere = createSphereMesh(texture);

					_this.scene.add(sphere);

					_this.metaMap[player.id] = {
						player: player,
						sphere: sphere,
						angle: player.angle,
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

				var meta = this.metaMap[player.id];
				this.scene.remove(meta.sphere);

				delete this.metaMap[player.id];

				this.updateBinPacking();
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				var meta = this.metaMap[player.id];

				if (!meta) {
					return;
				}

				this.rotateSphere(player, meta);

				meta.angle = player.angle;

				this.baseTexture.dirty();
			}
		}, {
			key: 'updateTexture',
			value: function updateTexture(player) {
				var _this2 = this;

				var texturePath = this.getTexturePathForPlayer(player);
				loadTextureAsync(texturePath, function (texture) {
					var material = _this2.metaMap[player.id].sphere.material;
					material.map = texture;
					material.needsUpdate = true;
				});
			}
		}, {
			key: 'render',
			value: function render() {
				this.renderer.render(this.scene, this.camera);
			}
		}, {
			key: 'updateBinPacking',
			value: function updateBinPacking() {
				var _this3 = this;

				var metaArray = Object.keys(this.metaMap).map(function (key) {
					return _this3.metaMap[key];
				});

				metaArray.forEach(function (p) {
					delete p.fit;
				});

				this.packer.fit(metaArray);

				metaArray.forEach(function (p) {
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

						_this3.setPlayerSprite(p.player, {
							x: p.x,
							y: p.y,
							w: p.w,
							h: p.h
						});
					}
				});
			}
		}, {
			key: 'setPlayerSprite',
			value: function setPlayerSprite(player, rect) {
				var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
				var texture = new PIXI.Texture(this.baseTexture, frame);

				if (tagpro.TILE_SIZE !== rect.w || tagpro.TILE_SIZE !== rect.h) {
					player.sprites.actualBall.position.x = (tagpro.TILE_SIZE - rect.w) / 2;
					player.sprites.actualBall.position.y = (tagpro.TILE_SIZE - rect.h) / 2;
				}

				player.sprites.actualBall.setTexture(texture);
			}
		}, {
			key: 'getTexturePathForPlayer',
			value: function getTexturePathForPlayer(player) {
				var texture;
				if (player.team === 1) {
					texture = this.config.texturesRed[this.textureIndexRed % this.config.texturesRed.length];

					if (this.config.textureSelection !== 'singleRandom') {
						this.textureIndexRed += 1;
					}
				} else {
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

				rotateX(meta.sphere, -(player.lx || 0) * 0.1 * this.config.velocityCoefficient);
				rotateY(meta.sphere, (player.ly || 0) * 0.1 * this.config.velocityCoefficient);

				var theta = player.angle - meta.angle;
				rotateZ(meta.sphere, theta * this.config.rotationCoefficient);
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

	function inject3D() {
		var texture = new TextureCanvas(config);

		var tr = tagpro.renderer;

		before(tr, 'render', function () {
			texture.render();
		});

		after(tr, 'createBallSprite', function (player) {
			texture.addPlayer(player);
		});

		after(tr, 'destroyPlayer', function (player) {
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
				texture.updateTexture(player);
				player.sprites.actualBall.tileId = tileId;
			}
		};
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
		onrender: function onrender() {
			var _this = this;

			var width = tagpro.TILE_SIZE;
			var height = tagpro.TILE_SIZE;

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
				texture.anisotropy = _this.get('options.anisotropy');
				texture.minFilter = _this.get('options.minFilter');
				texture.needsUpdate = true;

				var geometry = new THREE.SphereGeometry(_this.get('options.sphereRadius'), _this.get('options.sphereWidthSegments'), _this.get('options.sphereHeightSegments'));

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
			options: config,
			textureFilters: [{ label: 'Nearest', value: THREE.NearestFilter }, { label: 'NearestMipMapNearest', value: THREE.NearestMipMapNearestFilter }, { label: 'NearestMipMapLinear', value: THREE.NearestMipMapLinearFilter }, { label: 'Linear', value: THREE.LinearFilter }, { label: 'LinearMipMapNearest', value: THREE.LinearMipMapNearestFilter }, { label: 'LinearMipMapLinear', value: THREE.LinearMipMapLinearFilter }],
			materialShadings: [{ label: 'Flat', value: THREE.FlatShading }, { label: 'Smooth', value: THREE.SmoothShading }]
		},
		template: '<div class="options-3d">\n\t<div class="options-3d-header">\n\t\t<a href="#" class="close" on-click="close">&times;</a>\n\t\t<div class="actions">\n\t\t\t<button class="reset" on-click="reset-options">Reset</button>\n\t\t</div>\n\t\t<h1>\n\t\t\t<span class="text-3d">Balls 3D</span> Settings\n\t\t</h1>\n\t</div>\n\n\t{{#with options}}\n\t<div class="options-3d-content">\n\t\t<div class="options-3d-preview">\n\t\t\t<label class="options-3d-preview-red">\n\t\t\t\t{{#each options.texturesRed}}\n\t\t\t\t\t<Preview texture="{{.}}" />\n\t\t\t\t{{/each}}\n\t\t\t</label>\n\n\t\t\t<label class="options-3d-preview-blue">\n\t\t\t\t{{#each options.texturesBlue}}\n\t\t\t\t\t<Preview texture="{{.}}" />\n\t\t\t\t{{/each}}\n\t\t\t</label>\n\t\t</div>\n\n\t\t<label>\n\t\t\tRed textures\n\t\t\t<input type="text" name="red-textures" class="texture-select" value="{{redTexturesString}}" />\n\t\t</label>\n\n\t\t<label>\n\t\t\tBlue textures\n\t\t\t<input type="text" name="blue-textures" class="texture-select" value="{{blueTexturesString}}" />\n\t\t</label>\n\n\t\t<label>\n\t\t\t<input type="checkbox" checked="{{showAdvanced}}">\n\t\t\tAdvanced options\n\t\t</label>\n\n\t\t{{#if showAdvanced}}\n\t\t\t<label>\n\t\t\t\t<span>Enable remote textures</span>\n\t\t\t\t<input type="checkbox" checked="{{useCorsProxy}}">\n\t\t\t\t<small class="options-3d-muted">(Proxy all textures through crossorigin.me)</small>\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Texture selection behavior</span>\n\t\t\t\t<select value="{{textureSelection}}">\n\t\t\t\t\t<option value="default">one per player</option>\n\t\t\t\t\t<option value="random">random per player</option>\n\t\t\t\t\t<option value="singleRandom">random per team</option>\n\t\t\t\t</select>\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Velocity coefficient</span>\n\t\t\t\t<input type="range" min="0" max="2" step="0.1" value="{{velocityCoefficient}}"> {{velocityCoefficient}}\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Rotation coefficient</span>\n\t\t\t\t<input type="range" min="0" max="2" step="0.1" value="{{rotationCoefficient}}"> {{rotationCoefficient}}\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Ambient light color</span>\n\t\t\t\t<input type="color" value="{{ambientLightColorHex}}">\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Light color</span>\n\t\t\t\t<input type="color" value="{{lightColorHex}}">\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Light position</span>\n\t\t\t\tx <input type="number" min="-1000" max="1000" value="{{lightPosition.0}}">\n\t\t\t\ty <input type="number" min="-1000" max="1000" value="{{lightPosition.1}}">\n\t\t\t\tz <input type="number" min="-1000" max="1000" value="{{lightPosition.2}}">\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Light intensity</span>\n\t\t\t\t<input type="range" min="0" max="2" step="0.1" value="{{lightIntensity}}"> {{lightIntensity}}\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Texture.anisotropy</span>\n\t\t\t\t<input type="range" min="1" max="16" value="{{anisotropy}}"> {{anisotropy}}\n\t\t\t</label>\n\n\t\t\t<label>\n\t\t\t\t<span>Texture.minFilter</span>\n\t\t\t\t<select value="{{minFilter}}">\n\t\t\t\t\t{{#each textureFilters}}\n\t\t\t\t\t\t<option value="{{value}}">{{label}}</option>\n\t\t\t\t\t{{/each}}\n\t\t\t\t</select>\n\t\t\t</label>\n\t\t{{/if}}\n\t</div>\n\t{{/with}}\n</div>\n',
		css: '.options-3d-preview {\n\tdisplay: flex;\n}\n\n.options-3d-muted {\n\tcolor: #aaa;\n}\n\n.options-3d-preview-red,\n.options-3d-preview-blue {\n\tflex: 1;\n\ttext-align: center;\n\tpadding: 3px;\n}\n\n.options-3d-preview-red {\n\tbackground-color: rgba(255, 0, 0, 0.2);\n}\n\n.options-3d-preview-blue {\n\tbackground-color: rgba(0, 0, 255, 0.2);\n}\n\n.options-3d-preview-ball {\n\tvertical-align: middle;\n}\n\n.options-3d {\n\tmargin: 10px auto;\n\twidth: 570px;\n\tbackground-color: #eee;\n\tcolor: #000;\n\tborder-radius: 5px;\n\tborder: 2px solid #333;\n}\n\n\t.options-3d-header {\n\t\tborder-bottom: 1px solid #333;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-header .actions {\n\t\tfloat: right;\n\t\tpadding: 5px;\n\t\tmargin-right: 15px;\n\t}\n\n\t.options-3d-header .text-3d {\n\t\tposition: relative;\n\t\ttop: -3px;\n\t\tleft: -3px;\n\t}\n\n\t.options-3d-header .close {\n\t\tfloat: right;\n\t\ttext-decoration: none;\n\t\tcolor: #333;\n\t\tline-height: 20px;\n\t\tfont-size: 20px;\n\t\tpadding: 5px;\n\t}\n\n\t.options-3d h1,\n\t.options-3d h2,\n\t.options-3d h3 {\n\t\ttext-align: left;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\n\t\t/* override tagpro styles */\n\t\tbackground: none;\n\t\twidth: auto;\n\t\theight: auto;\n\t}\n\n\t.options-3d h1 { font-size: 26px; }\n\t.options-3d h2 { font-size: 14px; }\n\t.options-3d h3 { font-size: 12px; }\n\n\t.options-3d h1 > span,\n\t.options-3d h2 > span,\n\t.options-3d h3 > span {\n\t\tdisplay: inline;\n\t}\n\n.options-3d-content {\n\tpadding: 5px 10px;\n\toverflow: auto;\n}\n\n\t.options-3d-content > label {\n\t\tpadding: 5px;\n\t\tdisplay: block;\n\t}\n\n\t.options-3d-content > label > span {\n\t\tdisplay: inline-block;\n\t\twidth: 180px;\n\t\ttext-align: right;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-content > label > input {\n\t\tvertical-align: middle;\n\t}\n\n\t.options-3d-content a {\n\t\tcolor: black;\n\t}\n\n.options-3d .texture {\n\tdisplay: inline-block;\n\twidth: 100px;\n\theight: 100px;\n\tmargin: 5px;\n}\n\n.options-3d .texture img {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.options-3d .texture-input {\n\twidth: 100%;\n\tbox-sizing: border-box;\n}\n\n.option-thumbnail {\n\tposition: relative;\n\twidth: 50px;\n\theight: 50px;\n\toverflow: hidden;\n\tdisplay: inline-block;\n\tvertical-align: middle;\n\tmargin-right: 5px;\n}\n\n\t.option-thumbnail img {\n\t\tposition: absolute;\n\t\tleft: 50%;\n\t\ttop: 50%;\n\t\theight: 100%;\n\t\twidth: auto;\n\t\ttransform: translate(-50%, -50%);\n\t}\n\n.option-item-image {\n\twidth: 20px;\n\theight: 20px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.selectize-control {\n\tposition: static;\n}\n\n.selectize-dropdown [data-selectable] {\n\twhite-space: nowrap;\n\t/*display: inline-block;*/\n}',
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
					this.selectize.setValue(this.value, true);
				});
			});
		},
		onrender: function onrender() {
			var _this = this;

			$.getJSON(TEXTURES_URL).done(function (textures) {
				createSelectizes(textures, _this);
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

	tagpro.ready(function () {
		// Check if is in game
		if (tagpro.state > 0) {
			inject3D();
		} else if (location.pathname === '/') {
			GM_addStyle('\n\t\t\tbody {\n\t\t\t\toverflow: visible;\n\t\t\t}\n\n\t\t\t.text-3d {\n\t\t\t\tcolor: #ACE600;\n\t\t\t\ttext-shadow: 1px 1px #608100, 2px 2px #608100, 3px 3px #608100;\n\t\t\t}\n\n\t\t\t.balls3d-button {\n\t\t\t\tmargin-left: 10px;\n\t\t\t\tmargin-right: 10px;\n\t\t\t}\n\n\t\t\t.balls3d-button.active {\n\t\t\t\ttext-decoration: underline;\n\t\t\t}\n\t\t');

			initSelectize().then(function () {
				var $existingLink = $('a:contains("Map Statistics")');

				var $elem = $('<div id="balls3d-options"></div>').insertAfter($existingLink.closest('.section'));

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
						});
					},
					transitions: {
						slide: slide
					}
				});

				var $a = $('<a href="#" class="balls3d-button">3D settings</a>').on('click', function () {
					tagpro.balls3d.toggle('showOptions');
					$(this).toggleClass('active', tagpro.balls3d.get('showOptions'));
				});

				$a.insertBefore($existingLink);
			});
		}
	});

})($,Ractive,THREE,this.PIXI || {});
});