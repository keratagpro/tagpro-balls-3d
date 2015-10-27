export default class Storage {
	static getItem(key) {
		return JSON.parse(GM_getValue(key));
	}

	static setItem(key, value) {
		GM_setValue(key, JSON.stringify(value));
	}

	static removeItem(key) {
		GM_deleteValue(key);
	}

	static clear() {
		var keys = GM_listValues();
		keys.forEach(key => this.removeItem(key));
	}

	static all() {
		var keys = GM_listValues();

		return keys.reduce((map, key) => {
			map[key] = this.getItem(key);
			return map;
		}, {});
	}
}
