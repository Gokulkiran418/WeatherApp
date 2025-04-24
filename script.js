document.addEventListener('DOMContentLoaded', () => {
    const weatherCard = document.getElementById('weather-card');
    const spinner = document.getElementById('spinner');
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const historyDiv = document.getElementById('history');

    // Show spinner
    function showSpinner() {
        spinner.style.display = 'block';
    }

    // Hide spinner
    function hideSpinner() {
        spinner.style.display = 'none';
    }

    // Display weather data
    function displayWeather(data) {
        document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('date-time').textContent = new Date().toLocaleString();
        document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
        document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
        document.getElementById('pressure').textContent = `Pressure: ${data.main.pressure} hPa`;
        document.getElementById('feels-like').textContent = `Feels Like: ${data.main.feels_like}°C`;
        document.getElementById('sunrise').textContent = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
        document.getElementById('sunset').textContent = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
        weatherCard.style.display = 'block';
        setBackground(data.main.temp);
    }

    // Set background gradient based on temperature
    function setBackground(temp) {
        if (temp < 5) {
            document.body.classList.remove("gradient-background", "moderate", "warm", "hot");
            document.body.classList.add("cold");
        } else if (temp < 13) {
            document.body.classList.remove("gradient-background", "cold", "warm", "hot");
            document.body.classList.add("moderate");
        } else if (temp < 27) {
            document.body.classList.remove("gradient-background", "cold", "moderate", "hot");
            document.body.classList.add("warm");
        } else {
            document.body.classList.remove("gradient-background", "cold", "warm", "moderate");
            document.body.classList.add("hot");
        }
    }

    // Handle errors
    function handleError(message) {
        alert(message);
    }

    // Fetch weather by city name
    async function fetchWeatherByCity(city) {
        showSpinner();
        try {
            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const data = await response.json();
            displayWeather(data);
            saveToHistory(city);
            displayHistory();
        } catch (error) {
            handleError(error.message);
        } finally {
            hideSpinner();
        }
    }

    // Fetch weather by coordinates
    async function fetchWeatherByCoordinates(lat, lon) {
        console.log(`Fetching weather for lat: ${lat}, lon: ${lon}, types: ${typeof lat}, ${typeof lon}`);
        showSpinner();
        try {
          // Ensure lat and lon are numbers
          const latNum = Number(lat);
          const lonNum = Number(lon);
          if (isNaN(latNum) || isNaN(lonNum)) {
            throw new Error('Invalid coordinates: latitude or longitude is not a number');
          }
          const response = await fetch(`/api/weather?lat=${latNum}&lon=${lonNum}`);
          console.log('Fetch response status:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Unable to fetch weather: ${errorData.error || 'Unknown error'}`);
          }
          const data = await response.json();
          console.log('Weather data:', data);
          displayWeather(data);
        } catch (error) {
          console.error('Fetch error:', error.message);
          handleError(error.message);
        } finally {
          hideSpinner();
        }
      }
      
      function getLocation() {
        if (navigator.geolocation) {
          console.log('Requesting geolocation...');
          navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(`Got coordinates: lat=${lat}, lon=${lon}, types: ${typeof lat}, ${typeof lon}`);
            fetchWeatherByCoordinates(lat, lon);
          }, error => {
            console.error('Geolocation error:', error.message);
            handleError('Geolocation error: ' + error.message);
          });
        } else {
          handleError('Geolocation is not supported by this browser.');
        }
      }

    // Save city to search history
    function saveToHistory(city) {
        let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        if (!history.includes(city)) {
            history.unshift(city);
            if (history.length > 5) {
                history.pop();
            }
            localStorage.setItem('weatherHistory', JSON.stringify(history));
        }
    }

    // Display search history
    function displayHistory() {
        let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        historyDiv.innerHTML = '';
        history.forEach(city => {
            let btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary m-1';
            btn.textContent = city;
            btn.onclick = () => fetchWeatherByCity(city);
            historyDiv.appendChild(btn);
        });
    }

    // Event listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    });

    locationBtn.addEventListener('click', getLocation);

    // Display history on load
    displayHistory();
});
