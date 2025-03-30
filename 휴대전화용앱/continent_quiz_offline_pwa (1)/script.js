let map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentQuestion = null;
let currentMode = "country";
let score = 0;

let bordersLayer = null;
let correctCountries = [];

fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  .then(res => res.json())
  .then(geoData => {
    bordersLayer = geoData;
    L.geoJSON(geoData, {
      style: {
        color: "#000",
        weight: 1.5,
        fillOpacity: 0
      }
    }).addTo(map);
  });

function newQuestion() {
  const continent = document.getElementById("continent").value;
  const mode = document.getElementById("mode").value;
  currentMode = mode;

  if (!continent || !data[continent] || data[continent].length === 0) {
    alert("대륙을 선택하거나 해당 대륙에 등록된 국가가 없습니다!");
    return;
  }

  const countries = data[continent];
  const rand = Math.floor(Math.random() * countries.length);
  currentQuestion = countries[rand];

  const text = mode === "country"
    ? `문제: "${currentQuestion.country}"을(를) 지도에서 클릭하세요!`
    : `문제: "${currentQuestion.capital}" (수도)을(를) 지도에서 클릭하세요!`;

  document.getElementById("question").textContent = text;
  document.getElementById("result").textContent = "";
}

map.on("click", function (e) {
  if (!currentQuestion) return;

  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  const targetLat = currentMode === "country" ? currentQuestion.lat : currentQuestion.capitalLat;
  const targetLng = currentMode === "country" ? currentQuestion.lng : currentQuestion.capitalLng;

  const distance = getDistance(lat, lng, targetLat, targetLng);

  if (distance < 500) {
    document.getElementById("result").textContent = "정답입니다! 🎉";
    score += 1;
    document.getElementById("score").textContent = `점수: ${score}`;
    fillCorrectCountry(currentQuestion.country);
  } else {
    document.getElementById("result").textContent = "틀렸어요. 다시 시도해보세요!";
  }
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function fillCorrectCountry(countryName) {
  if (!bordersLayer) return;

  const match = bordersLayer.features.find(
    f => f.properties.name.toLowerCase() === countryName.toLowerCase()
  );

  if (match && !correctCountries.includes(countryName)) {
    correctCountries.push(countryName);
    L.geoJSON(match, {
      style: {
        color: "#2ecc71",
        fillColor: "#2ecc71",
        weight: 1,
        fillOpacity: 0.5
      }
    }).addTo(map);
  }
}