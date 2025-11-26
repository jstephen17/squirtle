const plantImg = document.getElementById("plantImg");
const waterBtn = document.getElementById("waterBtn");
const statusText = document.getElementById("status");

const moistureText = document.getElementById("moistureValue");
const waterText = document.getElementById("waterValue");

let pumpState = false; // false = OFF, true = ON

// Button control
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

async function fetchLatestData() {
  try {
    const response = await fetch("http://localhost/autoWatering/connect.php");
    const data = await response.json();

    if (data.moisture) {
      moistureText.textContent = `Moisture: ${data.moisture.moist_lvl}`;
    }
    if (data.water) {
      waterText.textContent = `Last Water Duration: ${data.water.water_duration} ms`;
    }
  } catch (error) {
    console.error("Error fetching latest data:", error);
  }
}


// Fetch data every 5 seconds
setInterval(fetchLatestData, 5000);
fetchLatestData(); // initial fetch
