"use strict";
cc._RF.push(module, '8e1d1bSecVN5Z2QPSDLvMrW', 'main');
// frameworks/cocos2d-html5/template/main.js

"use strict";

cc.game.onStart = function () {
    if (!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));

    var designSize = cc.size(480, 800);
    var screenSize = cc.view.getFrameSize();

    if (!cc.sys.isNative && screenSize.height < 800) {
        designSize = cc.size(320, 480);
        cc.loader.resPath = "res/Normal";
    } else {
        cc.loader.resPath = "res/HD";
    }
    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);

    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MyScene());
    }, this);
};
cc.game.run();

cc._RF.pop();