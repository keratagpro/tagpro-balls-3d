export function before(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function() {
		callback.apply(this, arguments);
		return orig.apply(this, arguments);
	};
};

export function after(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function() {
		var result = orig.apply(this, arguments);
		callback.apply(this, arguments);
		return result;
	};
};