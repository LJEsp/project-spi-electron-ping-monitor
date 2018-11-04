const fs = require("fs");

const electron = require("electron");
const { ipcRenderer } = electron;
const { dialog } = require("electron").remote;
const Json2csvParser = require("json2csv").Parser;
const moment = require("moment");

const sites = require("./sites.json");

const sitesList = document.getElementById("list");

let hostsCount = 0;
let pingCount = 0;
const countPing = document.getElementById("countPing");
const countTotal = document.getElementById("countTotal");

function loadApp() {
  sites.sites.forEach(site => {
    const siteListItem = document.createElement("li");
    siteListItem.setAttribute("class", "site-list-item");

    const siteText = document.createTextNode(site.header);
    const hostsList = document.createElement("ul");

    site.hosts.forEach(host => {
      hostsCount++;

      const hostListItem = document.createElement("li");
      hostListItem.setAttribute("id", "hostListItem");

      const hostText = document.createTextNode(host);
      hostListItem.setAttribute("key", host);

      hostListItem.appendChild(hostText);
      hostsList.appendChild(hostListItem);

      ipcRenderer.send("host:request", host);
    });

    siteListItem.appendChild(siteText);
    sitesList.append(siteListItem);
    sitesList.append(hostsList);

    countTotal.textContent = hostsCount;
  });
}

// Initialize
loadApp();

// Download
function download() {
  const downloadable = [];
  const fields = ["name", "hosts.host", "hosts.detail"];

  const sites = document.querySelectorAll(".site-list-item");

  sites.forEach(site => {
    const dlSite = {};
    dlSite.name = site.textContent;
    dlSite.hosts = [];

    site.nextSibling.childNodes.forEach(host => {
      const dlHost = {};
      const array = host.textContent.split(" — ");
      dlHost.host = array[0];
      dlHost.detail = array[1];

      dlSite.hosts.push(dlHost);
    });

    downloadable.push(dlSite);
  });

  // Convert JSON to CSV using module
  const json2csvParser = new Json2csvParser({ fields, unwind: ["hosts"] });
  const csv = json2csvParser.parse(downloadable);

  console.log(csv);

  console.log(downloadable);

  // Save CSV with dialog
  dialog.showSaveDialog(
    {
      defaultPath: `SPi Ping - ${moment().format("MMM DD YYYY, h mm ss a")}.csv`
    },
    fileName => {
      if (fileName === undefined) return;

      fs.writeFile(fileName, csv, err => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
        }

        alert("The file has been succesfully saved");
      });
    }
  );
}

// Reload function
function reloadApp() {
  pingCount = 0;

  sites.sites.forEach(site => {
    site.hosts.forEach(host => {
      ipcRenderer.send("host:request", host);
    });
  });
}

ipcRenderer.on("host:ping", (e, data) => {
  const key = data.host;

  const newItem = document.createElement("li");
  newItem.setAttribute("key", key);
  const newText = document.createTextNode(
    `${data.host} — ${data.isAlive}, ${data.time} ms, ${data.numeric_host}`
  );

  if (data.isAlive === true) {
    newItem.setAttribute("class", "ping-success");
  } else if (data.numeric_host === "oul") {
    newItem.setAttribute("class", "ping-fail");
  }

  newItem.appendChild(newText);

  const pingedItems = document.querySelectorAll(`[key="${data.host}"]`);

  pingCount++;

  pingedItems.forEach(item => {
    item.replaceWith(newItem);

    countPing.textContent = pingCount;
  });
});
