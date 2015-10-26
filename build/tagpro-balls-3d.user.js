// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.3.4
// @author        Kera
// @namespace     http://github.com/keratagpro/tagpro-balls-3d/
// @downloadUrl   https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.meta.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @require       https://cdnjs.cloudflare.com/ajax/libs/ractive/0.7.3/ractive.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/js/standalone/selectize.min.js
// @resource      options https://keratagpro.github.io/tagpro-balls-3d/options.html#v0.3.4
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

	function injectCSS(src) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.src = src;
		(document.head || document.body).appendChild(link);
	}

	var rootUrl = 'https://keratagpro.github.io/tagpro-balls-3d';

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

	THREE.ImageUtils.crossOrigin = '';

	var rotWorldMatrix;
	var vecY = new THREE.Vector3(1, 0, 0);
	var vecX = new THREE.Vector3(0, 1, 0);
	var vecZ = new THREE.Vector3(0, 0, 1);

	function addLightsToScene(scene) {
		var light = new THREE.AmbientLight(defaults.ambientLightColor);
		scene.add(light);

		light = new THREE.DirectionalLight(defaults.lightColor, defaults.lightIntensity);
		light.position.set.apply(light.position, defaults.lightPosition);

		scene.add(light);
	}

	function createSphereMesh(texture) {
		var geometry = new THREE.SphereGeometry(defaults.sphereRadius, defaults.sphereWidthSegments, defaults.sphereHeightSegments);

		var material = new THREE.MeshPhongMaterial({
			shading: defaults.sphereShading,
			map: texture
		});

		return new THREE.Mesh(geometry, material);
	}

	function createCamera(options) {
		options = $.extend({
			width: 400,
			height: 400
		}, options);

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
				this.renderer = THREE.WebGLRenderer({
					alpha: true,
					antialias: true
				});

				this.renderer.setSize(this.width, this.height);

				document.querySelector('#assets').appendChild(this.renderer.domElement);

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
				var texture = this.getTextureForPlayer(player);

				var sphere = createSphereMesh({ texture: texture });

				this.metaMap[player.id] = {
					player: player,
					sphere: sphere,
					angle: player.angle,
					w: tagpro.TILE_SIZE,
					h: tagpro.TILE_SIZE
				};

				this.updateBinPacking();

				this.baseTexture.dirty();
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

				this.rotateSphere(player, meta);

				meta.angle = player.angle;

				this.baseTexture.dirty();
			}
		}, {
			key: 'updateTexture',
			value: function updateTexture(player) {
				var material = this.metaMap[player.id].sphere.material;
				material.map = this.getTextureForPlayer(player);
				material.needsUpdate = true;
			}
		}, {
			key: 'render',
			value: function render() {
				this.renderer.render(this.scene, this.camera);
			}
		}, {
			key: 'updateBinPacking',
			value: function updateBinPacking() {
				var _this = this;

				var metaArray = Object.keys(this.metaMap).map(function (key) {
					return _this.metaMap[key];
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
						_this.setPlayerSprite(p.original, p.fit);

						p.x = p.fit.x;
						p.y = p.fit.y;
					}
				});
			}
		}, {
			key: 'setPlayerSprite',
			value: function setPlayerSprite(player, rect) {
				var frame = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
				var texture = new PIXI.Texture(this.baseTexture, frame);

				player.sprites.actualBall.setTexture(texture);
			}
		}, {
			key: 'getTextureForPlayer',
			value: function getTextureForPlayer(player) {
				var texture;
				if (player.team === 1) {
					texture = defaults.texturesRed[textureIndexRed % defaults.texturesRed.length];
					textureIndexRed += 1;
				} else {
					texture = defaults.texturesBlue[textureIndexBlue % defaults.texturesBlue.length];
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

				rotateX(meta.sphere, -(player.lx || 0) * defaults.velocityCoefficient);
				rotateY(meta.sphere, (player.ly || 0) * defaults.velocityCoefficient);

				var theta = player.angle - meta.angle;
				rotateZ(meta.sphere, theta * defaults.rotationCoefficient);
			}
		}]);
		return TextureCanvas;
	})();

	var TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

	var Options = Ractive.extend({
		data: {
			showOptions: true,
			options: defaults
		},
		template: '<div class="options-3d">\n\t<div class="options-3d-window {{showOptions ? \'\' : \'hidden\'}}">\n\t\t<div class="options-3d-header">\n\t\t\t<a href="#" class="close" on-click="set(\'showOptions\', false)">&times;</a>\n\t\t\t<div class="actions">\n\t\t\t\t<a class="reset" href="#" onclick="confirm(\'Are you sure?\')">Reset</a>\n\t\t\t</div>\n\t\t\t<h1>\n\t\t\t\t<span class="text-3d">Balls 3D</span> Options\n\t\t\t</h1>\n\t\t</div>\n\n\t\t<div class="options-3d-content">\n\t\t\t<div class="texture-input-wrapper">\n\t\t\t\tBlue textures\n\n\t\t\t\t<input type="text" name="blue-textures" class="texture-select" value="{{blueTexturesString}}" />\n\t\t\t</div>\n\n\t\t\t<div class="texture-input-wrapper">\n\t\t\t\tRed textures\n\t\t\t\t<input type="text" name="red-textures" class="texture-select" value="{{redTexturesString}}" />\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<a href="#" on-click="toggle(\'showOptions\')" class="options-3d-button text-3d {{mouseMoved ? \'\' : \'invisible\'}}">\n\t\t3D\n\t</a>\n</div>\n',
		css: '.options-3d {\n\tposition: absolute;\n\tbottom: 10px;\n\tright: 10px;\n}\n\n.options-3d-button {\n\tfont-size: 20px;\n\ttext-decoration: none;\n\tfloat: right;\n\n\topacity: 1;\n\ttransition: opacity 1s;\n}\n\n.options-3d-window {\n\tbackground-color: white;\n\twidth: 500px;\n\tborder-radius: 3px;\n\tborder: 2px solid #333;\n}\n\t.options-3d-header {\n\t\tborder-bottom: 1px solid #333;\n\t\tpadding: 5px 10px;\n\t}\n\n\t.options-3d-header .actions {\n\t\tfloat: right;\n\t\tpadding: 5px;\n\t\tmargin-right: 15px;\n\t}\n\n\t.options-3d-header .actions .reset {\n\t\tcolor: #ccc;\n\t\tfont-size: 80%;\n\t\tline-height: 20px;\n\t\ttext-decoration: none;\n\t}\n\n\t.options-3d-header .text-3d {\n\t\tposition: relative;\n\t\ttop: -3px;\n\t\tleft: -3px;\n\t}\n\n\t.options-3d-header .close {\n\t\tfloat: right;\n\t\ttext-decoration: none;\n\t\tcolor: #ccc;\n\t\tline-height: 20px;\n\t\tfont-size: 20px;\n\t\tpadding: 5px;\n\t}\n\n\t.options-3d h1,\n\t.options-3d h2,\n\t.options-3d h3 {\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t}\n\n\t.options-3d h1 { font-size: 26px; }\n\t.options-3d h2 { font-size: 14px; }\n\t.options-3d h3 { font-size: 12px; }\n\n.options-3d-content {\n\tpadding: 5px 10px;\n\tmax-height: 500px;\n\toverflow: auto;\n}\n\n.options-3d .texture {\n\tdisplay: inline-block;\n\twidth: 100px;\n\theight: 100px;\n\tmargin: 5px;\n}\n\n.options-3d .texture img {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.options-3d .texture-input-wrapper {\n\tpadding: 5px;\n}\n\n.options-3d .texture-input {\n\twidth: 100%;\n\tbox-sizing: border-box;\n}\n\n.text-3d {\n\tcolor: #ACE600;\n\t\ttext-shadow: 1px 1px #608100,\n\t\t2px 2px #608100,\n\t\t3px 3px #608100;\n}\n\n.options-3d .hidden {\n\tdisplay: none;\n}\n\n.options-3d .invisible {\n\topacity: 0;\n}\n\n.option-image {\n\twidth: 50px;\n\theight: 50px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.option-label { }\n\n.option-item-image {\n\twidth: 20px;\n\theight: 20px;\n\tvertical-align: middle;\n\tpadding-right: 5px;\n}\n\n.selectize-control {\n\tposition: static;\n}\n\n.selectize-dropdown [data-selectable] {\n\twhite-space: nowrap;\n\t/*display: inline-block;*/\n}',
		computed: {
			blueTexturesString: {
				get: '${options.blueTextures}.join(",")',
				set: function set(val) {
					this.set('options.blueTextures', val.split(','));
				}
			},
			redTexturesString: {
				get: '${options.redTextures}.join(",")',
				set: function set(val) {
					this.set('options.redTextures', val.split(','));
				}
			}
		},
		onrender: function onrender() {
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

			$.getJSON(TEXTURES_URL).done(createSelectize);
		}
	});

	function createSelectize(textures) {
		var optgroups = textures.reduce(function (mem, val) {
			if (mem.indexOf(val.group) < 0) {
				mem.push(val.group);
			}

			return mem;
		}, []).map(function (val) {
			return {
				group: val
			};
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
			optgroupValueField: 'group',
			optgroupLabelField: 'group',
			optgroupField: 'group',
			dropdownDirection: 'up',
			render: {
				item: function item(_item, escape) {
					return '<div>' + '<img class="option-item-image" src="' + _item.path + '" />' + (_item.name ? '<span class="name">' + escape(_item.name) + '</span>' : '') + '</div>';
				},
				option: function option(item, escape) {
					return '<div>' + '<img class="option-image" src="' + item.path + '" />' + (item.name ? '<span class="option-label">' + escape(item.name) + '</span>' : '') + '</div>';
				}
			}
		});
	}

	injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.default.min.css');

	tagpro.ready(function () {
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
	});

})($,Ractive,THREE,PIXI);