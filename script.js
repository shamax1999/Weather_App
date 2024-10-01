const apiKey = "4eb2b05f00144f5c9be92540243009";
const baseUrl = "https://api.weatherapi.com/v1";

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");

    // Get icons
    const lightIcon = document.getElementById("light-icon");
    const darkIcon = document.getElementById("dark-icon");

    // Toggle icon visibility
    if (document.body.classList.contains("dark-theme")) {
        lightIcon.style.display = "none";
        darkIcon.style.display = "inline"; // Show dark icon
    } else {
        lightIcon.style.display = "inline"; // Show light icon
        darkIcon.style.display = "none";
    }

    // Save the current theme to localStorage
    const currentTheme = document.body.classList.contains("dark-theme") ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', currentTheme);
}




// Function to suggest locations based on user input
async function suggestLocations() {
    const location = document.getElementById("search-input").value.trim();
    if (location.length < 3) return;

    try {
        const response = await fetch(`${baseUrl}/search.json?key=${apiKey}&q=${location}`);
        if (!response.ok) {
            throw new Error("Failed to fetch location suggestions.");
        }
        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
    }
}

// Function to display location suggestions
function displaySuggestions(suggestions) {
    const suggestionsList = document.getElementById("suggestions");
    suggestionsList.innerHTML = "";

    suggestions.forEach((suggestion) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.textContent = `${suggestion.name}, ${suggestion.country}`;
        listItem.onclick = () => {
            document.getElementById("search-input").value = suggestion.name;
            suggestionsList.innerHTML = "";
            getWeather();
        };
        suggestionsList.appendChild(listItem);
    });
}

// Main function to get weather details
async function getWeather() {
    const location = document.getElementById("search-input").value.trim();
    if (!location) {
        alert("Please enter a location.");
        return;
    }

    await fetchCurrentWeather(location);
    await fetchForecastWeather(location);
    await fetchPastWeather(location);
}


// Function to get current location weather using geolocation
async function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Current position: Latitude: ${latitude}, Longitude: ${longitude}`); // Log the coordinates
            const location = `${latitude},${longitude}`;

            await fetchCurrentWeather(location);
            await fetchForecastWeather(location);
            await fetchPastWeather(location);
        },
        (error) => {
            console.error("Error getting location:", error); // Log the error
            alert("Unable to retrieve your location. Please check your settings.");
        }
    );
}


// Fetch current weather data
// Fetch current weather data
async function fetchCurrentWeather(location) {
    try {
        const response = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}`);
        if (!response.ok) {
            throw new Error("Failed to fetch current weather data.");
        }
        const data = await response.json();
        console.log("Current Weather Data:", data); // Log the current weather data
        displayCurrentWeather(data);
    } catch (error) {
        console.error("Error fetching current weather:", error);
        alert("Error fetching current weather. Please check the console for details.");
    }
}



// Display current weather information along with the current date and time
function displayCurrentWeather(data) {
    // Get current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const currentTime = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const currentWeather = `
        <div class="location">
            <img src="${data.current.condition.icon}" alt="${data.current.condition.text}" class="weather-icon">
            <p class="weather-title">${data.location.name}, ${data.location.country}</p>
            <p class="weather-date">${currentDate}</p> <!-- Add current date here -->
            <p class="weather-time-large">${currentTime}</p> <!-- Add current time here with new class -->
        </div>
        
        <div class="weather-cards">
            <div class="weather-card">
                <i class="fas fa-thermometer-half icon"></i>
                <p class="weather-info">Temperature: ${data.current.temp_c}°C / ${data.current.temp_f}°F</p>
            </div>
            <div class="weather-card">
                <img src="${data.current.condition.icon}" alt="${data.current.condition.text}" class="weather-icon">
                <p class="weather-info">Condition: ${data.current.condition.text}</p>
            </div>
            <div class="weather-card">
                <i class="fas fa-tint icon"></i>
                <p class="weather-info">Humidity: ${data.current.humidity}%</p>
            </div>
            <div class="weather-card">
                <i class="fas fa-wind icon"></i>
                <p class="weather-info">Wind Speed: ${data.current.wind_kph} kph</p>
            </div>
        </div>
    `;
    document.getElementById("current-weather-details").innerHTML = currentWeather;
}




// Fetch forecast weather data for the next 3 days
async function fetchForecastWeather(location) {
    try {
        const response = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=4`);
        if (!response.ok) {
            throw new Error("Failed to fetch forecast weather data.");
        }
        const data = await response.json();
        displayForecastWeather(data);
    } catch (error) {
        console.error("Error fetching forecast weather:", error);
        alert("Error fetching forecast weather. Please check the console for details.");
    }
}


