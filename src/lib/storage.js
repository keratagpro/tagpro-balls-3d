export default class Storage {
	constructor(name) {
		this._name = name || 'config';
		this._data = {};

		this.load();
	}

	get(key) {
		return this._data[key];
	}

	set(key, value) {
		this._data[key] = value;
		this.save();
	}

	has(key) {
		return key in this._data;
	}

	load() {
		try {
			this._data = JSON.parse(s || GM_getValue(this._name));
		}
		catch (ex) {
			this.clear();
		}
	}

	save() {
		var str = JSON.stringify(this._data);
		GM_setValue(this._name, str);
	}

	delete(key) {
		if (key in this._data) {
			delete this._data[key];
			this.save();
		}
	}

	list() {
		return Object.keys(this._data).sort();
	}

	clear() {
		this._data = {};
		this.save();
	}

	edit() {
		var res = window.prompt('Edit cached package URLs', JSON.stringify(this._data, null, 2));
		if (res !== null) {
			try {
				this._data = res ? JSON.parse(res) : {};
				this.save();
			}
			catch (ex) {
				console.warn('Failed to update cache data: %s %o', ex.toString(), ex);
			}
		}
	}

	toString() {
		return `Storage(${this._name}): [${this.list.join('\n')}]`;
	}

	dump() {
		console.log(`Storage(${this._name}):`, JSON.stringify(this._data, null, 2));
	}
};