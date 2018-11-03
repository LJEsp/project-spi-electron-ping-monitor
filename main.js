const electron = require("electron");
const { ipcRenderer } = electron;
const sites = require("./sites.json");

const sitesList = document.getElementById("list");

function loadApp() {
  sites.sites.forEach(site => {
    const siteListItem = document.createElement("li");
    siteListItem.setAttribute("class", "site-list-item");

    const siteText = document.createTextNode(site.header);
    const hostsList = document.createElement("ul");

    site.hosts.forEach(host => {
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
  });
}

// Initialize
loadApp();

ipcRenderer.on("host:ping", (e, data) => {
  const pingedItem = document.querySelector(`[key="${data.host}"`);
  const newItem = document.createElement("li");
  const newText = document.createTextNode(
    `${data.host} — ${data.isAlive}, ${data.time} ms, ${data.numeric_host}`
  );

  if (data.isAlive === true) {
    newItem.setAttribute("class", "ping-success");
  } else if (data.numeric_host === "oul") {
    newItem.setAttribute("class", "ping-fail");
  }

  newItem.appendChild(newText);

  pingedItem.replaceWith(newItem);
});
