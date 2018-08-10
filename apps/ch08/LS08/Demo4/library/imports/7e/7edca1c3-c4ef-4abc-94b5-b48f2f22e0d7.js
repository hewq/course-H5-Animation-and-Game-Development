"use strict";
cc._RF.push(module, '7edcaHDxO9KvJS1tI8vIuDX', 'object');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/debugger/actors/object.js

/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
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

/* -*- indent-tabs-mode: nil; js-indent-level: 2; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// const { Cu, Ci } = require("chrome");
// const { GeneratedLocation } = require("devtools/server/actors/common");
// const { DebuggerServer } = require("devtools/server/main")
// const DevToolsUtils = require("devtools/toolkit/DevToolsUtils");
// const { dbg_assert, dumpn } = DevToolsUtils;
// const PromiseDebugging = require("PromiseDebugging");

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var TYPED_ARRAY_CLASSES = ["Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "Int8Array", "Int16Array", "Int32Array", "Float32Array", "Float64Array"];

// Number of items to preview in objects, arrays, maps, sets, lists,
// collections, etc.
var OBJECT_PREVIEW_MAX_ITEMS = 10;

/**
 * Creates an actor for the specified object.
 *
 * @param obj Debugger.Object
 *        The debuggee object.
 * @param hooks Object
 *        A collection of abstract methods that are implemented by the caller.
 *        ObjectActor requires the following functions to be implemented by
 *        the caller:
 *          - createValueGrip
 *              Creates a value grip for the given object
 *          - sources
 *              TabSources getter that manages the sources of a thread
 *          - createEnvironmentActor
 *              Creates and return an environment actor
 *          - getGripDepth
 *              An actor's grip depth getter
 *          - incrementGripDepth
 *              Increment the actor's grip depth
 *          - decrementGripDepth
 *              Decrement the actor's grip depth
 *          - globalDebugObject
 *              The Debuggee Global Object as given by the ThreadActor
 */
function ObjectActor(obj, _ref) {
  var createValueGrip = _ref.createValueGrip,
      sources = _ref.sources,
      createEnvironmentActor = _ref.createEnvironmentActor,
      getGripDepth = _ref.getGripDepth,
      incrementGripDepth = _ref.incrementGripDepth,
      decrementGripDepth = _ref.decrementGripDepth,
      getGlobalDebugObject = _ref.getGlobalDebugObject;

  dbg_assert(!obj.optimizedOut, "Should not create object actors for optimized out values!");
  this.obj = obj;
  this.hooks = {
    createValueGrip: createValueGrip,
    sources: sources,
    createEnvironmentActor: createEnvironmentActor,
    getGripDepth: getGripDepth,
    incrementGripDepth: incrementGripDepth,
    decrementGripDepth: decrementGripDepth,
    getGlobalDebugObject: getGlobalDebugObject
  };
  this.iterators = new Set();
}

