const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const ping = require("ping");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 800,
    // frame: false,
    webPreferences: { backgroundThrottling: false }
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  mainWindow.webContents.on("did-finish-load", () => {});
});

ipcMain.on("host:request", (event, host) => {
  const pingData = {};
  pingData.host = host;

  ping.promise.probe(host, { timeout: 10 }).then(res => {
    // console.log(`${host}, ${res.alive}`);

    // pingData.details = `${res.alive}, ${res.time} ms, ${res.numeric_host}`;
    pingData.isAlive = res.alive;
    pingData.time = res.time;
    pingData.numeric_host = res.numeric_host;

    mainWindow.webContents.send("host:ping", pingData);
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
