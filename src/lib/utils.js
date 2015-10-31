import $ from 'jquery';

export function injectCSS(src) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = src;
	(document.head || document.body).appendChild(link);
}

export function injectScript(src) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = src;
	document.body.appendChild(script);
}

export function isFrontPage() {
	return location.pathname === '/';
}

export function isGame() {
	return tagpro.state > 0;
}

export function isEvent() {
	if ($('script[src*="event"]').length !== 0) {
		return true;
	}

	if ($('#event-tiles').length !== 0) {
		return true;
	}

	return false;
}

export function isHalloweenEvent() {
	return $('script[src*="halloween"').length !== 0;
}

export function values(object) {
	var result = [];
	for(var property in object) {
		result.push(object[property]);
	}
	return result;
}