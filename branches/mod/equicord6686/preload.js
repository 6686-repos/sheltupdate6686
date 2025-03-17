const { readFileSync } = require("fs");
const { join } = require("path");
const { webFrame } = require("electron");

// run equicord's preload
require("./equicord6686-desktop/equicordDesktopPreload.js");

// inject equicord renderer
webFrame.top.executeJavaScript(readFileSync(join(__dirname, "equicord6686-desktop/renderer.js"), "utf8"));
