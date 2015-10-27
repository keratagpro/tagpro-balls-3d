// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.3.4
// @author        Kera
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_listValues
// @namespace     http://github.com/keratagpro/tagpro-balls-3d/
// @downloadUrl   https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.meta.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @require       https://cdnjs.cloudflare.com/ajax/libs/ractive/0.7.3/ractive.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.min.js
// ==/UserScript==

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

	function forceTop() {
		// HACK: Add way to open Selectize dropdown up
		Selectize.prototype.positionDropdown = function () {
			var $control = this.$control;
			var offset = this.settings.dropdownParent === 'body' ? $control.offset() : $control.position();
			var top = offset.top;
			offset.top += $control.outerHeight(true);

			this.$dropdown.css({
				width: $control.outerWidth(),
				left: offset.left
			});

			var dir = this.settings.dropdownDirection;
			if (dir === 'up') {
				this.$dropdown.css('top', top - this.$dropdown.outerHeight(true));
			} else {
				this.$dropdown.css('top', offset.top);
			}
		};
	}

	function initSelectize() {
		injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.default.min.css');
		injectScript('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/js/standalone/selectize.min.js');

		return new Promise(function (resolve, reject) {
			(function checkSelectize() {
				if (typeof Selectize !== 'undefined') {
					forceTop();
					resolve();
				} else {
					setTimeout(checkSelectize, 500);
				}
			})();
		});
	}

	function createSelectize(textures, ractive) {
		var optgroups = textures.reduce(function (tags, val) {
			if (tags.indexOf(val.tag) < 0) {
				tags.push(val.tag);
			}

			return tags;
		}, []).map(function (tag) {
			return { tag: tag };
		});

		var selectize = $('.texture-select').selectize({
			plugins: ['remove_button', 'optgroup_columns', {
				name: 'restore_on_backspace',
				options: {
					text: function text(option) {
						return option[this.settings.valueField];
					}
				}
			}],
			persist: false,
			hideSelected: false,
			options: textures,
			labelField: 'name',
			valueField: 'path',
			searchField: ['name', 'path'],
			create: function create(input) {
				var idx = input.lastIndexOf('/');
				if (idx < 0) {
					return false;
				}

				var name = input.substring(input.lastIndexOf('/') + 1);
				return {
					name: name,
					text: input,
					path: input
				};
			},
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
					return '<div>' + '<img class="option-image" src="' + item.path + '" />' + (item.name ? '<span class="option-label">' + escape(item.name) + '</span>' : '') + '</div>';
				}
			},
			onChange: function onChange(val) {
				ractive.updateModel();
			}
		});
	}

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

	var config = $.extend(true, {}, defaults, Storage.all());

	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('');

	var rotWorldMatrix;
	var vecY = new THREE.Vector3(1, 0, 0);
	var vecX = new THREE.Vector3(0, 1, 0);
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

		rotWorldMatrix = new THREE.Matrix4();
		rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
		rotWorldMatrix.multiply(object.matrix); // pre-multiply
		object.matrix = rotWorldMatrix;
		object.rotation.setFromRotationMatrix(object.matrix);
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

	function Packer(w, h) {
		this.init(w, h);
	}

	Packer.prototype = {
		init: function init(w, h) {
			this.root = { x: 0, y: 0, w: w, h: h };
		},
		fit: function fit(blocks) {
			var n, node, block;
			for (n = 0; n < blocks.length; n++) {
				block = blocks[n];
				node = this.findNode(this.root, block.w, block.h);
				if (node) {
					block.fit = this.splitNode(node, block.w, block.h);
				}
			}
		},
		findNode: function findNode(root, w, h) {
			if (root.used) {
				return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
			} else if (w <= root.w && h <= root.h) {
				return root;
			} else {
				return null;
			}
		},
		splitNode: function splitNode(node, w, h) {
			node.used = true;
			node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
			node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h };
			return node;
		}
	};

	THREE.ImageUtils.crossOrigin = '';

	var textureIndexRed = 0;
	var textureIndexBlue = 0;
	var tilePadding = 15;

	var TextureCanvas = (function () {
		function TextureCanvas(options) {
			babelHelpers.classCallCheck(this, TextureCanvas);

			this.metaMap = {};

			this.width = tagpro.TILE_SIZE * 10;
			this.height = tagpro.TILE_SIZE * 10;

			this.initThree(options);

			this.baseTexture = new PIXI.BaseTexture(this.renderer.domElement);

			this.packer = new Packer(this.width, this.height);
		}

		babelHelpers.createClass(TextureCanvas, [{
			key: 'initThree',
			value: function initThree(options) {
				this.renderer = new THREE.WebGLRenderer({
					alpha: true,
					antialias: true
				});

				this.renderer.setSize(this.width, this.height);

				var container = document.createElement('div');
				container.id = 'balls-3d-assets';
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
						w: tagpro.TILE_SIZE + tilePadding,
						h: tagpro.TILE_SIZE + tilePadding
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
					texture = config.texturesRed[textureIndexRed % config.texturesRed.length] || defaults.texturesRed[0];
					textureIndexRed += 1;
				} else {
					texture = config.texturesBlue[textureIndexBlue % config.texturesBlue.length] || defaults.texturesBlue[0];
					textureIndexBlue += 1;
				}

				return texture;
			}
		}, {
			key: 'rotateSphere',
			value: function rotateSphere(player, meta) {
				if (!meta.sphere) {
					return;
				}

				rotateX(meta.sphere, -(player.lx || 0) * config.velocityCoefficient);
				rotateY(meta.sphere, (player.ly || 0) * config.velocityCoefficient);

				var theta = player.angle - meta.angle;
				rotateZ(meta.sphere, theta * config.rotationCoefficient);
			}
		}]);
		return TextureCanvas;
	})();

	var TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

	var Options = Ractive.extend({
		data: {
			showOptions: false,
			options: config,
			textureFilters: [{ label: "Nearest", value: THREE.NearestFilter }, { label: "NearestMipMapNearest", value: THREE.NearestMipMapNearestFilter }, { label: "NearestMipMapLinear", value: THREE.NearestMipMapLinearFilter }, { label: "Linear", value: THREE.LinearFilter }, { label: "LinearMipMapNearest", value: THREE.LinearMipMapNearestFilter }, { label: "LinearMipMapLinear", value: THREE.LinearMipMapLinearFilter }],
			materialShadings: [{ label: "Flat", value: THREE.FlatShading }, { label: "Smooth", value: THREE.SmoothShading }]
		},
		template: '<div class="options-3d">\n\t<div class="options-3d-window {{showOptions ? \'\' : \'hidden\'}}">\n\t\t<div class="options-3d-header">\n\t\t\t<a href="#" class="close" on-click="set(\'showOptions\', false)">&times;</a>\n\t\t\t<div class="actions">\n\t\t\t\t<a class="reset" href="#" on-click="reset-options">Reset</a>\n\t\t\t</div>\n\t\t\t<h1>\n\t\t\t\t<span class="text-3d">Balls 3D</span> Options\n\t\t\t</h1>\n\t\t</div>\n\n\t\t{{#with options}}\n\t\t<div class="options-3d-content">\n\t\t\t<label class="texture-input-wrapper">\n\t\t\t\tBlue textures\n\n\t\t\t\t<input type="text" name="blue-textures" class="texture-select" value="{{blueTexturesString}}" />\n\t\t\t</label>\n\n\t\t\t<label class="texture-input-wrapper">\n\t\t\t\tRed textures\n\t\t\t\t<input type="text" name="red-textures" class="texture-select" value="{{redTexturesString}}" />\n\t\t\t</label>\n\n\t\t\t<a href="#" on-click="toggle(\'showAdvanced\')">Advanced options</a>\n\n\t\t\t{{#if showAdvanced}}\n\t\t\t<fieldset>\n\t\t\t\t<label>\n\t\t\t\t\tVelocity coefficient\n\t\t\t\t\t<input type="range" min="0" max="3" step="0.1" value="{{velocityCoefficient}}"> {{velocityCoefficient}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tRotation coefficient\n\t\t\t\t\t<input type="range" min="0" max="3" step="0.1" value="{{rotationCoefficient}}"> {{rotationCoefficient}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tAmbient light color\n\t\t\t\t\t<input type="color" value="{{ambientLightColorHex}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tLight color\n\t\t\t\t\t<input type="color" value="{{lightColorHex}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tLight position\n\t\t\t\t\t<input type="text" value="{{lightPositionString}}">\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tLight intensity\n\t\t\t\t\t<input type="range" min="0" max="2" step="0.1" value="{{lightIntensity}}"> {{lightIntensity}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tTexture.anisotropy\n\t\t\t\t\t<input type="range" min="1" max="16" value="{{anisotropy}}"> {{anisotropy}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tTexture.minFilter\n\t\t\t\t\t<select value="{{minFilter}}">\n\t\t\t\t\t\t{{#each textureFilters}}\n\t\t\t\t\t\t\t<option value="{{value}}">{{label}}</option>\n\t\t\t\t\t\t{{/each}}\n\t\t\t\t\t</select>\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tSphere radius\n\t\t\t\t\t<input type="range" min="1" max="30" step="0.1" value="{{sphereRadius}}"> {{sphereRadius}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tSphere width segments\n\t\t\t\t\t<input type="range" min="3" max="100" value="{{sphereWidthSegments}}"> {{sphereWidthSegments}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tSphere height segments\n\t\t\t\t\t<input type="range" min="2" max="100" value="{{sphereHeightSegments}}"> {{sphereHeightSegments}}\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tSphere shading\n\t\t\t\t\t<select value="{{sphereShading}}">\n\t\t\t\t\t\t{{#each materialShadings}}\n\t\t\t\t\t\t\t<option value="{{value}}">{{label}}</option>\n\t\t\t\t\t\t{{/each}}\n\t\t\t\t\t</select>\n\t\t\t\t</label>\n\t\t\t</fieldset>\n\t\t\t{{/if}}\n\t\t</div>\n\t\t{{/with}}\n\t</div>\n\n\t<a href="#" on-click="toggle(\'showOptions\')" class="options-3d-button text-3d {{mouseMoved ? \'\' : \'invisible\'}}">\n\t\t3D\n\t</a>\n</div>\n',
		css: '#balls-3d-assets {\n\tposition: absolute;\n\tvisibility: hidden;\n\tz-index: -1;\n}\n\n.options-3d {\n\tposition: absolute;\n\tbottom: 10px;\n\tright: 10px;\n}\n\n.options-3d-button {\n\tfont-size: 20px;\n\ttext-decoration: none;\n\tfloat: right;\n\n\topacity: 1;\n\ttransition: opacity 1s;\n}\n\n.options-3d-window {\n\tbackground-color: #fff;\n\tcolor: #000;\n\twidth: 500px;\n\tborder-radius: 3px;\n\tborder: 2px solid #333;\n}\n\t.options-3d-header {\n\t\tborder-bottom: 1px solid #333;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-header .actions {\n\t\tfloat: right;\n\t\tpadding: 5px;\n\t\tmargin-right: 15px;\n\t}\n\n\t.options-3d-header .actions .reset {\n\t\tcolor: #ccc;\n\t\tfont-size: 80%;\n\t\tline-height: 20px;\n\t\ttext-decoration: none;\n\t}\n\n\t.options-3d-header .text-3d {\n\t\tposition: relative;\n\t\ttop: -3px;\n\t\tleft: -3px;\n\t}\n\n\t.options-3d-header .close {\n\t\tfloat: right;\n\t\ttext-decoration: none;\n\t\tcolor: #ccc;\n\t\tline-height: 20px;\n\t\tfont-size: 20px;\n\t\tpadding: 5px;\n\t}\n\n\t.options-3d h1,\n\t.options-3d h2,\n\t.options-3d h3 {\n\t\tmargin: 0;\n\t\tpadding: 0;\n\n\t\t/* override tagpro styles */\n\t\tbackground: none;\n\t\twidth: auto;\n\t\theight: auto;\n\t}\n\n\t.options-3d h1 { font-size: 26px; }\n\t.options-3d h2 { font-size: 14px; }\n\t.options-3d h3 { font-size: 12px; }\n\n\t.options-3d h1 > span,\n\t.options-3d h2 > span,\n\t.options-3d h3 > span {\n\t\tdisplay: inline;\n\t}\n\n.options-3d-content {\n\tpadding: 5px 10px;\n\tmax-height: 500px;\n\toverflow: auto;\n}\n\n\t.options-3d-content label {\n\t\tdisplay: block;\n\t}\n\n\t.options-3d-content a {\n\t\tcolor: black;\n\t}\n\n.options-3d .texture {\n\tdisplay: inline-block;\n\twidth: 100px;\n\theight: 100px;\n\tmargin: 5px;\n}\n\n.options-3d .texture img {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.options-3d .texture-input-wrapper {\n\tpadding: 5px;\n}\n\n.options-3d .texture-input {\n\twidth: 100%;\n\tbox-sizing: border-box;\n}\n\n.text-3d {\n\tcolor: #ACE600;\n\t\ttext-shadow: 1px 1px #608100,\n\t\t2px 2px #608100,\n\t\t3px 3px #608100;\n}\n\n.options-3d .hidden {\n\tdisplay: none;\n}\n\n.options-3d .invisible {\n\topacity: 0;\n}\n\n.option-image {\n\twidth: 50px;\n\theight: 50px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.option-label { }\n\n.option-item-image {\n\twidth: 20px;\n\theight: 20px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.selectize-control {\n\tposition: static;\n}\n\n.selectize-dropdown [data-selectable] {\n\twhite-space: nowrap;\n\t/*display: inline-block;*/\n}',
		noCssTransform: true,
		computed: {
			blueTexturesString: {
				get: '${options.texturesBlue}.join(",")',
				set: function set(val) {
					this.set('options.texturesBlue', val.split(','));
				}
			},
			redTexturesString: {
				get: '${options.texturesRed}.join(",")',
				set: function set(val) {
					this.set('options.texturesRed', val.split(','));
				}
			},
			lightPositionString: {
				get: '${options.lightPosition}.join(",")',
				set: function set(val) {
					this.set('options.lightPosition', val.split(',').map(function (v) {
						return parseInt(v, 10);
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
			var mouseMoveTimeout;
			var self = this;
			$(window).on('mousemove', function (ev) {
				self.set('mouseMoved', true);

				if (mouseMoveTimeout) {
					clearTimeout(mouseMoveTimeout);
				}

				mouseMoveTimeout = setTimeout(function () {
					self.set('mouseMoved', false);
				}, 1000);
			});

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
				this.set('options', defaults);
			});
		},
		onrender: function onrender() {
			var _this = this;

			$.getJSON(TEXTURES_URL).done(function (textures) {
				createSelectize(textures, _this);
			});
		}
	});

	function init() {
		var texture = new TextureCanvas();

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

		var elem = $('<div id="balls3d-options"></div>').appendTo(document.body);
		var ractive = new Ractive({
			el: elem,
			template: '<Options />',
			components: {
				Options: Options
			}
		});

		tagpro.ractive = ractive;
	}

	initSelectize().then(function () {
		tagpro.ready(init);
	});

})($,Ractive,THREE,PIXI);