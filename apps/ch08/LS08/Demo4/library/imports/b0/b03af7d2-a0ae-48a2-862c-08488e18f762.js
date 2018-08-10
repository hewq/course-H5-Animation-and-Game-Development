"use strict";
cc._RF.push(module, 'b03affSoK5IooYsCEiOGPdi', 'UIScrollView');
// frameworks/cocos2d-html5/extensions/ccui/uiwidgets/scroll-widget/UIScrollView.js

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
 * The ScrollView control of Cocos UI
 * @class
 * @extends ccui.Layout
 *
 * @property {Number}               innerWidth              - Inner container width of the scroll view
 * @property {Number}               innerHeight             - Inner container height of the scroll view
 * @property {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH}    direction               - Scroll direction of the scroll view
 * @property {Boolean}              bounceEnabled           - Indicate whether bounce is enabled
 * @property {Boolean}              inertiaScrollEnabled    - Indicate whether inertiaScroll is enabled
 * @property {Number}               touchTotalTimeThreshold - Touch total time threshold
 */
ccui.ScrollView = ccui.Layout.extend( /** @lends ccui.ScrollView# */{
    _innerContainer: null,
    _direction: null,

    _topBoundary: 0,
    _bottomBoundary: 0,
    _leftBoundary: 0,
    _rightBoundary: 0,

    _touchMoveDisplacements: null,
    _touchMoveTimeDeltas: null,
    _touchMovePreviousTimestamp: 0,
    _touchTotalTimeThreshold: 0.5,

    _autoScrolling: false,
    _autoScrollTargetDelta: null,
    _autoScrollAttenuate: true,
    _autoScrollStartPosition: null,
    _autoScrollTotalTime: 0,
    _autoScrollAccumulatedTime: 0,
    _autoScrollCurrentlyOutOfBoundary: false,
    _autoScrollBraking: false,
    _autoScrollBrakingStartPosition: null,

    _bePressed: false,

    _childFocusCancelOffset: 0,

    bounceEnabled: false,

    _outOfBoundaryAmount: null,
    _outOfBoundaryAmountDirty: true,

    inertiaScrollEnabled: false,

    _scrollBarEnabled: true,
    _verticalScrollBar: null,
    _horizontalScrollBar: null,

    _scrollViewEventListener: null,
    _scrollViewEventSelector: null,
    _className: "ScrollView",

    /**
     * Allocates and initializes a UIScrollView.
     * Constructor of ccui.ScrollView. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @example
     * // example
     * var uiScrollView = new ccui.ScrollView();
     */
    ctor: function ctor() {
        ccui.Layout.prototype.ctor.call(this);
        this.setClippingEnabled(true);
        this._innerContainer.setTouchEnabled(false);

        this._direction = ccui.ScrollView.DIR_NONE;

        this._childFocusCancelOffset = 5;
        this.inertiaScrollEnabled = true;

        this._outOfBoundaryAmount = cc.p(0, 0);
        this._autoScrollTargetDelta = cc.p(0, 0);
        this._autoScrollStartPosition = cc.p(0, 0);
        this._autoScrollBrakingStartPosition = cc.p(0, 0);
        this._touchMoveDisplacements = [];
        this._touchMoveTimeDeltas = [];
        this._touchMovePreviousTimestamp = 0;

        this._scrollBarEnabled = true;
        this._initScrollBar();

        this.setTouchEnabled(true);
    },

    /**
     * Calls the parent class' onEnter and schedules update function.
     * @override
     */
    onEnter: function onEnter() {
        ccui.Layout.prototype.onEnter.call(this);
        this.scheduleUpdate();
    },

    onExit: function onExit() {
        cc.renderer._removeCache(this.__instanceId);
        ccui.Layout.prototype.onExit.call(this);
    },

    visit: function visit(parent) {
        var cmd = this._renderCmd,
            parentCmd = parent ? parent._renderCmd : null;

        // quick return if not visible
        if (!this._visible) {
            cmd._propagateFlagsDown(parentCmd);
            return;
        }

        this._adaptRenderers();
        this._doLayout();

        var renderer = cc.renderer;
        cmd.visit(parentCmd);

        renderer.pushRenderCommand(cmd);
        if (cmd instanceof ccui.ScrollView.WebGLRenderCmd) {
            var currentID = this.__instanceId;
            renderer._turnToCacheMode(currentID);
        }

        var stencilClipping = this._clippingEnabled && this._clippingType === ccui.Layout.CLIPPING_STENCIL;
        var scissorClipping = this._clippingEnabled && this._clippingType === ccui.Layout.CLIPPING_SCISSOR;

        if (stencilClipping) {
            cmd.stencilClippingVisit(parentCmd);
        } else if (scissorClipping) {
            cmd.scissorClippingVisit(parentCmd);
        }

        var i,
            children = this._children,
            len = children.length,
            child;
        var j,
            pChildren = this._protectedChildren,
            pLen = pChildren.length,
            pChild;

        if (this._reorderChildDirty) this.sortAllChildren();
        if (this._reorderProtectedChildDirty) this.sortAllProtectedChildren();
        for (i = 0; i < len; i++) {
            child = children[i];
            if (child && child._visible) {
                child.visit(this);
            }
        }
        for (j = 0; j < pLen; j++) {
            pChild = pChildren[j];
            if (pChild && pChild._visible) {
                cmd._changeProtectedChild(pChild);
                pChild.visit(this);
            }
        }

        if (stencilClipping) {
            cmd.postStencilVisit();
        } else if (scissorClipping) {
            cmd.postScissorVisit();
        }

        if (cmd instanceof ccui.ScrollView.WebGLRenderCmd) {
            renderer._turnToNormalMode();
        }

        // Need to update children after do layout
        this.updateChildren();

        cmd._dirtyFlag = 0;
    },

    /**
     * When a widget is in a layout, you could call this method to get the next focused widget within a specified _direction.             <br/>
     * If the widget is not in a layout, it will return itself
     *
     * @param {Number} _direction the _direction to look for the next focused widget in a layout
     * @param {ccui.Widget} current the current focused widget
     * @returns {ccui.Widget}
     */
    findNextFocusedWidget: function findNextFocusedWidget(direction, current) {
        if (this.getLayoutType() === ccui.Layout.LINEAR_VERTICAL || this.getLayoutType() === ccui.Layout.LINEAR_HORIZONTAL) {
            return this._innerContainer.findNextFocusedWidget(direction, current);
        } else return ccui.Widget.prototype.findNextFocusedWidget.call(this, direction, current);
    },

    _initRenderer: function _initRenderer() {
        ccui.Layout.prototype._initRenderer.call(this);

        this._innerContainer = new ccui.Layout();
        this._innerContainer.setColor(cc.color(255, 255, 255));
        this._innerContainer.setOpacity(255);
        this._innerContainer.setCascadeColorEnabled(true);
        this._innerContainer.setCascadeOpacityEnabled(true);

        this.addProtectedChild(this._innerContainer, 1, 1);
    },

    _createRenderCmd: function _createRenderCmd() {
        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) return new ccui.ScrollView.WebGLRenderCmd(this);else return new ccui.ScrollView.CanvasRenderCmd(this);
    },

    _onSizeChanged: function _onSizeChanged() {
        ccui.Layout.prototype._onSizeChanged.call(this);
        var locSize = this._contentSize;
        this._topBoundary = locSize.height;
        this._rightBoundary = locSize.width;
        var innerSize = this._innerContainer.getContentSize();
        this._innerContainer.setContentSize(cc.size(Math.max(innerSize.width, locSize.width), Math.max(innerSize.height, locSize.height)));
        this._innerContainer.setPosition(0, locSize.height - this._innerContainer.getContentSize().height);

        if (this._verticalScrollBar) this._verticalScrollBar.onScrolled(this._getHowMuchOutOfBoundary());

        if (this._horizontalScrollBar) this._horizontalScrollBar.onScrolled(this._getHowMuchOutOfBoundary());
    },

    /**
     * Changes inner container size of ScrollView.     <br/>
     * Inner container size must be larger than or equal the size of ScrollView.
     * @param {cc.Size} size inner container size.
     */
    setInnerContainerSize: function setInnerContainerSize(size) {
        var innerContainer = this._innerContainer,
            locSize = this._contentSize,
            innerSizeWidth = locSize.width,
            innerSizeHeight = locSize.height;

        if (size.width < locSize.width) cc.log("Inner width <= ScrollView width, it will be force sized!");else innerSizeWidth = size.width;

        if (size.height < locSize.height) cc.log("Inner height <= ScrollView height, it will be force sized!");else innerSizeHeight = size.height;

        innerContainer.setContentSize(cc.size(innerSizeWidth, innerSizeHeight));

        var pos = this._innerContainer.getPosition();
        var contAP = this._innerContainer.getAnchorPoint();

        if (this._innerContainer.getLeftBoundary() != 0.0) {
            pos.x = contAP.x * innerSizeWidth;
        }
        if (this._innerContainer.getTopBoundary() != this._contentSize.height) {
            pos.y = this._contentSize.height - (1.0 - contAP.y) * innerSizeHeight;
        }
        this.setInnerContainerPosition(pos);

        this._updateScrollBar(cc.p(0, 0));
    },

    _setInnerWidth: function _setInnerWidth(width) {
        var locW = this._contentSize.width,
            innerWidth = locW,
            container = this._innerContainer,
            oldInnerWidth = container.width;
        if (width < locW) cc.log("Inner width <= scrollview width, it will be force sized!");else innerWidth = width;
        container.width = innerWidth;

        switch (this._direction) {
            case ccui.ScrollView.DIR_HORIZONTAL:
            case ccui.ScrollView.DIR_BOTH:
                if (container.getRightBoundary() <= locW) {
                    var newInnerWidth = container.width;
                    var offset = oldInnerWidth - newInnerWidth;
                    this._scrollChildren(offset, 0);
                }
                break;
        }
        var innerAX = container.anchorX;
        if (container.getLeftBoundary() > 0.0) container.x = innerAX * innerWidth;
        if (container.getRightBoundary() < locW) container.x = locW - (1.0 - innerAX) * innerWidth;
    },

    _setInnerHeight: function _setInnerHeight(height) {
        var locH = this._contentSize.height,
            innerHeight = locH,
            container = this._innerContainer,
            oldInnerHeight = container.height;
        if (height < locH) cc.log("Inner height <= scrollview height, it will be force sized!");else innerHeight = height;
        container.height = innerHeight;

        switch (this._direction) {
            case ccui.ScrollView.DIR_VERTICAL:
            case ccui.ScrollView.DIR_BOTH:
                var newInnerHeight = innerHeight;
                var offset = oldInnerHeight - newInnerHeight;
                this._scrollChildren(0, offset);
                break;
        }
        var innerAY = container.anchorY;
        if (container.getLeftBoundary() > 0.0) container.y = innerAY * innerHeight;
        if (container.getRightBoundary() < locH) container.y = locH - (1.0 - innerAY) * innerHeight;
    },
    /**
     * Set inner container position
     *
     * @param {cc.Point} position Inner container position.
     */
    setInnerContainerPosition: function setInnerContainerPosition(position) {
        if (position.x === this._innerContainer.getPositionX() && position.y === this._innerContainer.getPositionY()) {
            return;
        }
        this._innerContainer.setPosition(position);
        this._outOfBoundaryAmountDirty = true;

        // Process bouncing events
        if (this.bounceEnabled) {
            for (var _direction = ccui.ScrollView.MOVEDIR_TOP; _direction < ccui.ScrollView.MOVEDIR_RIGHT; ++_direction) {
                if (this._isOutOfBoundary(_direction)) {
                    this._processScrollEvent(_direction, true);
                }
            }
        }

        this._dispatchEvent(ccui.ScrollView.EVENT_CONTAINER_MOVED);
    },

    /**
     * Get inner container position
     *
     * @return The inner container position.
     */
    getInnerContainerPosition: function getInnerContainerPosition() {
        return this._innerContainer.getPosition();
    },

    /**
     * Returns inner container size of ScrollView.     <br/>
     * Inner container size must be larger than or equal ScrollView's size.
     *
     * @return {cc.Size} inner container size.
     */
    getInnerContainerSize: function getInnerContainerSize() {
        return this._innerContainer.getContentSize();
    },
    _getInnerWidth: function _getInnerWidth() {
        return this._innerContainer.width;
    },
    _getInnerHeight: function _getInnerHeight() {
        return this._innerContainer.height;
    },

    _isInContainer: function _isInContainer(widget) {
        if (!this._clippingEnabled) return true;
        var wPos = widget._position,
            wSize = widget._contentSize,
            wAnchor = widget._anchorPoint,
            size = this._customSize,
            pos = this._innerContainer._position,
            bottom = 0,
            left = 0;
        if (
        // Top
        (bottom = wPos.y - wAnchor.y * wSize.height) >= size.height - pos.y ||
        // Bottom
        bottom + wSize.height <= -pos.y ||
        // right
        (left = wPos.x - wAnchor.x * wSize.width) >= size.width - pos.x ||
        // left
        left + wSize.width <= -pos.x) return false;else return true;
    },

    updateChildren: function updateChildren() {
        var child, i, l;
        var childrenArray = this._innerContainer._children;
        for (i = 0, l = childrenArray.length; i < l; i++) {
            child = childrenArray[i];
            if (child._inViewRect === true && this._isInContainer(child) === false) child._inViewRect = false;else if (child._inViewRect === false && this._isInContainer(child) === true) child._inViewRect = true;
        }
    },
    /**
     * Add child to ccui.ScrollView.
     * @param {cc.Node} widget
     * @param {Number} [zOrder]
     * @param {Number|string} [tag] tag or name
     * @returns {boolean}
     */
    addChild: function addChild(widget, zOrder, tag) {
        if (!widget) return false;
        if (this._isInContainer(widget) === false) widget._inViewRect = false;
        zOrder = zOrder || widget.getLocalZOrder();
        tag = tag || widget.getTag();
        return this._innerContainer.addChild(widget, zOrder, tag);
    },

    /**
     * Removes all children.
     */
    removeAllChildren: function removeAllChildren() {
        this.removeAllChildrenWithCleanup(true);
    },

    /**
     * Removes all children.
     * @param {Boolean} cleanup
     */
    removeAllChildrenWithCleanup: function removeAllChildrenWithCleanup(cleanup) {
        this._innerContainer.removeAllChildrenWithCleanup(cleanup);
    },

    /**
     * Removes widget child
     * @override
     * @param {ccui.Widget} child
     * @param {Boolean} cleanup
     * @returns {boolean}
     */
    removeChild: function removeChild(child, cleanup) {
        return this._innerContainer.removeChild(child, cleanup);
    },

    /**
     * Returns inner container's children
     * @returns {Array}
     */
    getChildren: function getChildren() {
        return this._innerContainer.getChildren();
    },

    /**
     * Gets the count of inner container's children
     * @returns {Number}
     */
    getChildrenCount: function getChildrenCount() {
        return this._innerContainer.getChildrenCount();
    },

    /**
     * Gets a child from the container given its tag
     * @param {Number} tag
     * @returns {ccui.Widget}
     */
    getChildByTag: function getChildByTag(tag) {
        return this._innerContainer.getChildByTag(tag);
    },

    /**
     * Gets a child from the container given its name
     * @param {String} name
     * @returns {ccui.Widget}
     */
    getChildByName: function getChildByName(name) {
        return this._innerContainer.getChildByName(name);
    },

    _flattenVectorByDirection: function _flattenVectorByDirection(vector) {
        var result = cc.p(0, 0);
        result.x = this._direction === ccui.ScrollView.DIR_VERTICAL ? 0 : vector.x;
        result.y = this._direction === ccui.ScrollView.DIR_HORIZONTAL ? 0 : vector.y;
        return result;
    },

    _getHowMuchOutOfBoundary: function _getHowMuchOutOfBoundary(addition) {
        if (addition === undefined) addition = cc.p(0, 0);

        if (addition.x === 0 && addition.y === 0 && !this._outOfBoundaryAmountDirty) {
            return this._outOfBoundaryAmount;
        }

        var outOfBoundaryAmount = cc.p(0, 0);

        if (this._innerContainer.getLeftBoundary() + addition.x > this._leftBoundary) {
            outOfBoundaryAmount.x = this._leftBoundary - (this._innerContainer.getLeftBoundary() + addition.x);
        } else if (this._innerContainer.getRightBoundary() + addition.x < this._rightBoundary) {
            outOfBoundaryAmount.x = this._rightBoundary - (this._innerContainer.getRightBoundary() + addition.x);
        }

        if (this._innerContainer.getTopBoundary() + addition.y < this._topBoundary) {
            outOfBoundaryAmount.y = this._topBoundary - (this._innerContainer.getTopBoundary() + addition.y);
        } else if (this._innerContainer.getBottomBoundary() + addition.y > this._bottomBoundary) {
            outOfBoundaryAmount.y = this._bottomBoundary - (this._innerContainer.getBottomBoundary() + addition.y);
        }

        if (addition.x === 0 && addition.y === 0) {
            this._outOfBoundaryAmount = outOfBoundaryAmount;
            this._outOfBoundaryAmountDirty = false;
        }
        return outOfBoundaryAmount;
    },

    _isOutOfBoundary: function _isOutOfBoundary(dir) {
        var outOfBoundary = this._getHowMuchOutOfBoundary();
        if (dir !== undefined) {
            switch (dir) {
                case ccui.ScrollView.MOVEDIR_TOP:
                    return outOfBoundary.y > 0;
                case ccui.ScrollView.MOVEDIR_BOTTOM:
                    return outOfBoundary.y < 0;
                case ccui.ScrollView.MOVEDIR_LEFT:
                    return outOfBoundary.x < 0;
                case ccui.ScrollView.MOVEDIR_RIGHT:
                    return outOfBoundary.x > 0;
            }
        } else {
            return !this._fltEqualZero(outOfBoundary);
        }

        return false;
    },

    _moveInnerContainer: function _moveInnerContainer(deltaMove, canStartBounceBack) {
        var adjustedMove = this._flattenVectorByDirection(deltaMove);

        this.setInnerContainerPosition(cc.pAdd(this.getInnerContainerPosition(), adjustedMove));

        var outOfBoundary = this._getHowMuchOutOfBoundary();
        this._updateScrollBar(outOfBoundary);

        if (this.bounceEnabled && canStartBounceBack) {
            this._startBounceBackIfNeeded();
        }
    },

    _updateScrollBar: function _updateScrollBar(outOfBoundary) {
        if (this._verticalScrollBar) {
            this._verticalScrollBar.onScrolled(outOfBoundary);
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.onScrolled(outOfBoundary);
        }
    },

    _calculateTouchMoveVelocity: function _calculateTouchMoveVelocity() {
        var totalTime = 0;
        for (var i = 0; i < this._touchMoveTimeDeltas.length; ++i) {
            totalTime += this._touchMoveTimeDeltas[i];
        }
        if (totalTime == 0 || totalTime >= this._touchTotalTimeThreshold) {
            return cc.p(0, 0);
        }

        var totalMovement = cc.p(0, 0);

        for (var i = 0; i < this._touchMoveDisplacements.length; ++i) {
            totalMovement.x += this._touchMoveDisplacements[i].x;
            totalMovement.y += this._touchMoveDisplacements[i].y;
        }

        return cc.pMult(totalMovement, 1 / totalTime);
    },

    /**
     * Set the touch total time threshold
     * @param {Number} touchTotalTimeThreshold
     */
    setTouchTotalTimeThreshold: function setTouchTotalTimeThreshold(touchTotalTimeThreshold) {
        this._touchTotalTimeThreshold = touchTotalTimeThreshold;
    },

    /**
     * Get the touch total time threshold
     * @returns {Number}
     */
    getTouchTotalTimeThreshold: function getTouchTotalTimeThreshold() {
        return this._touchTotalTimeThreshold;
    },

    _startInertiaScroll: function _startInertiaScroll(touchMoveVelocity) {
        var MOVEMENT_FACTOR = 0.7;
        var inertiaTotalMovement = cc.pMult(touchMoveVelocity, MOVEMENT_FACTOR);
        this._startAttenuatingAutoScroll(inertiaTotalMovement, touchMoveVelocity);
    },

    _startBounceBackIfNeeded: function _startBounceBackIfNeeded() {
        if (!this.bounceEnabled) {
            return false;
        }
        var bounceBackAmount = this._getHowMuchOutOfBoundary();
        if (this._fltEqualZero(bounceBackAmount)) {
            return false;
        }

        var BOUNCE_BACK_DURATION = 1.0;
        this._startAutoScroll(bounceBackAmount, BOUNCE_BACK_DURATION, true);
        return true;
    },

    _startAutoScrollToDestination: function _startAutoScrollToDestination(destination, timeInSec, attenuated) {
        this._startAutoScroll(cc.pSub(destination, this._innerContainer.getPosition()), timeInSec, attenuated);
    },

    _calculateAutoScrollTimeByInitialSpeed: function _calculateAutoScrollTimeByInitialSpeed(initialSpeed) {
        // Calculate the time from the initial speed according to quintic polynomial.
        return Math.sqrt(Math.sqrt(initialSpeed / 5));
    },

    _startAttenuatingAutoScroll: function _startAttenuatingAutoScroll(deltaMove, initialVelocity) {
        var time = this._calculateAutoScrollTimeByInitialSpeed(cc.pLength(initialVelocity));
        this._startAutoScroll(deltaMove, time, true);
    },

    _startAutoScroll: function _startAutoScroll(deltaMove, timeInSec, attenuated) {
        var adjustedDeltaMove = this._flattenVectorByDirection(deltaMove);

        this._autoScrolling = true;
        this._autoScrollTargetDelta = adjustedDeltaMove;
        this._autoScrollAttenuate = attenuated;
        this._autoScrollStartPosition = this._innerContainer.getPosition();
        this._autoScrollTotalTime = timeInSec;
        this._autoScrollAccumulatedTime = 0;
        this._autoScrollBraking = false;
        this._autoScrollBrakingStartPosition = cc.p(0, 0);

        // If the destination is also out of boundary of same side, start brake from beggining.
        var currentOutOfBoundary = this._getHowMuchOutOfBoundary();
        if (!this._fltEqualZero(currentOutOfBoundary)) {
            this._autoScrollCurrentlyOutOfBoundary = true;
            var afterOutOfBoundary = this._getHowMuchOutOfBoundary(adjustedDeltaMove);
            if (currentOutOfBoundary.x * afterOutOfBoundary.x > 0 || currentOutOfBoundary.y * afterOutOfBoundary.y > 0) {
                this._autoScrollBraking = true;
            }
        }
    },

    /**
     * Immediately stops inner container scroll initiated by any of the "scrollTo*" member functions
     */
    stopAutoScroll: function stopAutoScroll() {
        this._autoScrolling = false;
        this._autoScrollAttenuate = true;
        this._autoScrollTotalTime = 0;
        this._autoScrollAccumulatedTime = 0;
    },

    _isNecessaryAutoScrollBrake: function _isNecessaryAutoScrollBrake() {
        if (this._autoScrollBraking) {
            return true;
        }

        if (this._isOutOfBoundary()) {
            // It just went out of boundary.
            if (!this._autoScrollCurrentlyOutOfBoundary) {
                this._autoScrollCurrentlyOutOfBoundary = true;
                this._autoScrollBraking = true;
                this._autoScrollBrakingStartPosition = this.getInnerContainerPosition();
                return true;
            }
        } else {
            this._autoScrollCurrentlyOutOfBoundary = false;
        }
        return false;
    },

    _getAutoScrollStopEpsilon: function _getAutoScrollStopEpsilon() {
        return 0.0001;
    },

    _fltEqualZero: function _fltEqualZero(point) {
        return Math.abs(point.x) <= 0.0001 && Math.abs(point.y) <= 0.0001;
    },

    _processAutoScrolling: function _processAutoScrolling(deltaTime) {
        var OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05;
        // Make auto scroll shorter if it needs to deaccelerate.
        var brakingFactor = this._isNecessaryAutoScrollBrake() ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1;

        // Elapsed time
        this._autoScrollAccumulatedTime += deltaTime * (1 / brakingFactor);

        // Calculate the progress percentage
        var percentage = Math.min(1, this._autoScrollAccumulatedTime / this._autoScrollTotalTime);
        if (this._autoScrollAttenuate) {
            percentage -= 1;
            percentage = percentage * percentage * percentage * percentage * percentage + 1;
        }

        // Calculate the new position
        var newPosition = cc.pAdd(this._autoScrollStartPosition, cc.pMult(this._autoScrollTargetDelta, percentage));
        var reachedEnd = Math.abs(percentage - 1) <= this._getAutoScrollStopEpsilon();

        if (this.bounceEnabled) {
            // The new position is adjusted if out of boundary
            newPosition = cc.pAdd(this._autoScrollBrakingStartPosition, cc.pMult(cc.pSub(newPosition, this._autoScrollBrakingStartPosition), brakingFactor));
        } else {
            // Don't let go out of boundary
            var moveDelta = cc.pSub(newPosition, this.getInnerContainerPosition());
            var outOfBoundary = this._getHowMuchOutOfBoundary(moveDelta);
            if (!this._fltEqualZero(outOfBoundary)) {
                newPosition.x += outOfBoundary.x;
                newPosition.y += outOfBoundary.y;

                reachedEnd = true;
            }
        }

        // Finish auto scroll if it ended
        if (reachedEnd) {
            this._autoScrolling = false;
            this._dispatchEvent(ccui.ScrollView.EVENT_AUTOSCROLL_ENDED);
        }

        this._moveInnerContainer(cc.pSub(newPosition, this.getInnerContainerPosition()), reachedEnd);
    },

    _jumpToDestination: function _jumpToDestination(desOrX, y) {
        if (desOrX.x === undefined) {
            desOrX = cc.p(desOrX, y);
        }

        this._autoScrolling = false;
        this._moveInnerContainer(cc.pSub(desOrX, this.getInnerContainerPosition()), true);
    },

    _scrollChildren: function _scrollChildren(deltaMove) {
        var realMove = deltaMove;
        if (this.bounceEnabled) {
            // If the position of the inner container is out of the boundary, the offsets should be divided by two.
            var outOfBoundary = this._getHowMuchOutOfBoundary();
            realMove.x *= outOfBoundary.x == 0 ? 1 : 0.5;
            realMove.y *= outOfBoundary.y == 0 ? 1 : 0.5;
        }

        if (!this.bounceEnabled) {
            var outOfBoundary = this._getHowMuchOutOfBoundary(realMove);
            realMove.x += outOfBoundary.x;
            realMove.y += outOfBoundary.y;
        }

        var scrolledToLeft = false;
        var scrolledToRight = false;
        var scrolledToTop = false;
        var scrolledToBottom = false;

        if (realMove.y > 0.0) // up
            {
                var icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + realMove.y >= this._bottomBoundary) {
                    scrolledToBottom = true;
                }
            } else if (realMove.y < 0.0) // down
            {
                var icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + realMove.y <= this._topBoundary) {
                    scrolledToTop = true;
                }
            }

        if (realMove.x < 0.0) // left
            {
                var icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + realMove.x <= this._rightBoundary) {
                    scrolledToRight = true;
                }
            } else if (realMove.x > 0.0) // right
            {
                var icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + realMove.x >= this._leftBoundary) {
                    scrolledToLeft = true;
                }
            }
        this._moveInnerContainer(realMove, false);

        if (realMove.x != 0 || realMove.y != 0) {
            this._processScrollingEvent();
        }
        if (scrolledToBottom) {
            this._processScrollEvent(ccui.ScrollView.MOVEDIR_BOTTOM, false);
        }
        if (scrolledToTop) {
            this._processScrollEvent(ccui.ScrollView.MOVEDIR_TOP, false);
        }
        if (scrolledToLeft) {
            this._processScrollEvent(ccui.ScrollView.MOVEDIR_LEFT, false);
        }
        if (scrolledToRight) {
            this._processScrollEvent(ccui.ScrollView.MOVEDIR_RIGHT, false);
        }
    },

    /**
     * Scroll inner container to bottom boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottom: function scrollToBottom(time, attenuated) {
        this._startAutoScrollToDestination(cc.p(this._innerContainer.getPositionX(), 0), time, attenuated);
    },

    /**
     * Scroll inner container to top boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTop: function scrollToTop(time, attenuated) {
        this._startAutoScrollToDestination(cc.p(this._innerContainer.getPositionX(), this._contentSize.height - this._innerContainer.getContentSize().height), time, attenuated);
    },

    /**
     * Scroll inner container to left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToLeft: function scrollToLeft(time, attenuated) {
        this._startAutoScrollToDestination(cc.p(0, this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToRight: function scrollToRight(time, attenuated) {
        this._startAutoScrollToDestination(cc.p(this._contentSize.width - this._innerContainer.getContentSize().width, this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to top and left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTopLeft: function scrollToTopLeft(time, attenuated) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this._startAutoScrollToDestination(cc.p(0, this._contentSize.height - this._innerContainer.getContentSize().height), time, attenuated);
    },

    /**
     * Scroll inner container to top and right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTopRight: function scrollToTopRight(time, attenuated) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        var inSize = this._innerContainer.getContentSize();
        this._startAutoScrollToDestination(cc.p(this._contentSize.width - inSize.width, this._contentSize.height - inSize.height), time, attenuated);
    },

    /**
     * Scroll inner container to bottom and left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottomLeft: function scrollToBottomLeft(time, attenuated) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this._startAutoScrollToDestination(cc.p(0, 0), time, attenuated);
    },

    /**
     * Scroll inner container to bottom and right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottomRight: function scrollToBottomRight(time, attenuated) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this._startAutoScrollToDestination(cc.p(this._contentSize.width - this._innerContainer.getContentSize().width, 0), time, attenuated);
    },

    /**
     * Scroll inner container to vertical percent position of ScrollView.
     * @param {Number} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentVertical: function scrollToPercentVertical(percent, time, attenuated) {
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        this._startAutoScrollToDestination(cc.p(this._innerContainer.getPositionX(), minY + percent * h / 100), time, attenuated);
    },

    /**
     * Scroll inner container to horizontal percent position of ScrollView.
     * @param {Number} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentHorizontal: function scrollToPercentHorizontal(percent, time, attenuated) {
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this._startAutoScrollToDestination(cc.p(-(percent * w / 100), this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to both _direction percent position of ScrollView.
     * @param {cc.Point} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentBothDirection: function scrollToPercentBothDirection(percent, time, attenuated) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) return;
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this._startAutoScrollToDestination(cc.p(-(percent.x * w / 100), minY + percent.y * h / 100), time, attenuated);
    },

    /**
     * Move inner container to bottom boundary of ScrollView.
     */
    jumpToBottom: function jumpToBottom() {
        this._jumpToDestination(this._innerContainer.getPositionX(), 0);
    },

    /**
     * Move inner container to top boundary of ScrollView.
     */
    jumpToTop: function jumpToTop() {
        this._jumpToDestination(this._innerContainer.getPositionX(), this._contentSize.height - this._innerContainer.getContentSize().height);
    },

    /**
     * Move inner container to left boundary of ScrollView.
     */
    jumpToLeft: function jumpToLeft() {
        this._jumpToDestination(0, this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to right boundary of ScrollView.
     */
    jumpToRight: function jumpToRight() {
        this._jumpToDestination(this._contentSize.width - this._innerContainer.getContentSize().width, this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to top and left boundary of ScrollView.
     */
    jumpToTopLeft: function jumpToTopLeft() {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll _direction is not both!");
            return;
        }
        this._jumpToDestination(0, this._contentSize.height - this._innerContainer.getContentSize().height);
    },

    /**
     * Move inner container to top and right boundary of ScrollView.
     */
    jumpToTopRight: function jumpToTopRight() {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll _direction is not both!");
            return;
        }
        var inSize = this._innerContainer.getContentSize();
        this._jumpToDestination(this._contentSize.width - inSize.width, this._contentSize.height - inSize.height);
    },

    /**
     * Move inner container to bottom and left boundary of ScrollView.
     */
    jumpToBottomLeft: function jumpToBottomLeft() {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll _direction is not both!");
            return;
        }
        this._jumpToDestination(0, 0);
    },

    /**
     * Move inner container to bottom and right boundary of ScrollView.
     */
    jumpToBottomRight: function jumpToBottomRight() {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll _direction is not both!");
            return;
        }
        this._jumpToDestination(this._contentSize.width - this._innerContainer.getContentSize().width, 0);
    },

    /**
     * Move inner container to vertical percent position of ScrollView.
     * @param {Number} percent The destination vertical percent, accept value between 0 - 100
     */
    jumpToPercentVertical: function jumpToPercentVertical(percent) {
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        this._jumpToDestination(this._innerContainer.getPositionX(), minY + percent * h / 100);
    },

    /**
     * Move inner container to horizontal percent position of ScrollView.
     * @param {Number} percent The destination vertical percent, accept value between 0 - 100
     */
    jumpToPercentHorizontal: function jumpToPercentHorizontal(percent) {
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this._jumpToDestination(-(percent * w / 100), this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to both _direction percent position of ScrollView.
     * @param {cc.Point} percent The destination vertical percent, accept value between 0 - 100
     */
    jumpToPercentBothDirection: function jumpToPercentBothDirection(percent) {
        if (this._direction !== ccui.ScrollView.DIR_BOTH) return;
        var inSize = this._innerContainer.getContentSize();
        var minY = this._contentSize.height - inSize.height;
        var h = -minY;
        var w = inSize.width - this._contentSize.width;
        this._jumpToDestination(-(percent.x * w / 100), minY + percent.y * h / 100);
    },

    _gatherTouchMove: function _gatherTouchMove(delta) {
        var NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED = 5;
        while (this._touchMoveDisplacements.length >= NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED) {
            this._touchMoveDisplacements.splice(0, 1);
            this._touchMoveTimeDeltas.splice(0, 1);
        }
        this._touchMoveDisplacements.push(delta);

        var timestamp = new Date().getTime();
        this._touchMoveTimeDeltas.push((timestamp - this._touchMovePreviousTimestamp) / 1000);
        this._touchMovePreviousTimestamp = timestamp;
    },

    _handlePressLogic: function _handlePressLogic(touch) {
        this._bePressed = true;
        this._autoScrolling = false;

        // Clear gathered touch move information

        this._touchMovePreviousTimestamp = new Date().getTime();
        this._touchMoveDisplacements.length = 0;
        this._touchMoveTimeDeltas.length = 0;

        if (this._verticalScrollBar) {
            this._verticalScrollBar.onTouchBegan();
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.onTouchBegan();
        }
    },

    _handleMoveLogic: function _handleMoveLogic(touch) {
        var touchPositionInNodeSpace = this.convertToNodeSpace(touch.getLocation()),
            previousTouchPositionInNodeSpace = this.convertToNodeSpace(touch.getPreviousLocation());
        var delta = cc.pSub(touchPositionInNodeSpace, previousTouchPositionInNodeSpace);

        this._scrollChildren(delta);
        this._gatherTouchMove(delta);
    },

    _handleReleaseLogic: function _handleReleaseLogic(touch) {

        var touchPositionInNodeSpace = this.convertToNodeSpace(touch.getLocation()),
            previousTouchPositionInNodeSpace = this.convertToNodeSpace(touch.getPreviousLocation());
        var delta = cc.pSub(touchPositionInNodeSpace, previousTouchPositionInNodeSpace);

        this._gatherTouchMove(delta);

        this._bePressed = false;

        var bounceBackStarted = this._startBounceBackIfNeeded();
        if (!bounceBackStarted && this.inertiaScrollEnabled) {
            var touchMoveVelocity = this._calculateTouchMoveVelocity();
            if (touchMoveVelocity.x !== 0 || touchMoveVelocity.y !== 0) {
                this._startInertiaScroll(touchMoveVelocity);
            }
        }

        if (this._verticalScrollBar) {
            this._verticalScrollBar.onTouchEnded();
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.onTouchEnded();
        }
    },

    /**
     * The touch began event callback handler of ccui.ScrollView.
     * @param {cc.Touch} touch
     * @param {cc.Event} event
     * @returns {boolean}
     */
    onTouchBegan: function onTouchBegan(touch, event) {
        var pass = ccui.Layout.prototype.onTouchBegan.call(this, touch, event);
        if (!this._isInterceptTouch) {
            if (this._hit) this._handlePressLogic(touch);
        }
        return pass;
    },

    /**
     * The touch moved event callback handler of ccui.ScrollView.
     * @param {cc.Touch} touch
     * @param {cc.Event} event
     */
    onTouchMoved: function onTouchMoved(touch, event) {
        ccui.Layout.prototype.onTouchMoved.call(this, touch, event);
        if (!this._isInterceptTouch) this._handleMoveLogic(touch);
    },

    /**
     * The touch ended event callback handler of ccui.ScrollView.
     * @param {cc.Touch} touch
     * @param {cc.Event} event
     */
    onTouchEnded: function onTouchEnded(touch, event) {
        ccui.Layout.prototype.onTouchEnded.call(this, touch, event);
        if (!this._isInterceptTouch) this._handleReleaseLogic(touch);
        this._isInterceptTouch = false;
    },

    /**
     * The touch canceled event callback of ccui.ScrollView.
     * @param {cc.Touch} touch
     * @param {cc.Event} event
     */
    onTouchCancelled: function onTouchCancelled(touch, event) {
        ccui.Layout.prototype.onTouchCancelled.call(this, touch, event);
        if (!this._isInterceptTouch) this._handleReleaseLogic(touch);
        this._isInterceptTouch = false;
    },

    /**
     * The update callback handler.
     * @param {Number} dt
     */
    update: function update(dt) {
        if (this._autoScrolling) this._processAutoScrolling(dt);
    },

    /**
     * Intercept touch event, handle its child's touch event.
     * @override
     * @param {number} event event type
     * @param {ccui.Widget} sender
     * @param {cc.Touch} touch
     */
    interceptTouchEvent: function interceptTouchEvent(event, sender, touch) {
        if (!this._touchEnabled) {
            ccui.Layout.prototype.interceptTouchEvent.call(this, event, sender, touch);
            return;
        }

        if (this._direction === ccui.ScrollView.DIR_NONE) return;

        var touchPoint = touch.getLocation();
        switch (event) {
            case ccui.Widget.TOUCH_BEGAN:
                this._isInterceptTouch = true;
                this._touchBeganPosition.x = touchPoint.x;
                this._touchBeganPosition.y = touchPoint.y;
                this._handlePressLogic(touch);
                break;
            case ccui.Widget.TOUCH_MOVED:
                var offset = cc.pLength(cc.pSub(sender.getTouchBeganPosition(), touchPoint));
                this._touchMovePosition.x = touchPoint.x;
                this._touchMovePosition.y = touchPoint.y;
                if (offset > this._childFocusCancelOffset) {
                    sender.setHighlighted(false);
                    this._handleMoveLogic(touch);
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
            case ccui.Widget.TOUCH_ENDED:
                this._touchEndPosition.x = touchPoint.x;
                this._touchEndPosition.y = touchPoint.y;
                this._handleReleaseLogic(touch);
                if (sender.isSwallowTouches()) this._isInterceptTouch = false;
                break;
        }
    },

    _processScrollEvent: function _processScrollEvent(_directionEvent, bounce) {
        var event = 0;

        switch (_directionEvent) {
            case ccui.ScrollView.MOVEDIR_TOP:
                event = bounce ? ccui.ScrollView.EVENT_BOUNCE_TOP : ccui.ScrollView.EVENT_SCROLL_TO_TOP;
                break;
            case ccui.ScrollView.MOVEDIR_BOTTOM:
                event = bounce ? ccui.ScrollView.EVENT_BOUNCE_BOTTOM : ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM;
                break;
            case ccui.ScrollView.MOVEDIR_LEFT:
                event = bounce ? ccui.ScrollView.EVENT_BOUNCE_LEFT : ccui.ScrollView.EVENT_SCROLL_TO_LEFT;
                break;
            case ccui.ScrollView.MOVEDIR_RIGHT:
                event = bounce ? ccui.ScrollView.EVENT_BOUNCE_RIGHT : ccui.ScrollView.EVENT_SCROLL_TO_RIGHT;
                break;
        }

        this._dispatchEvent(event);
    },

    _processScrollingEvent: function _processScrollingEvent() {
        this._dispatchEvent(ccui.ScrollView.EVENT_SCROLLING);
    },

    _dispatchEvent: function _dispatchEvent(event) {
        if (this._scrollViewEventSelector) {
            if (this._scrollViewEventListener) this._scrollViewEventSelector.call(this._scrollViewEventListener, this, event);else this._scrollViewEventSelector(this, event);
        }
        if (this._ccEventCallback) this._ccEventCallback(this, event);
    },

    /**
     * Adds callback function called ScrollView event triggered
     * @param {Function} selector
     * @param {Object} [target=]
     * @deprecated since v3.0, please use addEventListener instead.
     */
    addEventListenerScrollView: function addEventListenerScrollView(selector, target) {
        this._scrollViewEventSelector = selector;
        this._scrollViewEventListener = target;
    },

    /**
     * Adds callback function called ScrollView event triggered
     * @param {Function} selector
     */
    addEventListener: function addEventListener(selector) {
        this._ccEventCallback = selector;
    },

    /**
     * Changes scroll _direction of ScrollView.
     * @param {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH} dir
     *   Direction::VERTICAL means vertical scroll, Direction::HORIZONTAL means horizontal scroll
     */
    setDirection: function setDirection(dir) {
        this._direction = dir;

        if (this._scrollBarEnabled) {
            this._removeScrollBar();
            this._initScrollBar();
        }
    },

    /**
     * Returns scroll direction of ScrollView.
     * @returns {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH}
     */
    getDirection: function getDirection() {
        return this._direction;
    },

    /**
     * Sets bounce enabled
     * @param {Boolean} enabled
     */
    setBounceEnabled: function setBounceEnabled(enabled) {
        this.bounceEnabled = enabled;
    },

    /**
     * Returns whether bounce is enabled
     * @returns {boolean}
     */
    isBounceEnabled: function isBounceEnabled() {
        return this.bounceEnabled;
    },

    /**
     * Sets inertiaScroll enabled
     * @param {boolean} enabled
     */
    setInertiaScrollEnabled: function setInertiaScrollEnabled(enabled) {
        this.inertiaScrollEnabled = enabled;
    },

    /**
     * Returns whether inertiaScroll is enabled
     * @returns {boolean}
     */
    isInertiaScrollEnabled: function isInertiaScrollEnabled() {
        return this.inertiaScrollEnabled;
    },

    /**
     * Toggle scroll bar enabled.
     * @param {boolean} enabled True if enable scroll bar, false otherwise.
     */
    setScrollBarEnabled: function setScrollBarEnabled(enabled) {
        if (this._scrollBarEnabled === enabled) {
            return;
        }

        if (this._scrollBarEnabled) {
            this._removeScrollBar();
        }
        this._scrollBarEnabled = enabled;
        if (this._scrollBarEnabled) {
            this._initScrollBar();
        }
    },
    /**
     * Query scroll bar state.
     * @returns {boolean} True if scroll bar is enabled, false otherwise.
     */
    isScrollBarEnabled: function isScrollBarEnabled() {
        return this._scrollBarEnabled;
    },

    /**
     * Set the scroll bar positions from the left-bottom corner (horizontal) and right-top corner (vertical).
     * @param {cc.Point} positionFromCorner The position from the left-bottom corner (horizontal) and right-top corner (vertical).
     */
    setScrollBarPositionFromCorner: function setScrollBarPositionFromCorner(positionFromCorner) {
        if (this._direction !== ccui.ScrollView.DIR_HORIZONTAL) {
            this.setScrollBarPositionFromCornerForVertical(positionFromCorner);
        }
        if (this._direction !== ccui.ScrollView.DIR_VERTICAL) {
            this.setScrollBarPositionFromCornerForHorizontal(positionFromCorner);
        }
    },

    /**
     * Set the vertical scroll bar position from right-top corner.
     * @param {cc.Point} positionFromCorner The position from right-top corner
     */
    setScrollBarPositionFromCornerForVertical: function setScrollBarPositionFromCornerForVertical(positionFromCorner) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        cc.assert(this._direction !== ccui.ScrollView.DIR_HORIZONTAL, "Scroll view doesn't have a vertical scroll bar!");
        this._verticalScrollBar.setPositionFromCorner(positionFromCorner);
    },

    /**
     * Get the vertical scroll bar's position from right-top corner.
     * @returns {cc.Point}
     */
    getScrollBarPositionFromCornerForVertical: function getScrollBarPositionFromCornerForVertical() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        cc.assert(this._direction !== ccui.ScrollView.DIR_HORIZONTAL, "Scroll view doesn't have a vertical scroll bar!");
        return this._verticalScrollBar.getPositionFromCorner();
    },

    /**
     * Set the horizontal scroll bar position from left-bottom corner.
     * @param {cc.Point} positionFromCorner The position from left-bottom corner
     */
    setScrollBarPositionFromCornerForHorizontal: function setScrollBarPositionFromCornerForHorizontal(positionFromCorner) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        cc.assert(this._direction !== ccui.ScrollView.DIR_VERTICAL, "Scroll view doesn't have a horizontal scroll bar!");
        this._horizontalScrollBar.setPositionFromCorner(positionFromCorner);
    },

    /**
     * Get the horizontal scroll bar's position from right-top corner.
     * @returns {cc.Point}
     */
    getScrollBarPositionFromCornerForHorizontal: function getScrollBarPositionFromCornerForHorizontal() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        cc.assert(this._direction !== ccui.ScrollView.DIR_VERTICAL, "Scroll view doesn't have a horizontal scroll bar!");
        return this._horizontalScrollBar.getPositionFromCorner();
    },

    /**
     * Set the scroll bar's width
     * @param {number} width The scroll bar's width
     */
    setScrollBarWidth: function setScrollBarWidth(width) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.setWidth(width);
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.setWidth(width);
        }
    },

    /**
     * Get the scroll bar's width
     * @returns {number} the scroll bar's width
     */
    getScrollBarWidth: function getScrollBarWidth() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            return this._verticalScrollBar.getWidth();
        }
        if (this._horizontalScrollBar) {
            return this._horizontalScrollBar.getWidth();
        }
        return 0;
    },

    /**
     * Set the scroll bar's color
     * @param {cc.Color} color the scroll bar's color
     */
    setScrollBarColor: function setScrollBarColor(color) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.setColor(color);
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.setColor(color);
        }
    },

    /**
     * Get the scroll bar's color
     * @returns {cc.Color} the scroll bar's color
     */
    getScrollBarColor: function getScrollBarColor() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.getColor();
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.getColor();
        }
        return cc.color.WHITE;
    },

    /**
     * Set the scroll bar's opacity
     * @param {number} opacity the scroll bar's opacity
     */
    setScrollBarOpacity: function setScrollBarOpacity(opacity) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.opacity = opacity;
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.opacity = opacity;
        }
    },

    /**
     * Get the scroll bar's opacity
     * @returns {number}
     */
    getScrollBarOpacity: function getScrollBarOpacity() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            return this._verticalScrollBar.opacity;
        }
        if (this._horizontalScrollBar) {
            return this._horizontalScrollBar.opacity;
        }
        return -1;
    },

    /**
     * Set scroll bar auto hide state
     * @param {boolean} autoHideEnabled scroll bar auto hide state
     */
    setScrollBarAutoHideEnabled: function setScrollBarAutoHideEnabled(autoHideEnabled) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.autoHideEnabled = autoHideEnabled;
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.autoHideEnabled = autoHideEnabled;
        }
    },

    /**
     * Query scroll bar auto hide state
     * @returns {boolean}
     */
    isScrollBarAutoHideEnabled: function isScrollBarAutoHideEnabled() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            return this._verticalScrollBar.autoHideEnabled;
        }
        if (this._horizontalScrollBar) {
            return this._horizontalScrollBar.autoHideEnabled;
        }
        return false;
    },

    /**
     * Set scroll bar auto hide time
     * @param {number} autoHideTime scroll bar auto hide state
     */
    setScrollBarAutoHideTime: function setScrollBarAutoHideTime(autoHideTime) {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            this._verticalScrollBar.autoHideTime = autoHideTime;
        }
        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.autoHideTime = autoHideTime;
        }
    },

    /**
     * Get the scroll bar's auto hide time
     * @returns {number}
     */
    getScrollBarAutoHideTime: function getScrollBarAutoHideTime() {
        cc.assert(this._scrollBarEnabled, "Scroll bar should be enabled!");
        if (this._verticalScrollBar) {
            return this._verticalScrollBar.autoHideTime;
        }
        if (this._horizontalScrollBar) {
            return this._horizontalScrollBar.autoHideTime;
        }
        return 0;
    },

    /**
     * Gets inner container of ScrollView. Inner container is the container of ScrollView's children.
     * @returns {ccui.Layout}
     */
    getInnerContainer: function getInnerContainer() {
        return this._innerContainer;
    },

    /**
     * Sets LayoutType of ccui.ScrollView.
     * @param {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE} type
     */
    setLayoutType: function setLayoutType(type) {
        this._innerContainer.setLayoutType(type);
    },

    /**
     * Returns the layout type of ccui.ScrollView.
     * @returns {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE}
     */
    getLayoutType: function getLayoutType() {
        return this._innerContainer.getLayoutType();
    },

    _doLayout: function _doLayout() {
        if (!this._doLayoutDirty) return;
        this._doLayoutDirty = false;
    },

    /**
     * Returns the "class name" of ccui.ScrollView.
     * @returns {string}
     */
    getDescription: function getDescription() {
        return "ScrollView";
    },

    _createCloneInstance: function _createCloneInstance() {
        return new ccui.ScrollView();
    },

    _copyClonedWidgetChildren: function _copyClonedWidgetChildren(model) {
        ccui.Layout.prototype._copyClonedWidgetChildren.call(this, model);
    },

    _copySpecialProperties: function _copySpecialProperties(scrollView) {
        if (scrollView instanceof ccui.ScrollView) {
            ccui.Layout.prototype._copySpecialProperties.call(this, scrollView);
            this.setInnerContainerSize(scrollView.getInnerContainerSize());
            this.setInnerContainerPosition(scrollView.getInnerContainerPosition());
            this.setDirection(scrollView._direction);

            this._topBoundary = scrollView._topBoundary;
            this._bottomBoundary = scrollView._bottomBoundary;
            this._leftBoundary = scrollView._leftBoundary;
            this._rightBoundary = scrollView._rightBoundary;
            this._bePressed = scrollView._bePressed;
            this._childFocusCancelOffset = scrollView._childFocusCancelOffset;
            this._touchMoveDisplacements = scrollView._touchMoveDisplacements;
            this._touchMoveTimeDeltas = scrollView._touchMoveTimeDeltas;
            this._touchMovePreviousTimestamp = scrollView._touchMovePreviousTimestamp;
            this._autoScrolling = scrollView._autoScrolling;
            this._autoScrollAttenuate = scrollView._autoScrollAttenuate;
            this._autoScrollStartPosition = scrollView._autoScrollStartPosition;
            this._autoScrollTargetDelta = scrollView._autoScrollTargetDelta;
            this._autoScrollTotalTime = scrollView._autoScrollTotalTime;
            this._autoScrollAccumulatedTime = scrollView._autoScrollAccumulatedTime;
            this._autoScrollCurrentlyOutOfBoundary = scrollView._autoScrollCurrentlyOutOfBoundary;
            this._autoScrollBraking = scrollView._autoScrollBraking;
            this._autoScrollBrakingStartPosition = scrollView._autoScrollBrakingStartPosition;

            this.setBounceEnabled(scrollView.bounceEnabled);
            this.setInertiaScrollEnabled(scrollView.inertiaScrollEnabled);

            this._scrollViewEventListener = scrollView._scrollViewEventListener;
            this._scrollViewEventSelector = scrollView._scrollViewEventSelector;
            this._ccEventCallback = scrollView._ccEventCallback;

            this.setScrollBarEnabled(scrollView.isScrollBarEnabled());
            if (this.isScrollBarEnabled()) {
                if (this._direction !== ccui.ScrollView.DIR_HORIZONTAL) {
                    this.setScrollBarPositionFromCornerForVertical(scrollView.getScrollBarPositionFromCornerForVertical());
                }
                if (this._direction !== ccui.ScrollView.DIR_VERTICAL) {
                    this.setScrollBarPositionFromCornerForHorizontal(scrollView.getScrollBarPositionFromCornerForHorizontal());
                }
                this.setScrollBarWidth(scrollView.getScrollBarWidth());
                this.setScrollBarColor(scrollView.getScrollBarColor());
                this.setScrollBarAutoHideEnabled(scrollView.isScrollBarAutoHideEnabled());
                this.setScrollBarAutoHideTime(scrollView.getScrollBarAutoHideTime());
            }
        }
    },

    _initScrollBar: function _initScrollBar() {
        if (this._direction !== ccui.ScrollView.DIR_HORIZONTAL && !this._verticalScrollBar) {
            this._verticalScrollBar = new ccui.ScrollViewBar(this, ccui.ScrollView.DIR_VERTICAL);
            this.addProtectedChild(this._verticalScrollBar, 2);
        }
        if (this._direction !== ccui.ScrollView.DIR_VERTICAL && !this._horizontalScrollBar) {
            this._horizontalScrollBar = new ccui.ScrollViewBar(this, ccui.ScrollView.DIR_HORIZONTAL);
            this.addProtectedChild(this._horizontalScrollBar, 2);
        }
    },

    _removeScrollBar: function _removeScrollBar() {
        if (this._verticalScrollBar) {
            this.removeProtectedChild(this._verticalScrollBar);
            this._verticalScrollBar = null;
        }
        if (this._horizontalScrollBar) {
            this.removeProtectedChild(this._horizontalScrollBar);
            this._horizontalScrollBar = null;
        }
    },

    /**
     * Returns a node by tag
     * @param {Number} tag
     * @returns {cc.Node}
     * @deprecated  since v3.0, please use getChildByTag instead.
     */
    getNodeByTag: function getNodeByTag(tag) {
        return this._innerContainer.getNodeByTag(tag);
    },

    /**
     * Returns all nodes of inner container
     * @returns {Array}
     * @deprecated since v3.0, please use getChildren instead.
     */
    getNodes: function getNodes() {
        return this._innerContainer.getNodes();
    },

    /**
     * Removes a node from ccui.ScrollView.
     * @param {cc.Node} node
     * @deprecated since v3.0, please use removeChild instead.
     */
    removeNode: function removeNode(node) {
        this._innerContainer.removeNode(node);
    },

    /**
     * Removes a node by tag
     * @param {Number} tag
     * @deprecated since v3.0, please use removeChildByTag instead.
     */
    removeNodeByTag: function removeNodeByTag(tag) {
        this._innerContainer.removeNodeByTag(tag);
    },

    /**
     * Remove all node from ccui.ScrollView.
     * @deprecated since v3.0, please use removeAllChildren instead.
     */
    removeAllNodes: function removeAllNodes() {
        this._innerContainer.removeAllNodes();
    },

    /**
     * Add node for scrollView
     * @param {cc.Node} node
     * @param {Number} zOrder
     * @param {Number} tag
     * @deprecated since v3.0, please use addChild instead.
     */
    addNode: function addNode(node, zOrder, tag) {
        this._innerContainer.addNode(node, zOrder, tag);
    }
});

