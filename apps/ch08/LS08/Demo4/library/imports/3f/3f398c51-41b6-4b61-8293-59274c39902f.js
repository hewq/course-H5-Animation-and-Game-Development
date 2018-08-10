"use strict";
cc._RF.push(module, '3f398xRQbZLYYKTWSdMOZAv', 'jsb_apis');
// frameworks/cocos2d-html5/jsb_apis.js

"use strict";

/****************************************************************************
 Copyright (c) 2014 Chukong Technologies Inc.

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
 * The namespace for jsb exclusive APIs, all APIs in this namespace should never be used in Web engine.
 * So please check whether the running environment is native or not before any usage.
 * @namespace
 * @name jsb
 * @example
 *
 * if(cc.sys.isNative) {
 *     cc.log(cc.fileUtils.fullPathForFilename("test.js"));
 * }
 */
var jsb = jsb || {};

/**
 * ATTENTION: USE jsb.fileUtils INSTEAD OF jsb.FileUtils.<br/>
 * jsb.fileUtils is the native file utils' singleton object,<br/>
 * please refer to Cocos2d-x's API to know how to use it.<br/>
 * Only available in JSB
 * @class
 * @name jsb.fileUtils
 * @extend cc.Class
 */
jsb.fileUtils = /** @lends jsb.fileUtils# */{

  /**
   * @function fullPathForFilename
   * @param {String} arg0
   * @return {String}
   */
  fullPathForFilename: function fullPathForFilename(str) {
    return;
  },

  /**
   * @function getStringFromFile
   * @param {String} arg0
   * @return {String}
   */
  getStringFromFile: function getStringFromFile(str) {
    return;
  },

  /**
   * @function removeFile
   * @param {String} arg0
   * @return {bool}
   */
  removeFile: function removeFile(str) {
    return false;
  },

  /**
   * @function isAbsolutePath
   * @param {String} arg0
   * @return {bool}
   */
  isAbsolutePath: function isAbsolutePath(str) {
    return false;
  },

  /**
   * @function renameFile
   * @param {String} arg0
   * @param {String} arg1
   * @param {String} arg2
   * @return {bool}
   */
  renameFile: function renameFile(arg0, arg1, arg2) {
    return false;
  },

  /**
   * @function loadFilenameLookupDictionaryFromFile
   * @param {String} arg0
   */
  loadFilenameLookupDictionaryFromFile: function loadFilenameLookupDictionaryFromFile(str) {},

  /**
   * @function isPopupNotify
   * @return {bool}
   */
  isPopupNotify: function isPopupNotify() {
    return false;
  },

  /**
   * @function getValueVectorFromFile
   * @param {String} arg0
   * @return {Array}
   */
  getValueVectorFromFile: function getValueVectorFromFile(str) {
    return new Array();
  },

  /**
   * @function getSearchPaths
   * @return {Array}
   */
  getSearchPaths: function getSearchPaths() {
    return new Array();
  },

  /**
   * @function writeToFile
   * @param {map_object} arg0
   * @param {String} arg1
   * @return {bool}
   */
  writeToFile: function writeToFile(map, str) {
    return false;
  },

  /**
   * @function getValueMapFromFile
   * @param {String} arg0
   * @return {map_object}
   */
  getValueMapFromFile: function getValueMapFromFile(str) {
    return map_object;
  },

  /**
   * @function getFileSize
   * @param {String} arg0
   * @return {long}
   */
  getFileSize: function getFileSize(str) {
    return 0;
  },

  /**
   * @function removeDirectory
   * @param {String} arg0
   * @return {bool}
   */
  removeDirectory: function removeDirectory(str) {
    return false;
  },

  /**
   * @function setSearchPaths
   * @param {Array} arg0
   */
  setSearchPaths: function setSearchPaths(array) {},

  /**
   * @function writeStringToFile
   * @param {String} arg0
   * @param {String} arg1
   * @return {bool}
   */
  writeStringToFile: function writeStringToFile(arg0, arg1) {
    return false;
  },

  /**
   * @function setSearchResolutionsOrder
   * @param {Array} arg0
   */
  setSearchResolutionsOrder: function setSearchResolutionsOrder(array) {},

  /**
   * @function addSearchResolutionsOrder
   * @param {String} arg0
   */
  addSearchResolutionsOrder: function addSearchResolutionsOrder(str) {},

  /**
   * @function addSearchPath
   * @param {String} arg0
   */
  addSearchPath: function addSearchPath(str) {},

  /**
   * @function isFileExist
   * @param {String} arg0
   * @return {bool}
   */
  isFileExist: function isFileExist(str) {
    return false;
  },

  /**
   * @function purgeCachedEntries
   */
  purgeCachedEntries: function purgeCachedEntries() {},

  /**
   * @function fullPathFromRelativeFile
   * @param {String} arg0
   * @param {String} arg1
   * @return {String}
   */
  fullPathFromRelativeFile: function fullPathFromRelativeFile(arg0, arg1) {
    return;
  },

  /**
   * @function isDirectoryExist
   * @param {String} arg0
   * @return {bool}
   */
  isDirectoryExist: function isDirectoryExist(str) {
    return false;
  },

  /**
   * @function getSearchResolutionsOrder
   * @return {Array}
   */
  getSearchResolutionsOrder: function getSearchResolutionsOrder() {
    return new Array();
  },

  /**
   * @function createDirectory
   * @param {String} arg0
   * @return {bool}
   */
  createDirectory: function createDirectory(str) {
    return false;
  },

  /**
   * @function createDirectories
   * @param {String} arg0
   * @return {bool}
   */
  createDirectories: function createDirectories(str) {
    return false;
  },

  /**
   * @function getWritablePath
   * @return {String}
   */
  getWritablePath: function getWritablePath() {
    return;
  }

};

