var res = {
    HelloWorld_png : "res/HelloWorld.png",

    Bg_mp3: "res/background.mp3",
    Click_mp3: "res/click.mp3",

    MusicOnNormal_png: "res/Menu/music-on-normal.png",
    MusicOnSelected_png: "res/Menu/music-on-selected.png",
    MusicOffNormal_png: "res/Menu/music-off-normal.png",
    MusicOffSelected_png: "res/Menu/music-off-selected.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
