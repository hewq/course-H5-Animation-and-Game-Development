var OverLayer = cc.Layer.extend({
	ctor: function () {
		this._super();
		this.addChild(new cc.LayerColor(cc.color.GRAY));
		var size = cc.winSize;
		var label = new cc.LabelTTF('This is the third scene', '', 50);
		label.x = size.width * 0.5;
		label.y = size.height * 0.7;
		this.addChild(label);

		var menuItem = new cc.MenuItemFont('first scene', function () {
			cc.director.runScene(new StartScene());
		}, this);

		var menu = new cc.Menu(menuItem);
		this.addChild(menu);
		menu.y = size.height * 0.3;
		return true;
	}
});

var OverScene = cc.Scene.extend({
	ctor: function () {
		this._super();
		cc.log('OverScene: ctor');
	},
	onEnter: function () {
		this._super();
		cc.log('OverScene: onEnter');
		var layer = new OverLayer();
		this.addChild(layer);
	},
	onEnterTransitionDidFinish: function () {
		this._super();
		cc.log('OverScene: onEnterTransitonDidFinish');
	},
	onExitTransitionDidStart: function () {
		this._super();
		cc.log('OverScene: onExitTransitonDidStart');
	},
	onExit: function () {
		this._super();
		cc.log('OverScene: onExit');
	}
});