var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    redSprite: null,
    speed: 0,
    num: 0,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        var size = cc.winSize;

        this.addChild(new cc.LayerColor(cc.color.WHITE));

        // for (var i = 0; i < 20; i++) {
        //     var xLine = new cc.LayerColor(cc.color.RED, 1, size.width, 1);
        //     xLine.x  = i * 100;
        //     this.addChild(xLine);
        //
        //     var yLine = new cc.LayerColor(cc.color.RED, size.width, 1);
        //     yLine.y = i * 100;
        //     this.addChild(yLine);
        // }
        //
        // var redSprite = new cc.Sprite(res.Red_png);
        // redSprite.x = 150;
        // redSprite.y = 150;
        // redSprite.setAnchorPoint(cc.p(0, 0));
        // this.addChild(redSprite);
        //
        // var yellowSprite = new cc.Sprite(res.Yellow_png);
        // yellowSprite.x = 100;
        // yellowSprite.y = 100;
        // yellowSprite.setAnchorPoint(cc.p(0.5, 0.5));
        // this.addChild(yellowSprite);
        //
        // var localPosition = redSprite.convertToNodeSpace(yellowSprite.getPosition());
        // cc.log(localPosition.x);
        // cc.log(localPosition.y);

        var yellowSprite = new cc.Sprite(res.Yellow_png);
        yellowSprite.x = 100;
        yellowSprite.y = 100;
        yellowSprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(yellowSprite, 2); // 设置 z 轴顺序

        this.redSprite = new cc.Sprite(res.Red_png);
        this.redSprite.x = size.width / 2;
        this.redSprite.y = 400;
        this.addChild(this.redSprite);
        this.redSprite.setLocalZOrder(0); // 设置 z 轴顺序(z-index)

        // void schedule(callback, interval, repeat, delay, key);
        this.schedule(this.myCallback, 0.02, cc.REPEAT_FOREVER, 0);

        return true;
    },
    // update: function (dt) {
    //     cc.log("Timer" + dt);
    //     this.num++;
    //     if (this.num > 1000) {
    //         this.unscheduleUpdate()
    //     }
    // },
    myCallback: function (dt) {
        this.redSprite.y -= this.speed;
        if (this.redSprite.y < 0) {
            this.speed = - 12.6;
        } else {
            this.speed += 0.2;
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

