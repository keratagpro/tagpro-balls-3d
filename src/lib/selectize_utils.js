import $ from 'jquery';
import { injectCSS, injectScript } from './utils';

export function initSelectize() {
	injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.legacy.min.css');
	injectScript('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/js/standalone/selectize.min.js');

	return new Promise(function(resolve, reject) {
		(function checkSelectize() {
			if (typeof(Selectize) !== 'undefined') {
				resolve();
			}
			else {
				setTimeout(checkSelectize, 500);
			}
		})();
	});
}

export function createSelectizes(textures, ractive) {
	$('.texture-select').each(function() {
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
	var optgroups = textures.reduce(function(tags, val) {
		if (tags.indexOf(val.tag) < 0) {
			tags.push(val.tag);
		}

		return tags;
	}, []).map(function(tag) {
		return { tag };
	});

	var selectize = $(elem).selectize({
		plugins: ['remove_button', 'optgroup_columns', {
			name: 'restore_on_backspace',
			options: {
				text: function(option) {
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
			item: function(item, escape) {
				return '<div>' +
					'<img class="option-item-image" src="' + item.path + '" />' +
					(item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
				'</div>';
			},
			option: function(item, escape) {
				return '<div>' +
					'<div class="option-thumbnail"><img src="' + item.path + '" /></div>' +
					(item.name ? '<span class="option-label">' + escape(item.name) + '</span>' : '') +
				'</div>';
			}
		},
		onChange: function(val) {
			ractive.updateModel();
		}
	});
}
