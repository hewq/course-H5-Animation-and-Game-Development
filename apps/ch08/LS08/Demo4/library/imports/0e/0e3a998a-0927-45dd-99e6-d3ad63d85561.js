"use strict";
cc._RF.push(module, '0e3a9mKCSdF3Znm061j2FVh', 'UIRelativeBox');
// frameworks/cocos2d-html5/extensions/ccui/layouts/UIRelativeBox.js

"use strict";

/****************************************************************************
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
 * The Relative box for Cocos UI layout.  Its layout type is ccui.Layout.RELATIVE.
 * @class
 * @extends ccui.Layout
 */
ccui.RelativeBox = ccui.Layout.extend( /** @lends ccui.RelativeBox# */{
  /**
   * The constructor of ccui.RelativeBox
   * @function
   * @param {cc.Size} [size]
   */
  ctor: function ctor(size) {
    ccui.Layout.prototype.ctor.call(this);
    this.setLayoutType(ccui.Layout.RELATIVE);

    if (size) {
      this.setContentSize(size);
    }
  }
});

/**
 * Creates a relative box
 * @deprecated  since v3.0, please use new ccui.RelativeBox(size) instead.
 * @param {cc.Size} size
 * @returns {ccui.RelativeBox}
 */
ccui.RelativeBox.create = function (size) {
  return new ccui.RelativeBox(size);
};

cc._RF.pop();