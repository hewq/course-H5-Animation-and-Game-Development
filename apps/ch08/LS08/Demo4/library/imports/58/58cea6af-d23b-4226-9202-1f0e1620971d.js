"use strict";
cc._RF.push(module, '58ceaav0jtCJpICHw4WIJcd', 'CCComponent');
// frameworks/cocos2d-html5/extensions/cocostudio/components/CCComponent.js

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
 * The base class of component in CocoStudio
 * @class
 * @extends cc.Class
 */
cc.Component = cc.Class.extend( /** @lends cc.Component# */{
  _owner: null,
  _name: "",
  _enabled: true,

  /**
   * Construction of cc.Component
   */
  ctor: function ctor() {
    this._owner = null;
    this._name = "";
    this._enabled = true;
  },

  /**
   * Initializes a cc.Component.
   * @returns {boolean}
   */
  init: function init() {
    return true;
  },

  /**
   * The callback when a component enter stage.
   */
  onEnter: function onEnter() {},

  /**
   * The callback when a component exit stage.
   */
  onExit: function onExit() {},

  /**
   * The callback per every frame if it schedules update.
   * @param delta
   */
  update: function update(delta) {},

  /**
   * Serialize a component object.
   * @param reader
   */
  serialize: function serialize(reader) {},

  /**
   * Returns component whether is enabled.
   * @returns {boolean}
   */
  isEnabled: function isEnabled() {
    return this._enabled;
  },

  /**
   * Sets component whether is enabled.
   * @param enable
   */
  setEnabled: function setEnabled(enable) {
    this._enabled = enable;
  },

  /**
   * Returns the name of cc.Component.
   * @returns {string}
   */
  getName: function getName() {
    return this._name;
  },

  /**
   * Sets the name to cc.Component.
   * @param {String} name
   */
  setName: function setName(name) {
    this._name = name;
  },

  /**
   * Sets the owner to cc.Component.
   * @param owner
   */
  setOwner: function setOwner(owner) {
    this._owner = owner;
  },

  /**
   * Returns the owner of cc.Component.
   * @returns {*}
   */
  getOwner: function getOwner() {
    return this._owner;
  }
});

/**
 * Allocates and initializes a component.
 * @deprecated since v3.0, please use new construction instead.
 * @return {cc.Component}
 */
cc.Component.create = function () {
  return new cc.Component();
};

cc._RF.pop();