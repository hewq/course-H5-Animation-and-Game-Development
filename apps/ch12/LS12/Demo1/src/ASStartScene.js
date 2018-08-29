var ASStartLayer = cc.Layer.extend({
	sprite: null,
	ctor: function () {
		this._super();

		var size = cc.winSize;
		this.addChild(new cc.LayerColor(cc.color.WHITE));

		cc.audioEngine.playMusic(res.Bg_mp3, true);

		// 音乐开关
		var onItem = new cc.MenuItemImage(res.MusicOnNormal_png, res.MusicOnSelected_png, function () {}, this);
		var offItem = new cc.MenuItemImage(res.MusicOffNormal_png, res.MusicOffSelected_png, function () {}, this);

		var toggleMenuItem = new cc.MenuItemToggle(onItem, offItem, function () {
			if (toggleMenuItem.getSelectedIndex() == 0) {
				cc.audioEngine.playMusic(res.Bg_mp3, true);
			} else {
				// cc.audioEngine.pauseMusic();
				// cc.audioEngine.resumeMusic();
				cc.audioEngine.stopMusic();
			}
		}, this);

		// 音效开关
		var onItem2 = new cc.MenuItemImage(res.MusicOnNormal_png, res.MusicOnSelected_png, function () {}, this);
		var offItem2 = new cc.MenuItemImage(res.MusicOffNormal_png, res.MusicOffSelected_png, function () {}, this);

		var toggleMenuItem2 = new cc.MenuItemToggle(onItem2, offItem2, function () {
			if (toggleMenuItem2.getSelectedIndex() == 0) {
				cc.audioEngine.playEffect(res.Click_mp3);
			} else {

			}
		}, this);

		// 开始按钮
		var startMenuItem = new cc.MenuItemFont('进 入', function () {
			cc.log('click start button');
			cc.audioEngine.playEffect(res.Click_mp3);
			cc.director.runScene(new ASMainScene());
		}, this);
		startMenuItem.setFontSize(80);
		startMenuItem.setColor(cc.color.BLACK);
		startMenuItem.setFontName('Arial');

		// 菜单
		startMenuItem.x = size.width / 2;
		startMenuItem.y = size.height / 2;

		toggleMenuItem.x = size.width * 0.2;
		toggleMenuItem.y = size.height / 5;

		toggleMenuItem2.x = size.width * 0.8;
		toggleMenuItem2.y = size.height / 5;

		var menu = new cc.Menu(startMenuItem, toggleMenuItem, toggleMenuItem2);
		menu.x = 0;
		menu.y = 0;

		this.addChild(menu);

		return true;
	}
});

var ASStartScene = cc.Scene.extend({
	ctor: function () {
		this._super();
		var layer = new ASStartLayer();
		this.addChild(layer);
	}
})