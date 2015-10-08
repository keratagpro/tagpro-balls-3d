if (!window.THREE) {
	$(document.body).append('<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min.js" />');
}

$('#assets')
	.append('<img name="balls3dred" src="http://{{rootUrl}}/textures/planets/mars.jpg" class="asset" />')
	.append('<img name="balls3dblue" src="http://{{rootUrl}}/textures/planets/earth.jpg" class="asset" />');

// NOTE: could use ES6 template string instead of this wrapper method, but
// this way you get syntax highlighting in the userscript editor.
function injected() {
{{script}}
}

var script = document.createElement('script');
script.type="text/javascript";
script.textContent = injected.toString();
document.body.appendChild(script);