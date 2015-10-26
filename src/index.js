import $ from 'jquery';
import Ractive from 'ractive';

import { before, after, injectCSS } from './lib/utils';
import TextureCanvas from './lib/texture_canvas';
import Options from './components/options';

injectCSS('https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.12.1/css/selectize.default.min.css');

tagpro.ready(function() {
	var texture = new TextureCanvas();

	var tr = tagpro.renderer;

	before(tr, 'render', function() {
		texture.render();
	});

	after(tr, 'createBallSprite', function(player) {
		texture.addPlayer(player);
	});

	after(tr, 'destroyPlayer', function(player) {
		texture.removePlayer(player);
	});

	after(tr, 'updatePlayerSpritePosition', function(player) {
		texture.updatePosition(player);
	});

	// Replace original tagpro.renderer.updatePlayerColor
	tr.updatePlayerColor = function(player) {
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
			Options
		}
	});
});
