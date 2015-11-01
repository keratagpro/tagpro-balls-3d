import THREE from 'three';
import Ractive from 'ractive';

import * as ThreeUtils from '../lib/three_utils';

export default Ractive.extend({
	template: '<canvas class="options-3d-preview-ball"></canvas>',
	data: {
		size: tagpro.TILE_SIZE
	},
	onrender: function() {
		var width = this.get('size');
		var height = this.get('size');

		var renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			canvas: this.find('canvas')
		});

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
			if (this.get('options.useMaxAnisotropy')) {
				texture.anisotropy = renderer.getMaxAnisotropy();
			}
			else {
				texture.anisotropy = this.get('options.customAnisotropy');
			}
			
			texture.minFilter = this.get('options.minFilter');
			texture.needsUpdate = true;

			var geometry = new THREE.SphereGeometry(
				this.get('radius') || this.get('options.sphereRadius'),
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

			if (this.get('options.drawOutline')) {
				var outlineMaterial = new THREE.MeshBasicMaterial({
					color: this.get('options.outlineColor'),
					side: THREE.FrontSide
				});

				var outline = new THREE.Mesh(geometry, outlineMaterial);
				outline.position = sphere.position;
				outline.scale.multiplyScalar(1.05);
				sphere.add(outline);
			}

			ThreeUtils.rotateZ(sphere, Math.PI);

			scene.add(sphere);

			function render() {
				ThreeUtils.rotateX(sphere, 0.02);
				ThreeUtils.rotateY(sphere, 0.02);
				ThreeUtils.rotateZ(sphere, 0.02);

				renderer.render(scene, camera);
				window.requestAnimationFrame(render);
			}

			window.requestAnimationFrame(render);
		});
	}
});