var _p = ccui.ScrollView.prototype;

// Extended properties
/** @expose */
_p.innerWidth;
cc.defineGetterSetter(_p, "innerWidth", _p._getInnerWidth, _p._setInnerWidth);
/** @expose */
_p.innerHeight;
cc.defineGetterSetter(_p, "innerHeight", _p._getInnerHeight, _p._setInnerHeight);
/** @expose */
_p.direction;
cc.defineGetterSetter(_p, "direction", _p.getDirection, _p.setDirection);
/** @expose */
_p.touchTotalTimeThreshold;
cc.defineGetterSetter(_p, "touchTotalTimeThreshold", _p.getTouchTotalTimeThreshold, _p.setTouchTotalTimeThreshold);
_p = null;
/**
 * allocates and initializes a UIScrollView.
 * @deprecated since v3.0, please use new ccui.ScrollView() instead.
 * @return {ccui.ScrollView}
 */
ccui.ScrollView.create = function () {
    return new ccui.ScrollView();
};

// Constants
//ScrollView direction
/**
 * The none flag of ccui.ScrollView's direction.
 * @constant
 * @type {number}
 */
ccui.ScrollView.DIR_NONE = 0;
/**
 * The vertical flag of ccui.ScrollView's direction.
 * @constant
 * @type {number}
 */
