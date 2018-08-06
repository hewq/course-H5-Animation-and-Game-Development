var StartLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;
        this.addChild(new cc.LayerColor(cc.color.RED));

        var label = new cc.LabelTTF('this is the first scene', '', 50);
        label.x = size.width * 0.5;
        label.y = size.height * 0.7;
        this.addChild(label);

        var menuItem = new cc.MenuItemFont('the second scene', function () {
           cc.director.runScene(new cc.TransitionMoveInL(2.0, new MainScene()));
        }, this);

        var menu = new cc.Menu(menuItem);
        this.addChild(menu);
        menu.y = size.height * 0.3;

        return true;
    }
});

var StartBgLayer = cc.Layer.extend({
 ctor: function () {
     this._super();
     this.addChild(new cc.LayerColor(cc.color.RED));
 }
});

var StartScene = cc.Scene.extend({
    ctor: function () {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);
    }
});