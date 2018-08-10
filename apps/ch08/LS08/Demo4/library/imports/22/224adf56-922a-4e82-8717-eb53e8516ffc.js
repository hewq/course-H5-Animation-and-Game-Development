"use strict";
cc._RF.push(module, '224ad9WkipOgocX61PoUW/8', 'TabSources');
// frameworks/cocos2d-x/cocos/scripting/js-bindings/script/debugger/actors/utils/TabSources.js

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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// const { Ci, Cu } = require("chrome");
// const Services = require("Services");
// const DevToolsUtils = require("devtools/toolkit/DevToolsUtils");
// const { dbg_assert, fetch } = DevToolsUtils;
// const EventEmitter = require("devtools/toolkit/event-emitter");
// const { OriginalLocation, GeneratedLocation, getOffsetColumn } = require("devtools/server/actors/common");
// const { resolve } = require("promise");

// loader.lazyRequireGetter(this, "SourceActor", "devtools/server/actors/script", true);
// loader.lazyRequireGetter(this, "isEvalSource", "devtools/server/actors/script", true);
// loader.lazyRequireGetter(this, "SourceMapConsumer", "source-map", true);
// loader.lazyRequireGetter(this, "SourceMapGenerator", "source-map", true);

/**
 * Manages the sources for a thread. Handles source maps, locations in the
 * sources, etc for ThreadActors.
 */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function TabSources(threadActor) {
  var allowSourceFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };

  EventEmitter.decorate(this);

  this._thread = threadActor;
  this._useSourceMaps = true;
  this._autoBlackBox = true;
  this._anonSourceMapId = 1;
  this.allowSource = function (source) {
    return !isHiddenSource(source) && allowSourceFn(source);
  };

  this.blackBoxedSources = new Set();
  this.prettyPrintedSources = new Map();

  // generated Debugger.Source -> promise of SourceMapConsumer
  this._sourceMaps = new Map();
  // sourceMapURL -> promise of SourceMapConsumer
  this._sourceMapCache = Object.create(null);
  // Debugger.Source -> SourceActor
  this._sourceActors = new Map();
  // url -> SourceActor
  this._sourceMappedSourceActors = Object.create(null);
}

/**
 * Matches strings of the form "foo.min.js" or "foo-min.js", etc. If the regular
 * expression matches, we can be fairly sure that the source is minified, and
 * treat it as such.
 */
var MINIFIED_SOURCE_REGEXP = /\bmin\.js$/;

