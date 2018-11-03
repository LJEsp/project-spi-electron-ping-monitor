const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const ping = require("ping");
const sites = require("./sites.json");

let mainWindow;

// const hosts = ["post.ch", "google.com.ph", "facebook.com", "192.168.1.1"];

// hosts.forEach(function(host) {
//   ping.sys.probe(host, function(isAlive) {
//     var msg = isAlive
//       ? "host " + host + " is alive"
//       : "host " + host + " is dead";
//     console.log(msg);
//   });
// });

app.on("ready", () => {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL(`file://${__dirname}/main.html`);

  mainWindow.webContents.on("did-finish-load", () => {});
});

ipcMain.on("host:request", (event, host) => {
  const pingData = {};
  pingData.host = host;

  ping.promise.probe(host, { timeout: 10 }).then(res => {
    console.log(`${host}, ${res.alive}`);

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