// Display forecast weather information for the next 3 days
function displayForecastWeather(data) {
    let forecastHTML = "<div class='weather-cards'>"; // Wrap in a container
    data.forecast.forecastday.forEach(day => {
        forecastHTML += createWeatherCard(day);
    });
    forecastHTML += "</div>"; // Close the container
    document.getElementById("forecast-details").innerHTML = forecastHTML;
}


// Function to create a weather card for a specific day with icons for each detail
function createWeatherCard(day) {
    const dayDate = new Date(day.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    let displayDate;

    if (dayDate.toDateString() === today.toDateString()) {
        displayDate = "Today";
    } else if (dayDate.toDateString() === yesterday.toDateString()) {
        displayDate = "Yesterday";
    } else if (dayDate.toDateString() === tomorrow.toDateString()) {
        displayDate = "Tomorrow";
    } else {
        // Format the date to show the day name
        const options = { weekday: 'long' };
        displayDate = dayDate.toLocaleDateString(undefined, options);
    }

    return `
        <div class="weather-card">
            <div class="card-header">
                <b><p>${displayDate}</p></b>
            </div>
            <div class="card-body">
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-icon">
                <p><i class="fas fa-thermometer-half icon"></i> Avg Temp: ${day.day.avgtemp_c}°C / ${day.day.avgtemp_f}°F</p>
                <p><i class="fas fa-cloud-sun icon"></i> Condition: ${day.day.condition.text}</p>
                <p><i class="fas fa-umbrella icon"></i> Chance of Rain: ${day.day.daily_chance_of_rain}%</p>
            </div>
        </div>
    `;
}




// Display weekly weather information for the next 7 days
function displayWeeklyWeather(data) {
    let weeklyWeatherHTML = "<div class='weather-cards'>"; // Wrap in a container
    const today = new Date();

    data.forecast.forecastday.forEach(day => {
        const dayDate = new Date(day.date);
        let displayDate;

        if (dayDate.toDateString() === today.toDateString()) {
            displayDate = "Today";
        } else if (dayDate.toDateString() === tomorrow.toDateString()) {
            displayDate = "Tomorrow";
        } else {
            const options = { weekday: 'long' };
            displayDate = dayDate.toLocaleDateString(undefined, options); // Format the date to show the day name
        }

        weeklyWeatherHTML += createWeatherCard(day, displayDate); // Pass displayDate to createWeatherCard
    });

    weeklyWeatherHTML += "</div>"; // Close the container
    document.getElementById("weekly-weather-details").innerHTML = weeklyWeatherHTML; // Insert the HTML into the page
}



// Fetch past weather data for the last 7 days
async function fetchPastWeather(location) {
    const today = new Date();
    let pastWeatherHTML = "<div class='weather-cards'>"; // Wrap in a container

    for (let i = 1; i <= 7; i++) {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - i);
        const formattedDate = pastDate.toISOString().split('T')[0];

        try {
            console.log("Fetching past weather for:", formattedDate);
            const response = await fetch(`${baseUrl}/history.json?key=${apiKey}&q=${location}&dt=${formattedDate}`);
            if (!response.ok) {
                throw new Error("Failed to fetch past weather data.");
            }
            const data = await response.json();
            pastWeatherHTML += createPastWeatherCard(data.forecast.forecastday[0]);
        } catch (error) {
            console.error("Error fetching past weather:", error);
            alert("Error fetching past weather. Please check the console for details.");
        }
    }
    
    pastWeatherHTML += "</div>"; // Close the container
    document.getElementById("past-weather-details").innerHTML = pastWeatherHTML; // Insert the HTML into the page
}




// Function to create a weather card for a specific past day with icons for each detail
function createPastWeatherCard(day) {
    return `
        <div class="weather-card">
            <div class="card-header">
               <b> <p>${day.date}</p> </b>
            </div>
            <div class="card-body">
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-icon">
                <p><i class="fas fa-thermometer-half icon"></i> Avg Temp: ${day.day.avgtemp_c}°C / ${day.day.avgtemp_f}°F</p>
                <p><i class="fas fa-cloud-sun icon"></i> Condition: ${day.day.condition.text}</p>
                
            </div>
        </div>
    `;
}

// Call this function to set the initial theme based on user preference or default
function setInitialTheme() {
    const theme = localStorage.getItem('theme') || 'light-theme'; // Default to light
    document.body.classList.add(theme);
}

// Call the initial theme setting function
setInitialTheme();
