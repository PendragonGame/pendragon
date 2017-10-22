const {
    app,
    BrowserWindow,
    ipcMain,
} = require('electron');
const path = require('path');
const url = require('url');
const is = require('electron-is');
const dbStore = require('./data-store/dbStore');

let mainWindow;
// const Autosave = new dbStore.SaveGame('autosave.entities');
// const ManualSave = new dbStore.SaveGame('entities');

let x = dbStore.getStates();
console.log(x);

/**
 * 
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 640,
        height: 640,
        resizable: false,
        webPreferences: {
            nodeIntegrationInWorker: true,
        },
        icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
        icon: path.join(__dirname, 'assets/icons/mac/logo-mac.icns'),
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

ipcMain.on('saveEntity', function(ev, arg) {
    dbStore.storeEntity(arg);
});

ipcMain.on('manualSaveState', function(ev, arg) {
    dbStore.manualSave();
});

setInterval(function() {
    dbStore.autosave();
}, 1000);

ipcMain.on('listSaveStates', function(ev, arg) {
    let p = dbStore.getStates();
    p.then((keys) => {
        ev.sender.send('reply-listSaveStates', {data: keys, success: true});
    })
    .catch((reason) => {
        console.error('Failed to load keys:');
        console.error(reason);
        ev.sender.send('reply-listSaveStates', {data: null, success: false});
    });
});

ipcMain.on('loadState', function(ev, arg) {
    let p = dbStore.loadState(arg);
    p.then((data) => {
        ev.sender.send('reply-loadState', {data: data, success: true});
    })
    .catch((reason) => {
        console.error('Failed to load key:');
        console.error(reason);
        ev.sender.send('reply-listSaveStates', {data: null, success: false});
    });
});

