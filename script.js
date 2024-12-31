const TRANSPORT_ICONS = {
  B: '<i class="fas fa-bus transport-icon"></i>',
  T: '<i class="fas fa-subway transport-icon"></i>',
  IC: '<i class="fas fa-train transport-icon"></i>',
  IR: '<i class="fas fa-train transport-icon"></i>',
  RE: '<i class="fas fa-train transport-icon"></i>',
  S: '<i class="fas fa-train transport-icon"></i>',
  Train: '<i class="fas fa-train transport-icon"></i>',
  TGV: '<i class="fas fa-train transport-icon"></i>',
  ICN: '<i class="fas fa-train transport-icon"></i>',
  Bus: '<i class="fas fa-bus transport-icon"></i>',
  M: '<i class="fas fa-subway transport-icon"></i>',
  Tram: '<i class="fas fa-train-tram transport-icon"></i>',
  BN: '<i class="fas fa-bus transport-icon"></i>',
  NAB: '<i class="fas fa-bus transport-icon"></i>',
  PostAuto: '<i class="fas fa-bus transport-icon"></i>',
  Cableway: '<i class="fas fa-mountain transport-icon"></i>',
  BAT: '<i class="fas fa-ship transport-icon"></i>',
  Walk: '<i class="fas fa-walking transport-icon"></i>',
};

// Initialize date and time inputs with current values
document.getElementById("dateInput").valueAsDate = new Date();
document.getElementById("timeInput").value = new Date().toLocaleTimeString(
  "en-US",
  {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }
);

const fromStationInput = document.getElementById("fromStation");
const toStationInput = document.getElementById("toStation");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const searchButton = document.getElementById("searchButton");
const connectionsBody = document.getElementById("connectionsBody");

function getTransportDisplay(journey) {
  const icon =
    TRANSPORT_ICONS[journey.category] ||
    '<i class="fas fa-question-circle transport-icon"></i>';
  const name = journey.number
    ? `${journey.category} ${journey.number}`
    : journey.category;
  return `<span class="transport-item">${icon}<span class="transport-name">${name}</span></span>`;
}

async function fetchConnections() {
  const fromStation = fromStationInput.value.trim();
  const toStation = toStationInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;

  if (!fromStation || !toStation) {
    connectionsBody.innerHTML = `
            <tr>
              <td colspan="5" class="error">
                Please enter both departure and destination stations
              </td>
            </tr>
          `;
    return;
  }

  connectionsBody.innerHTML = `
          <tr>
            <td colspan="5" class="loading">
              Loading connections...
            </td>
          </tr>
        `;

  try {
    const response = await fetch(
      `https://transport.opendata.ch/v1/connections?from=${encodeURIComponent(
        fromStation
      )}&to=${encodeURIComponent(toStation)}&date=${date}&time=${time}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.connections || data.connections.length === 0) {
      connectionsBody.innerHTML = `
              <tr>
                <td colspan="5" class="error">
                  No connections found between ${fromStation} and ${toStation}
                </td>
              </tr>
            `;
      return;
    }

    connectionsBody.innerHTML = data.connections
      .slice(0, 5)
      .map((connection) => {
        const departureTime = new Date(
          connection.from.departure
        ).toLocaleTimeString("de-CH", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const arrivalTime = new Date(connection.to.arrival).toLocaleTimeString(
          "de-CH",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        const duration = connection.duration
          .replace("00d", "")
          .replace(":", "h ")
          .replace(":", "m");

        const transportInfo = connection.sections
          .filter((section) => section.journey)
          .map((section) => getTransportDisplay(section.journey))
          .join("");

        return `
                <tr>
                  <td>${departureTime}<br><small>${
          connection.from.station.name
        }</small></td>
                  <td>${arrivalTime}<br><small>${
          connection.to.station.name
        }</small></td>
                  <td>${duration}</td>
                  <td>${connection.transfers} changes</td>
                  <td>${
                    transportInfo ||
                    getTransportDisplay({ category: "Walk", number: "" })
                  }</td>
                </tr>
              `;
      })
      .join("");
  } catch (error) {
    connectionsBody.innerHTML = `
            <tr>
              <td colspan="5" class="error">
                Error fetching connections: ${error.message}
              </td>
            </tr>
          `;
  }
}

searchButton.addEventListener("click", fetchConnections);

// Allow searching on Enter key press in inputs
[fromStationInput, toStationInput, dateInput, timeInput].forEach((input) => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });
});

// Prefill inputs for demonstration
fromStationInput.value = "Zürich HB";
toStationInput.value = "Bern";
