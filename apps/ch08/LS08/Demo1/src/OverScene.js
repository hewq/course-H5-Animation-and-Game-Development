var OverLayer = cc.Layer.extend({
	ctor: function () {
		this._super();
		this.addChild(new cc.LayerColor(cc.color.GREY));
		var size = cc.winSize;
		var label = new cc.LabelTTF('This is the third scene', '', 50);
		label.x = size.width * 0.5;
		label.y = size.height * 0.7;
		this.addChild(label);

		var menuItem = new cc.MenuItemFont('the first scene', function () {
			cc.director.runScene(new cc.TransitionProgressInOut(2, new StartScene()));
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
		var layer = new OverLayer();
		this.addChild(layer);
	}
})