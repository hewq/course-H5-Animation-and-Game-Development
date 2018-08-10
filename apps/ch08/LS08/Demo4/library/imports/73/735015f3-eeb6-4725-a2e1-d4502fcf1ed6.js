"use strict";
cc._RF.push(module, '73501Xz7rZHJaLh1FAvzx7W', 'CCInvocation');
// frameworks/cocos2d-html5/extensions/gui/control-extension/CCInvocation.js

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

/**
 * An Invocation class
 * @class
 * @extends cc.Class
 */
cc.Invocation = cc.Class.extend( /** @lends cc.Invocation# */{
    _action: null,
    _target: null,
    _controlEvent: null,

    ctor: function ctor(target, action, controlEvent) {
        this._target = target;
        this._action = action;
        this._controlEvent = controlEvent;
    },

    getAction: function getAction() {
        return this._action;
    },

    getTarget: function getTarget() {
        return this._target;
    },

    getControlEvent: function getControlEvent() {
        return this._controlEvent;
    },

    invoke: function invoke(sender) {
        if (this._target && this._action) {
            if (cc.isString(this._action)) {
                this._target[this._action](sender, this._controlEvent);
            } else {
                this._action.call(this._target, sender, this._controlEvent);
            }
        }
    }
});

cc._RF.pop();