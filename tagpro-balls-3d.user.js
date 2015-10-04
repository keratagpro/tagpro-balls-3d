// ==UserScript==
// @name          TagPro Balls 3D
// @description   Replaces ball sprites with rotating 3D ball sprites using THREE.js.
// @version       0.3.0
// @author        Kera
// @grant         GM_getValue
// @grant         GM_setValue
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min.js
// @namespace     http://github.com/keratagpro/
// @downloadUrl   https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-balls-3d/tagpro-balls-3d.meta.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

// HACK: browserify-shim tries to find libraries from window/global, which are unavailable in userscripts
window.THREE = window.THREE || THREE;
window.PIXI = window.PIXI || PIXI;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(t){"use strict";function r(t){var r=t.charCodeAt(0);return r===h||r===u?62:r===c||r===f?63:o>r?-1:o+10>r?r-o+26+26:i+26>r?r-i:A+26>r?r-A+26:void 0}function e(t){function e(t){i[f++]=t}var n,h,c,o,A,i;if(t.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var u=t.length;A="="===t.charAt(u-2)?2:"="===t.charAt(u-1)?1:0,i=new a(3*t.length/4-A),c=A>0?t.length-4:t.length;var f=0;for(n=0,h=0;c>n;n+=4,h+=3)o=r(t.charAt(n))<<18|r(t.charAt(n+1))<<12|r(t.charAt(n+2))<<6|r(t.charAt(n+3)),e((16711680&o)>>16),e((65280&o)>>8),e(255&o);return 2===A?(o=r(t.charAt(n))<<2|r(t.charAt(n+1))>>4,e(255&o)):1===A&&(o=r(t.charAt(n))<<10|r(t.charAt(n+1))<<4|r(t.charAt(n+2))>>2,e(o>>8&255),e(255&o)),i}function n(t){function r(t){return lookup.charAt(t)}function e(t){return r(t>>18&63)+r(t>>12&63)+r(t>>6&63)+r(63&t)}var n,a,h,c=t.length%3,o="";for(n=0,h=t.length-c;h>n;n+=3)a=(t[n]<<16)+(t[n+1]<<8)+t[n+2],o+=e(a);switch(c){case 1:a=t[t.length-1],o+=r(a>>2),o+=r(a<<4&63),o+="==";break;case 2:a=(t[t.length-2]<<8)+t[t.length-1],o+=r(a>>10),o+=r(a>>4&63),o+=r(a<<2&63),o+="="}return o}var a="undefined"!=typeof Uint8Array?Uint8Array:Array,h="+".charCodeAt(0),c="/".charCodeAt(0),o="0".charCodeAt(0),A="a".charCodeAt(0),i="A".charCodeAt(0),u="-".charCodeAt(0),f="_".charCodeAt(0);t.toByteArray=e,t.fromByteArray=n}("undefined"==typeof exports?this.base64js={}:exports);

},{}],2:[function(require,module,exports){
(function (global){
function kMaxLength(){return Buffer.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function Buffer(t){return this instanceof Buffer?(this.length=0,this.parent=void 0,"number"==typeof t?fromNumber(this,t):"string"==typeof t?fromString(this,t,arguments.length>1?arguments[1]:"utf8"):fromObject(this,t)):arguments.length>1?new Buffer(t,arguments[1]):new Buffer(t)}function fromNumber(t,e){if(t=allocate(t,0>e?0:0|checked(e)),!Buffer.TYPED_ARRAY_SUPPORT)for(var r=0;e>r;r++)t[r]=0;return t}function fromString(t,e,r){("string"!=typeof r||""===r)&&(r="utf8");var n=0|byteLength(e,r);return t=allocate(t,n),t.write(e,r),t}function fromObject(t,e){if(Buffer.isBuffer(e))return fromBuffer(t,e);if(isArray(e))return fromArray(t,e);if(null==e)throw new TypeError("must start with number, buffer, array or string");if("undefined"!=typeof ArrayBuffer){if(e.buffer instanceof ArrayBuffer)return fromTypedArray(t,e);if(e instanceof ArrayBuffer)return fromArrayBuffer(t,e)}return e.length?fromArrayLike(t,e):fromJsonObject(t,e)}function fromBuffer(t,e){var r=0|checked(e.length);return t=allocate(t,r),e.copy(t,0,0,r),t}function fromArray(t,e){var r=0|checked(e.length);t=allocate(t,r);for(var n=0;r>n;n+=1)t[n]=255&e[n];return t}function fromTypedArray(t,e){var r=0|checked(e.length);t=allocate(t,r);for(var n=0;r>n;n+=1)t[n]=255&e[n];return t}function fromArrayBuffer(t,e){return Buffer.TYPED_ARRAY_SUPPORT?(e.byteLength,t=Buffer._augment(new Uint8Array(e))):t=fromTypedArray(t,new Uint8Array(e)),t}function fromArrayLike(t,e){var r=0|checked(e.length);t=allocate(t,r);for(var n=0;r>n;n+=1)t[n]=255&e[n];return t}function fromJsonObject(t,e){var r,n=0;"Buffer"===e.type&&isArray(e.data)&&(r=e.data,n=0|checked(r.length)),t=allocate(t,n);for(var i=0;n>i;i+=1)t[i]=255&r[i];return t}function allocate(t,e){Buffer.TYPED_ARRAY_SUPPORT?(t=Buffer._augment(new Uint8Array(e)),t.__proto__=Buffer.prototype):(t.length=e,t._isBuffer=!0);var r=0!==e&&e<=Buffer.poolSize>>>1;return r&&(t.parent=rootParent),t}function checked(t){if(t>=kMaxLength())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+kMaxLength().toString(16)+" bytes");return 0|t}function SlowBuffer(t,e){if(!(this instanceof SlowBuffer))return new SlowBuffer(t,e);var r=new Buffer(t,e);return delete r.parent,r}function byteLength(t,e){"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"binary":case"raw":case"raws":return r;case"utf8":case"utf-8":return utf8ToBytes(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return base64ToBytes(t).length;default:if(n)return utf8ToBytes(t).length;e=(""+e).toLowerCase(),n=!0}}function slowToString(t,e,r){var n=!1;if(e=0|e,r=void 0===r||r===1/0?this.length:0|r,t||(t="utf8"),0>e&&(e=0),r>this.length&&(r=this.length),e>=r)return"";for(;;)switch(t){case"hex":return hexSlice(this,e,r);case"utf8":case"utf-8":return utf8Slice(this,e,r);case"ascii":return asciiSlice(this,e,r);case"binary":return binarySlice(this,e,r);case"base64":return base64Slice(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return utf16leSlice(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}function hexWrite(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n),n>i&&(n=i)):n=i;var f=e.length;if(f%2!==0)throw new Error("Invalid hex string");n>f/2&&(n=f/2);for(var o=0;n>o;o++){var u=parseInt(e.substr(2*o,2),16);if(isNaN(u))throw new Error("Invalid hex string");t[r+o]=u}return o}function utf8Write(t,e,r,n){return blitBuffer(utf8ToBytes(e,t.length-r),t,r,n)}function asciiWrite(t,e,r,n){return blitBuffer(asciiToBytes(e),t,r,n)}function binaryWrite(t,e,r,n){return asciiWrite(t,e,r,n)}function base64Write(t,e,r,n){return blitBuffer(base64ToBytes(e),t,r,n)}function ucs2Write(t,e,r,n){return blitBuffer(utf16leToBytes(e,t.length-r),t,r,n)}function base64Slice(t,e,r){return 0===e&&r===t.length?base64.fromByteArray(t):base64.fromByteArray(t.slice(e,r))}function utf8Slice(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;r>i;){var f=t[i],o=null,u=f>239?4:f>223?3:f>191?2:1;if(r>=i+u){var s,a,h,c;switch(u){case 1:128>f&&(o=f);break;case 2:s=t[i+1],128===(192&s)&&(c=(31&f)<<6|63&s,c>127&&(o=c));break;case 3:s=t[i+1],a=t[i+2],128===(192&s)&&128===(192&a)&&(c=(15&f)<<12|(63&s)<<6|63&a,c>2047&&(55296>c||c>57343)&&(o=c));break;case 4:s=t[i+1],a=t[i+2],h=t[i+3],128===(192&s)&&128===(192&a)&&128===(192&h)&&(c=(15&f)<<18|(63&s)<<12|(63&a)<<6|63&h,c>65535&&1114112>c&&(o=c))}}null===o?(o=65533,u=1):o>65535&&(o-=65536,n.push(o>>>10&1023|55296),o=56320|1023&o),n.push(o),i+=u}return decodeCodePointsArray(n)}function decodeCodePointsArray(t){var e=t.length;if(MAX_ARGUMENTS_LENGTH>=e)return String.fromCharCode.apply(String,t);for(var r="",n=0;e>n;)r+=String.fromCharCode.apply(String,t.slice(n,n+=MAX_ARGUMENTS_LENGTH));return r}function asciiSlice(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;r>i;i++)n+=String.fromCharCode(127&t[i]);return n}function binarySlice(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;r>i;i++)n+=String.fromCharCode(t[i]);return n}function hexSlice(t,e,r){var n=t.length;(!e||0>e)&&(e=0),(!r||0>r||r>n)&&(r=n);for(var i="",f=e;r>f;f++)i+=toHex(t[f]);return i}function utf16leSlice(t,e,r){for(var n=t.slice(e,r),i="",f=0;f<n.length;f+=2)i+=String.fromCharCode(n[f]+256*n[f+1]);return i}function checkOffset(t,e,r){if(t%1!==0||0>t)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function checkInt(t,e,r,n,i,f){if(!Buffer.isBuffer(t))throw new TypeError("buffer must be a Buffer instance");if(e>i||f>e)throw new RangeError("value is out of bounds");if(r+n>t.length)throw new RangeError("index out of range")}function objectWriteUInt16(t,e,r,n){0>e&&(e=65535+e+1);for(var i=0,f=Math.min(t.length-r,2);f>i;i++)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function objectWriteUInt32(t,e,r,n){0>e&&(e=4294967295+e+1);for(var i=0,f=Math.min(t.length-r,4);f>i;i++)t[r+i]=e>>>8*(n?i:3-i)&255}function checkIEEE754(t,e,r,n,i,f){if(e>i||f>e)throw new RangeError("value is out of bounds");if(r+n>t.length)throw new RangeError("index out of range");if(0>r)throw new RangeError("index out of range")}function writeFloat(t,e,r,n,i){return i||checkIEEE754(t,e,r,4,3.4028234663852886e38,-3.4028234663852886e38),ieee754.write(t,e,r,n,23,4),r+4}function writeDouble(t,e,r,n,i){return i||checkIEEE754(t,e,r,8,1.7976931348623157e308,-1.7976931348623157e308),ieee754.write(t,e,r,n,52,8),r+8}function base64clean(t){if(t=stringtrim(t).replace(INVALID_BASE64_RE,""),t.length<2)return"";for(;t.length%4!==0;)t+="=";return t}function stringtrim(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function toHex(t){return 16>t?"0"+t.toString(16):t.toString(16)}function utf8ToBytes(t,e){e=e||1/0;for(var r,n=t.length,i=null,f=[],o=0;n>o;o++){if(r=t.charCodeAt(o),r>55295&&57344>r){if(!i){if(r>56319){(e-=3)>-1&&f.push(239,191,189);continue}if(o+1===n){(e-=3)>-1&&f.push(239,191,189);continue}i=r;continue}if(56320>r){(e-=3)>-1&&f.push(239,191,189),i=r;continue}r=i-55296<<10|r-56320|65536}else i&&(e-=3)>-1&&f.push(239,191,189);if(i=null,128>r){if((e-=1)<0)break;f.push(r)}else if(2048>r){if((e-=2)<0)break;f.push(r>>6|192,63&r|128)}else if(65536>r){if((e-=3)<0)break;f.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(1114112>r))throw new Error("Invalid code point");if((e-=4)<0)break;f.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return f}function asciiToBytes(t){for(var e=[],r=0;r<t.length;r++)e.push(255&t.charCodeAt(r));return e}function utf16leToBytes(t,e){for(var r,n,i,f=[],o=0;o<t.length&&!((e-=2)<0);o++)r=t.charCodeAt(o),n=r>>8,i=r%256,f.push(i),f.push(n);return f}function base64ToBytes(t){return base64.toByteArray(base64clean(t))}function blitBuffer(t,e,r,n){for(var i=0;n>i&&!(i+r>=e.length||i>=t.length);i++)e[i+r]=t[i];return i}var base64=require("base64-js"),ieee754=require("ieee754"),isArray=require("is-array");exports.Buffer=Buffer,exports.SlowBuffer=SlowBuffer,exports.INSPECT_MAX_BYTES=50,Buffer.poolSize=8192;var rootParent={};Buffer.TYPED_ARRAY_SUPPORT=void 0!==global.TYPED_ARRAY_SUPPORT?global.TYPED_ARRAY_SUPPORT:function(){function t(){}try{var e=new Uint8Array(1);return e.foo=function(){return 42},e.constructor=t,42===e.foo()&&e.constructor===t&&"function"==typeof e.subarray&&0===e.subarray(1,1).byteLength}catch(r){return!1}}(),Buffer.TYPED_ARRAY_SUPPORT&&(Buffer.prototype.__proto__=Uint8Array.prototype,Buffer.__proto__=Uint8Array),Buffer.isBuffer=function(t){return!(null==t||!t._isBuffer)},Buffer.compare=function(t,e){if(!Buffer.isBuffer(t)||!Buffer.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,f=Math.min(r,n);f>i&&t[i]===e[i];)++i;return i!==f&&(r=t[i],n=e[i]),n>r?-1:r>n?1:0},Buffer.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},Buffer.concat=function(t,e){if(!isArray(t))throw new TypeError("list argument must be an Array of Buffers.");if(0===t.length)return new Buffer(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;r++)e+=t[r].length;var n=new Buffer(e),i=0;for(r=0;r<t.length;r++){var f=t[r];f.copy(n,i),i+=f.length}return n},Buffer.byteLength=byteLength,Buffer.prototype.length=void 0,Buffer.prototype.parent=void 0,Buffer.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?utf8Slice(this,0,t):slowToString.apply(this,arguments)},Buffer.prototype.equals=function(t){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t?!0:0===Buffer.compare(this,t)},Buffer.prototype.inspect=function(){var t="",e=exports.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,e).match(/.{2}/g).join(" "),this.length>e&&(t+=" ... ")),"<Buffer "+t+">"},Buffer.prototype.compare=function(t){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t?0:Buffer.compare(this,t)},Buffer.prototype.indexOf=function(t,e){function r(t,e,r){for(var n=-1,i=0;r+i<t.length;i++)if(t[r+i]===e[-1===n?0:i-n]){if(-1===n&&(n=i),i-n+1===e.length)return r+n}else n=-1;return-1}if(e>2147483647?e=2147483647:-2147483648>e&&(e=-2147483648),e>>=0,0===this.length)return-1;if(e>=this.length)return-1;if(0>e&&(e=Math.max(this.length+e,0)),"string"==typeof t)return 0===t.length?-1:String.prototype.indexOf.call(this,t,e);if(Buffer.isBuffer(t))return r(this,t,e);if("number"==typeof t)return Buffer.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,t,e):r(this,[t],e);throw new TypeError("val must be string, number or Buffer")},Buffer.prototype.get=function(t){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(t)},Buffer.prototype.set=function(t,e){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(t,e)},Buffer.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else if(isFinite(e))e=0|e,isFinite(r)?(r=0|r,void 0===n&&(n="utf8")):(n=r,r=void 0);else{var i=n;n=e,e=0|r,r=i}var f=this.length-e;if((void 0===r||r>f)&&(r=f),t.length>0&&(0>r||0>e)||e>this.length)throw new RangeError("attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return hexWrite(this,t,e,r);case"utf8":case"utf-8":return utf8Write(this,t,e,r);case"ascii":return asciiWrite(this,t,e,r);case"binary":return binaryWrite(this,t,e,r);case"base64":return base64Write(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ucs2Write(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},Buffer.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var MAX_ARGUMENTS_LENGTH=4096;Buffer.prototype.slice=function(t,e){var r=this.length;t=~~t,e=void 0===e?r:~~e,0>t?(t+=r,0>t&&(t=0)):t>r&&(t=r),0>e?(e+=r,0>e&&(e=0)):e>r&&(e=r),t>e&&(e=t);var n;if(Buffer.TYPED_ARRAY_SUPPORT)n=Buffer._augment(this.subarray(t,e));else{var i=e-t;n=new Buffer(i,void 0);for(var f=0;i>f;f++)n[f]=this[f+t]}return n.length&&(n.parent=this.parent||this),n},Buffer.prototype.readUIntLE=function(t,e,r){t=0|t,e=0|e,r||checkOffset(t,e,this.length);for(var n=this[t],i=1,f=0;++f<e&&(i*=256);)n+=this[t+f]*i;return n},Buffer.prototype.readUIntBE=function(t,e,r){t=0|t,e=0|e,r||checkOffset(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},Buffer.prototype.readUInt8=function(t,e){return e||checkOffset(t,1,this.length),this[t]},Buffer.prototype.readUInt16LE=function(t,e){return e||checkOffset(t,2,this.length),this[t]|this[t+1]<<8},Buffer.prototype.readUInt16BE=function(t,e){return e||checkOffset(t,2,this.length),this[t]<<8|this[t+1]},Buffer.prototype.readUInt32LE=function(t,e){return e||checkOffset(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},Buffer.prototype.readUInt32BE=function(t,e){return e||checkOffset(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},Buffer.prototype.readIntLE=function(t,e,r){t=0|t,e=0|e,r||checkOffset(t,e,this.length);for(var n=this[t],i=1,f=0;++f<e&&(i*=256);)n+=this[t+f]*i;return i*=128,n>=i&&(n-=Math.pow(2,8*e)),n},Buffer.prototype.readIntBE=function(t,e,r){t=0|t,e=0|e,r||checkOffset(t,e,this.length);for(var n=e,i=1,f=this[t+--n];n>0&&(i*=256);)f+=this[t+--n]*i;return i*=128,f>=i&&(f-=Math.pow(2,8*e)),f},Buffer.prototype.readInt8=function(t,e){return e||checkOffset(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},Buffer.prototype.readInt16LE=function(t,e){e||checkOffset(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},Buffer.prototype.readInt16BE=function(t,e){e||checkOffset(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},Buffer.prototype.readInt32LE=function(t,e){return e||checkOffset(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},Buffer.prototype.readInt32BE=function(t,e){return e||checkOffset(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},Buffer.prototype.readFloatLE=function(t,e){return e||checkOffset(t,4,this.length),ieee754.read(this,t,!0,23,4)},Buffer.prototype.readFloatBE=function(t,e){return e||checkOffset(t,4,this.length),ieee754.read(this,t,!1,23,4)},Buffer.prototype.readDoubleLE=function(t,e){return e||checkOffset(t,8,this.length),ieee754.read(this,t,!0,52,8)},Buffer.prototype.readDoubleBE=function(t,e){return e||checkOffset(t,8,this.length),ieee754.read(this,t,!1,52,8)},Buffer.prototype.writeUIntLE=function(t,e,r,n){t=+t,e=0|e,r=0|r,n||checkInt(this,t,e,r,Math.pow(2,8*r),0);var i=1,f=0;for(this[e]=255&t;++f<r&&(i*=256);)this[e+f]=t/i&255;return e+r},Buffer.prototype.writeUIntBE=function(t,e,r,n){t=+t,e=0|e,r=0|r,n||checkInt(this,t,e,r,Math.pow(2,8*r),0);var i=r-1,f=1;for(this[e+i]=255&t;--i>=0&&(f*=256);)this[e+i]=t/f&255;return e+r},Buffer.prototype.writeUInt8=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,1,255,0),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=t,e+1},Buffer.prototype.writeUInt16LE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t,this[e+1]=t>>>8):objectWriteUInt16(this,t,e,!0),e+2},Buffer.prototype.writeUInt16BE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=t):objectWriteUInt16(this,t,e,!1),e+2},Buffer.prototype.writeUInt32LE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=t):objectWriteUInt32(this,t,e,!0),e+4},Buffer.prototype.writeUInt32BE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=t):objectWriteUInt32(this,t,e,!1),e+4},Buffer.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e=0|e,!n){var i=Math.pow(2,8*r-1);checkInt(this,t,e,r,i-1,-i)}var f=0,o=1,u=0>t?1:0;for(this[e]=255&t;++f<r&&(o*=256);)this[e+f]=(t/o>>0)-u&255;return e+r},Buffer.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e=0|e,!n){var i=Math.pow(2,8*r-1);checkInt(this,t,e,r,i-1,-i)}var f=r-1,o=1,u=0>t?1:0;for(this[e+f]=255&t;--f>=0&&(o*=256);)this[e+f]=(t/o>>0)-u&255;return e+r},Buffer.prototype.writeInt8=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,1,127,-128),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),0>t&&(t=255+t+1),this[e]=t,e+1},Buffer.prototype.writeInt16LE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t,this[e+1]=t>>>8):objectWriteUInt16(this,t,e,!0),e+2},Buffer.prototype.writeInt16BE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=t):objectWriteUInt16(this,t,e,!1),e+2},Buffer.prototype.writeInt32LE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,4,2147483647,-2147483648),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):objectWriteUInt32(this,t,e,!0),e+4},Buffer.prototype.writeInt32BE=function(t,e,r){return t=+t,e=0|e,r||checkInt(this,t,e,4,2147483647,-2147483648),0>t&&(t=4294967295+t+1),Buffer.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=t):objectWriteUInt32(this,t,e,!1),e+4},Buffer.prototype.writeFloatLE=function(t,e,r){return writeFloat(this,t,e,!0,r)},Buffer.prototype.writeFloatBE=function(t,e,r){return writeFloat(this,t,e,!1,r)},Buffer.prototype.writeDoubleLE=function(t,e,r){return writeDouble(this,t,e,!0,r)},Buffer.prototype.writeDoubleBE=function(t,e,r){return writeDouble(this,t,e,!1,r)},Buffer.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&r>n&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(0>e)throw new RangeError("targetStart out of bounds");if(0>r||r>=this.length)throw new RangeError("sourceStart out of bounds");if(0>n)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,f=n-r;if(this===t&&e>r&&n>e)for(i=f-1;i>=0;i--)t[i+e]=this[i+r];else if(1e3>f||!Buffer.TYPED_ARRAY_SUPPORT)for(i=0;f>i;i++)t[i+e]=this[i+r];else t._set(this.subarray(r,r+f),e);return f},Buffer.prototype.fill=function(t,e,r){if(t||(t=0),e||(e=0),r||(r=this.length),e>r)throw new RangeError("end < start");if(r!==e&&0!==this.length){if(0>e||e>=this.length)throw new RangeError("start out of bounds");if(0>r||r>this.length)throw new RangeError("end out of bounds");var n;if("number"==typeof t)for(n=e;r>n;n++)this[n]=t;else{var i=utf8ToBytes(t.toString()),f=i.length;for(n=e;r>n;n++)this[n]=i[n%f]}return this}},Buffer.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(Buffer.TYPED_ARRAY_SUPPORT)return new Buffer(this).buffer;for(var t=new Uint8Array(this.length),e=0,r=t.length;r>e;e+=1)t[e]=this[e];return t.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var BP=Buffer.prototype;Buffer._augment=function(t){return t.constructor=Buffer,t._isBuffer=!0,t._set=t.set,t.get=BP.get,t.set=BP.set,t.write=BP.write,t.toString=BP.toString,t.toLocaleString=BP.toString,t.toJSON=BP.toJSON,t.equals=BP.equals,t.compare=BP.compare,t.indexOf=BP.indexOf,t.copy=BP.copy,t.slice=BP.slice,t.readUIntLE=BP.readUIntLE,t.readUIntBE=BP.readUIntBE,t.readUInt8=BP.readUInt8,t.readUInt16LE=BP.readUInt16LE,t.readUInt16BE=BP.readUInt16BE,t.readUInt32LE=BP.readUInt32LE,t.readUInt32BE=BP.readUInt32BE,t.readIntLE=BP.readIntLE,t.readIntBE=BP.readIntBE,t.readInt8=BP.readInt8,t.readInt16LE=BP.readInt16LE,t.readInt16BE=BP.readInt16BE,t.readInt32LE=BP.readInt32LE,t.readInt32BE=BP.readInt32BE,t.readFloatLE=BP.readFloatLE,t.readFloatBE=BP.readFloatBE,t.readDoubleLE=BP.readDoubleLE,t.readDoubleBE=BP.readDoubleBE,t.writeUInt8=BP.writeUInt8,t.writeUIntLE=BP.writeUIntLE,t.writeUIntBE=BP.writeUIntBE,t.writeUInt16LE=BP.writeUInt16LE,t.writeUInt16BE=BP.writeUInt16BE,t.writeUInt32LE=BP.writeUInt32LE,t.writeUInt32BE=BP.writeUInt32BE,t.writeIntLE=BP.writeIntLE,t.writeIntBE=BP.writeIntBE,t.writeInt8=BP.writeInt8,t.writeInt16LE=BP.writeInt16LE,t.writeInt16BE=BP.writeInt16BE,t.writeInt32LE=BP.writeInt32LE,t.writeInt32BE=BP.writeInt32BE,t.writeFloatLE=BP.writeFloatLE,t.writeFloatBE=BP.writeFloatBE,t.writeDoubleLE=BP.writeDoubleLE,t.writeDoubleBE=BP.writeDoubleBE,t.fill=BP.fill,t.inspect=BP.inspect,t.toArrayBuffer=BP.toArrayBuffer,t};var INVALID_BASE64_RE=/[^+\/0-9A-Za-z-_]/g;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":1,"ieee754":5,"is-array":6}],3:[function(require,module,exports){
(function (Buffer){
var clone=function(){"use strict";function e(t,r,n,o){function f(t,n){if(null===t)return null;if(0==n)return t;var i,a;if("object"!=typeof t)return t;if(e.__isArray(t))i=[];else if(e.__isRegExp(t))i=new RegExp(t.source,u(t)),t.lastIndex&&(i.lastIndex=t.lastIndex);else if(e.__isDate(t))i=new Date(t.getTime());else{if(p&&Buffer.isBuffer(t))return i=new Buffer(t.length),t.copy(i),i;"undefined"==typeof o?(a=Object.getPrototypeOf(t),i=Object.create(a)):(i=Object.create(o),a=o)}if(r){var s=c.indexOf(t);if(-1!=s)return l[s];c.push(t),l.push(i)}for(var y in t){var b;a&&(b=Object.getOwnPropertyDescriptor(a,y)),b&&null==b.set||(i[y]=f(t[y],n-1))}return i}var i;"object"==typeof r&&(n=r.depth,o=r.prototype,i=r.filter,r=r.circular);var c=[],l=[],p="undefined"!=typeof Buffer;return"undefined"==typeof r&&(r=!0),"undefined"==typeof n&&(n=1/0),f(t,n)}function t(e){return Object.prototype.toString.call(e)}function r(e){return"object"==typeof e&&"[object Date]"===t(e)}function n(e){return"object"==typeof e&&"[object Array]"===t(e)}function o(e){return"object"==typeof e&&"[object RegExp]"===t(e)}function u(e){var t="";return e.global&&(t+="g"),e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),t}return e.clonePrototype=function(e){if(null===e)return null;var t=function(){};return t.prototype=e,new t},e.__objToStr=t,e.__isDate=r,e.__isArray=n,e.__isRegExp=o,e.__getRegExpFlags=u,e}();"object"==typeof module&&module.exports&&(module.exports=clone);

}).call(this,require("buffer").Buffer)
},{"buffer":2}],4:[function(require,module,exports){
var clone=require("clone");module.exports=function(e,n){return e=e||{},Object.keys(n).forEach(function(o){"undefined"==typeof e[o]&&(e[o]=clone(n[o]))}),e};

},{"clone":3}],5:[function(require,module,exports){
exports.read=function(a,o,t,r,h){var M,p,w=8*h-r-1,f=(1<<w)-1,e=f>>1,i=-7,N=t?h-1:0,n=t?-1:1,s=a[o+N];for(N+=n,M=s&(1<<-i)-1,s>>=-i,i+=w;i>0;M=256*M+a[o+N],N+=n,i-=8);for(p=M&(1<<-i)-1,M>>=-i,i+=r;i>0;p=256*p+a[o+N],N+=n,i-=8);if(0===M)M=1-e;else{if(M===f)return p?NaN:(s?-1:1)*(1/0);p+=Math.pow(2,r),M-=e}return(s?-1:1)*p*Math.pow(2,M-r)},exports.write=function(a,o,t,r,h,M){var p,w,f,e=8*M-h-1,i=(1<<e)-1,N=i>>1,n=23===h?Math.pow(2,-24)-Math.pow(2,-77):0,s=r?0:M-1,u=r?1:-1,l=0>o||0===o&&0>1/o?1:0;for(o=Math.abs(o),isNaN(o)||o===1/0?(w=isNaN(o)?1:0,p=i):(p=Math.floor(Math.log(o)/Math.LN2),o*(f=Math.pow(2,-p))<1&&(p--,f*=2),o+=p+N>=1?n/f:n*Math.pow(2,1-N),o*f>=2&&(p++,f/=2),p+N>=i?(w=0,p=i):p+N>=1?(w=(o*f-1)*Math.pow(2,h),p+=N):(w=o*Math.pow(2,N-1)*Math.pow(2,h),p=0));h>=8;a[t+s]=255&w,s+=u,w/=256,h-=8);for(p=p<<h|w,e+=h;e>0;a[t+s]=255&p,s+=u,p/=256,e-=8);a[t+s-u]|=128*l};

},{}],6:[function(require,module,exports){
var isArray=Array.isArray,str=Object.prototype.toString;module.exports=isArray||function(r){return!!r&&"[object Array]"==str.call(r)};

},{}],7:[function(require,module,exports){
"use strict";function toObject(e){if(null===e||void 0===e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}var hasOwnProperty=Object.prototype.hasOwnProperty,propIsEnumerable=Object.prototype.propertyIsEnumerable;module.exports=Object.assign||function(e,r){for(var t,n,o=toObject(e),a=1;a<arguments.length;a++){t=Object(arguments[a]);for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);if(Object.getOwnPropertySymbols){n=Object.getOwnPropertySymbols(t);for(var c=0;c<n.length;c++)propIsEnumerable.call(t,n[c])&&(o[n[c]]=t[n[c]])}}return o};

},{}],8:[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _pixiJs = (typeof window !== "undefined" ? window['PIXI'] : typeof global !== "undefined" ? global['PIXI'] : null);

var _pixiJs2 = _interopRequireDefault(_pixiJs);

var _libHooks = require('./lib/hooks');

var _libPlayer_utils = require('./lib/player_utils');

var PlayerUtils = _interopRequireWildcard(_libPlayer_utils);

var _libThree_utils = require('./lib/three_utils');

var ThreeUtils = _interopRequireWildcard(_libThree_utils);

var _libObject_grid = require('./lib/object_grid');

var _libObject_grid2 = _interopRequireDefault(_libObject_grid);

_three2['default'].ImageUtils.crossOrigin = '';

var GRID_COLS = 10;
var GRID_ROWS = 10;
var TILE_SIZE = 40;

var CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
var CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;

var scene = new _three2['default'].Scene();
ThreeUtils.addLightsToScene(scene);

var grid = new _libObject_grid2['default']({
	cols: GRID_COLS,
	rows: GRID_ROWS,
	cellSize: TILE_SIZE
});

scene.add(grid);

var renderer = ThreeUtils.createRenderer();
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

// For debugging
// document.body.appendChild(renderer.domElement);

var camera = ThreeUtils.createCamera({
	width: grid.width,
	height: grid.height
});

var baseTexture = new _pixiJs2['default'].BaseTexture(renderer.domElement);

function render() {
	renderer.render(scene, camera);
}

tagpro.ready(function () {
	var tr = tagpro.renderer;

	(0, _libHooks.after)(tr, 'createBallSprite', function (player) {
		player.lastAngle = player.angle; // initialize lastAngle

		PlayerUtils.createSphereAsync(player, function (sphere) {
			player.sphere = sphere;

			var rect = grid.add(sphere);

			PlayerUtils.setSprite(player, baseTexture, rect);

			baseTexture.dirty();
		});
	});

	(0, _libHooks.after)(tr, 'destroyPlayer', function (player) {
		grid.remove(player.sphere);
		delete player.sphere;
	});

	(0, _libHooks.after)(tr, 'updatePlayerSpritePosition', function (player) {
		PlayerUtils.rotateSphere(player);

		player.lastAngle = player.angle;

		baseTexture.dirty();
	});

	// Replace original tagpro.renderer.updatePlayerColor
	tr.updatePlayerColor = function (player) {
		var color = player.team === 1 ? 'red' : 'blue';
		var tileId = color + 'ball';

		if (player.sprites.actualBall.tileId !== tileId) {
			PlayerUtils.updateTexture(player);
			player.sprites.actualBall.tileId = tileId;
		}
	};

	(0, _libHooks.before)(tr, 'render', render);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/hooks":9,"./lib/object_grid":10,"./lib/player_utils":11,"./lib/three_utils":12}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.before = before;
exports.after = after;

function before(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function () {
		callback.apply(this, arguments);
		return orig.apply(this, arguments);
	};
}

;

function after(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function () {
		var result = orig.apply(this, arguments);
		callback.apply(this, arguments);
		return result;
	};
}

;

},{}],10:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function ObjectGrid(options) {
	_three2["default"].Object3D.call(this);

	this.cols = options.cols;
	this.rows = options.rows;
	this.cellSize = options.cellSize;

	this.type = "ObjectGrid";

	this._children = [];
};

ObjectGrid.prototype = Object.create(_three2["default"].Object3D.prototype);
ObjectGrid.prototype.constructor = ObjectGrid;

ObjectGrid.prototype.add = function (object) {
	var idx = this._children.indexOf(null);
	if (idx < 0) {
		idx = this._children.push(object.uuid) - 1;
	} else {
		this._children[idx] = object.uuid;
	}

	var col = idx % this.cols;
	var row = ~ ~(idx / this.cols);

	var x = col * this.cellSize;
	var y = row * this.cellSize;

	object.position.x = x + this.cellSize / 2;
	object.position.y = y + this.cellSize / 2;

	_three2["default"].Object3D.prototype.add.call(this, object);

	return {
		x: x,
		y: y,
		width: this.cellSize,
		height: this.cellSize
	};
};

ObjectGrid.prototype.remove = function (object) {
	var idx = this._children.indexOf(object.uuid);

	if (idx < 0) {
		return;
	}

	this._children[idx] = null;

	_three2["default"].Object3D.prototype.remove.call(this, object);
};

exports["default"] = ObjectGrid;
module.exports = exports["default"];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.createSphereAsync = createSphereAsync;
exports.rotateSphere = rotateSphere;
exports.setSprite = setSprite;
exports.loadTextureAsync = loadTextureAsync;
exports.updateTexture = updateTexture;
exports.getTexturePath = getTexturePath;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _defaults = require('defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _three_utils = require('./three_utils');

var ThreeUtils = _interopRequireWildcard(_three_utils);

var velocityCoefficient = 0.1;
var rotationCoefficient = 1.0;

var vecY = new _three2['default'].Vector3(1, 0, 0);
var vecX = new _three2['default'].Vector3(0, 1, 0);
var vecZ = new _three2['default'].Vector3(0, 0, 1);

function createSphereAsync(player, callback) {
	loadTextureAsync(player, function (texture) {
		var sphere = ThreeUtils.createSphere(texture);
		callback(sphere);
	});
}

;

function rotateSphere(player) {
	if (!player.sphere) {
		return;
	}

	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecX, -(player.lx || 0) * velocityCoefficient);
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecY, (player.ly || 0) * velocityCoefficient);

	var theta = player.angle - player.lastAngle;
	ThreeUtils.rotateAroundWorldAxis(player.sphere, vecZ, theta * rotationCoefficient);
}

