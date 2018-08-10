"use strict";
cc._RF.push(module, 'd857ehz+TZIAY13Bpp80fLU', 'jsb_debugger');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/jsb_debugger.js

"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
 * Copyright (c) 2013-2016 Chukong Technologies Inc.
 * Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// const { ActorPool, appendExtraActors, createExtraActors } = require("devtools/server/actors/common");
// const { RootActor } = require("devtools/server/actors/root");
// const { ThreadActor } = require("devtools/server/actors/script");
// const { DebuggerServer } = require("devtools/server/main");
// const { TabSources } = require("devtools/server/actors/utils/TabSources");
// const promise = require("promise");
// const makeDebugger = require("devtools/server/actors/utils/make-debugger");


var gTestGlobals = [];
var needToSendNavigation = false;
var testTab = null;

// A mock tab list, for use by tests. This simply presents each global in
// gTestGlobals as a tab, and the list is fixed: it never calls its
// onListChanged handler.
//
// As implemented now, we consult gTestGlobals when we're constructed, not
// when we're iterated over, so tests have to add their globals before the
// root actor is created.
function TestTabList(aConnection) {
  this.conn = aConnection;

  // An array of actors for each global added with
  // DebuggerServer.addTestGlobal.
  this._tabActors = [];

  // A pool mapping those actors' names to the actors.
  this._tabActorPool = new ActorPool(aConnection);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = gTestGlobals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var global = _step.value;

      var actor = new TestTabActor(aConnection, global);
      testTab = actor;
      actor.selected = false;
      this._tabActors.push(actor);
      this._tabActorPool.addActor(actor);
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

  if (this._tabActors.length > 0) {
    this._tabActors[0].selected = true;
  }

  aConnection.addActorPool(this._tabActorPool);
}

TestTabList.prototype = {
  constructor: TestTabList,
  getList: function getList() {
    return resolve([].concat(_toConsumableArray(this._tabActors)));
  }
};

function createRootActor(aConnection) {
  var root = new RootActor(aConnection, {
    tabList: new TestTabList(aConnection),
    globalActorFactories: DebuggerServer.globalActorFactories
  });

  // root.applicationType = "xpcshell-tests";
  return root;
}

function TestTabActor(aConnection, aGlobal) {
  this.makeDebugger = function () {
    var dbg = new Debugger();
    dbg.addDebuggee(this._global);
    return dbg;
  };

  this.conn = aConnection;
  this._global = aGlobal;
  this._global.wrappedJSObject = aGlobal;
  this.threadActor = new ThreadActor(this, this._global);
  this.conn.addActor(this.threadActor);
  this.consoleActor = new WebConsoleActor(this.conn, this);
  this.conn.addActor(this.consoleActor);
  this._attached = false;
  this._extraActors = {};
  // this.makeDebugger = makeDebugger.bind(null, {
  //   findDebuggees: () => [this._global],
  //   shouldAddNewGlobalAsDebuggee: g => g.hostAnnotations &&
  //                                      g.hostAnnotations.type == "document" &&
  //                                      g.hostAnnotations.element === this._global

  // });
}

