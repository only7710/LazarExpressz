const map = L.map("map").setView([47.0, 19.0], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors', 
}).addTo(map);

const vehicleMarkers = new Map();

function getColorByDelay(delay) {
    if (delay <= 4 * 60) return "#00FF00";
    if (delay <= 19 * 60) return "#FFFF00";
    if (delay <= 59 * 60) return "#FFA500";
    return "#FF0000";
}

async function fetchGraphQL(query) {
    const response = await fetch("assets/php/proxy.php", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
    },
        body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data.data;
}

async function fetchAndDisplayTrains() {
    const vehicleQuery = `{ vehiclePositions(swLat: 45.5, swLon: 16.1, neLat: 48.7, neLon: 22.8, modes: [RAIL, RAIL_REPLACEMENT_BUS]) { trip { gtfsId tripShortName tripHeadsign } vehicleId lat lon label speed heading } }`;
    const data = await fetchGraphQL(vehicleQuery);
    const seenVehicleIds = new Set();

    for (const v of data.vehiclePositions) {
        seenVehicleIds.add(v.vehicleId);
        fetchTripDelay(v);
    }

    for (const id of [...vehicleMarkers.keys()]) {
        if (!seenVehicleIds.has(id)) {
            map.removeLayer(vehicleMarkers.get(id));
            vehicleMarkers.delete(id);
        }
    }
}

async function fetchTripDelay(vehicle) {
    const gtfsId = vehicle.trip.gtfsId;
    const date = new Date().toISOString().split("T")[0];
    const query = `{ trip(id: \"${gtfsId}\", serviceDay: \"${date}\") { tripHeadsign trainCategoryName trainName route { longName shortName } stoptimes { stop { name } realtimeArrival realtimeDeparture arrivalDelay scheduledArrival scheduledDeparture } } }`;

    const data = await fetchGraphQL(query);
    const trip = data.trip;
    if (!trip) return;

    const stoptimes = trip.stoptimes;
    const now = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    for (let st of stoptimes) {
        if (st.realtimeDeparture > now) {
            const delay = st.arrivalDelay;
            const stopName = st.stop.name;
            const scheduled = secondsToHHMM(st.scheduledArrival);
            const actual = secondsToHHMM(st.realtimeArrival);

            displayMarker(
                vehicle,
                delay,
                stopName,
                scheduled,
                actual,
                stoptimes
            );
            break;
        }
    }
}

function secondsToHHMM(seconds) {
    const d = new Date(0);
    d.setSeconds(seconds);
    return d.toISOString().substr(11, 5);
}

function displayMarker(
    vehicle,
    delay,
    stopName,
    scheduled,
    actual,
    stoptimes
) {
    const id = vehicle.vehicleId;
    const lat = vehicle.lat;
    const lon = vehicle.lon;
    const color = getColorByDelay(delay);
    const name = vehicle.trip.tripShortName;
    const headsign = vehicle.trip.tripHeadsign;
    const speed = Math.round(vehicle.speed * 3.6);
    const heading = vehicle.heading || 0;

    saveTrainData({
        vehicle_id: id,
        train_name: name,
        headsign: headsign,
        latitude: lat,
        longitude: lon,
        speed: speed,
        delay_seconds: delay,
        stop_name: stopName,
        scheduled_time: scheduled,
        actual_time: actual
    });

    if (vehicleMarkers.has(id)) {
        map.removeLayer(vehicleMarkers.get(id));
    }

    const arrowSvg = `
      <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="10" fill="${color}" stroke="black" stroke-width="1.5" />
        <g transform="rotate(${heading},18,18)">
          <polygon points="18,0 13,10 23,10" fill="black"/>
        </g>
      </svg>
    `;
    const arrowIcon = L.divIcon({
        className: 'train-arrow-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: arrowSvg
    });

    const marker = L.marker([lat, lon], { icon: arrowIcon });

    const hoverText = `<b>${name} → ${headsign}</b> • \n${speed} km/h • \n${Math.round(
        delay / 60
    )} perc késés`;
    marker.bindTooltip(hoverText);

    let table =
        '<table class="popup-table"><tr><th>Megálló</th><th>Tervezett</th><th>Tényleges</th><th>Késés (perc)</th></tr>';
    for (const st of stoptimes) {
        const sName = st.stop.name;
        const sched = secondsToHHMM(st.scheduledArrival);
        const act = secondsToHHMM(st.realtimeArrival);
        const d = Math.round(st.arrivalDelay / 60);
        table += `<tr><td>${sName}</td><td>${sched}</td><td>${act}</td><td>${d}</td></tr>`;
    }
    table += "</table>";

    const popup = `<b>${name} → ${headsign}</b><br><b>Sebesség:</b> ${speed} km/h<br><b>Köv. megálló:</b> ${stopName}<br><b>Késés:</b> ${Math.round(
    delay / 60
    )} perc<br><b>Érkezés:</b> ${scheduled} (<span style="color: green">${actual}</span>)<br>${table}`;

    marker.bindPopup(popup);
    marker.addTo(map);
    vehicleMarkers.set(id, marker);
}

async function saveTrainData(trainData) {
    console.log(trainData);
    try {
        await fetch("assets/php/save_train_data.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainData)
        });
    } catch (e) {
        console.error("Error saving train data:", e);
    }
}

fetchAndDisplayTrains();
setInterval(fetchAndDisplayTrains, 60000);