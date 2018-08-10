"use strict";
cc._RF.push(module, 'fa0cb8/cUNHm7X3gRn4LDw0', 'TriggerBase');
// frameworks/cocos2d-html5/extensions/cocostudio/trigger/TriggerBase.js

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
 * Sends event by trigger manager.
 * @function
 * @param {Number} event
 */
ccs.sendEvent = function (event) {
    var triggerObjArr = ccs.triggerManager.get(event);
    if (triggerObjArr == null) return;
    for (var i = 0; i < triggerObjArr.length; i++) {
        var triObj = triggerObjArr[i];
        if (triObj != null && triObj.detect()) triObj.done();
    }
};

/**
 * Registers a trigger class to objectFactory type map.
 * @param {String} className
 * @param {function} func
 */
ccs.registerTriggerClass = function (className, func) {
    new ccs.TInfo(className, func);
};

cc._RF.pop();