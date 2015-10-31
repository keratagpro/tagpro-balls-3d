import $ from 'jquery';
import Ractive from 'ractive';

import init3D from './lib/init_3d';
import { initSelectize } from './lib/selectize_utils';
import * as utils from './lib/utils';
import config from './lib/config';
import Options from './components/options';
import slide from './transitions/slide';

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
			Options
		},
		oninit: function() {
			this.on('Options.close', function() {
				this.set('showOptions', false);
				return false;
			});

			this.observe('showOptions', function(val) {
				$optionsLink.toggleClass('active', val);
			});
		},
		transitions: {
			slide
		}
	});

	$optionsLink.on('click', () => {
		tagpro.balls3d.toggle('showOptions');
		return false;
	});
}

tagpro.ready(function() {
	// Check if is in game
	if (utils.isGame()) {
		if (config.disableForEvents && utils.isEvent()) {
			console.log('Disabling 3D for event!');
			return;
		}

		if (utils.isHalloweenEvent()) {
			config.textureMarsBall = 'https://keratagpro.github.io/tagpro-balls-3d/textures/misc/eye.jpg';
			config.texturesBlue = ['https://keratagpro.github.io/tagpro-balls-3d/textures/misc/zombie.jpg'];
		}

		init3D(config);
	}
	else if (utils.isFrontPage()) {
		GM_addStyle(`
			body {
				overflow: visible;
			}

			.text-3d {
				color: #ACE600;
				text-shadow: 1px 1px #608100, 2px 2px #608100, 3px 3px #608100;
			}

			.balls3d-button {
				margin-left: 10px;
				margin-right: 10px;
			}

			.balls3d-button.active {
				text-decoration: underline;
			}
		`);

		initSelectize().then(initOptions);
	}
});