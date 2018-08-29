var TempLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;
        cc.log('Layer ctor');
       
        var label = new cc.LabelTTF('hello', '' , 50);
        label.x = size.width / 2;
        label.y = size.height / 2;

        this.addChild(label);

        return true;
    }
});

var TempScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new TempLayer();
        this.addChild(layer);
    }
});

