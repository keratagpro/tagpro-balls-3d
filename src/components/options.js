import $ from 'jquery';
import Ractive from 'ractive';

import config from '../lib/config';

const TEXTURES_URL = 'http://keratagpro.github.io/tagpro-balls-3d/textures.json';

export default Ractive.extend({
	data: {
		showOptions: true,
		options: config
	},
	template: `OPTIONS_HTML`,
	css: `OPTIONS_CSS`,
	computed: {
		blueTexturesString: {
			get: '${options.blueTextures}.join(",")',
			set: function(val) {
				this.set('options.blueTextures', val.split(','));
			}
		},
		redTexturesString: {
			get: '${options.redTextures}.join(",")',
			set: function(val) {
				this.set('options.redTextures', val.split(','));
			}
		}
	},
	onrender: function() {
		var mouseMoveTimeout;
		var self = this;
		$(window).on('mousemove', function(ev) {
			self.set('mouseMoved', true);

			if (mouseMoveTimeout) {
				clearTimeout(mouseMoveTimeout);
			}

			mouseMoveTimeout = setTimeout(function() {
				self.set('mouseMoved', false);
			}, 1000);
		});

		$.getJSON(TEXTURES_URL).done(createSelectize);
	}
});

function createSelectize(textures) {
	var optgroups = textures.reduce(function(mem, val) {
		if (mem.indexOf(val.group) < 0) {
			mem.push(val.group);
		}

		return mem;
	}, []).map(function(val) {
		return {
			group: val
		};
	});

	var selectize = $('.texture-select').selectize({
		plugins: ['remove_button', 'optgroup_columns', {
			name: 'restore_on_backspace',
			options: {
				text: function(option) {
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
		create: function(input) {
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
			item: function(item, escape) {
				return '<div>' +
					'<img class="option-item-image" src="' + item.path + '" />' +
					(item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
				'</div>';
			},
			option: function(item, escape) {
				return '<div>' +
					'<img class="option-image" src="' + item.path + '" />' +
					(item.name ? '<span class="option-label">' + escape(item.name) + '</span>' : '') +
				'</div>';
			}
		}
	});
}
