"use strict";
cc._RF.push(module, '29e2ew3hDFHbbeDlncUABWk', 'jsb_ccui_property_impls');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/ccui/jsb_ccui_property_impls.js

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

// Override width and height getter setter
_forceExtend(ccui.Widget.prototype, {
    _getXPercent: function _getXPercent() {
        return this.getPositionPercent().x;
    },
    _getYPercent: function _getYPercent() {
        return this.getPositionPercent().y;
    },

    _setXPercent: function _setXPercent(x) {
        var p = cc.p(x, this.getPositionPercent().y);
        this.setPositionPercent(p);
    },
    _setYPercent: function _setYPercent(y) {
        var p = cc.p(this.getPositionPercent().x, y);
        this.setPositionPercent(p);
    },

    _getWidth: function _getWidth() {
        return this.getContentSize().width;
    },
    _getHeight: function _getHeight() {
        return this.getContentSize().height;
    },
    _getWidthPercent: function _getWidthPercent() {
        return this.getSizePercent().width;
    },
    _getHeightPercent: function _getHeightPercent() {
        return this.getSizePercent().height;
    },

    _setWidth: function _setWidth(w) {
        var size = cc.size(w, this.getContentSize().height);
        this.setContentSize(size);
    },
    _setHeight: function _setHeight(h) {
        var size = cc.size(this.getContentSize().width, h);
        this.setContentSize(size);
    },
    _setWidthPercent: function _setWidthPercent(w) {
        var size = cc.size(w, this.getSizePercent().height);
        this.setSizePercent(size);
    },
    _setHeightPercent: function _setHeightPercent(h) {
        var size = cc.size(this.getSizePercent().width, h);
        this.setSizePercent(size);
    }
});

_safeExtend(ccui.Button.prototype, {
    _fontStyleRE: /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/,

    _getTitleFont: function _getTitleFont() {
        var size = this.getTitleFontSize();
        var name = this.getTitleFontName();
        return size + "px '" + name + "'";
    },

    _setTitleFont: function _setTitleFont(fontStyle) {
        var res = this._fontStyleRE.exec(fontStyle);
        if (res) {
            this.setTitleFontSize(parseInt(res[1]));
            this.setTitleFontName(res[2]);
        }
    }
});

_safeExtend(ccui.Text.prototype, {
    _getBoundingWidth: function _getBoundingWidth() {
        return this.getTextAreaSize().width;
    },
    _getBoundingHeight: function _getBoundingHeight() {
        return this.getTextAreaSize().height;
    },

    _setBoundingWidth: function _setBoundingWidth(w) {
        var size = cc.size(w, this.getTextAreaSize().height);
        this.setTextAreaSize(size);
    },
    _setBoundingHeight: function _setBoundingHeight(h) {
        var size = cc.size(this.getTextAreaSize().width, h);
        this.setTextAreaSize(size);
    }
});

_safeExtend(ccui.TextField.prototype, {
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
    }
});

_safeExtend(ccui.ScrollView.prototype, {
    _getInnerWidth: function _getInnerWidth() {
        return this.getInnerContainerSize().width;
    },
    _getInnerHeight: function _getInnerHeight() {
        return this.getInnerContainerSize().height;
    },

    _setInnerWidth: function _setInnerWidth(w) {
        var size = cc.size(w, this.getInnerContainerSize().height);
        this.setInnerContainerSize(size);
    },
    _setInnerHeight: function _setInnerHeight(h) {
        var size = cc.size(this.getInnerContainerSize().width, h);
        this.setInnerContainerSize(size);
    }
});

// _safeExtend(ccui.EditBox.prototype, {
//     _setFont: function(fontStyle) {
//         var res = cc.LabelTTF.prototype._fontStyleRE.exec(fontStyle);
//         if(res) {
//             this.setFontSize(parseInt(res[1]));
//             this.setFontName(res[2]);
//         }
//     }
// });

cc._RF.pop();