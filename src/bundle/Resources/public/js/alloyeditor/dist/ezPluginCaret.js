!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ezPluginCaret=t():(e.eZ=e.eZ||{},e.eZ.ezAlloyEditor=e.eZ.ezAlloyEditor||{},e.eZ.ezAlloyEditor.ezPluginCaret=t())}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=56)}({56:function(e,t,n){"use strict";!function(e){if(!CKEDITOR.plugins.get("ezcaret")){var t=function(e,t){var n=e.createRange();n.moveToPosition(t,CKEDITOR.POSITION_AFTER_START),e.getSelection().selectRanges([n])},n=function e(t){var n=t.getChild(0);return n&&n.type!==CKEDITOR.NODE_TEXT?e(n):t};CKEDITOR.plugins.add("ezcaret",{init:function(e){e.eZ=e.eZ||{},e.eZ.moveCaretToElement=t,e.eZ.findCaretElement=n}})}}(window)}}).default});
//# sourceMappingURL=ezPluginCaret.js.map