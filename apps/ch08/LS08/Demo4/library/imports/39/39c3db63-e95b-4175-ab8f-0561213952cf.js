"use strict";
cc._RF.push(module, '39c3dtj6VtBdauPBWEhOVLP', 'TriggerObj');
// frameworks/cocos2d-html5/extensions/cocostudio/trigger/TriggerObj.js

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
 * The base class of trigger condition.
 * @class
 * @extends ccs.Class
 */
ccs.BaseTriggerCondition = ccs.Class.extend( /** @lends ccs.BaseTriggerCondition# */{
    /**
     * Construction of ccs.BaseTriggerCondition
     */
    ctor: function ctor() {},

    /**
     * initializes a BaseTriggerCondition class.
     * @returns {boolean}
     */
    init: function init() {
        return true;
    },

    /**
     * Detects trigger condition
     * @returns {boolean}
     */
    detect: function detect() {
        return true;
    },

    /**
     * Serialize a BaseTriggerCondition object.
     * @param jsonVal
     */
    serialize: function serialize(jsonVal) {},

    /**
     * Removes all condition
     */
    removeAll: function removeAll() {}
});

/**
 * The base class of trigger action
 * @class
 * @extends ccs.Class
 */
ccs.BaseTriggerAction = ccs.Class.extend( /** @lends ccs.BaseTriggerAction# */{
    /**
     * Construction of ccs.BaseTriggerAction
     */
    ctor: function ctor() {},

    /**
     * Initializes a BaseTriggerAction object.
     * @returns {boolean}
     */
    init: function init() {
        return true;
    },

    /**
     * Sets the action to done.
     */
    done: function done() {},

    /**
     * Serializes a ccs.BaseTriggerAction object.
     * @param jsonVal
     */
    serialize: function serialize(jsonVal) {},

    /**
     * Removes all actions.
     */
    removeAll: function removeAll() {}
});

/**
 * The trigger object of Cocostudio.
 * @class
 * @extends ccs.Class
 */
ccs.TriggerObj = ccs.Class.extend( /** @lends ccs.TriggerObj# */{
    _cons: null,
    _acts: null,
    _id: 0,
    _enable: true,
    _vInt: null,

    ctor: function ctor() {
        this._id = 0;
        this._enable = true;

        ccs.TriggerObj.prototype.init.call(this);
    },

    /**
     * Initializes a ccs.TriggerObj
     * @returns {boolean}
     */
    init: function init() {
        this._cons = [];
        this._acts = [];
        this._vInt = [];
        return true;
    },

    /**
     * Detects trigger's conditions.
     * @returns {boolean}
     */
    detect: function detect() {
        if (!this._enable || this._cons.length === 0) {
            return true;
        }
        var ret = true;
        var obj = null;
        for (var i = 0; i < this._cons.length; i++) {
            obj = this._cons[i];
            if (obj && obj.detect) ret = ret && obj.detect();
        }
        return ret;
    },

    /**
     * Sets trigger's actions to done.
     */
    done: function done() {
        if (!this._enable || this._acts.length === 0) return;
        var obj;
        for (var i = 0; i < this._acts.length; i++) {
            obj = this._acts[i];
            if (obj && obj.done) obj.done();
        }
    },

    /**
     * Removes all condition and actions from ccs.TriggerObj.
     */
    removeAll: function removeAll() {
        var obj = null;
        for (var i = 0; i < this._cons.length; i++) {
            obj = this._cons[i];
            if (obj) obj.removeAll();
        }
        this._cons = [];
        for (var i = 0; i < this._acts.length; i++) {
            obj = this._acts[i];
            if (obj) obj.removeAll();
        }
        this._acts = [];
    },

    /**
     * Serializes ccs.TriggerObj
     * @param jsonVal
     */
    serialize: function serialize(jsonVal) {
        this._id = jsonVal["id"] || 0;
        var conditions = jsonVal["conditions"] || [];
        for (var i = 0; i < conditions.length; i++) {
            var subDict = conditions[i];
            var classname = subDict["classname"];
            var con = ccs.objectFactory.createObject(classname);
            if (!con) {
                cc.log("class named classname(" + classname + ") can not implement!");
                continue;
            }

            con.serialize(subDict);
            con.init();
            this._cons.push(con);
        }

        var actions = jsonVal["actions"] || [];
        for (var i = 0; i < actions.length; i++) {
            var subDict = actions[i];
            var classname = subDict["classname"];
            var act = ccs.objectFactory.createObject(classname);
            if (!act) {
                cc.log("class named classname(" + classname + ") can not implement!");
                continue;
            }

            act.serialize(subDict);
            act.init();
            this._acts.push(act);
        }

        var events = jsonVal["events"] || [];
        for (var i = 0; i < events.length; i++) {
            var subDict = events[i];
            var event = subDict["id"];
            if (event < 0) {
                continue;
            }
            this._vInt.push(event);
        }
    },

    /**
     * Returns the id of ccs.TriggerObj.
     * @returns {number}
     */
    getId: function getId() {
        return this._id;
    },

    /**
     * Sets enable value.
     * @param {Boolean} enable
     */
    setEnable: function setEnable(enable) {
        this._enable = enable;
    },

    /**
     * Returns the events of ccs.TriggerObj.
     * @returns {null|Array}
     */
    getEvents: function getEvents() {
        return this._vInt;
    }
});

ccs.TriggerObj.create = function () {
    return new ccs.TriggerObj();
};

cc._RF.pop();