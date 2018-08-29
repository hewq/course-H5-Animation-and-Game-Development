var TempLayer = cc.Layer.extend({
    ctor:function () {
        this._super();

        var size = cc.winSize;

        // 添加 _labelLoading
        var labelLoading = new cc.LabelTTF('Temp scene', '', 50);
        labelLoading.x = size.width / 2;
        labelLoading.y = size.height / 2 + 50;
        this.addChild(labelLoading);

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

