const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");

const API_KEY = "69a28bac9a79f28b2bdbb50a6994d03e";

const getWeatherDetails = (cityInput, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        const uniqueForecastDays = [];
        const fiveDaysforecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        })

        console.log(fiveDaysforecast);

    }).catch(() => {
        alert('Error occured while trying to fetch the weather forecast!')
    })
}
const getCityCoordinates = () => {
    event.preventDefault();
    const cityInput = searchInput.value.trim();
    if(!cityInput) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${API_KEY}`
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityInput}`);
        const { name, lat, lon } = data[0]
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert('Error occured while trying to fetch coordinates!')
    })

}

searchButton.addEventListener("click" , getCityCoordinates);