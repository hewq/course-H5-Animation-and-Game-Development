"use strict";
cc._RF.push(module, '77c67zUOxBMr5l3qkf6SDs+', 'GAFMaskProto');
// frameworks/cocos2d-html5/external/gaf/Library/GAFMaskProto.js

"use strict";

gaf._MaskProto = function (asset, mask, idRef) {
    this.getIdRef = function () {
        return idRef;
    };
    this.getMaskNodeProto = function () {
        return mask;
    };

    /*
     * Will construct GAFMask
     */
    this._gafConstruct = function () {
        var ret = new gaf.Mask(this);
        ret._init();
        return ret;
    };
};

cc._RF.pop();