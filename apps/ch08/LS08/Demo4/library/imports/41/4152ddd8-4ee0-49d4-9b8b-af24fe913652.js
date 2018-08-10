"use strict";
cc._RF.push(module, '4152d3YTuBJ1JuLryT+kTZS', 'root');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/debugger/actors/root.js

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

/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// const { Cc, Ci, Cu } = require("chrome");
// const Services = require("Services");
// const { ActorPool, appendExtraActors, createExtraActors } = require("devtools/server/actors/common");
// const { DebuggerServer } = require("devtools/server/main");

// loader.lazyGetter(this, "ppmm", () => {
//   return Cc["@mozilla.org/parentprocessmessagemanager;1"].getService(Ci.nsIMessageBroadcaster);
// });

/* Root actor for the remote debugging protocol. */

/**
 * Create a remote debugging protocol root actor.
 *
 * @param aConnection
 *     The DebuggerServerConnection whose root actor we are constructing.
 *
 * @param aParameters
 *     The properties of |aParameters| provide backing objects for the root
 *     actor's requests; if a given property is omitted from |aParameters|, the
 *     root actor won't implement the corresponding requests or notifications.
 *     Supported properties:
 *
 *     - tabList: a live list (see below) of tab actors. If present, the
 *       new root actor supports the 'listTabs' request, providing the live
 *       list's elements as its tab actors, and sending 'tabListChanged'
 *       notifications when the live list's contents change. One actor in
 *       this list must have a true '.selected' property.
 *
 *     - addonList: a live list (see below) of addon actors. If present, the
 *       new root actor supports the 'listAddons' request, providing the live
 *       list's elements as its addon actors, and sending 'addonListchanged'
 *       notifications when the live list's contents change.
 *
 *     - globalActorFactories: an object |A| describing further actors to
 *       attach to the 'listTabs' reply. This is the type accumulated by
 *       DebuggerServer.addGlobalActor. For each own property |P| of |A|,
 *       the root actor adds a property named |P| to the 'listTabs'
 *       reply whose value is the name of an actor constructed by
 *       |A[P]|.
 *
 *     - onShutdown: a function to call when the root actor is disconnected.
 *
 * Instance properties:
 *
 * - applicationType: the string the root actor will include as the
 *      "applicationType" property in the greeting packet. By default, this
 *      is "browser".
 *
 * Live lists:
 *
 * A "live list", as used for the |tabList|, is an object that presents a
 * list of actors, and also notifies its clients of changes to the list. A
 * live list's interface is two properties:
 *
 * - getList: a method that returns a promise to the contents of the list.
 *
 * - onListChanged: a handler called, with no arguments, when the set of
 *             values the iterator would produce has changed since the last
 *             time 'iterator' was called. This may only be set to null or a
 *             callable value (one for which the typeof operator returns
 *             'function'). (Note that the live list will not call the
 *             onListChanged handler until the list has been iterated over
 *             once; if nobody's seen the list in the first place, nobody
 *             should care if its contents have changed!)
 *
 * When the list changes, the list implementation should ensure that any
 * actors yielded in previous iterations whose referents (tabs) still exist
 * get yielded again in subsequent iterations. If the underlying referent
 * is the same, the same actor should be presented for it.
 *
 * The root actor registers an 'onListChanged' handler on the appropriate
 * list when it may need to send the client 'tabListChanged' notifications,
 * and is careful to remove the handler whenever it does not need to send
 * such notifications (including when it is disconnected). This means that
 * live list implementations can use the state of the handler property (set
 * or null) to install and remove observers and event listeners.
 *
 * Note that, as the only way for the root actor to see the members of the
 * live list is to begin an iteration over the list, the live list need not
 * actually produce any actors until they are reached in the course of
 * iteration: alliterative lazy live lists.
 */

function RootActor(aConnection, aParameters) {
  this.conn = aConnection;
  this._parameters = aParameters;
  this._onTabListChanged = this.onTabListChanged.bind(this);
  this._onAddonListChanged = this.onAddonListChanged.bind(this);
  this._extraActors = {};

  this._globalActorPool = new ActorPool(this.conn);
  this.conn.addActorPool(this._globalActorPool);

  this._chromeActor = null;
}

