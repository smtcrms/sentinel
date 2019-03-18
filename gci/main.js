const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

if (process.env.ELECTRON_START_URL) {
    require("electron-reload")(__dirname);
}

let mainWindow;

function createWindow() {
    if (process.platform === "win32") screenHeight = 700;
    else screenHeight = 672;
    mainWindow = new BrowserWindow({
        title: "Gaia Client Interface",
        resizable: false,
        maximizable: false,
        width: 1000,
        height: screenHeight
    });
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "build/index.html"),
            protocol: "file:",
            slashes: true
        })
    );

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function() {
    if (mainWindow === null) {
        createWindow();
    }
});