ccui.ScrollView.DIR_VERTICAL = 1;
/**
 * The horizontal flag of ccui.ScrollView's direction.
 * @constant
 * @type {number}
 */
ccui.ScrollView.DIR_HORIZONTAL = 2;
/**
 * The both flag of ccui.ScrollView's direction.
 * @constant
 * @type {number}
 */
ccui.ScrollView.DIR_BOTH = 3;

//ScrollView event
/**
 * The flag scroll to top of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_SCROLL_TO_TOP = 0;
/**
 * The flag scroll to bottom of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM = 1;
/**
 * The flag scroll to left of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_SCROLL_TO_LEFT = 2;
/**
 * The flag scroll to right of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_SCROLL_TO_RIGHT = 3;
/**
 * The scrolling flag of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_SCROLLING = 4;
/**
 * The flag bounce top of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_BOUNCE_TOP = 5;
/**
 * The flag bounce bottom of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_BOUNCE_BOTTOM = 6;
/**
 * The flag bounce left of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_BOUNCE_LEFT = 7;
/**
 * The flag bounce right of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_BOUNCE_RIGHT = 8;
/**
 * The flag container moved of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_CONTAINER_MOVED = 9;
/**
 * The flag autoscroll ended of ccui.ScrollView's event.
 * @constant
 * @type {number}
 */
ccui.ScrollView.EVENT_AUTOSCROLL_ENDED = 10;

/**
 * @ignore
 */

ccui.ScrollView.MOVEDIR_TOP = 0;
ccui.ScrollView.MOVEDIR_BOTTOM = 1;
ccui.ScrollView.MOVEDIR_LEFT = 2;
ccui.ScrollView.MOVEDIR_RIGHT = 3;

cc._RF.pop();