RootActor.prototype = {
  constructor: RootActor,
  applicationType: "browser",

  traits: {
    sources: true,
    // Whether the inspector actor allows modifying outer HTML.
    editOuterHTML: true,
    // Whether the inspector actor allows modifying innerHTML and inserting
    // adjacent HTML.
    pasteHTML: true,
    // Whether the server-side highlighter actor exists and can be used to
    // remotely highlight nodes (see server/actors/highlighters.js)
    highlightable: true,
    // Which custom highlighter does the server-side highlighter actor supports?
    // (see server/actors/highlighters.js)
    customHighlighters: true,
    // Whether the inspector actor implements the getImageDataFromURL
    // method that returns data-uris for image URLs. This is used for image
    // tooltips for instance
    urlToImageDataResolver: true,
    networkMonitor: true,
    // Whether the storage inspector actor to inspect cookies, etc.
    storageInspector: true,
    // Whether storage inspector is read only
    storageInspectorReadOnly: true,
    // Whether conditional breakpoints are supported
    conditionalBreakpoints: true,
    // Whether the server supports full source actors (breakpoints on
    // eval scripts, etc)
    debuggerSourceActors: true,
    bulk: true,
    // Whether the style rule actor implements the modifySelector method
    // that modifies the rule's selector
    selectorEditable: true,
    // Whether the page style actor implements the addNewRule method that
    // adds new rules to the page
    addNewRule: true,
    // Whether the dom node actor implements the getUniqueSelector method
    getUniqueSelector: true,
    // Whether the director scripts are supported
    directorScripts: true,
    // Whether the debugger server supports
    // blackboxing/pretty-printing (not supported in Fever Dream yet)
    noBlackBoxing: false,
    noPrettyPrinting: false,
    // Whether the page style actor implements the getUsedFontFaces method
    // that returns the font faces used on a node
    getUsedFontFaces: true,
    // Trait added in Gecko 38, indicating that all features necessary for
    // grabbing allocations from the MemoryActor are available for the performance tool
    memoryActorAllocations: true,
    // Added in Gecko 40, indicating that the backend isn't stupid about
    // sending resumption packets on tab navigation.
    noNeedToFakeResumptionOnNavigation: true,
    // Added in Firefox 40. Indicates that the backend supports registering custom
    // commands through the WebConsoleCommands API.
    webConsoleCommands: true,
    // Whether root actor exposes tab actors
    // if allowChromeProcess is true, you can fetch a ChromeActor instance
    // to debug chrome and any non-content ressource via getProcess request
    // if allocChromeProcess is defined, but not true, it means that root actor
    // no longer expose tab actors, but also that getProcess forbids
    // exposing actors for security reasons
    get allowChromeProcess() {
      return DebuggerServer.allowChromeProcess;
    },
    // Whether or not `getProfile()` supports specifying a `startTime`
    // and `endTime` to filter out samples. Fx40+
    profilerDataFilterable: true
  },

  /**
   * Return a 'hello' packet as specified by the Remote Debugging Protocol.
   */
  sayHello: function sayHello() {
    return {
      from: this.actorID,
      applicationType: this.applicationType,
      /* This is not in the spec, but it's used by tests. */
      testConnectionPrefix: this.conn.prefix,
      traits: this.traits
    };
  },

  /**
   * Disconnects the actor from the browser window.
   */
  disconnect: function disconnect() {
    /* Tell the live lists we aren't watching any more. */
    if (this._parameters.tabList) {
      this._parameters.tabList.onListChanged = null;
    }
    if (this._parameters.addonList) {
      this._parameters.addonList.onListChanged = null;
    }
    if (typeof this._parameters.onShutdown === 'function') {
      this._parameters.onShutdown();
    }
    this._extraActors = null;
    this.conn = null;
    this._tabActorPool = null;
    this._globalActorPool = null;
    this._parameters = null;
    this._chromeActor = null;
  },

  /* The 'listTabs' request and the 'tabListChanged' notification. */

  /**
   * Handles the listTabs request. The actors will survive until at least
   * the next listTabs request.
   */
  onListTabs: function onListTabs() {
    var _this = this;

    var tabList = this._parameters.tabList;
    if (!tabList) {
      return { from: this.actorID, error: "noTabs",
        message: "This root actor has no browser tabs." };
    }

    /*
     * Walk the tab list, accumulating the array of tab actors for the
     * reply, and moving all the actors to a new ActorPool. We'll
     * replace the old tab actor pool with the one we build here, thus
     * retiring any actors that didn't get listed again, and preparing any
     * new actors to receive packets.
     */
    var newActorPool = new ActorPool(this.conn);
    var tabActorList = [];
    var selected = void 0;
    return tabList.getList().then(function (tabActors) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = tabActors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tabActor = _step.value;

          if (tabActor.selected) {
            selected = tabActorList.length;
          }
          tabActor.parentID = _this.actorID;
          newActorPool.addActor(tabActor);
          tabActorList.push(tabActor);
        }
        /* DebuggerServer.addGlobalActor support: create actors. */
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

      if (!_this._globalActorPool) {
        _this._globalActorPool = new ActorPool(_this.conn);
        _this.conn.addActorPool(_this._globalActorPool);
      }
      // this._createExtraActors(this._parameters.globalActorFactories, this._globalActorPool);
      /*
       * Drop the old actorID -> actor map. Actors that still mattered were
       * added to the new map; others will go away.
       */
      if (_this._tabActorPool) {
        _this.conn.removeActorPool(_this._tabActorPool);
      }
      _this._tabActorPool = newActorPool;
      _this.conn.addActorPool(_this._tabActorPool);

      var reply = {
        "from": _this.actorID,
        "selected": selected || 0,
        "tabs": tabActorList.map(function (actor) {
          return actor.form();
        })
      };

      /* If a root window is accessible, include its URL. */
      if (_this.url) {
        reply.url = _this.url;
      }

      /* DebuggerServer.addGlobalActor support: name actors in 'listTabs' reply. */
      // this._appendExtraActors(reply);

      /*
       * Now that we're actually going to report the contents of tabList to
       * the client, we're responsible for letting the client know if it
       * changes.
       */
      tabList.onListChanged = _this._onTabListChanged;

      return reply;
    });
  },

  onGetTab: function onGetTab(options) {
    var _this2 = this;

    var tabList = this._parameters.tabList;
    if (!tabList) {
      return { error: "noTabs",
        message: "This root actor has no browser tabs." };
    }
    if (!this._tabActorPool) {
      this._tabActorPool = new ActorPool(this.conn);
      this.conn.addActorPool(this._tabActorPool);
    }
    return tabList.getTab(options).then(function (tabActor) {
      tabActor.parentID = _this2.actorID;
      _this2._tabActorPool.addActor(tabActor);

      return { tab: tabActor.form() };
    }, function (error) {
      if (error.error) {
        // Pipe expected errors as-is to the client
        return error;
      } else {
        return { error: "noTab",
          message: "Unexpected error while calling getTab(): " + error };
      }
    });
  },

  onTabListChanged: function onTabListChanged() {
    this.conn.send({ from: this.actorID, type: "tabListChanged" });
    /* It's a one-shot notification; no need to watch any more. */
    this._parameters.tabList.onListChanged = null;
  },

  onListAddons: function onListAddons() {
    var _this3 = this;

    var addonList = this._parameters.addonList;
    if (!addonList) {
      return { from: this.actorID, error: "noAddons",
        message: "This root actor has no browser addons." };
    }

    return addonList.getList().then(function (addonActors) {
      var addonActorPool = new ActorPool(_this3.conn);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = addonActors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var addonActor = _step2.value;

          addonActorPool.addActor(addonActor);
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

      if (_this3._addonActorPool) {
        _this3.conn.removeActorPool(_this3._addonActorPool);
      }
      _this3._addonActorPool = addonActorPool;
      _this3.conn.addActorPool(_this3._addonActorPool);

      addonList.onListChanged = _this3._onAddonListChanged;

      return {
        "from": _this3.actorID,
        "addons": addonActors.map(function (addonActor) {
          return addonActor.form();
        })
      };
    });
  },

  onAddonListChanged: function onAddonListChanged() {
    this.conn.send({ from: this.actorID, type: "addonListChanged" });
    this._parameters.addonList.onListChanged = null;
  },

  onListProcesses: function onListProcesses() {
    var processes = [];
    for (var i = 0; i < ppmm.childCount; i++) {
      processes.push({
        id: i, // XXX: may not be a perfect id, but process message manager doesn't expose anything...
        parent: i == 0, // XXX Weak, but appear to be stable
        tabCount: undefined // TODO: exposes process message manager on frameloaders in order to compute this
      });
    }
    return { processes: processes };
  },

  onGetProcess: function onGetProcess(aRequest) {
    if (!DebuggerServer.allowChromeProcess) {
      return { error: "forbidden",
        message: "You are not allowed to debug chrome." };
    }
    if ("id" in aRequest && typeof aRequest.id != "number") {
      return { error: "wrongParameter",
        message: "getProcess requires a valid `id` attribute." };
    }
    // If the request doesn't contains id parameter or id is 0
    // (id == 0, based on onListProcesses implementation)
    if (!("id" in aRequest) || aRequest.id === 0) {
      if (!this._chromeActor) {
        // Create a ChromeActor for the parent process
        var _require = require("devtools/server/actors/chrome"),
            ChromeActor = _require.ChromeActor;

        this._chromeActor = new ChromeActor(this.conn);
        this._globalActorPool.addActor(this._chromeActor);
      }

      return { form: this._chromeActor.form() };
    } else {
      var mm = ppmm.getChildAt(aRequest.id);
      if (!mm) {
        return { error: "noProcess",
          message: "There is no process with id '" + aRequest.id + "'." };
      }
      return DebuggerServer.connectToContent(this.conn, mm).then(function (form) {
        return { form: form };
      });
    }
  },

  /* This is not in the spec, but it's used by tests. */
  onEcho: function onEcho(aRequest) {
    /*
     * Request packets are frozen. Copy aRequest, so that
     * DebuggerServerConnection.onPacket can attach a 'from' property.
     */
    return Cu.cloneInto(aRequest, {});
  },

  onProtocolDescription: function onProtocolDescription() {
    return require("devtools/server/protocol").dumpProtocolSpec();
  },

  /* Support for DebuggerServer.addGlobalActor. */
  // _createExtraActors: createExtraActors,
  // _appendExtraActors: appendExtraActors,

  /**
   * Remove the extra actor (added by DebuggerServer.addGlobalActor or
   * DebuggerServer.addTabActor) name |aName|.
   */
  removeActorByName: function removeActorByName(aName) {
    if (aName in this._extraActors) {
      var actor = this._extraActors[aName];
      if (this._globalActorPool.has(actor)) {
        this._globalActorPool.removeActor(actor);
      }
      if (this._tabActorPool) {
        // Iterate over TabActor instances to also remove tab actors
        // created during listTabs for each document.
        this._tabActorPool.forEach(function (tab) {
          tab.removeActorByName(aName);
        });
      }
      delete this._extraActors[aName];
    }
  }
};

RootActor.prototype.requestTypes = {
  "listTabs": RootActor.prototype.onListTabs,
  "getTab": RootActor.prototype.onGetTab,
  "listAddons": RootActor.prototype.onListAddons,
  "listProcesses": RootActor.prototype.onListProcesses,
  "getProcess": RootActor.prototype.onGetProcess,
  "echo": RootActor.prototype.onEcho,
  "protocolDescription": RootActor.prototype.onProtocolDescription
};

// exports.RootActor = RootActor;

cc._RF.pop();