function setSprite(player, baseTexture, rect) {
	var frame = new PIXI.Rectangle(rect.x, rect.y, rect.width, rect.height);
	var texture = new PIXI.Texture(baseTexture, frame);

	player.sprites.actualBall.setTexture(texture);
}

function loadTextureAsync(player, callback) {
	var texturePath = getTexturePath(player);
	ThreeUtils.loadTextureAsync(texturePath, callback);
}

function updateTexture(player) {
	loadTextureAsync(player, function (texture) {
		player.sphere.material = ThreeUtils.createMaterial(texture);
	});
}

;

function getTexturePath(player) {
	var rootPath = "http://keratagpro.github.io/tagpro-balls-3d/textures/";

	var texturePath = player.team === 1 ? "planets/marsmap1k.jpg" : "planets/earthmap1k.jpg";

	return rootPath + texturePath;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./three_utils":12,"defaults":4}],12:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.createRenderer = createRenderer;
exports.addLightsToScene = addLightsToScene;
exports.createSphere = createSphere;
exports.loadTextureAsync = loadTextureAsync;
exports.createCamera = createCamera;
exports.rotateAroundWorldAxis = rotateAroundWorldAxis;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _defaults = require('defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var rotWorldMatrix;

function createRenderer(options) {
	options = (0, _defaults2['default'])(options, {
		alpha: true,
		antialias: true
	});

	return new _three2['default'].WebGLRenderer(options);
}

;

function addLightsToScene(scene, options) {
	options = (0, _defaults2['default'])(options, {
		ambientColor: 0x888888,
		color: 0xcccccc,
		position: [-200, -200, -400],
		intensity: 1
	});

	var light = new _three2['default'].AmbientLight(options.ambientColor);
	scene.add(light);

	var light = new _three2['default'].DirectionalLight(options.hex, options.intensity);
	light.position.set.apply(light.position, options.position);

	scene.add(light);
}

function createSphere(texture) {
	options = {
		radius: 19,
		widthSegments: 16,
		heightSegments: 12
	};

	var geometry = new _three2['default'].SphereGeometry(options.radius, options.widthSegments, options.heightSegments);

	var material = new _three2['default'].MeshPhongMaterial({
		shading: _three2['default'].SmoothShading,
		map: texture
	});

	return new _three2['default'].Mesh(geometry, material);
}

;

function loadTextureAsync(texturePath, callback) {
	_three2['default'].ImageUtils.loadTexture(texturePath, undefined, function (texture) {
		texture.anisotropy = 1;
		texture.minFilter = _three2['default'].LinearFilter;

		callback(texture);
	});
}

;

function createCamera(options) {
	options = (0, _defaults2['default'])(options, {
		width: 400,
		height: 400
	});

	var camera = new _three2['default'].OrthographicCamera(-options.width / 2, options.width / 2, -options.height / 2, options.height / 2, 1, 1000);

	camera.position.z = 900;

	// camera.up = new THREE.Vector3(0, 1, 0);
	camera.lookAt(new _three2['default'].Vector3(0, 0, 0));

	camera.position.x = options.width / 2;
	camera.position.y = options.height / 2;

	return camera;
}

// Rotate an object around an arbitrary axis in world space      

function rotateAroundWorldAxis(object, axis, radians) {
	if (radians === 0 || isNaN(radians)) {
		return;
	}

	rotWorldMatrix = new _three2['default'].Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"defaults":4,"object-assign":7}]},{},[8]);