ObjectActor.prototype = {
  actorPrefix: "obj",

  /**
   * Returns a grip for this actor for returning in a protocol message.
   */
  grip: function grip() {
    this.hooks.incrementGripDepth();

    var g = {
      "type": "object",
      "class": this.obj.class,
      "actor": this.actorID,
      "extensible": this.obj.isExtensible(),
      "frozen": this.obj.isFrozen(),
      "sealed": this.obj.isSealed()
    };

    if (this.obj.class != "DeadObject") {
      if (this.obj.class == "Promise") {
        g.promiseState = this._createPromiseState();
      }

      // FF40+: Allow to know how many properties an object has
      // to lazily display them when there is a bunch.
      // Throws on some MouseEvent object in tests.
      try {
        // Bug 1163520: Assert on internal functions
        if (this.obj.class != "Function") {
          g.ownPropertyLength = this.obj.getOwnPropertyNames().length;
        }
      } catch (e) {}

      var raw = this.obj.unsafeDereference();

      // If Cu is not defined, we are running on a worker thread, where xrays
      // don't exist.
      // if (Cu) {
      //   raw = Cu.unwaiveXrays(raw);
      // }

      if (!DevToolsUtils.isSafeJSObject(raw)) {
        raw = null;
      }

      // let previewers = DebuggerServer.ObjectActorPreviewers[this.obj.class] ||
      //                  DebuggerServer.ObjectActorPreviewers.Object;
      // for (let fn of previewers) {
      //   try {
      //     if (fn(this, g, raw)) {
      //       break;
      //     }
      //   } catch (e) {
      //     let msg = "ObjectActor.prototype.grip previewer function";
      //     DevToolsUtils.reportException(msg, e);
      //   }
      // }
    }

    this.hooks.decrementGripDepth();
    return g;
  },

  /**
   * Returns an object exposing the internal Promise state.
   */
  _createPromiseState: function _createPromiseState() {
    var _getPromiseState = getPromiseState(this.obj),
        state = _getPromiseState.state,
        value = _getPromiseState.value,
        reason = _getPromiseState.reason;

    var promiseState = { state: state };
    var rawPromise = this.obj.unsafeDereference();

    if (state == "fulfilled") {
      promiseState.value = this.hooks.createValueGrip(value);
    } else if (state == "rejected") {
      promiseState.reason = this.hooks.createValueGrip(reason);
    }

    promiseState.creationTimestamp = Date.now() - PromiseDebugging.getPromiseLifetime(rawPromise);

    // If the promise is not settled, avoid adding the timeToSettle property
    // and catch the error thrown by PromiseDebugging.getTimeToSettle.
    try {
      promiseState.timeToSettle = PromiseDebugging.getTimeToSettle(rawPromise);
    } catch (e) {}

    return promiseState;
  },

  /**
   * Releases this actor from the pool.
   */
  release: function release() {
    var _this = this;

    if (this.registeredPool.objectActors) {
      this.registeredPool.objectActors.delete(this.obj);
    }
    this.iterators.forEach(function (actor) {
      return _this.registeredPool.removeActor(actor);
    });
    this.iterators.clear();
    this.registeredPool.removeActor(this);
  },

  /**
   * Handle a protocol request to provide the definition site of this function
   * object.
   */
  onDefinitionSite: function onDefinitionSite() {
    if (this.obj.class != "Function") {
      return {
        from: this.actorID,
        error: "objectNotFunction",
        message: this.actorID + " is not a function."
      };
    }

    if (!this.obj.script) {
      return {
        from: this.actorID,
        error: "noScript",
        message: this.actorID + " has no Debugger.Script"
      };
    }

    return this.hooks.sources().getOriginalLocation(new GeneratedLocation(this.hooks.sources().createNonSourceMappedActor(this.obj.script.source), this.obj.script.startLine, 0 // TODO bug 901138: use Debugger.Script.prototype.startColumn
    )).then(function (originalLocation) {
      return {
        source: originalLocation.originalSourceActor.form(),
        line: originalLocation.originalLine,
        column: originalLocation.originalColumn
      };
    });
  },

  /**
   * Handle a protocol request to provide the names of the properties defined on
   * the object and not its prototype.
   */
  onOwnPropertyNames: function onOwnPropertyNames() {
    return { from: this.actorID,
      ownPropertyNames: this.obj.getOwnPropertyNames() };
  },

  /**
   * Creates an actor to iterate over an object property names and values.
   * See PropertyIteratorActor constructor for more info about options param.
   *
   * @param request object
   *        The protocol request object.
   */
  onEnumProperties: function onEnumProperties(request) {
    var actor = new PropertyIteratorActor(this, request.options);
    this.registeredPool.addActor(actor);
    this.iterators.add(actor);
    return { iterator: actor.grip() };
  },

  /**
   * Handle a protocol request to provide the prototype and own properties of
   * the object.
   */
  onPrototypeAndProperties: function onPrototypeAndProperties() {
    var ownProperties = Object.create(null);
    var names = void 0;
    try {
      names = this.obj.getOwnPropertyNames();
    } catch (ex) {
      log('exception: ' + ex);
      log(ex.stack);
      // The above can throw if this.obj points to a dead object.
      // TODO: we should use Cu.isDeadWrapper() - see bug 885800.
      return { from: this.actorID,
        prototype: this.hooks.createValueGrip(null),
        ownProperties: ownProperties,
        safeGetterValues: Object.create(null) };
    }
    try {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          ownProperties[name] = this._propertyDescriptor(name);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return { from: this.actorID,
        prototype: this.hooks.createValueGrip(this.obj.proto),
        ownProperties: ownProperties,
        safeGetterValues: this._findSafeGetterValues(names) };
    } catch (ex) {
      log('exception: ' + ex);
      log(ex.stack);
    }
  },

  /**
   * Find the safe getter values for the current Debugger.Object, |this.obj|.
   *
   * @private
   * @param array ownProperties
   *        The array that holds the list of known ownProperties names for
   *        |this.obj|.
   * @param number [limit=0]
   *        Optional limit of getter values to find.
   * @return object
   *         An object that maps property names to safe getter descriptors as
   *         defined by the remote debugging protocol.
   */
  _findSafeGetterValues: function _findSafeGetterValues(ownProperties) {
    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var safeGetterValues = Object.create(null);
    var obj = this.obj;
    var level = 0,
        i = 0;

    while (obj) {
      var getters = this._findSafeGetters(obj);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = getters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var name = _step2.value;

          // Avoid overwriting properties from prototypes closer to this.obj. Also
          // avoid providing safeGetterValues from prototypes if property |name|
          // is already defined as an own property.
          if (name in safeGetterValues || obj != this.obj && ownProperties.indexOf(name) !== -1) {
            continue;
          }

          // Ignore __proto__ on Object.prototye.
          if (!obj.proto && name == "__proto__") {
            continue;
          }

          var desc = null,
              getter = null;
          try {
            desc = obj.getOwnPropertyDescriptor(name);
            getter = desc.get;
          } catch (ex) {
            // The above can throw if the cache becomes stale.
          }
          if (!getter) {
            obj._safeGetters = null;
            continue;
          }

          var result = getter.call(this.obj);
          if (result && !("throw" in result)) {
            var getterValue = undefined;
            if ("return" in result) {
              getterValue = result.return;
            } else if ("yield" in result) {
              getterValue = result.yield;
            }
            // WebIDL attributes specified with the LenientThis extended attribute
            // return undefined and should be ignored.
            if (getterValue !== undefined) {
              safeGetterValues[name] = {
                getterValue: this.hooks.createValueGrip(getterValue),
                getterPrototypeLevel: level,
                enumerable: desc.enumerable,
                writable: level == 0 ? desc.writable : true
              };
              if (limit && ++i == limit) {
                break;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (limit && i == limit) {
        break;
      }

      obj = obj.proto;
      level++;
    }

    return safeGetterValues;
  },

  /**
   * Find the safe getters for a given Debugger.Object. Safe getters are native
   * getters which are safe to execute.
   *
   * @private
   * @param Debugger.Object object
   *        The Debugger.Object where you want to find safe getters.
   * @return Set
   *         A Set of names of safe getters. This result is cached for each
   *         Debugger.Object.
   */
  _findSafeGetters: function _findSafeGetters(object) {
    if (object._safeGetters) {
      return object._safeGetters;
    }

    var getters = new Set();
    var names = [];
    try {
      names = object.getOwnPropertyNames();
    } catch (ex) {
      // Calling getOwnPropertyNames() on some wrapped native prototypes is not
      // allowed: "cannot modify properties of a WrappedNative". See bug 952093.
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var name = _step3.value;

        var desc = null;
        try {
          desc = object.getOwnPropertyDescriptor(name);
        } catch (e) {
          // Calling getOwnPropertyDescriptor on wrapped native prototypes is not
          // allowed (bug 560072).
        }
        if (!desc || desc.value !== undefined || !("get" in desc)) {
          continue;
        }

        if (DevToolsUtils.hasSafeGetter(desc)) {
          getters.add(name);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    object._safeGetters = getters;
    return getters;
  },

  /**
   * Handle a protocol request to provide the prototype of the object.
   */
  onPrototype: function onPrototype() {
    return { from: this.actorID,
      prototype: this.hooks.createValueGrip(this.obj.proto) };
  },

  /**
   * Handle a protocol request to provide the property descriptor of the
   * object's specified property.
   *
   * @param request object
   *        The protocol request object.
   */
  onProperty: function onProperty(request) {
    if (!request.name) {
      return { error: "missingParameter",
        message: "no property name was specified" };
    }

    return { from: this.actorID,
      descriptor: this._propertyDescriptor(request.name) };
  },

  /**
   * Handle a protocol request to provide the display string for the object.
   */
  onDisplayString: function onDisplayString() {
    var string = stringify(this.obj);
    return { from: this.actorID,
      displayString: this.hooks.createValueGrip(string) };
  },

  /**
   * A helper method that creates a property descriptor for the provided object,
   * properly formatted for sending in a protocol response.
   *
   * @private
   * @param string name
   *        The property that the descriptor is generated for.
   * @param boolean [onlyEnumerable]
   *        Optional: true if you want a descriptor only for an enumerable
   *        property, false otherwise.
   * @return object|undefined
   *         The property descriptor, or undefined if this is not an enumerable
   *         property and onlyEnumerable=true.
   */
  _propertyDescriptor: function _propertyDescriptor(name, onlyEnumerable) {
    var desc = void 0;
    try {
      desc = this.obj.getOwnPropertyDescriptor(name);
    } catch (e) {
      // Calling getOwnPropertyDescriptor on wrapped native prototypes is not
      // allowed (bug 560072). Inform the user with a bogus, but hopefully
      // explanatory, descriptor.
      return {
        configurable: false,
        writable: false,
        enumerable: false,
        value: e.name
      };
    }

    if (!desc || onlyEnumerable && !desc.enumerable) {
      return undefined;
    }

    var retval = {
      configurable: desc.configurable,
      enumerable: desc.enumerable
    };

    if ("value" in desc) {
      retval.writable = desc.writable;
      retval.value = this.hooks.createValueGrip(desc.value);
    } else {
      if ("get" in desc) {
        retval.get = this.hooks.createValueGrip(desc.get);
      }
      if ("set" in desc) {
        retval.set = this.hooks.createValueGrip(desc.set);
      }
    }
    return retval;
  },

  /**
   * Handle a protocol request to provide the source code of a function.
   *
   * @param request object
   *        The protocol request object.
   */
  onDecompile: function onDecompile(request) {
    if (this.obj.class !== "Function") {
      return { error: "objectNotFunction",
        message: "decompile request is only valid for object grips " + "with a 'Function' class." };
    }

    return { from: this.actorID,
      decompiledCode: this.obj.decompile(!!request.pretty) };
  },

  /**
   * Handle a protocol request to provide the parameters of a function.
   */
  onParameterNames: function onParameterNames() {
    if (this.obj.class !== "Function") {
      return { error: "objectNotFunction",
        message: "'parameterNames' request is only valid for object " + "grips with a 'Function' class." };
    }

    return { parameterNames: this.obj.parameterNames };
  },

  /**
   * Handle a protocol request to release a thread-lifetime grip.
   */
  onRelease: function onRelease() {
    this.release();
    return {};
  },

  /**
   * Handle a protocol request to provide the lexical scope of a function.
   */
  onScope: function onScope() {
    if (this.obj.class !== "Function") {
      return { error: "objectNotFunction",
        message: "scope request is only valid for object grips with a" + " 'Function' class." };
    }

    var envActor = this.hooks.createEnvironmentActor(this.obj.environment, this.registeredPool);
    if (!envActor) {
      return { error: "notDebuggee",
        message: "cannot access the environment of this function." };
    }

    return { from: this.actorID, scope: envActor.form() };
  },

  /**
   * Handle a protocol request to get the list of dependent promises of a
   * promise.
   *
   * @return object
   *         Returns an object containing an array of object grips of the
   *         dependent promises
   */
  onDependentPromises: function onDependentPromises() {
    var _this2 = this;

    if (this.obj.class != "Promise") {
      return { error: "objectNotPromise",
        message: "'dependentPromises' request is only valid for " + "object grips with a 'Promise' class." };
    }

    var rawPromise = this.obj.unsafeDereference();
    var promises = PromiseDebugging.getDependentPromises(rawPromise).map(function (p) {
      return _this2.hooks.createValueGrip(_this2.obj.makeDebuggeeValue(p));
    });

    return { promises: promises };
  },

  /**
   * Handle a protocol request to get the allocation stack of a promise.
   */
  onAllocationStack: function onAllocationStack() {
    if (this.obj.class != "Promise") {
      return { error: "objectNotPromise",
        message: "'allocationStack' request is only valid for " + "object grips with a 'Promise' class." };
    }

    var rawPromise = this.obj.unsafeDereference();
    var stack = PromiseDebugging.getAllocationStack(rawPromise);
    var allocationStacks = [];

    while (stack) {
      if (stack.source) {
        var source = this._getSourceOriginalLocation(stack);

        if (source) {
          allocationStacks.push(source);
        }
      }
      stack = stack.parent;
    }

    return Promise.all(allocationStacks).then(function (stacks) {
      return { allocationStack: stacks };
    });
  },

  /**
   * Handle a protocol request to get the fulfillment stack of a promise.
   */
  onFulfillmentStack: function onFulfillmentStack() {
    if (this.obj.class != "Promise") {
      return { error: "objectNotPromise",
        message: "'fulfillmentStack' request is only valid for " + "object grips with a 'Promise' class." };
    }

    var rawPromise = this.obj.unsafeDereference();
    var stack = PromiseDebugging.getFullfillmentStack(rawPromise);
    var fulfillmentStacks = [];

    while (stack) {
      if (stack.source) {
        var source = this._getSourceOriginalLocation(stack);

        if (source) {
          fulfillmentStacks.push(source);
        }
      }
      stack = stack.parent;
    }

    return Promise.all(fulfillmentStacks).then(function (stacks) {
      return { fulfillmentStack: stacks };
    });
  },

  /**
   * Handle a protocol request to get the rejection stack of a promise.
   */
  onRejectionStack: function onRejectionStack() {
    if (this.obj.class != "Promise") {
      return { error: "objectNotPromise",
        message: "'rejectionStack' request is only valid for " + "object grips with a 'Promise' class." };
    }

    var rawPromise = this.obj.unsafeDereference();
    var stack = PromiseDebugging.getRejectionStack(rawPromise);
    var rejectionStacks = [];

    while (stack) {
      if (stack.source) {
        var source = this._getSourceOriginalLocation(stack);

        if (source) {
          rejectionStacks.push(source);
        }
      }
      stack = stack.parent;
    }

    return Promise.all(rejectionStacks).then(function (stacks) {
      return { rejectionStack: stacks };
    });
  },

  /**
   * Helper function for fetching the source location of a SavedFrame stack.
   *
   * @param SavedFrame stack
   *        The promise allocation stack frame
   * @return object
   *         Returns an object containing the source location of the SavedFrame
   *         stack.
   */
  _getSourceOriginalLocation: function _getSourceOriginalLocation(stack) {
    var source = void 0;

    // Catch any errors if the source actor cannot be found
    try {
      source = this.hooks.sources().getSourceActorByURL(stack.source);
    } catch (e) {}

    if (!source) {
      return null;
    }

    return this.hooks.sources().getOriginalLocation(new GeneratedLocation(source, stack.line, stack.column)).then(function (originalLocation) {
      return {
        source: originalLocation.originalSourceActor.form(),
        line: originalLocation.originalLine,
        column: originalLocation.originalColumn,
        functionDisplayName: stack.functionDisplayName
      };
    });
  },

  /**
   * Added by minggo
   * To get the name of this object. It is used to get function name,
   * which is needed by dispalying function name in stack strace.
   */
  onName: function onName() {
    return { from: this.actorID, name: this.obj.name };
  }
};

ObjectActor.prototype.requestTypes = {
  "definitionSite": ObjectActor.prototype.onDefinitionSite,
  "parameterNames": ObjectActor.prototype.onParameterNames,
  "prototypeAndProperties": ObjectActor.prototype.onPrototypeAndProperties,
  "enumProperties": ObjectActor.prototype.onEnumProperties,
  "prototype": ObjectActor.prototype.onPrototype,
  "property": ObjectActor.prototype.onProperty,
  "displayString": ObjectActor.prototype.onDisplayString,
  "ownPropertyNames": ObjectActor.prototype.onOwnPropertyNames,
  "decompile": ObjectActor.prototype.onDecompile,
  "release": ObjectActor.prototype.onRelease,
  "scope": ObjectActor.prototype.onScope,
  "dependentPromises": ObjectActor.prototype.onDependentPromises,
  "allocationStack": ObjectActor.prototype.onAllocationStack,
  "fulfillmentStack": ObjectActor.prototype.onFulfillmentStack,
  "rejectionStack": ObjectActor.prototype.onRejectionStack,
  "name": ObjectActor.prototype.onName // added by minggo
};

/**
 * Creates an actor to iterate over an object's property names and values.
 *
 * @param objectActor ObjectActor
 *        The object actor.
 * @param options Object
 *        A dictionary object with various boolean attributes:
 *        - ignoreSafeGetters Boolean
 *          If true, do not iterate over safe getters.
 *        - ignoreIndexedProperties Boolean
 *          If true, filters out Array items.
 *          e.g. properties names between `0` and `object.length`.
 *        - ignoreNonIndexedProperties Boolean
 *          If true, filters out items that aren't array items
 *          e.g. properties names that are not a number between `0`
 *          and `object.length`.
 *        - sort Boolean
 *          If true, the iterator will sort the properties by name
 *          before dispatching them.
 *        - query String
 *          If non-empty, will filter the properties by names and values
 *          containing this query string. The match is not case-sensitive.
 *          Regarding value filtering it just compare to the stringification
 *          of the property value.
 */
function PropertyIteratorActor(objectActor, options) {
  var _this3 = this;

  this.objectActor = objectActor;

  var ownProperties = Object.create(null);
  var names = [];
  try {
    names = this.objectActor.obj.getOwnPropertyNames();
  } catch (ex) {}

  var safeGetterValues = {};
  var safeGetterNames = [];
  if (!options.ignoreSafeGetters) {
    // Merge the safe getter values into the existing properties list.
    safeGetterValues = this.objectActor._findSafeGetterValues(names);
    safeGetterNames = Object.keys(safeGetterValues);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = safeGetterNames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var name = _step4.value;

        if (names.indexOf(name) === -1) {
          names.push(name);
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  if (options.ignoreIndexedProperties || options.ignoreNonIndexedProperties) {
    var length = DevToolsUtils.getProperty(this.objectActor.obj, "length");
    if (typeof length !== "number") {
      // Pseudo arrays are flagged as ArrayLike if they have
      // subsequent indexed properties without having any length attribute.
      length = 0;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = names[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var key = _step5.value;

          if (isNaN(key) || key != length++) {
            break;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }

    if (options.ignoreIndexedProperties) {
      names = names.filter(function (i) {
        // Use parseFloat in order to reject floats...
        // (parseInt converts floats to integer)
        // (Number(str) converts spaces to 0)
        i = parseFloat(i);
        return !Number.isInteger(i) || i < 0 || i >= length;
      });
    }

    if (options.ignoreNonIndexedProperties) {
      names = names.filter(function (i) {
        i = parseFloat(i);
        return Number.isInteger(i) && i >= 0 && i < length;
      });
    }
  }

  if (options.query) {
    var query = options.query;

    query = query.toLowerCase();
    names = names.filter(function (name) {
      // Filter on attribute names
      if (name.toLowerCase().includes(query)) {
        return true;
      }
      // and then on attribute values
      var desc = void 0;
      try {
        desc = _this3.obj.getOwnPropertyDescriptor(name);
      } catch (e) {}
      if (desc && desc.value && String(desc.value).includes(query)) {
        return true;
      }
      return false;
    });
  }

  if (options.sort) {
    names.sort();
  }

  // Now build the descriptor list
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = names[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _name = _step6.value;

      var desc = this.objectActor._propertyDescriptor(_name);
      if (!desc) {
        desc = safeGetterValues[_name];
      } else if (_name in safeGetterValues) {
        // Merge the safe getter values into the existing properties list.
        var _safeGetterValues$_na = safeGetterValues[_name],
            getterValue = _safeGetterValues$_na.getterValue,
            getterPrototypeLevel = _safeGetterValues$_na.getterPrototypeLevel;

        desc.getterValue = getterValue;
        desc.getterPrototypeLevel = getterPrototypeLevel;
      }
      ownProperties[_name] = desc;
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  this.names = names;
  this.ownProperties = ownProperties;
}

PropertyIteratorActor.prototype = {
  actorPrefix: "propertyIterator",

  grip: function grip() {
    return {
      type: "propertyIterator",
      actor: this.actorID,
      count: this.names.length
    };
  },

  names: function names(_ref2) {
    var indexes = _ref2.indexes;

    var list = [];
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = indexes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var idx = _step7.value;

        list.push(this.names[idx]);
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    return {
      names: list
    };
  },

  slice: function slice(_ref3) {
    var start = _ref3.start,
        count = _ref3.count;

    var names = this.names.slice(start, start + count);
    var props = Object.create(null);
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = names[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var name = _step8.value;

        props[name] = this.ownProperties[name];
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    return {
      ownProperties: props
    };
  },

  all: function all() {
    return {
      ownProperties: this.ownProperties
    };
  }
};

PropertyIteratorActor.prototype.requestTypes = {
  "names": PropertyIteratorActor.prototype.names,
  "slice": PropertyIteratorActor.prototype.slice,
  "all": PropertyIteratorActor.prototype.all
};

/**
 * Functions for adding information to ObjectActor grips for the purpose of
 * having customized output. This object holds arrays mapped by
 * Debugger.Object.prototype.class.
 *
 * In each array you can add functions that take two
 * arguments:
 *   - the ObjectActor instance and its hooks to make a preview for,
 *   - the grip object being prepared for the client,
 *   - the raw JS object after calling Debugger.Object.unsafeDereference(). This
 *   argument is only provided if the object is safe for reading properties and
 *   executing methods. See DevToolsUtils.isSafeJSObject().
 *
 * Functions must return false if they cannot provide preview
 * information for the debugger object, or true otherwise.
 */
DebuggerServer.ObjectActorPreviewers = {
  String: [function (_ref4, grip) {
    var obj = _ref4.obj,
        hooks = _ref4.hooks;

    var result = genericObjectPreviewer("String", String, obj, hooks);
    var length = DevToolsUtils.getProperty(obj, "length");

    if (!result || typeof length != "number") {
      return false;
    }

    grip.preview = {
      kind: "ArrayLike",
      length: length
    };

    if (hooks.getGripDepth() > 1) {
      return true;
    }

    var items = grip.preview.items = [];

    var max = Math.min(result.value.length, OBJECT_PREVIEW_MAX_ITEMS);
    for (var i = 0; i < max; i++) {
      var value = hooks.createValueGrip(result.value[i]);
      items.push(value);
    }

    return true;
  }],

  Boolean: [function (_ref5, grip) {
    var obj = _ref5.obj,
        hooks = _ref5.hooks;

    var result = genericObjectPreviewer("Boolean", Boolean, obj, hooks);
    if (result) {
      grip.preview = result;
      return true;
    }

    return false;
  }],

  Number: [function (_ref6, grip) {
    var obj = _ref6.obj,
        hooks = _ref6.hooks;

    var result = genericObjectPreviewer("Number", Number, obj, hooks);
    if (result) {
      grip.preview = result;
      return true;
    }

    return false;
  }],

  Function: [function (_ref7, grip) {
    var obj = _ref7.obj,
        hooks = _ref7.hooks;

    if (obj.name) {
      grip.name = obj.name;
    }

    if (obj.displayName) {
      grip.displayName = obj.displayName.substr(0, 500);
    }

    if (obj.parameterNames) {
      grip.parameterNames = obj.parameterNames;
    }

    // Check if the developer has added a de-facto standard displayName
    // property for us to use.
    var userDisplayName = void 0;
    try {
      userDisplayName = obj.getOwnPropertyDescriptor("displayName");
    } catch (e) {
      // Calling getOwnPropertyDescriptor with displayName might throw
      // with "permission denied" errors for some functions.
      dumpn(e);
    }

    if (userDisplayName && typeof userDisplayName.value == "string" && userDisplayName.value) {
      grip.userDisplayName = hooks.createValueGrip(userDisplayName.value);
    }

    var dbgGlobal = hooks.getGlobalDebugObject();
    if (dbgGlobal) {
      var script = dbgGlobal.makeDebuggeeValue(obj.unsafeDereference()).script;
      if (script) {
        grip.location = {
          url: script.url,
          line: script.startLine
        };
      }
    }

    return true;
  }],

  RegExp: [function (_ref8, grip) {
    var obj = _ref8.obj,
        hooks = _ref8.hooks;

    // Avoid having any special preview for the RegExp.prototype itself.
    if (!obj.proto || obj.proto.class != "RegExp") {
      return false;
    }

    var str = RegExp.prototype.toString.call(obj.unsafeDereference());
    grip.displayString = hooks.createValueGrip(str);
    return true;
  }],

  Date: [function (_ref9, grip) {
    var obj = _ref9.obj,
        hooks = _ref9.hooks;

    var time = Date.prototype.getTime.call(obj.unsafeDereference());

    grip.preview = {
      timestamp: hooks.createValueGrip(time)
    };
    return true;
  }],

  Array: [function (_ref10, grip) {
    var obj = _ref10.obj,
        hooks = _ref10.hooks;

    var length = DevToolsUtils.getProperty(obj, "length");
    if (typeof length != "number") {
      return false;
    }

    grip.preview = {
      kind: "ArrayLike",
      length: length
    };

    if (hooks.getGripDepth() > 1) {
      return true;
    }

    var raw = obj.unsafeDereference();
    var items = grip.preview.items = [];

    for (var i = 0; i < length; ++i) {
      // Array Xrays filter out various possibly-unsafe properties (like
      // functions, and claim that the value is undefined instead. This
      // is generally the right thing for privileged code accessing untrusted
      // objects, but quite confusing for Object previews. So we manually
      // override this protection by waiving Xrays on the array, and re-applying
      // Xrays on any indexed value props that we pull off of it.
      var desc = Object.getOwnPropertyDescriptor(Cu.waiveXrays(raw), i);
      if (desc && !desc.get && !desc.set) {
        var value = Cu.unwaiveXrays(desc.value);
        value = makeDebuggeeValueIfNeeded(obj, value);
        items.push(hooks.createValueGrip(value));
      } else {
        items.push(null);
      }

      if (items.length == OBJECT_PREVIEW_MAX_ITEMS) {
        break;
      }
    }

    return true;
  }],

  Set: [function (_ref11, grip) {
    var obj = _ref11.obj,
        hooks = _ref11.hooks;

    var size = DevToolsUtils.getProperty(obj, "size");
    if (typeof size != "number") {
      return false;
    }

    grip.preview = {
      kind: "ArrayLike",
      length: size
    };

    // Avoid recursive object grips.
    if (hooks.getGripDepth() > 1) {
      return true;
    }

    var raw = obj.unsafeDereference();
    var items = grip.preview.items = [];
    // We currently lack XrayWrappers for Set, so when we iterate over
    // the values, the temporary iterator objects get created in the target
    // compartment. However, we _do_ have Xrays to Object now, so we end up
    // Xraying those temporary objects, and filtering access to |it.value|
    // based on whether or not it's Xrayable and/or callable, which breaks
    // the for/of iteration.
    //
    // This code is designed to handle untrusted objects, so we can safely
    // waive Xrays on the iterable, and relying on the Debugger machinery to
    // make sure we handle the resulting objects carefully.
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = Cu.waiveXrays(Set.prototype.values.call(raw))[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        var item = _step9.value;

        item = Cu.unwaiveXrays(item);
        item = makeDebuggeeValueIfNeeded(obj, item);
        items.push(hooks.createValueGrip(item));
        if (items.length == OBJECT_PREVIEW_MAX_ITEMS) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }

    return true;
  }],

  Map: [function (_ref12, grip) {
    var obj = _ref12.obj,
        hooks = _ref12.hooks;

    var size = DevToolsUtils.getProperty(obj, "size");
    if (typeof size != "number") {
      return false;
    }

    grip.preview = {
      kind: "MapLike",
      size: size
    };

    if (hooks.getGripDepth() > 1) {
      return true;
    }

    var raw = obj.unsafeDereference();
    var entries = grip.preview.entries = [];
    // Iterating over a Map via .entries goes through various intermediate
    // objects - an Iterator object, then a 2-element Array object, then the
    // actual values we care about. We don't have Xrays to Iterator objects,
    // so we get Opaque wrappers for them. And even though we have Xrays to
    // Arrays, the semantics often deny access to the entires based on the
    // nature of the values. So we need waive Xrays for the iterator object
    // and the tupes, and then re-apply them on the underlying values until
    // we fix bug 1023984.
    //
    // Even then though, we might want to continue waiving Xrays here for the
    // same reason we do so for Arrays above - this filtering behavior is likely
    // to be more confusing than beneficial in the case of Object previews.
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      for (var _iterator10 = Cu.waiveXrays(Map.prototype.entries.call(raw))[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        var keyValuePair = _step10.value;

        var key = Cu.unwaiveXrays(keyValuePair[0]);
        var value = Cu.unwaiveXrays(keyValuePair[1]);
        key = makeDebuggeeValueIfNeeded(obj, key);
        value = makeDebuggeeValueIfNeeded(obj, value);
        entries.push([hooks.createValueGrip(key), hooks.createValueGrip(value)]);
        if (entries.length == OBJECT_PREVIEW_MAX_ITEMS) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError10 = true;
      _iteratorError10 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion10 && _iterator10.return) {
          _iterator10.return();
        }
      } finally {
        if (_didIteratorError10) {
          throw _iteratorError10;
        }
      }
    }

    return true;
  }],

  DOMStringMap: [function (_ref13, grip, rawObj) {
    var obj = _ref13.obj,
        hooks = _ref13.hooks;

    if (!rawObj) {
      return false;
    }

    var keys = obj.getOwnPropertyNames();
    grip.preview = {
      kind: "MapLike",
      size: keys.length
    };

    if (hooks.getGripDepth() > 1) {
      return true;
    }

    var entries = grip.preview.entries = [];
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      for (var _iterator11 = keys[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        var key = _step11.value;

        var value = makeDebuggeeValueIfNeeded(obj, rawObj[key]);
        entries.push([key, hooks.createValueGrip(value)]);
        if (entries.length == OBJECT_PREVIEW_MAX_ITEMS) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }

    return true;
  }]
};

/**
 * Generic previewer for "simple" classes like String, Number and Boolean.
 *
 * @param string className
 *        Class name to expect.
 * @param object classObj
 *        The class to expect, eg. String. The valueOf() method of the class is
 *        invoked on the given object.
 * @param Debugger.Object obj
 *        The debugger object we need to preview.
 * @param object hooks
 *        The thread actor to use to create a value grip.
 * @return object|null
 *         An object with one property, "value", which holds the value grip that
 *         represents the given object. Null is returned if we can't preview the
 *         object.
 */
function genericObjectPreviewer(className, classObj, obj, hooks) {
  if (!obj.proto || obj.proto.class != className) {
    return null;
  }

  var raw = obj.unsafeDereference();
  var v = null;
  try {
    v = classObj.prototype.valueOf.call(raw);
  } catch (ex) {
    // valueOf() can throw if the raw JS object is "misbehaved".
    return null;
  }

  if (v !== null) {
    v = hooks.createValueGrip(makeDebuggeeValueIfNeeded(obj, v));
    return { value: v };
  }

  return null;
}

// Preview functions that do not rely on the object class.
DebuggerServer.ObjectActorPreviewers.Object = [function TypedArray(_ref14, grip) {
  var obj = _ref14.obj,
      hooks = _ref14.hooks;

  if (TYPED_ARRAY_CLASSES.indexOf(obj.class) == -1) {
    return false;
  }

  var length = DevToolsUtils.getProperty(obj, "length");
  if (typeof length != "number") {
    return false;
  }

  grip.preview = {
    kind: "ArrayLike",
    length: length
  };

  if (hooks.getGripDepth() > 1) {
    return true;
  }

  var raw = obj.unsafeDereference();
  var global = Cu.getGlobalForObject(DebuggerServer);
  var classProto = global[obj.class].prototype;
  // The Xray machinery for TypedArrays denies indexed access on the grounds
  // that it's slow, and advises callers to do a structured clone instead.
  var safeView = Cu.cloneInto(classProto.subarray.call(raw, 0, OBJECT_PREVIEW_MAX_ITEMS), global);
  var items = grip.preview.items = [];
  for (var i = 0; i < safeView.length; i++) {
    items.push(safeView[i]);
  }

  return true;
}, function Error(_ref15, grip) {
  var obj = _ref15.obj,
      hooks = _ref15.hooks;

  switch (obj.class) {
    case "Error":
    case "EvalError":
    case "RangeError":
    case "ReferenceError":
    case "SyntaxError":
    case "TypeError":
    case "URIError":
      var name = DevToolsUtils.getProperty(obj, "name");
      var msg = DevToolsUtils.getProperty(obj, "message");
      var stack = DevToolsUtils.getProperty(obj, "stack");
      var fileName = DevToolsUtils.getProperty(obj, "fileName");
      var lineNumber = DevToolsUtils.getProperty(obj, "lineNumber");
      var columnNumber = DevToolsUtils.getProperty(obj, "columnNumber");
      grip.preview = {
        kind: "Error",
        name: hooks.createValueGrip(name),
        message: hooks.createValueGrip(msg),
        stack: hooks.createValueGrip(stack),
        fileName: hooks.createValueGrip(fileName),
        lineNumber: hooks.createValueGrip(lineNumber),
        columnNumber: hooks.createValueGrip(columnNumber)
      };
      return true;
    default:
      return false;
  }
}, function CSSMediaRule(_ref16, grip, rawObj) {
  var obj = _ref16.obj,
      hooks = _ref16.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMCSSMediaRule)) {
    return false;
  }
  grip.preview = {
    kind: "ObjectWithText",
    text: hooks.createValueGrip(rawObj.conditionText)
  };
  return true;
}, function CSSStyleRule(_ref17, grip, rawObj) {
  var obj = _ref17.obj,
      hooks = _ref17.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMCSSStyleRule)) {
    return false;
  }
  grip.preview = {
    kind: "ObjectWithText",
    text: hooks.createValueGrip(rawObj.selectorText)
  };
  return true;
}, function ObjectWithURL(_ref18, grip, rawObj) {
  var obj = _ref18.obj,
      hooks = _ref18.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMCSSImportRule || rawObj instanceof Ci.nsIDOMCSSStyleSheet || rawObj instanceof Ci.nsIDOMLocation || rawObj instanceof Ci.nsIDOMWindow)) {
    return false;
  }

  var url = void 0;
  if (rawObj instanceof Ci.nsIDOMWindow && rawObj.location) {
    url = rawObj.location.href;
  } else if (rawObj.href) {
    url = rawObj.href;
  } else {
    return false;
  }

  grip.preview = {
    kind: "ObjectWithURL",
    url: hooks.createValueGrip(url)
  };

  return true;
}, function ArrayLike(_ref19, grip, rawObj) {
  var obj = _ref19.obj,
      hooks = _ref19.hooks;

  if (isWorker || !rawObj || obj.class != "DOMStringList" && obj.class != "DOMTokenList" && !(rawObj instanceof Ci.nsIDOMMozNamedAttrMap || rawObj instanceof Ci.nsIDOMCSSRuleList || rawObj instanceof Ci.nsIDOMCSSValueList || rawObj instanceof Ci.nsIDOMFileList || rawObj instanceof Ci.nsIDOMFontFaceList || rawObj instanceof Ci.nsIDOMMediaList || rawObj instanceof Ci.nsIDOMNodeList || rawObj instanceof Ci.nsIDOMStyleSheetList)) {
    return false;
  }

  if (typeof rawObj.length != "number") {
    return false;
  }

  grip.preview = {
    kind: "ArrayLike",
    length: rawObj.length
  };

  if (hooks.getGripDepth() > 1) {
    return true;
  }

  var items = grip.preview.items = [];

  for (var i = 0; i < rawObj.length && items.length < OBJECT_PREVIEW_MAX_ITEMS; i++) {
    var value = makeDebuggeeValueIfNeeded(obj, rawObj[i]);
    items.push(hooks.createValueGrip(value));
  }

  return true;
}, function CSSStyleDeclaration(_ref20, grip, rawObj) {
  var obj = _ref20.obj,
      hooks = _ref20.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMCSSStyleDeclaration)) {
    return false;
  }

  grip.preview = {
    kind: "MapLike",
    size: rawObj.length
  };

  var entries = grip.preview.entries = [];

  for (var i = 0; i < OBJECT_PREVIEW_MAX_ITEMS && i < rawObj.length; i++) {
    var prop = rawObj[i];
    var value = rawObj.getPropertyValue(prop);
    entries.push([prop, hooks.createValueGrip(value)]);
  }

  return true;
}, function DOMNode(_ref21, grip, rawObj) {
  var obj = _ref21.obj,
      hooks = _ref21.hooks;

  if (isWorker || obj.class == "Object" || !rawObj || !(rawObj instanceof Ci.nsIDOMNode)) {
    return false;
  }

  var preview = grip.preview = {
    kind: "DOMNode",
    nodeType: rawObj.nodeType,
    nodeName: rawObj.nodeName
  };

  if (rawObj instanceof Ci.nsIDOMDocument && rawObj.location) {
    preview.location = hooks.createValueGrip(rawObj.location.href);
  } else if (rawObj instanceof Ci.nsIDOMDocumentFragment) {
    preview.childNodesLength = rawObj.childNodes.length;

    if (hooks.getGripDepth() < 2) {
      preview.childNodes = [];
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = rawObj.childNodes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var node = _step12.value;

          var actor = hooks.createValueGrip(obj.makeDebuggeeValue(node));
          preview.childNodes.push(actor);
          if (preview.childNodes.length == OBJECT_PREVIEW_MAX_ITEMS) {
            break;
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }
    }
  } else if (rawObj instanceof Ci.nsIDOMElement) {
    // Add preview for DOM element attributes.
    if (rawObj instanceof Ci.nsIDOMHTMLElement) {
      preview.nodeName = preview.nodeName.toLowerCase();
    }

    var i = 0;
    preview.attributes = {};
    preview.attributesLength = rawObj.attributes.length;
    var _iteratorNormalCompletion13 = true;
    var _didIteratorError13 = false;
    var _iteratorError13 = undefined;

    try {
      for (var _iterator13 = rawObj.attributes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
        var attr = _step13.value;

        preview.attributes[attr.nodeName] = hooks.createValueGrip(attr.value);
        if (++i == OBJECT_PREVIEW_MAX_ITEMS) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError13 = true;
      _iteratorError13 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion13 && _iterator13.return) {
          _iterator13.return();
        }
      } finally {
        if (_didIteratorError13) {
          throw _iteratorError13;
        }
      }
    }
  } else if (rawObj instanceof Ci.nsIDOMAttr) {
    preview.value = hooks.createValueGrip(rawObj.value);
  } else if (rawObj instanceof Ci.nsIDOMText || rawObj instanceof Ci.nsIDOMComment) {
    preview.textContent = hooks.createValueGrip(rawObj.textContent);
  }

  return true;
}, function DOMEvent(_ref22, grip, rawObj) {
  var obj = _ref22.obj,
      hooks = _ref22.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMEvent)) {
    return false;
  }

  var preview = grip.preview = {
    kind: "DOMEvent",
    type: rawObj.type,
    properties: Object.create(null)
  };

  if (hooks.getGripDepth() < 2) {
    var target = obj.makeDebuggeeValue(rawObj.target);
    preview.target = hooks.createValueGrip(target);
  }

  var props = [];
  if (rawObj instanceof Ci.nsIDOMMouseEvent) {
    props.push("buttons", "clientX", "clientY", "layerX", "layerY");
  } else if (rawObj instanceof Ci.nsIDOMKeyEvent) {
    var modifiers = [];
    if (rawObj.altKey) {
      modifiers.push("Alt");
    }
    if (rawObj.ctrlKey) {
      modifiers.push("Control");
    }
    if (rawObj.metaKey) {
      modifiers.push("Meta");
    }
    if (rawObj.shiftKey) {
      modifiers.push("Shift");
    }
    preview.eventKind = "key";
    preview.modifiers = modifiers;

    props.push("key", "charCode", "keyCode");
  } else if (rawObj instanceof Ci.nsIDOMTransitionEvent) {
    props.push("propertyName", "pseudoElement");
  } else if (rawObj instanceof Ci.nsIDOMAnimationEvent) {
    props.push("animationName", "pseudoElement");
  } else if (rawObj instanceof Ci.nsIDOMClipboardEvent) {
    props.push("clipboardData");
  }

  // Add event-specific properties.
  var _iteratorNormalCompletion14 = true;
  var _didIteratorError14 = false;
  var _iteratorError14 = undefined;

  try {
    for (var _iterator14 = props[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
      var prop = _step14.value;

      var value = rawObj[prop];
      if (value && ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" || typeof value == "function")) {
        // Skip properties pointing to objects.
        if (hooks.getGripDepth() > 1) {
          continue;
        }
        value = obj.makeDebuggeeValue(value);
      }
      preview.properties[prop] = hooks.createValueGrip(value);
    }

    // Add any properties we find on the event object.
  } catch (err) {
    _didIteratorError14 = true;
    _iteratorError14 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion14 && _iterator14.return) {
        _iterator14.return();
      }
    } finally {
      if (_didIteratorError14) {
        throw _iteratorError14;
      }
    }
  }

  if (!props.length) {
    var i = 0;
    for (var _prop in rawObj) {
      var value = rawObj[_prop];
      if (_prop == "target" || _prop == "type" || value === null || typeof value == "function") {
        continue;
      }
      if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) == "object") {
        if (hooks.getGripDepth() > 1) {
          continue;
        }
        value = obj.makeDebuggeeValue(value);
      }
      preview.properties[_prop] = hooks.createValueGrip(value);
      if (++i == OBJECT_PREVIEW_MAX_ITEMS) {
        break;
      }
    }
  }

  return true;
}, function DOMException(_ref23, grip, rawObj) {
  var obj = _ref23.obj,
      hooks = _ref23.hooks;

  if (isWorker || !rawObj || !(rawObj instanceof Ci.nsIDOMDOMException)) {
    return false;
  }

  grip.preview = {
    kind: "DOMException",
    name: hooks.createValueGrip(rawObj.name),
    message: hooks.createValueGrip(rawObj.message),
    code: hooks.createValueGrip(rawObj.code),
    result: hooks.createValueGrip(rawObj.result),
    filename: hooks.createValueGrip(rawObj.filename),
    lineNumber: hooks.createValueGrip(rawObj.lineNumber),
    columnNumber: hooks.createValueGrip(rawObj.columnNumber)
  };

  return true;
}, function PseudoArray(_ref24, grip, rawObj) {
  var obj = _ref24.obj,
      hooks = _ref24.hooks;

  var length = 0;

  // Making sure all keys are numbers from 0 to length-1
  var keys = obj.getOwnPropertyNames();
  if (keys.length == 0) {
    return false;
  }
  var _iteratorNormalCompletion15 = true;
  var _didIteratorError15 = false;
  var _iteratorError15 = undefined;

  try {
    for (var _iterator15 = keys[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
      var key = _step15.value;

      if (isNaN(key) || key != length++) {
        return false;
      }
    }
  } catch (err) {
    _didIteratorError15 = true;
    _iteratorError15 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion15 && _iterator15.return) {
        _iterator15.return();
      }
    } finally {
      if (_didIteratorError15) {
        throw _iteratorError15;
      }
    }
  }

  grip.preview = {
    kind: "ArrayLike",
    length: length
  };

  // Avoid recursive object grips.
  if (hooks.getGripDepth() > 1) {
    return true;
  }

  var items = grip.preview.items = [];

  var i = 0;
  var _iteratorNormalCompletion16 = true;
  var _didIteratorError16 = false;
  var _iteratorError16 = undefined;

  try {
    for (var _iterator16 = keys[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
      var _key = _step16.value;

      if (rawObj.hasOwnProperty(_key) && i++ < OBJECT_PREVIEW_MAX_ITEMS) {
        var value = makeDebuggeeValueIfNeeded(obj, rawObj[_key]);
        items.push(hooks.createValueGrip(value));
      }
    }
  } catch (err) {
    _didIteratorError16 = true;
    _iteratorError16 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion16 && _iterator16.return) {
        _iterator16.return();
      }
    } finally {
      if (_didIteratorError16) {
        throw _iteratorError16;
      }
    }
  }

  return true;
}, function GenericObject(objectActor, grip) {
  var obj = objectActor.obj,
      hooks = objectActor.hooks;

  if (grip.preview || grip.displayString || hooks.getGripDepth() > 1) {
    return false;
  }

  var i = 0,
      names = [];
  var preview = grip.preview = {
    kind: "Object",
    ownProperties: Object.create(null)
  };

  try {
    names = obj.getOwnPropertyNames();
  } catch (ex) {
    // Calling getOwnPropertyNames() on some wrapped native prototypes is not
    // allowed: "cannot modify properties of a WrappedNative". See bug 952093.
  }

  preview.ownPropertiesLength = names.length;

  var _iteratorNormalCompletion17 = true;
  var _didIteratorError17 = false;
  var _iteratorError17 = undefined;

  try {
    for (var _iterator17 = names[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
      var name = _step17.value;

      var desc = objectActor._propertyDescriptor(name, true);
      if (!desc) {
        continue;
      }

      preview.ownProperties[name] = desc;
      if (++i == OBJECT_PREVIEW_MAX_ITEMS) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError17 = true;
    _iteratorError17 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion17 && _iterator17.return) {
        _iterator17.return();
      }
    } finally {
      if (_didIteratorError17) {
        throw _iteratorError17;
      }
    }
  }

  if (i < OBJECT_PREVIEW_MAX_ITEMS) {
    preview.safeGetterValues = objectActor._findSafeGetterValues(Object.keys(preview.ownProperties), OBJECT_PREVIEW_MAX_ITEMS - i);
  }

  return true;
}];

