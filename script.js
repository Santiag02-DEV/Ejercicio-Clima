async function datosClima(city = 'vitoria-gasteiz') {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=d0b6a93c5f41e9a68d307c89db56c6bd&units=metric`);
    const data = await response.json();

    const temp = [];
    const timeLabels = [];
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString('en-CA');

        if (!dailyForecasts[dateString]) {
            dailyForecasts[dateString] = {
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                mainWeather: item.weather[0].main
            };
        } else {
            dailyForecasts[dateString].tempMin = Math.min(dailyForecasts[dateString].tempMin, item.main.temp_min);
            dailyForecasts[dateString].tempMax = Math.max(dailyForecasts[dateString].tempMax, item.main.temp_max);
        }

        if (date.getMinutes() === 0) {
            temp.push(item.main.temp.toFixed(0));
            timeLabels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    });

    const cityName = data.city.name;
    const weatherDescription = data.list[0].weather[0].main.toLowerCase();
    const mainWeather = data.list[0].weather[0].main;
    const temMax = data.list[0].main.temp_max.toFixed(0);
    const temMin = data.list[0].main.temp_min.toFixed(0);

    const today = new Date();
    const todayString = today.toLocaleDateString('en-CA');
    const todayWeather = dailyForecasts[todayString];
    const todayOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const todayDateString = today.toLocaleDateString(undefined, todayOptions);

    const divContainer = document.querySelector('.container');
    const divOverlay = document.querySelector('.overlay');
    divOverlay.innerHTML = '';

    const weatherClasses = {
        clear: 'clear',
        clouds: 'cloudy',
        rain: 'rain',
        snow: 'snow',
        thunderstorm: 'thunderstorm'
    };

    const weatherIcons = {
        clear: 'fa-sun',
        clouds: 'fa-cloud',
        rain: 'fa-cloud-rain',
        snow: 'fa-snowflake',
        thunderstorm: 'fa-bolt'
    };


    const weatherClass = weatherClasses[weatherDescription];
    const weatherIcon = weatherIcons[weatherDescription];

    // Hide all videos
    document.querySelectorAll('video').forEach(video => video.style.display = 'none');
    // Show the relevant video
    document.getElementById(`video-${weatherClass}`).style.display = 'block';

    divOverlay.innerHTML += `
        <form action="">
            <input type="text" name="search" placeholder="Buscar una ciudad" id="searchInput">
        </form>
        <h2>${cityName}</h2>
        <p class="dateTime">${todayDateString}</p>
        <div class="temp">
            <h1>${temp[0]}°</h1>
            <div class="Contemp">
                <div class="maintemp">
                    <p>${mainWeather}</p>
                    <p><i class="fas ${weatherIcon}" style="color: white"></i></p>
                </div>
                <div class="maxmin">
                    <p>Máx: ${temMax}°</p>
                    <p> - </p>
                    <p>Mín: ${temMin}°</p>
                </div>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="tempChart" style="background-color: rgba(0, 0, 0, 0.3)"></canvas>
        </div>
        <div class="forecast-container">
            <div class="forecast">
                ${Object.keys(dailyForecasts).filter(date => {
                    const currentDate = new Date(date);
                    const today = new Date();
                    const dayDifference = (currentDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

                    return dayDifference > 0 && dayDifference <= 4;
                }).map(date => {
                    const dayOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][new Date(date).getDay()];

                    const dailyWeatherDescription = dailyForecasts[date].mainWeather.toLowerCase();
                    const dailyWeatherIcon = weatherIcons[dailyWeatherDescription] || 'fa-cloud';
                    return `
                        <div class="forecast-item">
                            <p class="day">${dayOfWeek}</p>
                            <p>${dailyForecasts[date].mainWeather}<i class="fas ${dailyWeatherIcon} iconday" style="color: white"></i></p>
                            <p> H:${dailyForecasts[date].tempMax.toFixed(0)}° - L:${dailyForecasts[date].tempMin.toFixed(0)}°</p>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    const ctx = document.getElementById('tempChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels.slice(0, 8),
            datasets: [{
                label: 'Temperatura (°C)',
                data: temp,
                backgroundColor: temp.map(t => t >= 23 ? 'rgba(255, 99, 71, 0.2)' : 'rgba(54, 162, 235, 0.2)'),
                borderColor: temp.map(t => t >= 23 ? 'rgba(255, 99, 71, 1)' : 'rgba(54, 162, 235, 1)'),
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    let searchTimer;
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (event) => {
        clearTimeout(searchTimer);

        const city = event.target.value.trim();
        if (city === '') {
            datosClima();
        } else {
            searchTimer = setTimeout(() => {
                datosClima(city);
            }, 500);
        }
    });
}

datosClima();

setInterval(datosClima, 30000);