TabSources.prototype = {
  /**
   * Update preferences and clear out existing sources
   */
  reconfigure: function reconfigure(options) {
    if ('useSourceMaps' in options) {
      this._useSourceMaps = options.useSourceMaps;
    }

    if ('autoBlackBox' in options) {
      this._autoBlackBox = options.autoBlackBox;
    }

    this.reset();
  },

  /**
   * Clear existing sources so they are recreated on the next access.
   *
   * @param Object opts
   *        Specify { sourceMaps: true } if you also want to clear
   *        the source map cache (usually done on reload).
   */
  reset: function reset() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this._sourceActors = new Map();
    this._sourceMaps = new Map();
    this._sourceMappedSourceActors = Object.create(null);

    if (opts.sourceMaps) {
      this._sourceMapCache = Object.create(null);
    }
  },

  /**
   * Return the source actor representing the `source` (or
   * `originalUrl`), creating one if none exists already. May return
   * null if the source is disallowed.
   *
   * @param Debugger.Source source
   *        The source to make an actor for
   * @param String originalUrl
   *        The original source URL of a sourcemapped source
   * @param optional Debguger.Source generatedSource
   *        The generated source that introduced this source via source map,
   *        if any.
   * @param optional String contentType
   *        The content type of the source, if immediately available.
   * @returns a SourceActor representing the source or null.
   */
  source: function source(_ref) {
    var _source = _ref.source,
        originalUrl = _ref.originalUrl,
        generatedSource = _ref.generatedSource,
        isInlineSource = _ref.isInlineSource,
        contentType = _ref.contentType;

    dbg_assert(_source || originalUrl && generatedSource, "TabSources.prototype.source needs an originalUrl or a source");

    if (_source) {
      // If a source is passed, we are creating an actor for a real
      // source, which may or may not be sourcemapped.

      if (!this.allowSource(_source)) {
        return null;
      }

      // It's a hack, but inline HTML scripts each have real sources,
      // but we want to represent all of them as one source as the
      // HTML page. The actor representing this fake HTML source is
      // stored in this array, which always has a URL, so check it
      // first.
      if (_source.url in this._sourceMappedSourceActors) {
        return this._sourceMappedSourceActors[_source.url];
      }

      if (isInlineSource) {
        // If it's an inline source, the fake HTML source hasn't been
        // created yet (would have returned above), so flip this source
        // into a sourcemapped state by giving it an `originalUrl` which
        // is the HTML url.
        originalUrl = _source.url;
        _source = null;
      } else if (this._sourceActors.has(_source)) {
        return this._sourceActors.get(_source);
      }
    } else if (originalUrl) {
      // Not all "original" scripts are distinctly separate from the
      // generated script. Pretty-printed sources have a sourcemap for
      // themselves, so we need to make sure there a real source
      // doesn't already exist with this URL.
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._sourceActors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _ref2 = _step.value;

          var _ref3 = _slicedToArray(_ref2, 2);

          var source = _ref3[0];
          var _actor = _ref3[1];

          if (source.url === originalUrl) {
            return _actor;
          }
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

      if (originalUrl in this._sourceMappedSourceActors) {
        return this._sourceMappedSourceActors[originalUrl];
      }
    }

    var actor = new SourceActor({
      thread: this._thread,
      source: _source,
      originalUrl: originalUrl,
      generatedSource: generatedSource,
      isInlineSource: isInlineSource,
      contentType: contentType
    });

    var sourceActorStore = this._thread.sourceActorStore;
    var id = sourceActorStore.getReusableActorId(_source, originalUrl);
    if (id) {
      actor.actorID = id;
    }

    this._thread.threadLifetimePool.addActor(actor);
    sourceActorStore.setReusableActorId(_source, originalUrl, actor.actorID);

    if (this._autoBlackBox && this._isMinifiedURL(actor.url)) {
      this.blackBox(actor.url);
    }

    if (_source) {
      this._sourceActors.set(_source, actor);
    } else {
      this._sourceMappedSourceActors[originalUrl] = actor;
    }

    this._emitNewSource(actor);
    return actor;
  },

  _emitNewSource: function _emitNewSource(actor) {
    var _this = this;

    if (!actor.source) {
      // Always notify if we don't have a source because that means
      // it's something that has been sourcemapped, or it represents
      // the HTML file that contains inline sources.
      this.emit('newSource', actor);
    } else {
      // If sourcemapping is enabled and a source has sourcemaps, we
      // create `SourceActor` instances for both the original and
      // generated sources. The source actors for the generated
      // sources are only for internal use, however; breakpoints are
      // managed by these internal actors. We only want to notify the
      // user of the original sources though, so if the actor has a
      // `Debugger.Source` instance and a valid source map (meaning
      // it's a generated source), don't send the notification.
      this.fetchSourceMap(actor.source).then(function (map) {
        if (!map) {
          _this.emit('newSource', actor);
        }
      });
    }
  },

  getSourceActor: function getSourceActor(source) {
    if (source.url in this._sourceMappedSourceActors) {
      return this._sourceMappedSourceActors[source.url];
    }

    if (this._sourceActors.has(source)) {
      return this._sourceActors.get(source);
    }

    throw new Error('getSource: could not find source actor for ' + (source.url || 'source'));
  },

  getSourceActorByURL: function getSourceActorByURL(url) {
    if (url) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._sourceActors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _ref4 = _step2.value;

          var _ref5 = _slicedToArray(_ref4, 2);

          var source = _ref5[0];
          var actor = _ref5[1];

          if (source.url === url) {
            return actor;
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

      if (url in this._sourceMappedSourceActors) {
        return this._sourceMappedSourceActors[url];
      }
    }

    throw new Error('getSourceByURL: could not find source for ' + url);
  },

  /**
   * Returns true if the URL likely points to a minified resource, false
   * otherwise.
   *
   * @param String aURL
   *        The URL to test.
   * @returns Boolean
   */
  _isMinifiedURL: function _isMinifiedURL(aURL) {
    try {
      var url = Services.io.newURI(aURL, null, null).QueryInterface(Ci.nsIURL);
      return MINIFIED_SOURCE_REGEXP.test(url.fileName);
    } catch (e) {
      // Not a valid URL so don't try to parse out the filename, just test the
      // whole thing with the minified source regexp.
      return MINIFIED_SOURCE_REGEXP.test(aURL);
    }
  },

  /**
   * Create a source actor representing this source. This ignores
   * source mapping and always returns an actor representing this real
   * source. Use `createSourceActors` if you want to respect source maps.
   *
   * @param Debugger.Source aSource
   *        The source instance to create an actor for.
   * @returns SourceActor
   */
  createNonSourceMappedActor: function createNonSourceMappedActor(aSource) {
    // Don't use getSourceURL because we don't want to consider the
    // displayURL property if it's an eval source. We only want to
    // consider real URLs, otherwise if there is a URL but it's
    // invalid the code below will not set the content type, and we
    // will later try to fetch the contents of the URL to figure out
    // the content type, but it's a made up URL for eval sources.
    var url = isEvalSource(aSource) ? null : aSource.url;
    var spec = { source: aSource };

    // XXX bug 915433: We can't rely on Debugger.Source.prototype.text
    // if the source is an HTML-embedded <script> tag. Since we don't
    // have an API implemented to detect whether this is the case, we
    // need to be conservative and only treat valid js files as real
    // sources. Otherwise, use the `originalUrl` property to treat it
    // as an HTML source that manages multiple inline sources.

    // Assume the source is inline if the element that introduced it is not a
    // script element, or does not have a src attribute.
    var element = aSource.element ? aSource.element.unsafeDereference() : null;
    if (element && (element.tagName !== "SCRIPT" || !element.hasAttribute("src"))) {
      spec.isInlineSource = true;
    } else {
      if (url) {
        try {
          var urlInfo = Services.io.newURI(url, null, null).QueryInterface(Ci.nsIURL);
          if (urlInfo.fileExtension === "xml") {
            // XUL inline scripts may not correctly have the
            // `source.element` property, so do a blunt check here if
            // it's an xml page.
            spec.isInlineSource = true;
          } else if (urlInfo.fileExtension === "js") {
            spec.contentType = "text/javascript";
          }
        } catch (ex) {
          // There are a few special URLs that we know are JavaScript:
          // inline `javascript:` and code coming from the console
          if (url.indexOf("javascript:") === 0 || url === 'debugger eval code') {
            spec.contentType = "text/javascript";
          }
        }
      } else {
        // Assume the content is javascript if there's no URL
        spec.contentType = "text/javascript";
      }
    }
    return this.source(spec);
  },

  /**
   * This is an internal function that returns a promise of an array
   * of source actors representing all the source mapped sources of
   * `aSource`, or `null` if the source is not sourcemapped or
   * sourcemapping is disabled. Users should call `createSourceActors`
   * instead of this.
   *
   * @param Debugger.Source aSource
   *        The source instance to create actors for.
   * @return Promise of an array of source actors
   */
  _createSourceMappedActors: function _createSourceMappedActors(aSource) {
    var _this2 = this;

    if (!this._useSourceMaps || !aSource.sourceMapURL) {
      return resolve(null);
    }

    return this.fetchSourceMap(aSource).then(function (map) {
      if (map) {
        return map.sources.map(function (s) {
          return _this2.source({ originalUrl: s, generatedSource: aSource });
        }).filter(isNotNull);
      }
      return null;
    });
  },

  /**
   * Creates the source actors representing the appropriate sources
   * of `aSource`. If sourcemapped, returns actors for all of the original
   * sources, otherwise returns a 1-element array with the actor for
   * `aSource`.
   *
   * @param Debugger.Source aSource
   *        The source instance to create actors for.
   * @param Promise of an array of source actors
   */
  createSourceActors: function createSourceActors(aSource) {
    var _this3 = this;

    return this._createSourceMappedActors(aSource).then(function (actors) {
      var actor = _this3.createNonSourceMappedActor(aSource);
      return (actors || [actor]).filter(isNotNull);
    });
  },

  /**
   * Return a promise of a SourceMapConsumer for the source map for
   * `aSource`; if we already have such a promise extant, return that.
   * This will fetch the source map if we don't have a cached object
   * and source maps are enabled (see `_fetchSourceMap`).
   *
   * @param Debugger.Source aSource
   *        The source instance to get sourcemaps for.
   * @return Promise of a SourceMapConsumer
   */
  fetchSourceMap: function fetchSourceMap(aSource) {
    if (this._sourceMaps.has(aSource)) {
      return this._sourceMaps.get(aSource);
    } else if (!aSource || !aSource.sourceMapURL) {
      return resolve(null);
    }

    var sourceMapURL = aSource.sourceMapURL;
    if (aSource.url) {
      sourceMapURL = this._normalize(sourceMapURL, aSource.url);
    }
    var result = this._fetchSourceMap(sourceMapURL, aSource.url);

    // The promises in `_sourceMaps` must be the exact same instances
    // as returned by `_fetchSourceMap` for `clearSourceMapCache` to work.
    this._sourceMaps.set(aSource, result);
    return result;
  },

  /**
   * Return a promise of a SourceMapConsumer for the source map for
   * `aSource`. The resolved result may be null if the source does not
   * have a source map or source maps are disabled.
   */
  getSourceMap: function getSourceMap(aSource) {
    return resolve(this._sourceMaps.get(aSource));
  },

  /**
   * Set a SourceMapConsumer for the source map for
   * |aSource|.
   */
  setSourceMap: function setSourceMap(aSource, aMap) {
    this._sourceMaps.set(aSource, resolve(aMap));
  },

  /**
   * Return a promise of a SourceMapConsumer for the source map located at
   * |aAbsSourceMapURL|, which must be absolute. If there is already such a
   * promise extant, return it. This will not fetch if source maps are
   * disabled.
   *
   * @param string aAbsSourceMapURL
   *        The source map URL, in absolute form, not relative.
   * @param string aScriptURL
   *        When the source map URL is a data URI, there is no sourceRoot on the
   *        source map, and the source map's sources are relative, we resolve
   *        them from aScriptURL.
   */
  _fetchSourceMap: function _fetchSourceMap(aAbsSourceMapURL, aSourceURL) {
    var _this4 = this;

    if (!this._useSourceMaps) {
      return resolve(null);
    } else if (this._sourceMapCache[aAbsSourceMapURL]) {
      return this._sourceMapCache[aAbsSourceMapURL];
    }

    var fetching = fetch(aAbsSourceMapURL, { loadFromCache: false }).then(function (_ref6) {
      var content = _ref6.content;

      var map = new SourceMapConsumer(content);
      _this4._setSourceMapRoot(map, aAbsSourceMapURL, aSourceURL);
      return map;
    }).then(null, function (error) {
      if (!DevToolsUtils.reportingDisabled) {
        DevToolsUtils.reportException("TabSources.prototype._fetchSourceMap", error);
      }
      return null;
    });
    this._sourceMapCache[aAbsSourceMapURL] = fetching;
    return fetching;
  },

  /**
   * Sets the source map's sourceRoot to be relative to the source map url.
   */
  _setSourceMapRoot: function _setSourceMapRoot(aSourceMap, aAbsSourceMapURL, aScriptURL) {
    // No need to do this fiddling if we won't be fetching any sources over the
    // wire.
    if (aSourceMap.hasContentsOfAllSources()) {
      return;
    }

    var base = this._dirname(aAbsSourceMapURL.indexOf("data:") === 0 ? aScriptURL : aAbsSourceMapURL);
    aSourceMap.sourceRoot = aSourceMap.sourceRoot ? this._normalize(aSourceMap.sourceRoot, base) : base;
  },

  _dirname: function _dirname(aPath) {
    return Services.io.newURI(".", null, Services.io.newURI(aPath, null, null)).spec;
  },

  /**
   * Clears the source map cache. Source maps are cached by URL so
   * they can be reused across separate Debugger instances (once in
   * this cache, they will never be reparsed again). They are
   * also cached by Debugger.Source objects for usefulness. By default
   * this just removes the Debugger.Source cache, but you can remove
   * the lower-level URL cache with the `hard` option.
   *
   * @param aSourceMapURL string
   *        The source map URL to uncache
   * @param opts object
   *        An object with the following properties:
   *        - hard: Also remove the lower-level URL cache, which will
   *          make us completely forget about the source map.
   */
  clearSourceMapCache: function clearSourceMapCache(aSourceMapURL) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { hard: false };

    var oldSm = this._sourceMapCache[aSourceMapURL];

    if (opts.hard) {
      delete this._sourceMapCache[aSourceMapURL];
    }

    if (oldSm) {
      // Clear out the current cache so all sources will get the new one
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this._sourceMaps.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _ref7 = _step3.value;

          var _ref8 = _slicedToArray(_ref7, 2);

          var source = _ref8[0];
          var sm = _ref8[1];

          if (sm === oldSm) {
            this._sourceMaps.delete(source);
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
    }
  },

  /*
   * Forcefully change the source map of a source, changing the
   * sourceMapURL and installing the source map in the cache. This is
   * necessary to expose changes across Debugger instances
   * (pretty-printing is the use case). Generate a random url if one
   * isn't specified, allowing you to set "anonymous" source maps.
   *
   * @param aSource Debugger.Source
   *        The source to change the sourceMapURL property
   * @param aUrl string
   *        The source map URL (optional)
   * @param aMap SourceMapConsumer
   *        The source map instance
   */
  setSourceMapHard: function setSourceMapHard(aSource, aUrl, aMap) {
    var url = aUrl;
    if (!url) {
      // This is a littly hacky, but we want to forcefully set a
      // sourcemap regardless of sourcemap settings. We want to
      // literally change the sourceMapURL so that all debuggers will
      // get this and pretty-printing will Just Work (Debugger.Source
      // instances are per-debugger, so we can't key off that). To
      // avoid tons of work serializing the sourcemap into a data url,
      // just make a fake URL and stick the sourcemap there.
      url = "internal://sourcemap" + this._anonSourceMapId++ + '/';
    }
    aSource.sourceMapURL = url;

    // Forcefully set the sourcemap cache. This will be used even if
    // sourcemaps are disabled.
    this._sourceMapCache[url] = resolve(aMap);
  },

  /**
   * Return the non-source-mapped location of the given Debugger.Frame. If the
   * frame does not have a script, the location's properties are all null.
   *
   * @param Debugger.Frame aFrame
   *        The frame whose location we are getting.
   * @returns Object
   *          Returns an object of the form { source, line, column }
   */
  getFrameLocation: function getFrameLocation(aFrame) {
    if (!aFrame || !aFrame.script) {
      return new GeneratedLocation();
    }

    return new GeneratedLocation(this.createNonSourceMappedActor(aFrame.script.source), aFrame.script.getOffsetLine(aFrame.offset), getOffsetColumn(aFrame.offset, aFrame.script));
  },

  /**
   * Returns a promise of the location in the original source if the source is
   * source mapped, otherwise a promise of the same location. This can
   * be called with a source from *any* Debugger instance and we make
   * sure to that it works properly, reusing source maps if already
   * fetched. Use this from any actor that needs sourcemapping.
   */
  getOriginalLocation: function getOriginalLocation(generatedLocation) {
    var _this5 = this;

    var generatedSourceActor = generatedLocation.generatedSourceActor,
        generatedLine = generatedLocation.generatedLine,
        generatedColumn = generatedLocation.generatedColumn;

    var source = generatedSourceActor.source;
    var url = source ? source.url : generatedSourceActor._originalUrl;

    // In certain scenarios the source map may have not been fetched
    // yet (or at least tied to this Debugger.Source instance), so use
    // `fetchSourceMap` instead of `getSourceMap`. This allows this
    // function to be called from anywere (across debuggers) and it
    // should just automatically work.
    return this.fetchSourceMap(source).then(function (map) {
      if (map) {
        var _map$originalPosition = map.originalPositionFor({
          line: generatedLine,
          column: generatedColumn == null ? Infinity : generatedColumn
        }),
            originalUrl = _map$originalPosition.source,
            originalLine = _map$originalPosition.line,
            originalColumn = _map$originalPosition.column,
            originalName = _map$originalPosition.name;

        // Since the `Debugger.Source` instance may come from a
        // different `Debugger` instance (any actor can call this
        // method), we can't rely on any of the source discovery
        // setup (`_discoverSources`, etc) to have been run yet. So
        // we have to assume that the actor may not already exist,
        // and we might need to create it, so use `source` and give
        // it the required parameters for a sourcemapped source.


        return new OriginalLocation(originalUrl ? _this5.source({
          originalUrl: originalUrl,
          generatedSource: source
        }) : null, originalLine, originalColumn, originalName);
      }

      // No source map
      return OriginalLocation.fromGeneratedLocation(generatedLocation);
    });
  },

  getAllGeneratedLocations: function getAllGeneratedLocations(originalLocation) {
    var _this6 = this;

    var originalSourceActor = originalLocation.originalSourceActor,
        originalLine = originalLocation.originalLine,
        originalColumn = originalLocation.originalColumn;


    var source = originalSourceActor.source || originalSourceActor.generatedSource;

    return this.fetchSourceMap(source).then(function (map) {
      if (map) {
        map.computeColumnSpans();

        return map.allGeneratedPositionsFor({
          source: originalSourceActor.url,
          line: originalLine,
          column: originalColumn
        }).map(function (_ref9) {
          var line = _ref9.line,
              column = _ref9.column,
              lastColumn = _ref9.lastColumn;

          return new GeneratedLocation(_this6.createNonSourceMappedActor(source), line, column, lastColumn);
        });
      }

      return [GeneratedLocation.fromOriginalLocation(originalLocation)];
    });
  },

  /**
   * Returns a promise of the location in the generated source corresponding to
   * the original source and line given.
   *
   * When we pass a script S representing generated code to `sourceMap`,
   * above, that returns a promise P. The process of resolving P populates
   * the tables this function uses; thus, it won't know that S's original
   * source URLs map to S until P is resolved.
   */
  getGeneratedLocation: function getGeneratedLocation(originalLocation) {
    var _this7 = this;

    var originalSourceActor = originalLocation.originalSourceActor;

    // Both original sources and normal sources could have sourcemaps,
    // because normal sources can be pretty-printed which generates a
    // sourcemap for itself. Check both of the source properties to make it work
    // for both kinds of sources.

    var source = originalSourceActor.source || originalSourceActor.generatedSource;

    // See comment about `fetchSourceMap` in `getOriginalLocation`.
    return this.fetchSourceMap(source).then(function (map) {
      if (map) {
        var originalLine = originalLocation.originalLine,
            originalColumn = originalLocation.originalColumn;

        var _map$generatedPositio = map.generatedPositionFor({
          source: originalSourceActor.url,
          line: originalLine,
          column: originalColumn == null ? 0 : originalColumn,
          bias: SourceMapConsumer.LEAST_UPPER_BOUND
        }),
            generatedLine = _map$generatedPositio.line,
            generatedColumn = _map$generatedPositio.column;

        return new GeneratedLocation(_this7.createNonSourceMappedActor(source), generatedLine, generatedColumn);
      }

      return GeneratedLocation.fromOriginalLocation(originalLocation);
    });
  },

  /**
   * Returns true if URL for the given source is black boxed.
   *
   * @param aURL String
   *        The URL of the source which we are checking whether it is black
   *        boxed or not.
   */
  isBlackBoxed: function isBlackBoxed(aURL) {
    return this.blackBoxedSources.has(aURL);
  },

  /**
   * Add the given source URL to the set of sources that are black boxed.
   *
   * @param aURL String
   *        The URL of the source which we are black boxing.
   */
  blackBox: function blackBox(aURL) {
    this.blackBoxedSources.add(aURL);
  },

  /**
   * Remove the given source URL to the set of sources that are black boxed.
   *
   * @param aURL String
   *        The URL of the source which we are no longer black boxing.
   */
  unblackBox: function unblackBox(aURL) {
    this.blackBoxedSources.delete(aURL);
  },

  /**
   * Returns true if the given URL is pretty printed.
   *
   * @param aURL String
   *        The URL of the source that might be pretty printed.
   */
  isPrettyPrinted: function isPrettyPrinted(aURL) {
    return this.prettyPrintedSources.has(aURL);
  },

  /**
   * Add the given URL to the set of sources that are pretty printed.
   *
   * @param aURL String
   *        The URL of the source to be pretty printed.
   */
  prettyPrint: function prettyPrint(aURL, aIndent) {
    this.prettyPrintedSources.set(aURL, aIndent);
  },

  /**
   * Return the indent the given URL was pretty printed by.
   */
  prettyPrintIndent: function prettyPrintIndent(aURL) {
    return this.prettyPrintedSources.get(aURL);
  },

  /**
   * Remove the given URL from the set of sources that are pretty printed.
   *
   * @param aURL String
   *        The URL of the source that is no longer pretty printed.
   */
  disablePrettyPrint: function disablePrettyPrint(aURL) {
    this.prettyPrintedSources.delete(aURL);
  },

  /**
   * Normalize multiple relative paths towards the base paths on the right.
   */
  _normalize: function _normalize() {
    for (var _len = arguments.length, aURLs = Array(_len), _key = 0; _key < _len; _key++) {
      aURLs[_key] = arguments[_key];
    }

    dbg_assert(aURLs.length > 1, "Should have more than 1 URL");
    var base = Services.io.newURI(aURLs.pop(), null, null);
    var url = void 0;
    while (url = aURLs.pop()) {
      base = Services.io.newURI(url, null, base);
    }
    return base.spec;
  },

  iter: function iter() {
    var _this8 = this;

    var actors = Object.keys(this._sourceMappedSourceActors).map(function (k) {
      return _this8._sourceMappedSourceActors[k];
    });
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = this._sourceActors.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var actor = _step4.value;

        if (!this._sourceMaps.has(actor.source)) {
          actors.push(actor);
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

    return actors;
  }
};

/*
 * Checks if a source should never be displayed to the user because
 * it's either internal or we don't support in the UI yet.
 */
function isHiddenSource(aSource) {
  // Ignore the internal Function.prototype script
  return aSource.text === '() {\n}';
}

/**
 * Returns true if its argument is not null.
 */
function isNotNull(aThing) {
  return aThing !== null;
}

exports.TabSources = TabSources;
exports.isHiddenSource = isHiddenSource;

cc._RF.pop();