/**
 * Call PromiseDebugging.getState on this Debugger.Object's referent and wrap
 * the resulting `value` or `reason` properties in a Debugger.Object instance.
 *
 * See dom/webidl/PromiseDebugging.webidl
 *
 * @returns Object
 *          An object of one of the following forms:
 *          - { state: "pending" }
 *          - { state: "fulfilled", value }
 *          - { state: "rejected", reason }
 */
function getPromiseState(obj) {
  if (obj.class != "Promise") {
    throw new Error("Can't call `getPromiseState` on `Debugger.Object`s that don't " + "refer to Promise objects.");
  }

  var state = PromiseDebugging.getState(obj.unsafeDereference());
  return {
    state: state.state,
    value: obj.makeDebuggeeValue(state.value),
    reason: obj.makeDebuggeeValue(state.reason)
  };
};

/**
 * Determine if a given value is non-primitive.
 *
 * @param Any value
 *        The value to test.
 * @return Boolean
 *         Whether the value is non-primitive.
 */
function isObject(value) {
  var type = typeof value === "undefined" ? "undefined" : _typeof(value);
  return type == "object" ? value !== null : type == "function";
}

/**
 * Create a function that can safely stringify Debugger.Objects of a given
 * builtin type.
 *
 * @param Function ctor
 *        The builtin class constructor.
 * @return Function
 *         The stringifier for the class.
 */
