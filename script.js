const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const clearButton = document.querySelector(".clearButton");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsUl = document.querySelector(".weather-cards");
const searchHistoryUl = document.querySelector("#search-history");

const API_KEY = "69a28bac9a79f28b2bdbb50a6994d03e";

// Function to create HTML for current weather and 5-day forecast
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } 
    else {
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

// Function to fetch weather details from API
const getWeatherDetails = async (cityName, latitude, longitude) => {
    try {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        const response = await fetch(WEATHER_API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        updateWeatherDisplay(cityName, fiveDaysForecast);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("An error occurred while fetching the weather forecast!");
    }
};

// Function to update weather display on the dashboard
const updateWeatherDisplay = (cityName, weatherData) => {
    document.getElementById("weather-data").style.display = "block";

    const currentWeatherHTML = createWeatherCard(cityName, weatherData[0], 0);
    document.getElementById("current-weather").innerHTML = currentWeatherHTML;

    const weatherCardsUl = document.getElementById("weather-cards");
    weatherCardsUl.innerHTML = "";
    for (let i = 1; i < 6; i++) {
        const forecastHTML = createWeatherCard(cityName, weatherData[i], i);
        weatherCardsUl.innerHTML += forecastHTML;
    }
}

// Function to handle form submission
const handleFormSubmission = event => {
    event.preventDefault();
    const cityName = searchInput.value.trim();
    if (cityName === "") return;

    fetchCityCoordinates(cityName);
    searchInput.value = "";
}

// Function to fetch city coordinates
const fetchCityCoordinates = cityName => {
    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEO_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch city coordinates');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert(`No coordinates found for ${cityName}`);
                return;
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
            addToSearchHistory(name);
            
            storeSearchHistory(name);
        })
        .catch(error => {
            console.error("Error fetching city coordinates:", error);
            alert("An error occurred while fetching city coordinates!");
        });
}

// Function to store search history
const storeSearchHistory = cityName => {
    let searchHistory = localStorage.getItem('searchHistory');
    if (!searchHistory) {
        searchHistory = [];
    } else {
        searchHistory = JSON.parse(searchHistory);
    }
    searchHistory.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
};

// Function to retrieve search history
const retrieveSearchHistory = () => {
    const searchHistory = localStorage.getItem('searchHistory');
    if (searchHistory) {
        return JSON.parse(searchHistory);
    }
    return [];
};

// Function to add a city to the search history
const addToSearchHistory = cityName => {
    const searchHistoryContainer = document.getElementById("search-history");
    
    
    if ([...searchHistoryContainer.children].some(item => item.textContent === cityName)) {
        return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = cityName;
    listItem.addEventListener("click", () => {
        fetchCityCoordinates(cityName);
    });
    searchHistoryContainer.appendChild(listItem);
};

// Function to display the search history
const displaySearchHistory = () => {
    const searchHistoryContainer = document.getElementById("search-history");
    searchHistoryContainer.innerHTML = "";
    
    const searchedCities = retrieveSearchHistory();
    
    searchedCities.forEach(city => {
        const listItem = document.createElement("li");
        listItem.textContent = city;
        listItem.addEventListener("click", () => {
            fetchCityCoordinates(city);
        });

        searchHistoryContainer.appendChild(listItem);
    });
};

// Event listeners
searchButton.addEventListener("click", handleFormSubmission);
searchInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        handleFormSubmission(event);
    }
});

clearButton.addEventListener("click", () => {
    document.getElementById("search-history").innerHTML = "";  
    localStorage.removeItem('searchHistory');
});