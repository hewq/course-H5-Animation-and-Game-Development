"use strict";
cc._RF.push(module, '4d667UDDo9L0pax8ATaxqXc', 'CCBKeyframe');
// frameworks/cocos2d-html5/extensions/ccb-reader/CCBKeyframe.js

"use strict";

/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

cc.BuilderKeyframe = cc.Class.extend({
    _value: null,
    _time: 0,
    _easingType: 0,
    _easingOpt: 0,

    getValue: function getValue() {
        return this._value;
    },
    setValue: function setValue(value) {
        this._value = value;
    },

    getTime: function getTime() {
        return this._time;
    },
    setTime: function setTime(time) {
        this._time = time;
    },

    getEasingType: function getEasingType() {
        return this._easingType;
    },
    setEasingType: function setEasingType(easingType) {
        this._easingType = easingType;
    },

    getEasingOpt: function getEasingOpt() {
        return this._easingOpt;
    },
    setEasingOpt: function setEasingOpt(easingOpt) {
        this._easingOpt = easingOpt;
    }
});

cc._RF.pop();