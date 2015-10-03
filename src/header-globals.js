
// HACK: browserify-shim tries to find libraries from window/global, which are unavailable in userscripts
window.THREE = window.THREE || THREE;
window.PIXI = window.PIXI || PIXI;

