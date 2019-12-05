const {app, BrowserWindow} = require('electron');
const remote = require('remote');
const path = require('path');
const fs = require('fs');

// to keep window from being garbage collected by javascript reference it:
let win;



//then…
function createWindow(){
	win = new BrowserWindow({width:1800, height:1000});

    win.loadFile("index.html");
    win.webContents.openDevTools();

    win.on('closed', ()=> {
        win = null;
    });
   
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit();
    }
});
