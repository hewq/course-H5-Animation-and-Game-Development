"use strict";
cc._RF.push(module, 'd0daaqXnsdJKIIZtgm87kSe', 'GAFMask');
// frameworks/cocos2d-html5/external/gaf/Library/GAFMask.js

"use strict";

gaf.Mask = gaf.Object.extend({
    _className: "GAFMask",
    _clippingNode: null,

    ctor: function ctor(gafSpriteProto) {
        this._super();
        cc.assert(gafSpriteProto, "Error! Missing mandatory parameter.");
        this._gafproto = gafSpriteProto;
    },

    _init: function _init() {
        var maskNodeProto = this._gafproto.getMaskNodeProto();
        cc.assert(maskNodeProto, "Error. Mask node for id ref " + this._gafproto.getIdRef() + " not found.");
        this._maskNode = maskNodeProto._gafConstruct();
        this._clippingNode = cc.ClippingNode.create(this._maskNode);
        this._clippingNode.setAlphaThreshold(0.5);
        this.addChild(this._clippingNode);
    },

    setExternalTransform: function setExternalTransform(affineTransform) {
        if (!cc.affineTransformEqualToTransform(this._maskNode._additionalTransform, affineTransform)) {
            this._maskNode.setAdditionalTransform(affineTransform);
        }
    },

    _getNode: function _getNode() {
        return this._clippingNode;
    }
});

cc._RF.pop();