function createBuiltinStringifier(ctor) {
  return function (obj) {
    return ctor.prototype.toString.call(obj.unsafeDereference());
  };
}

/**
 * Stringify a Debugger.Object-wrapped Error instance.
 *
 * @param Debugger.Object obj
 *        The object to stringify.
 * @return String
 *         The stringification of the object.
 */
function errorStringify(obj) {
  var name = DevToolsUtils.getProperty(obj, "name");
  if (name === "" || name === undefined) {
    name = obj.class;
  } else if (isObject(name)) {
    name = stringify(name);
  }

  var message = DevToolsUtils.getProperty(obj, "message");
  if (isObject(message)) {
    message = stringify(message);
  }

  if (message === "" || message === undefined) {
    return name;
  }
  return name + ": " + message;
}

/**
 * Stringify a Debugger.Object based on its class.
 *
 * @param Debugger.Object obj
 *        The object to stringify.
 * @return String
 *         The stringification for the object.
 */
function stringify(obj) {
  if (obj.class == "DeadObject") {
    var error = new Error("Dead object encountered.");
    DevToolsUtils.reportException("stringify", error);
    return "<dead object>";
  }

  var stringifier = stringifiers[obj.class] || stringifiers.Object;

  try {
    return stringifier(obj);
  } catch (e) {
    DevToolsUtils.reportException("stringify", e);
    return "<failed to stringify object>";
  }
}