TestTabActor.prototype = {
  constructor: TestTabActor,
  actorPrefix: "TestTabActor",

  get window() {
    return this._global;
  },

  get url() {
    // return "http://cocos2d-x.org";
    return "about:cehome";
  },

  get sources() {
    if (!this._sources) {
      this._sources = new TabSources(this.threadActor);
    }
    return this._sources;
  },

  form: function form() {
    var response = { actor: this.actorID, title: "cocos project", 'consoleActor': this.consoleActor.actorID };

    // Walk over tab actors added by extensions and add them to a new ActorPool.
    var actorPool = new ActorPool(this.conn);
    // this._createExtraActors(DebuggerServer.tabActorFactories, actorPool);
    if (!actorPool.isEmpty()) {
      this._tabActorPool = actorPool;
      this.conn.addActorPool(this._tabActorPool);
    }

    // this._appendExtraActors(response);

    return response;
  },

  onAttach: function onAttach(aRequest) {
    this._attached = true;

    var response = { type: "tabAttached", threadActor: this.threadActor.actorID };
    // this._appendExtraActors(response);

    return response;
  },

  onDetach: function onDetach(aRequest) {
    if (!this._attached) {
      return { "error": "wrongState" };
    }
    return { type: "detached" };
  },

  onReload: function onReload(aRequest) {
    this.sources.reset({ sourceMaps: true });
    this.threadActor.clearDebuggees();
    this.threadActor.dbg.addDebuggees();
    return {};
  },

  removeActorByName: function removeActorByName(aName) {
    var actor = this._extraActors[aName];
    if (this._tabActorPool) {
      this._tabActorPool.removeActor(actor);
    }
    delete this._extraActors[aName];
  }

  /* Support for DebuggerServer.addTabActor. */
  // _createExtraActors: createExtraActors,
  // _appendExtraActors: appendExtraActors
};

TestTabActor.prototype.requestTypes = {
  "attach": TestTabActor.prototype.onAttach,
  "detach": TestTabActor.prototype.onDetach,
  "reload": TestTabActor.prototype.onReload
};

var conn = null;
var transport = null;

var incomingData = '';

undefined.processInput = function (inputstr) {
  if (!inputstr) {

    return;
  }

  if (inputstr === "connected") {
    DebuggerServer.init();
    DebuggerServer.setRootActor(createRootActor);
    conn = DebuggerServer._onConnection(transport);

    return;
  }

  function extractPacket(inputString) {
    // Well this is ugly.
    var sep = inputString.indexOf(':');
    if (sep < 0) {
      return null;
    }

    var count = inputString.substring(0, sep);
    // Check for a positive number with no garbage afterwards.
    if (!/^[0-9]+$/.exec(count)) {
      return null;
    }

    count = +count;
    if (inputString.length - (sep + 1) < count) {
      // Don't have a complete request yet.
      return null;
    }

    // We have a complete request, pluck it out of the data and parse it.
    inputString = inputString.substring(sep + 1);
    var packet = inputString.substring(0, count);
    incomingData = inputString.substring(count);

    return packet;
  }

  function handlePacket(packet) {
    try {
      // packet = this._converter.ConvertToUnicode(packet);
      packet = DevToolsUtils.utf8to16(packet);
      var parsed = JSON.parse(packet);
      conn.onPacket(parsed);
    } catch (e) {
      var msg = "Error parsing incoming packet: " + packet + " (" + e + " - " + e.stack + ")";
    }
  }

  incomingData += inputstr;
  var packet;
  while (packet = extractPacket(incomingData)) {
    handlePacket(packet);
  }
};

undefined._prepareDebugger = function (global) {

  this.globalDebuggee = global;
  cc = global.cc;
  // exports = global;
  // load all functions exported in DevToolsUtils to global(exports)
  require('script/debugger/DevToolsUtils.js', 'debug');
  require('script/debugger/event-emitter.js', 'debug');
  require('script/debugger/actors/utils/ScriptStore.js', 'debug');
  require('script/debugger/actors/common.js', 'debug');
  require('script/debugger/core/promise.js', 'debug');
  require('script/debugger/transport.js', 'debug');
  require('script/debugger/main.js', 'debug');
  require('script/debugger/actors/object.js', 'debug');
  require('script/debugger/actors/root.js', 'debug');
  require('script/debugger/actors/script.js', 'debug');
  require('script/debugger/actors/webconsole.js', 'debug');
  require('script/debugger/actors/utils/TabSources.js', 'debug');

  //DebuggerServer.addTestGlobal = function(aGlobal) {
  gTestGlobals.push(global);
  //};

  transport = new DebuggerTransport();
};

cc._RF.pop();