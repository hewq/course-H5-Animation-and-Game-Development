"use strict";
cc._RF.push(module, 'ab4d4zA9S9AHpbVjxqbAV6I', 'GAFBoot');
// frameworks/cocos2d-html5/external/gaf/GAFBoot.js

'use strict';

var gaf = gaf || {};
gaf._tmp = gaf._tmp || {};
gaf._initialized = false;

gaf.CCGAFLoader = function () {
    this.load = function (realUrl, url, item, cb) {
        if (!gaf._initialized) {
            gaf._setup();
        }
        var loader = new gaf.Loader();
        loader.LoadFile(realUrl, function (data) {
            cb(null, data);
        });
    };
};

gaf._setup = function () {
    gaf._setupShaders();
    gaf._initialized = true;
};

cc.loader.register('.gaf', new gaf.CCGAFLoader());

cc._RF.pop();