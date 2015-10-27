import $ from 'jquery';
import { injectCSS, injectScript } from './inject_utils';

function forceTop() {
	// HACK: Add way to open Selectize dropdown up
	Selectize.prototype.positionDropdown = function() {
		var $control = this.$control;
		var offset = this.settings.dropdownParent === 'body' ? $control.offset() : $control.position();
		var top = offset.top;
		offset.top += $control.outerHeight(true);

		this.$dropdown.css({
			width : $control.outerWidth(),
			left  : offset.left
		});

		var dir = this.settings.dropdownDirection;
		if (dir === 'up') {
			this.$dropdown.css('top', top - this.$dropdown.outerHeight(true));
		}
		else {
			this.$dropdown.css('top', offset.top);
		}
	};
}

export function initSelectize() {
	injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.default.min.css');
	injectScript('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/js/standalone/selectize.min.js');

	return new Promise(function(resolve, reject) {
		(function checkSelectize() {
			if (typeof(Selectize) !== 'undefined') {
				forceTop();
				resolve();
			}
			else {
				setTimeout(checkSelectize, 500);
			}
		})();
	});
}

export function createSelectize(textures, ractive) {
	var optgroups = textures.reduce(function(tags, val) {
		if (tags.indexOf(val.tag) < 0) {
			tags.push(val.tag);
		}

		return tags;
	}, []).map(function(tag) {
		return { tag };
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
		optgroupValueField: 'tag',
		optgroupLabelField: 'tag',
		optgroupField: 'tag',
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
		},
		onChange: function(val) {
			ractive.updateModel();
		}
	});
}
