import defaults from 'defaults';
import THREE from 'three';

function ObjectGrid(options) {
	THREE.Object3D.call(this);

	this.cols = options.cols;
	this.rows = options.rows;
	this.cellSize = options.cellSize;

	this._grid = [];
};

ObjectGrid.prototype.add = function(object) {
	THREE.Object3D.prototype.add.call(this, object);

	var idx = this._grid.indexOf(null);
	if (idx < 0) {
		idx = this._grid.push(object) - 1;
	}
	else {
		this._grid[idx] = object;
	}

	var col = (idx % this.cols);
	var row = ~~(idx / this.cols);

	var x = col * this.cellSize;
	var y = row * this.cellSize

	object.position.x = x + this.cellSize / 2;
	object.position.y = y + this.cellSize / 2;

	return {
		x: x,
		y: y,
		width: this.cellSize,
		height: this.cellSize
	};
};

ObjectGrid.prototype.remove = function(object) {
	THREE.Object3D.prototype.remove.call(this, object);

	var idx = this._grid.indexOf(object);
	
	if (idx < 0) {
		return;
	}

	this._grid[idx] = 0;
};

export default ObjectGrid;
