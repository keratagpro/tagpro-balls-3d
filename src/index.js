import $ from 'jquery';
import Ractive from 'ractive';

import inject3D from './lib/inject_3d';
import { initSelectize } from './lib/selectize_utils';
import Options from './components/options';
import slide from './transitions/slide';

// Check if is in game
if (tagpro.state > 0) {
	inject3D();
}
else if (location.pathname === '/') {
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

	initSelectize().then(function() {
		var $existingLink = $('a:contains("Map Statistics")');

		var $elem = $('<div id="balls3d-options"></div>').insertAfter($existingLink.closest('.section'));

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
				});
			},
			transitions: {
				slide
			}
		});

		var $a = $('<a href="#" class="balls3d-button">3D settings</a>')
			.on('click', function () {
				tagpro.balls3d.toggle('showOptions');
				$(this).toggleClass('active', tagpro.balls3d.get('showOptions'));
			});

		$a.insertBefore($existingLink);
	});
}
