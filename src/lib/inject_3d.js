import { before, after } from './hooks';
import TextureCanvas from './texture_canvas';

export default function inject3D() {
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
}