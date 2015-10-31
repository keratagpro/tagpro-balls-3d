import { before, after } from './hooks';
import TextureCanvas from './texture_canvas';

export default function inject3D(config) {
	var texture = new TextureCanvas(config);

	var tr = tagpro.renderer;

	before(tr, 'render', function() {
		texture.render();
	});

	after(tr, 'drawMarsball', function(object, position) {
		texture.addMarsBall(object, position);
	});

	after(tr, 'updateMarsBall', function(object, position) {
		texture.updateMarsBall(object, position);
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
}