let isConnected = false;
let currentServer = null;
let savedMB = 0;
let blockedThreats = 0;
let counterInterval = null;

const toggleBtn = document.getElementById("toggleBtn");
const statusLed = document.getElementById("statusLed");
const statusText = document.getElementById("statusText");
const locationSpan = document.getElementById("locationName");
const flagSpan = document.getElementById("flagEmoji");
const fakeIpSpan = document.getElementById("fakeIp");
const dataSavedSpan = document.getElementById("dataSaved");
const threatsSpan = document.getElementById("threatsBlocked");
const statusCard = document.getElementById("statusCard");

function updateServerUI(locationName, flagEmoji, ipAddr) {
  locationSpan.innerText = locationName;
  flagSpan.innerText = flagEmoji;
  fakeIpSpan.innerText = ipAddr;
}

function startCounters() {
  if (counterInterval) clearInterval(counterInterval);
  counterInterval = setInterval(() => {
    if (isConnected) {
      savedMB += Math.floor(Math.random() * 3) + 1;
      blockedThreats += Math.random() > 0.8 ? 1 : 0;
      dataSavedSpan.innerText = savedMB;
      threatsSpan.innerText = blockedThreats;
    }
  }, 2000);
}

function connectTo(serverData) {
  if (!serverData) return;
  currentServer = serverData;
  updateServerUI(serverData.loc, serverData.flag, serverData.ip);
  statusLed.classList.add("connected");
  statusText.innerText = "Connected";
  statusCard.style.border = "1px solid #2a6df4";
  toggleBtn.classList.add("active");
  isConnected = true;
  startCounters();
}

function disconnect() {
  isConnected = false;
  currentServer = null;
  statusLed.classList.remove("connected");
  statusText.innerText = "Disconnected";
  statusCard.style.border = "1px solid rgba(72, 187, 255, 0.2)";
  toggleBtn.classList.remove("active");
  updateServerUI("Not connected", "🌍", "0.0.0.0");
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = null;
  }
}

toggleBtn.addEventListener("click", () => {
  if (isConnected) {
    disconnect();
  } else {
    statusText.innerText = "Connecting...";
    statusLed.classList.remove("connected");
    setTimeout(() => {
      if (!isConnected) {
        let defaultServer = null;
        if (currentServer) {
          defaultServer = currentServer;
        } else {
          const firstItem = document.querySelector(".server-item");
          if (firstItem) {
            defaultServer = {
              loc: firstItem.getAttribute("data-loc"),
              flag: firstItem.getAttribute("data-flag"),
              ip: firstItem.getAttribute("data-ip"),
            };
          } else {
            defaultServer = {
              loc: "New York",
              flag: "🇺🇸",
              ip: "192.241.130.12",
            };
          }
        }
        connectTo(defaultServer);
      }
    }, 600);
  }
});

document.querySelectorAll(".server-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!isConnected) return;
    const loc = item.getAttribute("data-loc");
    const flag = item.getAttribute("data-flag");
    const ip = item.getAttribute("data-ip");
    currentServer = { loc, flag, ip };
    updateServerUI(loc, flag, ip);
    statusText.innerText = "Switching...";
    setTimeout(() => {
      if (isConnected) statusText.innerText = "Connected";
    }, 300);
  });
});

disconnect();
const firstDefault = document.querySelector(".server-item");
if (firstDefault) {
  currentServer = {
    loc: firstDefault.getAttribute("data-loc"),
    flag: firstDefault.getAttribute("data-flag"),
    ip: firstDefault.getAttribute("data-ip"),
  };
}