// Used to prevent infinite recursion when an array is found inside itself.
var seen = null;

var stringifiers = {
  Error: errorStringify,
  EvalError: errorStringify,
  RangeError: errorStringify,
  ReferenceError: errorStringify,
  SyntaxError: errorStringify,
  TypeError: errorStringify,
  URIError: errorStringify,
  Boolean: createBuiltinStringifier(Boolean),
  Function: createBuiltinStringifier(Function),
  Number: createBuiltinStringifier(Number),
  RegExp: createBuiltinStringifier(RegExp),
  String: createBuiltinStringifier(String),
  Object: function Object(obj) {
    return "[object " + obj.class + "]";
  },
  Array: function Array(obj) {
    // If we're at the top level then we need to create the Set for tracking
    // previously stringified arrays.
    var topLevel = !seen;
    if (topLevel) {
      seen = new Set();
    } else if (seen.has(obj)) {
      return "";
    }

    seen.add(obj);

    var len = DevToolsUtils.getProperty(obj, "length");
    var string = "";

    // The following check is only required because the debuggee could possibly
    // be a Proxy and return any value. For normal objects, array.length is
    // always a non-negative integer.
    if (typeof len == "number" && len > 0) {
      for (var i = 0; i < len; i++) {
        var desc = obj.getOwnPropertyDescriptor(i);
        if (desc) {
          var value = desc.value;

          if (value != null) {
            string += isObject(value) ? stringify(value) : value;
          }
        }

        if (i < len - 1) {
          string += ",";
        }
      }
    }

    if (topLevel) {
      seen = null;
    }

    return string;
  },
  DOMException: function DOMException(obj) {
    var message = DevToolsUtils.getProperty(obj, "message") || "<no message>";
    var result = (+DevToolsUtils.getProperty(obj, "result")).toString(16);
    var code = DevToolsUtils.getProperty(obj, "code");
    var name = DevToolsUtils.getProperty(obj, "name") || "<unknown>";

    return '[Exception... "' + message + '" ' + 'code: "' + code + '" ' + 'nsresult: "0x' + result + ' (' + name + ')"]';
  },
  Promise: function Promise(obj) {
    var _getPromiseState2 = getPromiseState(obj),
        state = _getPromiseState2.state,
        value = _getPromiseState2.value,
        reason = _getPromiseState2.reason;

    var statePreview = state;
    if (state != "pending") {
      var settledValue = state === "fulfilled" ? value : reason;
      statePreview += ": " + ((typeof settledValue === "undefined" ? "undefined" : _typeof(settledValue)) === "object" && settledValue !== null ? stringify(settledValue) : settledValue);
    }
    return "Promise (" + statePreview + ")";
  }
};

