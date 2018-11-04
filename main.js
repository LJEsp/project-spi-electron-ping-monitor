const electron = require("electron");
const { ipcRenderer } = electron;
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

  // const pingedItem = document.querySelector(`[key="${data.host}"`);
  // const key = data.host;

  // const newItem = document.createElement("li");
  // newItem.setAttribute("key", key);
  // const newText = document.createTextNode(
  //   `${data.host} — ${data.isAlive}, ${data.time} ms, ${data.numeric_host}`
  // );

  // if (data.isAlive === true) {
  //   newItem.setAttribute("class", "ping-success");
  // } else if (data.numeric_host === "oul") {
  //   newItem.setAttribute("class", "ping-fail");
  // }

  // newItem.appendChild(newText);

  // pingedItem.replaceWith(newItem);
});
