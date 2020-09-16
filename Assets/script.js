$(function () {
    const numberOfDaysToForecast = 5;
    var searchHistoryArray = [];
    const apiKey = "6099ede7d24801fa3337c93df63323b6";
    const inputField = $("#searchInput");
    var cityName;
    var todaysDate = moment().format("dddd Do MMMM YYYY");
    var inputSwitch;
    var listCity;
    
    if (localStorage.getItem("Weather search history")) {
      var arrayFromStorage = localStorage
        .getItem("Weather search history")
        .split(",");
    } else {
      var arrayFromStorage;
    }
  
  $("#searchButton").on("click", function () {
    event.preventDefault();
    

    if (inputField.val() === "") {      
      return;
    } else {
      inputSwitch = true;
      showWeather();
    }
  });

  
  $("#clearButton").on("click", function () {
    localStorage.removeItem("Weather search history");
    location.reload();
  });

  
  $(document).on("click", ".list-group-item", function () {
    inputSwitch = false;
    listCity = $(this).text();
    showWeather();
  });
  
  function onLoad() {
    $("#searchList").empty();

    if (arrayFromStorage) {
      searchHistoryArray = arrayFromStorage;
    }

    for (let i = 0; i < searchHistoryArray.length; i++) {
      var aSearchTerm = $("<li>").text(searchHistoryArray[i]);
      aSearchTerm.addClass("list-group-item");
      $("#searchList").prepend(aSearchTerm);
    }
  }
  onLoad();

  function showWeather() {
    event.preventDefault();

   
    if (inputSwitch) {
      cityName = inputField.val();
    } else {
      cityName = listCity;
    }

    $("#header-row").empty();
    $("#current-weather-data").empty();
    $("#forecast-row").empty();

    var currentWeatherQueryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&units=imperial&appid=" +
      apiKey;

    
    $.ajax({
      url: currentWeatherQueryURL,
      method: "GET",
    }).then(function (response) {
      cityName = response.name;

    
      if (response) {
        if (searchHistoryArray.includes(cityName) === false) {

          populateSearchBar();
        }
      } else {
        
        alert("not a valid city name");
      }

      $("#weatherData").empty();
      cityNameAndDate = $("<h4>").text(response.name + " (" + todaysDate + ")");
      currentIconEl = $("<img id='currentWeatherIcon'>").attr(
        "src",
        "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png"
      );
      $("#headerRow").empty();
      $("#headerRow").append(cityNameAndDate, currentIconEl);

      
      currentTempEl = $("<p>").text(
        "Temperature: " + Math.round(response.main.temp) + " °F"
      );
      currentHumidityEl = $("<p>").text(
        "Humidity: " + response.main.humidity + "%"
      );
      currentWindEl = $("<p>").text(
        "Wind speed: " + Math.round(response.wind.speed) + " MPH"
      );

      $("#weatherData").append(
        currentTempEl,
        currentHumidityEl,
        currentWindEl
      );

      var latitude = response.coord.lat;
      var longitude = response.coord.lon;


      var currentUVQueryURL =
        "https://api.openweathermap.org/data/2.5/uvi?appid=" +
        apiKey +
        "&lat=" +
        latitude +
        "&lon=" +
        longitude;

      $.ajax({
        url: currentUVQueryURL,
        method: "GET",
      }).then(function (response) {
        $("#forecastTitle").text("5-day Forecast");

        currentUVLabel = $("<span>").text("UV Index: ");
        currentUVBadge = $("<span>").text(response.value);
        console.log(response.value);

        if (response.value < 3) {

          currentUVBadge.addClass("uv uv-low");
        } else if (response.value >= 3 && response.value < 6) {

          currentUVBadge.addClass("uv uv-med");
        } else if (response.value >= 6 && response.value < 8) {

          currentUVBadge.addClass("uv uv-high");
        } else if (response.value >= 8 && response.value <= 10) {

          currentUVBadge.addClass("uv uv-very-high");
        } else {

          currentUVBadge.addClass("uv uv-extreme");
        }

        $("#weatherData").append(currentUVLabel, currentUVBadge);
      });


      var forecastQueryURL =
        "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" +
        latitude +
        "&lon=" +
        longitude +
        "&exclude=current,minutely,hourly&appid=" +
        apiKey;

      $.ajax({
        url: forecastQueryURL,
        method: "GET",
      }).then(function (response) {
        
        $("#forecastRow").empty();
        for (let i = 1; i < numberOfDaysToForecast + 1; i++) {
          var forecastCard = $("<div class='col-sm-2 card forecast card-body'>");
            console.log("test-1");

          var forecastDayEl = $("<h6>");

          var unixSeconds = response.daily[i].dt;
          var unixMilliseconds = unixSeconds * 1000;
          var forecastDateUnix = new Date(unixMilliseconds);
          var forecastDoW = forecastDateUnix.toLocaleString("en-US", {
            weekday: "long",
          });
          forecastDayEl.text(forecastDoW);


          var hrLine = $("<hr />");


          var iconPara = $("<p>");

          var iconImg = $("<img>");
          iconImg.attr(
            "src",
            "http://openweathermap.org/img/wn/" +
              response.daily[i].weather[0].icon +
              ".png"
          );
          iconPara.append(iconImg);

          var tempPara = $("<p>").text(
            "Temp: " + Math.round(response.daily[i].temp.day) + " °F"
          );


          var humidPara = $("<p>").text(
            "Humidity: " + response.daily[i].humidity + "%"
          );


          forecastCard.append(
            forecastDayEl,
            hrLine,
            iconPara,
            tempPara,
            humidPara
          );
          
          $("#forecastRow").append(forecastCard);
        }
      });
    });
  }
  function populateSearchBar() {
    $("#search-history-items").empty();

    searchHistoryArray.push(cityName);
    console.log("searchHistoryArray: " + searchHistoryArray);
    localStorage.setItem("Weather search history", searchHistoryArray);

    for (let i = 0; i < searchHistoryArray.length; i++) {
      var aSearchTerm = $("<li>").text(searchHistoryArray[i]);
      aSearchTerm.addClass("listGroupItem");
      $("#searchList").prepend(aSearchTerm);
    }
  }
});