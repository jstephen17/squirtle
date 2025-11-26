const plantImg = document.getElementById("plantImg");
const waterBtn = document.getElementById("waterBtn");
const statusText = document.getElementById("status");

const moistureText = document.getElementById("moistureValue");
const waterText = document.getElementById("waterValue");

const historyTable = document.getElementById("logTable");

let pumpState = false; // false = OFF, true = ON

// Pump button control
waterBtn.addEventListener("click", () => {
  const endpoint = pumpState ? "/pump/off" : "/pump/on";
  fetch(endpoint).then(() => {
    pumpState = !pumpState;
    updateUI();
  });
});

function updateUI() {
  if (pumpState) {
    waterBtn.classList.add("on");
    plantImg.src = "imgs/plantwater.png";
    statusText.textContent = "WATERING...";
  } else {
    waterBtn.classList.remove("on");
    plantImg.src = "imgs/plant.png";
    statusText.textContent = "PUMP OFF";
  }
}

// Fetch latest moisture and last watered
async function fetchLatestData() {
  try {
    const response = await fetch("http://localhost/autoWatering/connect.php");
    const data = await response.json();

    // Updated JSON format
    if (data.latest.moisture) {
      moistureText.textContent =
        `Moisture: ${data.latest.moisture.moist_lvl}`;
    }

    if (data.latest.water) {
      waterText.textContent =
        `Last Watered: ${data.latest.water.timedate_stamp}`;
    }
  } catch (error) {
    console.error("Error fetching latest data:", error);
  }
}

// Fetch last rows for table
async function loadHistoryTable(limit = 10) {
  try {
    const response = await fetch(`http://localhost/autoWatering/connect.php?limit=${limit}`);
    const data = await response.json();

    const moistureRows = data.recents.moisture || [];
    const waterRows = data.recents.water || [];

    historyTable.innerHTML = ""; // Clear table

    // Convert to table entries
    moistureRows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.timedate_stamp}</td>
        <td>${row.moist_lvl}</td>
        <td>Moisture Reading</td>
      `;
      historyTable.appendChild(tr);
    });

    // Convert to table entries
    waterRows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.timedate_stamp}</td>
        <td>${row.water_duration} ms</td>
        <td>Watering Log</td>
      `;
      historyTable.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading table:", error);
  }
}

// Refresh every 5 sec
setInterval(fetchLatestData, 5000);
setInterval(loadHistoryTable, 5000);

fetchLatestData();
loadHistoryTable();
