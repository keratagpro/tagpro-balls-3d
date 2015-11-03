import $ from 'jquery';
import Ractive from 'ractive';
import THREE from 'three';

import { createSelectizes } from '../lib/selectize_utils';
import config, { defaults } from '../lib/config';
import Storage from '../lib/storage';
import Preview from './preview';

const TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

export default Ractive.extend({
	data: {
		showAdvanced: false,
		isChanged: function(option) {
			var val = this.get('options.' + option);
			var def = defaults[option];

			return val.toString() !== def.toString();
		},
		options: config,
		textureFilters: [
			{ label: 'Nearest', value: THREE.NearestFilter },
			{ label: 'NearestMipMapNearest', value: THREE.NearestMipMapNearestFilter },
			{ label: 'NearestMipMapLinear', value: THREE.NearestMipMapLinearFilter },
			{ label: 'Linear', value: THREE.LinearFilter },
			{ label: 'LinearMipMapNearest', value: THREE.LinearMipMapNearestFilter },
			{ label: 'LinearMipMapLinear', value: THREE.LinearMipMapLinearFilter }
		],
		materialShadings: [
			{ label: 'Flat', value: THREE.FlatShading },
			{ label: 'Smooth', value: THREE.SmoothShading }
		],
	},
	resetOption: function(option) {
		this.set('options.' + option, defaults[option]);
		this.event.original.preventDefault();
	},
	preset: function(preset) {
		var red = this.find('#texturesRed').selectize;
		var blue = this.find('#texturesBlue').selectize;

		if (preset === 'default') {
			red.setValue(this.getTexturesByName([
				'mars'
			]));

			blue.setValue(this.getTexturesByName([
				'earth'
			]));
		}
		else if (preset === 'planets') {
			red.setValue(this.getTexturesByName([
				'mars',
				'jupiter',
				'venus',
				'mercury'
			]));

			blue.setValue(this.getTexturesByName([
				'earth',
				'neptune',
				'pluto',
				'moon'
			]));
		}
		else if (preset === 'pool') {
			red.setValue(this.getTexturesByName([
				'ball-01',
				'ball-02',
				'ball-03',
				'ball-04',
				'ball-05',
				'ball-06'
			]));

			blue.setValue(this.getTexturesByName([
				'ball-09',
				'ball-10',
				'ball-11',
				'ball-12',
				'ball-13',
				'ball-14'
			]));	
		}
		else if (preset === 'basketvsbeach') {
			red.setValue(this.getTexturesByName([
				'basket-ball'
			]));

			blue.setValue(this.getTexturesByName([
				'beach-ball'
			]));
		}
	},
	getTexturesByName: function(names) {
		return this.get('textures')
			.filter(texture => names.includes(texture.name))
			.map(texture => texture.path);
	},
	template: `OPTIONS_HTML`,
	css: `OPTIONS_CSS`,
	noCssTransform: true,
	computed: {
		blueTexturesString: {
			get: '${options.texturesBlue}.join(",")',
			set: function(val) {
				this.set('options.texturesBlue', val.split(',').filter(v => !!v));
			}
		},
		redTexturesString: {
			get: '${options.texturesRed}.join(",")',
			set: function(val) {
				this.set('options.texturesRed', val.split(',').filter(v => !!v));
			}
		},
		ambientLightColorHex: {
			get: function() {
				var val = this.get('options.ambientLightColor');
				var color = new THREE.Color(val);
				return '#' + color.getHexString();
			},
			set: function(val) {
				var color = new THREE.Color(val);
				this.set('options.ambientLightColor', color.getHex());
			}
		},
		lightColorHex: {
			get: function() {
				var val = this.get('options.lightColor');
				var color = new THREE.Color(val);
				return '#' + color.getHexString();
			},
			set: function(val) {
				var color = new THREE.Color(val);
				this.set('options.lightColor', color.getHex());
			}
		},
		outlineColorRedHex: {
			get: function() {
				var val = this.get('options.outlineColorRed');
				var color = new THREE.Color(val);
				return '#' + color.getHexString();
			},
			set: function(val) {
				var color = new THREE.Color(val);
				this.set('options.outlineColorRed', color.getHex());
			}
		},
		outlineColorBlueHex: {
			get: function() {
				var val = this.get('options.outlineColorBlue');
				var color = new THREE.Color(val);
				return '#' + color.getHexString();
			},
			set: function(val) {
				var color = new THREE.Color(val);
				this.set('options.outlineColorBlue', color.getHex());
			}
		}
	},
	oninit: function() {
		this.observe('options.*', function(val, oldVal, keypath) {
			var key = keypath.replace('options.', '');

			if (val === defaults[key]) {
				Storage.removeItem(key);
			}
			else {
				Storage.setItem(key, val);
			}
		}, { init: false });

		this.on('reset-options', function() {
			Storage.clear();
			this.set('options', $.extend(true, {}, defaults));

			$('input.texture-select').each(function() {
				this.selectize.setValue(this.value, true);
			});
		});
	},
	onrender: function() {
		$.getJSON(TEXTURES_URL).done(textures => {
			this.set('textures', textures);
			createSelectizes(textures, this);
		});
	},
	components: {
		Preview
	}
});
