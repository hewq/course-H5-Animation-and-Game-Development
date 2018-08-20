var HelloWorldLayer = cc.Layer.extend({
    sprites: [],
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        var size = cc.winSize;

        this.addChild(new cc.LayerColor(cc.color.GRAY));

        // 创建精灵数组
        for (var i = 0; i < 3; i++) {
            this.sprites[i] = new cc.Sprite('res/sprite' + (i + 1) + '.png');
            this.sprites[i].x = size.width * 0.2;
            this.sprites[i].y = size.height * (0.3 * i + 0.2);
            this.addChild(this.sprites[i]);
        }

        // 间隔动作（ActionInterval）练习三 闪烁 进度条 颜色
        this.sprites[0].runAction(cc.blink(20.0, 10));
        // this.sprites[0].runAction(cc.speed(cc.blink(20.0, 10), 5)); // 5倍速
        
        var timer = new cc.ProgressTimer(this.sprites[1]);
        timer.x = this.sprites[1].x + 100;
        timer.y = this.sprites[1].y;
        this.addChild(timer);
        // timer.type = cc.ProgressTimer.TYPE_RADIAL;
        timer.type = cc.ProgressTimer.TYPE_BAR;
        timer.midPoint = cc.p(0, 0); // 控制变化起点
        timer.barChangeRate = cc.p(0, 1); // 控制 x 和 y 方向的变化率
        // timer.runAction(cc.progressFromTo(5.0, 0, 90));
        timer.runAction(cc.progressTo(5.0, 50));

        // 颜色改变
        this.sprites[2].runAction(cc.tintTo(5.0, 128, 0, 0));
        // this.sprites[2].runAction(cc.tintBy(5.0, 128, 128, 128));
        
        // 变速 speed 与 ease
        this.sprites[1].runAction(cc.speed(cc.moveBy(20, 300, 0), 5)); // 5倍速

        var tempAct = cc.moveBy(5.0, 300, 0);
        // var tempEaseAction = tempAct.easing(cc.easeElasticInOut()); // cc.easeBackIn();
        var tempEaseAction = tempAct.easing(cc.easeExponentialInOut()); // cc.easeBackIn();
        this.sprites[2].runAction(tempEaseAction);

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

