const apiKey = '1c2fd912fbc12c2569632c1a8769f23d';
//const lat = '37.983810';
//const lon = '23.727539';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds =3600000
var politislocation, politislatitude, politislongitude;
if (window.BroadSignObject) {
       politislocation = decodeURIComponent(
        window.BroadSignObject.politislocation
      );
      
       politislatitude = decodeURIComponent(
        window.BroadSignObject.politislatitude
      );
      
       politislongitude = decodeURIComponent(
        window.BroadSignObject.politislongitude
      );
};
if (politislocation === undefined || !politislocation) {
        politislocation = 'ΑΘΗΝΑ';
}
if (politislatitude === undefined || !politislatitude) {
        politislatitude = '37.983810';
}
if (politislongitude === undefined || !politislongitude) {
        politislongitude = '23.727539';
}
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${politislatitude}&lon=${politislongitude}&appid=${apiKey}&units=metric`;
const region = politislocation;


console.log('https://api.openweathermap.org/data/2.5/weather?lat=37.983810&lon=23.727539&appid=1c2fd912fbc12c2569632c1a8769f23d&units=metric');
// Static fallback data
const staticWeatherData = {
    main: {
        temp: 17, 
        //feels_like: 19, 
    },
    weather: [{
        icon: "02d"
    }]
};

function updateWeatherData(data) {
    const locationElement = document.getElementById('location');
    if (locationElement) locationElement.textContent = region;
    document.getElementById('temp').textContent = data.main.temp.toFixed(0);
    //document.getElementById('feels_like').textContent = data.main.feels_like.toFixed(0);

    //const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    //document.getElementById('weather_icon').src = iconUrl;
    const iconUrl = `img/svg/${data.weather[0].icon}.svg`;
    document.getElementById('weather_icon').src = iconUrl;
}

//function setMessage(message) {
//    document.getElementById('message').textContent = message;
//}

function cacheWeatherData(data) {
    const cacheEntry = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem('weatherData', JSON.stringify(cacheEntry));
}

function isCacheValid() {
    const cacheEntry = JSON.parse(localStorage.getItem('weatherData'));
    if (!cacheEntry) return false;

    const age = Date.now() - cacheEntry.timestamp;
    return age < CACHE_DURATION;
}

function getCachedWeatherData() {
    const cacheEntry = JSON.parse(localStorage.getItem('weatherData'));
    if (cacheEntry && cacheEntry.data) {
        updateWeatherData(cacheEntry.data);
        //setMessage("Cached weather");
    } else {
        fallback(); // Use static data if cache is invalid
        //setMessage("Using fallback");
    }
}

function fetchWeather() {
    if (isCacheValid()) {
        getCachedWeatherData();
        return;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateWeatherData(data);
            cacheWeatherData(data);
            //setMessage("Live weather");
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            if (!isCacheValid()) {
                fallback(); // Now explicitly falls back to static data if cache is also invalid
            } else {
            getCachedWeatherData(); // Otherwise, use the cached data if valid
        }
    });
}

function fallback() {
    updateWeatherData(staticWeatherData);
    //setMessage("Static weather data");
}

if (navigator.onLine) {
    fetchWeather();
} else {
    if (!isCacheValid()) {
        fallback(); // Directly use static data if cache is not valid
    } else {
        getCachedWeatherData(); // Use cached data when offline if it's still valid
    }
}