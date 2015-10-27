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