"use strict";
cc._RF.push(module, '86cf0mvjWpOFq6ou8jlVDhH', 'jsb_property_impls');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/jsb_property_impls.js

"use strict";

/*
 * Copyright (c) 2014-2016 Chukong Technologies Inc.
 * Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function _safeExtend(obj, list) {
    for (var key in list) {
        if (!obj[key]) obj[key] = list[key];
    }
}
function _forceExtend(obj, list) {
    for (var key in list) {
        obj[key] = list[key];
    }
}

function _customUndefined(message) {
    return function () {
        cc.log("Not implemented yet in JSB");
        message && cc.log(message);
        return undefined;
    };
}

var _undefined = {
    _jsbUndefined: function _jsbUndefined(message) {
        cc.log("Not implemented yet in JSB");
        return undefined;
    },
    _shadowUndefined: _customUndefined("Please use enableShadow function"),
    _strokeUndefined: _customUndefined("Please use enableStroke function")
};

_safeExtend(cc.Node.prototype, {
    _getWidth: function _getWidth() {
        return this.getContentSize().width;
    },
    _getHeight: function _getHeight() {
        return this.getContentSize().height;
    },

    _setWidth: function _setWidth(width) {
        this.setContentSize(width, this.getContentSize().height);
    },
    _setHeight: function _setHeight(height) {
        this.setContentSize(this.getContentSize().width, height);
    },

    _getAnchorX: function _getAnchorX() {
        return this.getAnchorPoint().x;
    },
    _getAnchorY: function _getAnchorY() {
        return this.getAnchorPoint().y;
    },

    _setAnchorX: function _setAnchorX(x) {
        this.setAnchorPoint(cc.p(x, this.getAnchorPoint().y));
    },
    _setAnchorY: function _setAnchorY(y) {
        this.setAnchorPoint(cc.p(this.getAnchorPoint().x, y));
    }
});

_safeExtend(cc.LabelTTF.prototype, {
    _fontStyleRE: /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/,

    _getFont: function _getFont() {
        var size = this.getFontSize();
        var name = this.getFontName();
        return size + "px '" + name + "'";
    },

    _setFont: function _setFont(fontStyle) {
        var res = this._fontStyleRE.exec(fontStyle);
        if (res) {
            this.setFontSize(parseInt(res[1]));
            this.setFontName(res[2]);
        }
    },

    _getBoundingWidth: function _getBoundingWidth() {
        return this.getDimensions().width;
    },
    _getBoundingHeight: function _getBoundingHeight() {
        return this.getDimensions().height;
    },

    _setBoundingWidth: function _setBoundingWidth(w) {
        var size = cc.size(w, this.getDimensions().height);
        this.setDimensions(size);
    },
    _setBoundingHeight: function _setBoundingHeight(h) {
        var size = cc.size(this.getDimensions().width, h);
        this.setDimensions(size);
    },

    _getFillStyle: _undefined._jsbUndefined,
    _getStrokeStyle: _undefined._strokeUndefined,
    _setStrokeStyle: _undefined._strokeUndefined,
    _getLineWidth: _undefined._strokeUndefined,
    _setLineWidth: _undefined._strokeUndefined,
    _getShadowOffsetX: _undefined._shadowUndefined,
    _setShadowOffsetX: _undefined._shadowUndefined,
    _getShadowOffsetY: _undefined._shadowUndefined,
    _setShadowOffsetY: _undefined._shadowUndefined,
    _getShadowOpacity: _undefined._shadowUndefined,
    _setShadowOpacity: _undefined._shadowUndefined,
    _getShadowBlur: _undefined._shadowUndefined,
    _setShadowBlur: _undefined._shadowUndefined
});

_safeExtend(cc.Sprite.prototype, {
    _getOffsetX: function _getOffsetX() {
        return this.getOffsetPosition().x;
    },
    _getOffsetY: function _getOffsetY() {
        return this.getOffsetPosition().y;
    }
});

_safeExtend(cc.LabelBMFont.prototype, {
    _getAlignment: _undefined._jsbUndefined,
    _getBoundingWidth: _undefined._jsbUndefined,
    setBoundingWidth: function setBoundingWidth(width) {
        this.setWidth(width);
    }
});

_safeExtend(cc.TMXLayer.prototype, {
    _getLayerWidth: function _getLayerWidth() {
        return this.getLayerSize().width;
    },
    _getLayerHeight: function _getLayerHeight() {
        return this.getLayerSize().height;
    },

    _setLayerWidth: function _setLayerWidth(w) {
        var size = cc.size(w, this.getLayerSize().height);
        this.setLayerSize(size);
    },
    _setLayerHeight: function _setLayerHeight(h) {
        var size = cc.size(this.getLayerSize().width, h);
        this.setLayerSize(size);
    },

    _getTileWidth: function _getTileWidth() {
        return this.getMapTileSize().width;
    },
    _getTileHeight: function _getTileHeight() {
        return this.getMapTileSize().height;
    },

    _setTileWidth: function _setTileWidth(w) {
        var size = cc.size(w, this.getMapTileSize().height);
        this.setMapTileSize(size);
    },
    _setTileHeight: function _setTileHeight(h) {
        var size = cc.size(this.getMapTileSize().width, h);
        this.setMapTileSize(size);
    }
});

_safeExtend(cc.TMXTiledMap.prototype, {
    _getMapWidth: function _getMapWidth() {
        return this.getMapSize().width;
    },
    _getMapHeight: function _getMapHeight() {
        return this.getMapSize().height;
    },

    _setMapWidth: function _setMapWidth(w) {
        var size = cc.size(w, this.getMapSize().height);
        this.setMapSize(size);
    },
    _setMapHeight: function _setMapHeight(h) {
        var size = cc.size(this.getMapSize().width, h);
        this.setMapSize(size);
    },

    _getTileWidth: function _getTileWidth() {
        return this.getTileSize().width;
    },
    _getTileHeight: function _getTileHeight() {
        return this.getTileSize().height;
    },

    _setTileWidth: function _setTileWidth(w) {
        var size = cc.size(w, this.getTileSize().height);
        this.setTileSize(size);
    },
    _setTileHeight: function _setTileHeight(h) {
        var size = cc.size(this.getTileSize().width, h);
        this.setTileSize(size);
    }
});

_safeExtend(cc.Texture2D.prototype, {
    _getWidth: function _getWidth() {
        return this.getContentSize().width;
    },
    _getHeight: function _getHeight() {
        return this.getContentSize().height;
    }
});

cc._RF.pop();