/**
 * Make a debuggee value for the given object, if needed. Primitive values
 * are left the same.
 *
 * Use case: you have a raw JS object (after unsafe dereference) and you want to
 * send it to the client. In that case you need to use an ObjectActor which
 * requires a debuggee value. The Debugger.Object.prototype.makeDebuggeeValue()
 * method works only for JS objects and functions.
 *
 * @param Debugger.Object obj
 * @param any value
 * @return object
 */
function makeDebuggeeValueIfNeeded(obj, value) {
  if (value && ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" || typeof value == "function")) {
    return obj.makeDebuggeeValue(value);
  }
  return value;
}

/**
 * Creates an actor for the specied "very long" string. "Very long" is specified
 * at the server's discretion.
 *
 * @param string String
 *        The string.
 */
function LongStringActor(string) {
  this.string = string;
  this.stringLength = string.length;
}

LongStringActor.prototype = {
  actorPrefix: "longString",

  disconnect: function disconnect() {
    // Because longStringActors is not a weak map, we won't automatically leave
    // it so we need to manually leave on disconnect so that we don't leak
    // memory.
    this._releaseActor();
  },

  /**
   * Returns a grip for this actor for returning in a protocol message.
   */
  grip: function grip() {
    return {
      "type": "longString",
      "initial": this.string.substring(0, DebuggerServer.LONG_STRING_INITIAL_LENGTH),
      "length": this.stringLength,
      "actor": this.actorID
    };
  },

  /**
   * Handle a request to extract part of this actor's string.
   *
   * @param request object
   *        The protocol request object.
   */
  onSubstring: function onSubstring(request) {
    return {
      "from": this.actorID,
      "substring": this.string.substring(request.start, request.end)
    };
  },

  /**
   * Handle a request to release this LongStringActor instance.
   */
  onRelease: function onRelease() {
    // TODO: also check if registeredPool === threadActor.threadLifetimePool
    // when the web console moves aray from manually releasing pause-scoped
    // actors.
    this._releaseActor();
    this.registeredPool.removeActor(this);
    return {};
  },

  _releaseActor: function _releaseActor() {
    if (this.registeredPool && this.registeredPool.longStringActors) {
      delete this.registeredPool.longStringActors[this.string];
    }
  }
};

