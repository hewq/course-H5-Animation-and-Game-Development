var MainLayer = cc.Layer.extend({
	ctor: function () {
		this._super();
		this.addChild(new cc.LayerColor(cc.color.ORANGE));
		var size = cc.winSize;
		var label = new cc.LabelTTF('This is the second scene', '', 50);
		label.x = size.width * 0.5;
		label.y = size.height * 0.7;
		this.addChild(label);

		var menuItem = new cc.MenuItemFont('third scene', function () {
			cc.director.runScene(new cc.TransitionMoveInB(2.0, new OverScene()));
		}, this);

		var menu = new cc.Menu(menuItem);
		this.addChild(menu);
		menu.y = size.height * 0.3;
		return true;
	}
});

var MainScene = cc.Scene.extend({
	ctor: function () {
		this._super();
		cc.log('MainScene: ctor');
	},
	onEnter: function () {
		this._super();
		cc.log('MainScene: onEnter');
		var layer = new MainLayer();
		this.addChild(layer);
	},
	onEnterTransitionDidFinish: function () {
		this._super();
		cc.log('MainScene: onEnterTransitionDidFinish');
	},
	onExitTransitionDidStart: function () {
		this._super();
		cc.log('MainScene: onExitTransitionDidStart');
	},
	onExit: function () {
		this._super();
		cc.log('MainScene: onExit');
	}
})