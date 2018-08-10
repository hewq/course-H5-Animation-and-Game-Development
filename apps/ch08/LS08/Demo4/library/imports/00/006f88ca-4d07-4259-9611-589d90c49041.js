"use strict";
cc._RF.push(module, '006f8jKTQdCWZYRWJ2QxJBB', 'CCSimplePool');
// frameworks/cocos2d-html5/cocos2d/core/utils/CCSimplePool.js

"use strict";

/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.

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

cc.SimplePool = function () {
    this._pool = [];
};
cc.SimplePool.prototype = {
    constructor: cc.SimplePool,

    size: function size() {
        return this._pool.length;
    },

    put: function put(obj) {
        if (obj && this._pool.indexOf(obj) === -1) {
            this._pool.unshift(obj);
        }
    },

    get: function get() {
        var last = this._pool.length - 1;
        if (last < 0) {
            return null;
        } else {
            var obj = this._pool[last];
            this._pool.length = last;
            return obj;
        }
    },

    find: function find(finder, end) {
        var found,
            i,
            obj,
            pool = this._pool,
            last = pool.length - 1;
        for (i = pool.length; i >= 0; --i) {
            obj = pool[i];
            found = finder(i, obj);
            if (found) {
                pool[i] = pool[last];
                pool.length = last;
                return obj;
            }
        }
        if (end) {
            var index = end();
            if (index >= 0) {
                pool[index] = pool[last];
                pool.length = last;
                return obj;
            }
        }
        return null;
    }
};

cc._RF.pop();