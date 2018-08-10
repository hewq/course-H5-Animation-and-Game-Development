"use strict";
cc._RF.push(module, '6579cXiuwRFxKFUXis0xH+J', 'CCProtectedNodeWebGLRenderCmd');
// frameworks/cocos2d-html5/extensions/ccui/base-classes/CCProtectedNodeWebGLRenderCmd.js

"use strict";

/****************************************************************************
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

(function () {
    if (!cc.Node.WebGLRenderCmd) return;
    cc.ProtectedNode.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
    };

    var proto = cc.ProtectedNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cc.inject(cc.ProtectedNode.RenderCmd, proto);
    proto.constructor = cc.ProtectedNode.WebGLRenderCmd;
    proto._pNodeCmdCtor = cc.ProtectedNode.WebGLRenderCmd;

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);

        var i,
            len,
            locChildren = this._node._protectedChildren;
        if (recursive && locChildren && locChildren.length !== 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                locChildren[i]._renderCmd.transform(this, recursive);
            }
        }
    };

    proto.pNodeTransform = proto.transform;
})();

cc._RF.pop();