LongStringActor.prototype.requestTypes = {
  "substring": LongStringActor.prototype.onSubstring,
  "release": LongStringActor.prototype.onRelease
};

/**
 * Create a grip for the given debuggee value.  If the value is an
 * object, will create an actor with the given lifetime.
 */
function createValueGrip(value, pool, makeObjectGrip) {
  switch (typeof value === "undefined" ? "undefined" : _typeof(value)) {
    case "boolean":
      return value;

    case "string":
      if (stringIsLong(value)) {
        return longStringGrip(value, pool);
      }
      return value;

    case "number":
      if (value === Infinity) {
        return { type: "Infinity" };
      } else if (value === -Infinity) {
        return { type: "-Infinity" };
      } else if (Number.isNaN(value)) {
        return { type: "NaN" };
      } else if (!value && 1 / value === -Infinity) {
        return { type: "-0" };
      }
      return value;

    case "undefined":
      return { type: "undefined" };

    case "object":
      if (value === null) {
        return { type: "null" };
      } else if (value.optimizedOut || value.uninitialized || value.missingArguments) {
        // The slot is optimized out, an uninitialized binding, or
        // arguments on a dead scope
        return {
          type: "null",
          optimizedOut: value.optimizedOut,
          uninitialized: value.uninitialized,
          missingArguments: value.missingArguments
        };
      }
      return makeObjectGrip(value, pool);

    case "symbol":
      var form = {
        type: "symbol"
      };
      var name = getSymbolName(value);
      if (name !== undefined) {
        form.name = createValueGrip(name, pool, makeObjectGrip);
      }
      return form;

    default:
      dbg_assert(false, "Failed to provide a grip for: " + value);
      return null;
  }
}

