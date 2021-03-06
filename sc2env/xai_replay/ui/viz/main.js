const {app, BrowserWindow} = require('electron');
const path = require('path');


// to keep window from being garbage collected by javascript reference it:
let win;

//then…
function createWindow(){
	win = new BrowserWindow({width:2000, height:1200,webPreferences: {
        nodeIntegration: true
    }});

    win.loadFile("index.html");
    //win.webContents.openDevTools();

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

       