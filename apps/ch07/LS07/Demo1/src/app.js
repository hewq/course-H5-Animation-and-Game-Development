var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ttfLabel: null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        var size = cc.winSize;

        var ttfLabel = new cc.LabelTTF('这是LabelTTF', '', 50);
        ttfLabel.x = size.width / 2;
        ttfLabel.y = size.height / 2;

        // 设置字体样式
        ttfLabel.setFontFillColor(cc.color.RED);
        ttfLabel.setFontSize(100);
        ttfLabel.enableStroke(cc.color.YELLOW, 5);
        ttfLabel.enableShadow(cc.color.WHITE, 15, 15, 15);

        this.addChild(ttfLabel);

        // BMFont 标签（位图字体标签）
        var labelBMFont = new cc.LabelBMFont('中国', res.LabelBitmap_fnt);

        labelBMFont.x = size.width * 0.5;
        labelBMFont.y = size.height * 0.3;
        this.addChild(labelBMFont);

        var labelBMFont2 = new cc.LabelBMFont('Hello World!', res.LabelBitmap2_fnt);
        labelBMFont2.x = size.width * 0.5;
        labelBMFont2.y = size.height * 0.15;
        this.addChild(labelBMFont2);


        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

