var radius = 19;
var widthSegments = 16;
var heightSegments = 12;

export default function createBall(texture) {
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

	var material = new THREE.MeshPhongMaterial({
		shading: THREE.SmoothShading,
		map: texture
	});

	return new THREE.Mesh(geometry, material);
}