/**
 * @class
 */
jsb.EventAssetsManager = cc.Class.extend( /** @lends jsb.EventAssetsManager# */{

  /**
   * @function getAssetsManager
   * @return {cc.AssetsManager}
   */
  getAssetsManager: function getAssetsManager() {
    return cc.AssetsManager;
  },

  /**
   * @function getAssetId
   * @return {String}
   */
  getAssetId: function getAssetId() {
    return;
  },

  /**
   * @function getCURLECode
   * @return {int}
   */
  getCURLECode: function getCURLECode() {
    return 0;
  },

  /**
   * @function getMessage
   * @return {String}
   */
  getMessage: function getMessage() {
    return;
  },

  /**
   * @function getCURLMCode
   * @return {int}
   */
  getCURLMCode: function getCURLMCode() {
    return 0;
  },

  /**
   * @function getPercentByFile
   * @return {float}
   */
  getPercentByFile: function getPercentByFile() {
    return 0;
  },

  /**
   * @function getEventCode
   * @return {number} cc.EventAssetsManager.EventCode
   */
  getEventCode: function getEventCode() {
    return 0;
  },

  /**
   * @function getPercent
   * @return {float}
   */
  getPercent: function getPercent() {
    return 0;
  },

  /**
   * @function EventAssetsManager
   * @constructor
   * @param {String} arg0
   * @param {cc.AssetsManager} arg1
   * @param {number} arg2 cc.EventAssetsManager::EventCode
   * @param {float} arg3
   * @param {float} arg4
   * @param {String} arg5
   * @param {String} arg6
   * @param {int} arg7
   * @param {int} arg8
   */
  EventAssetsManager: function EventAssetsManager(arg0, assetsmanager, eventcode, arg3, arg4, arg5, arg6, arg7, arg8) {}
});

/**
 * @class
 */
jsb.EventListenerAssetsManager = cc.Class.extend( /** @lends jsb.EventListenerAssetsManager# */{

  /**
   * @function init
   * @param {cc.AssetsManager} arg0
   * @param {function} arg1
   * @return {bool}
   */
  init: function init(assetsmanager, func) {
    return false;
  },

  /**
   * @function create
   * @param {cc.AssetsManager} arg0
   * @param {function} arg1
   * @return {cc.EventListenerAssetsManager}
   */
  create: function create(assetsmanager, func) {
    return cc.EventListenerAssetsManager;
  },

  /**
   * @function EventListenerAssetsManager
   * @constructor
   */
  EventListenerAssetsManager: function EventListenerAssetsManager() {}

});

/**
 * @class
 * jsb.AssetsManager is the native AssetsManager for your game resources or scripts.
 * please refer to this document to know how to use it: http://www.cocos2d-x.org/docs/manual/framework/html5/v3/assets-manager/en
 * Only available in JSB
 */
jsb.AssetsManager = cc.Class.extend( /** @lends jsb.AssetsManager# */{

  /**
   * @function getState
   * @return {number} jsb.AssetsManager::State
   */
  getState: function getState() {
    return 0;
  },

  /**
   * @function checkUpdate
   */
  checkUpdate: function checkUpdate() {},

  /**
   * @function getStoragePath
   * @return {String}
   */
  getStoragePath: function getStoragePath() {
    return;
  },

  /**
   * @function update
   */
  update: function update() {},

  /**
   * @function getLocalManifest
   * @return {object} jsb.Manifest
   */
  getLocalManifest: function getLocalManifest() {
    return cc.Manifest;
  },

  /**
   * @function getRemoteManifest
   * @return {jsb.Manifest}
   */
  getRemoteManifest: function getRemoteManifest() {
    return cc.Manifest;
  },

  /**
   * @function downloadFailedAssets
   */
  downloadFailedAssets: function downloadFailedAssets() {},

  /**
   * @function create
   * @param {String} arg0
   * @param {String} arg1
   * @return {jsb.AssetsManager}
   */
  create: function create(arg0, arg1) {
    return cc.AssetsManager;
  },

  /**
   * @function AssetsManager
   * @constructor
   * @param {String} arg0
   * @param {String} arg1
   */
  ctor: function ctor(arg0, arg1) {}

});

/**
 * @class
 */
jsb.Manifest = cc.Class.extend( /** @lends jsb.Manifest# */{

  /**
   * @function getManifestFileUrl
   * @return {String}
   */
  getManifestFileUrl: function getManifestFileUrl() {
    return;
  },

  /**
   * @function isVersionLoaded
   * @return {bool}
   */
  isVersionLoaded: function isVersionLoaded() {
    return false;
  },

  /**
   * @function isLoaded
   * @return {bool}
   */
  isLoaded: function isLoaded() {
    return false;
  },

  /**
   * @function getPackageUrl
   * @return {String}
   */
  getPackageUrl: function getPackageUrl() {
    return;
  },

  /**
   * @function getVersion
   * @return {String}
   */
  getVersion: function getVersion() {
    return;
  },

  /**
   * @function getVersionFileUrl
   * @return {String}
   */
  getVersionFileUrl: function getVersionFileUrl() {
    return;
  }
});

/**
 * jsb.reflection is a bridge to let you invoke Java static functions.
 * please refer to this document to know how to use it: http://www.cocos2d-x.org/docs/manual/framework/html5/v3/reflection/en
 * Only available on iOS/Mac/Android platform
 * @class
 * @name jsb.reflection
 */
jsb.reflection = /** @lends jsb.reflection# */{
  /**
   * @function
   */
  callStaticMethod: function callStaticMethod() {}
};

cc._RF.pop();