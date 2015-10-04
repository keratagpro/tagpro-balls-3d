import THREE from 'three';

function ObjectGrid(options) {
	THREE.Object3D.call(this);

	this.cols = options.cols;
	this.rows = options.rows;
	this.cellSize = options.cellSize;

	this.type = "ObjectGrid";

	this._grid = [];
};

ObjectGrid.prototype = Object.create(THREE.Object3D.prototype);
ObjectGrid.prototype.constructor = ObjectGrid;

ObjectGrid.prototype.add = function(object) {
	var idx = this._grid.indexOf(null);
	if (idx < 0) {
		idx = this._grid.push(object.uuid) - 1;
	}
	else {
		this._grid[idx] = object.uuid;
	}

	var col = (idx % this.cols);
	var row = ~~(idx / this.cols);

	var x = col * this.cellSize;
	var y = row * this.cellSize

	object.position.x = x + this.cellSize / 2;
	object.position.y = y + this.cellSize / 2;

	THREE.Object3D.prototype.add.call(this, object);

	return {
		x: x,
		y: y,
		width: this.cellSize,
		height: this.cellSize
	};
};

ObjectGrid.prototype.remove = function(object) {
	var idx = this._grid.indexOf(object.uuid);
	
	if (idx < 0) {
		return;
	}

	this._grid[idx] = null;

	THREE.Object3D.prototype.remove.call(this, object);
};

export default ObjectGrid;
