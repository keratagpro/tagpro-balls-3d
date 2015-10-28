import $ from 'jquery';
import Ractive from 'ractive';
import THREE from 'three';

import { createSelectize } from '../lib/selectize_utils';
import config, { defaults } from '../lib/config';
import Storage from '../lib/storage';
import Preview from './preview';

const TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

export default Ractive.extend({
	data: {
		showAdvanced: false,
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
		]
	},
	template: `OPTIONS_HTML`,
	css: `OPTIONS_CSS`,
	noCssTransform: true,
	computed: {
		blueTexturesString: {
			get: '${options.texturesBlue}.join(",")',
			set: function(val) {
				this.set('options.texturesBlue', val.split(',').filter(function(v) { return !!v; }));
			}
		},
		redTexturesString: {
			get: '${options.texturesRed}.join(",")',
			set: function(val) {
				this.set('options.texturesRed', val.split(',').filter(function(v) { return !!v; }));
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
			createSelectize(textures, this);
		});
	},
	components: {
		Preview
	}
});
