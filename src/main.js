const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const is = require('electron-is');

let mainWindow;


/**
 * 
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 640,
        height: 640,
        resizable: false,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (is.dev()) mainWindow = null;
        else app.quit();
    });
}

app.on('ready', () => {
    createWindow();
    if (is.dev()) {
        const elemon = require('elemon');
        elemon({
            app: app,
            mainFile: 'main.js',
            bws: [{
                bw: mainWindow,
                res: [],
            }],
        });
        mainWindow.openDevTools();
    }
});