// const symbolProtoToString = Symbol.prototype.toString;

// function getSymbolName(symbol) {
//   const name = symbolProtoToString.call(symbol).slice("Symbol(".length, -1);
//   return name || undefined;
// }

/**
 * Returns true if the string is long enough to use a LongStringActor instead
 * of passing the value directly over the protocol.
 *
 * @param str String
 *        The string we are checking the length of.
 */
function stringIsLong(str) {
  return str.length >= DebuggerServer.LONG_STRING_LENGTH;
}

/**
 * Create a grip for the given string.
 *
 * @param str String
 *        The string we are creating a grip for.
 * @param pool ActorPool
 *        The actor pool where the new actor will be added.
 */
function longStringGrip(str, pool) {
  if (!pool.longStringActors) {
    pool.longStringActors = {};
  }

  if (pool.longStringActors.hasOwnProperty(str)) {
    return pool.longStringActors[str].grip();
  }

  var actor = new LongStringActor(str);
  pool.addActor(actor);
  pool.longStringActors[str] = actor;
  return actor.grip();
}

// exports.ObjectActor = ObjectActor;
// exports.PropertyIteratorActor = PropertyIteratorActor;
// exports.LongStringActor = LongStringActor;
// exports.createValueGrip = createValueGrip;
// exports.stringIsLong = stringIsLong;
// exports.longStringGrip = longStringGrip;

cc._RF.pop();