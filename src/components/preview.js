import THREE from 'three';
import Ractive from 'ractive';

import * as ThreeUtils from '../lib/three_utils';

export default Ractive.extend({
	template: '<canvas class="options-3d-preview-ball"></canvas>',
	onrender: function() {
		var width = tagpro.TILE_SIZE - 2;
		var height = tagpro.TILE_SIZE - 2;

		var renderer = new THREE.WebGLRenderer({
			alpha: false,
			antialias: true,
			canvas: this.find('canvas')
		});
		renderer.setClearColor( 0xffffff );

		renderer.setSize(width, height);

		var scene = new THREE.Scene();

		ThreeUtils.addLightsToScene(scene);

		var camera = ThreeUtils.createCamera({ width, height });

		var loader = new THREE.TextureLoader();
		loader.setCrossOrigin('');

		var texture = this.get('texture');

		if (this.get('options.useCorsProxy')) {
			texture = this.get('options.corsProxy') + texture;
		}

		loader.load(texture, texture => {
			texture.anisotropy = this.get('options.anisotropy');
			texture.minFilter = this.get('options.minFilter');
			texture.needsUpdate = true;

			var geometry = new THREE.SphereGeometry(
				this.get('options.sphereRadius'),
				this.get('options.sphereWidthSegments'),
				this.get('options.sphereHeightSegments')
			);

			var material = new THREE.MeshPhongMaterial({
				shading: this.get('options.sphereShading'),
				map: texture
			});

			this.observe('texture', function(val) {
				if (this.get('options.useCorsProxy')) {
					val = this.get('options.corsProxy') + val;
				}

				loader.load(val, texture => {
					material.map = texture;
					material.needsUpdate = true;
				});
			});

			var sphere = new THREE.Mesh(geometry, material);
			sphere.position.x = width / 2;
			sphere.position.y = height / 2;

			ThreeUtils.rotateZ(sphere, Math.PI);

			scene.add(sphere);

			var axis = new THREE.Vector3(1, 1, 0);
			if (this.get('texture').indexOf('earth') !== -1) {
  				var len = 16;
				for (var i = 0; i < len; i++) {
					renderer.render(scene, camera);

					var evt = document.createEvent('HTMLEvents');
	  				evt.initEvent('click');

					var link = document.createElement('a');
					link.href = renderer.domElement.toDataURL();
					link.download = 'ball-' + (('00' + (len - i)).slice(-2)) + '.png';
					link.dispatchEvent(evt);
					ThreeUtils.rotateAroundWorldAxis(sphere, axis, 2 * Math.PI / len);
				}
			}
			else {
				function render() {
					ThreeUtils.rotateX(sphere, 0.02);
					// ThreeUtils.rotateY(sphere, 0.02);
					// ThreeUtils.rotateZ(sphere, 0.02);

					renderer.render(scene, camera);
					window.requestAnimationFrame(render);
				}

				window.requestAnimationFrame(render);
			}
		});
	}
});