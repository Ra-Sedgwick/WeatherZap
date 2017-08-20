$(function () {

    var query;
    var conditionData; 
    var forcastModels = [];

    /* Query HTML 5 geolcation permission */
    navigator.permissions.query({ name: 'geolocation' })
        .then(function (permissionStatus) {

            console.log(permissionStatus.state);
            var query;

            /* geolocation is available */
            if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {

                navigator.geolocation.getCurrentPosition(function (position) {

                    var lattitude = position.coords.latitude;
                    var longitude = position.coords.longitude;

                    $.getJSON("http://api.wunderground.com/api/8e2d1db7242415ea/geolookup/q/" +
                        lattitude + "," + longitude + ".json", function () { })
                        .done(function (data) {
                            query = data.location.zip;
                            getWeather(query);
                            updateModel(index, query);

                          
                        });
                });
            }
            else {
                $('#location').text("Geolocation Is Disabled In Your Browser!");
                $('#temp_f').text("Please seach by city or zipcode.")
            }

            /* Auto complete location query */
            $('#query_input').keypress(function (e) {

                query = $("#query_input").val();

                if (query.length > 3) {

                    $.getJSON("http://autocomplete.wunderground.com/aq?query=" + query + "&cb=?", function () { })
                        .done(function (data) {

                            var resultCount = data.RESULTS.length

                            $("#location_list").empty();

                            for (i = 0; i <= resultCount; i++) {

                                if (i > 3)
                                    break;

                                var locationName = data.RESULTS[i].name;

                                $("#location_list").append("<option>" + locationName + "</option>");

                            }

                            $("#query_input").on("input", function () {

                                var selection = $(this).val();

                                for (i = 0; i < resultCount; i++) {

                                    if (selection === data.RESULTS[i].name) {
                                        query = data.RESULTS[i].zmw;
                                        getWeather(data.RESULTS[i].zmw);
                                        updateModel(index, data.removeClass[i].zmw);

                                    }


                                }
                            })
                        });
                }
            });

            $(document).on("click", "li.cell", function () {
                var index = $("li.cell").index(this)
                console.log(index);
                console.log(query);
                getWeather(query);
                updateModel(index, query);
               

            });

        });


});


function updateModel(index, zipcode) {
    // Conditions
    $.get("http://api.wunderground.com/api/8e2d1db7242415ea/forecast10day/q/" +
        zipcode + ".json", function () { })
        .done(function (data) {

            var day;
            day = data.forecast.simpleforecast.forecastday[index].date.weekday + " ";
            day += data.forecast.simpleforecast.forecastday[index].date.monthname + " ";
            day += data.forecast.simpleforecast.forecastday[index].date.day;
            $('.modal-title').text(day).css("font-weight", "bold");

            var forcastText = data.forecast.txt_forecast.forecastday[index].fcttext
            $('.modal-body').text(forcastText);


            var high = data.forecast.simpleforecast.forecastday[index].high.fahrenheit;
            $("#high").text("");
            $("<b>High: <b>").appendTo('#high');
            $('#high').append(high);

            
            var wind = data.forecast.simpleforecast.forecastday[index].maxwind.mph + " mph, ";
            wind += data.forecast.simpleforecast.forecastday[index].maxwind.dir;
            $('#wind').text("");
            $('<b>Wind: <b>').appendTo('#wind');    
            $("#wind").append(wind);

            var low = "Low:  " + data.forecast.simpleforecast.forecastday[index].low.fahrenheit;
            $('#low').text('');
            $('<b>Low: <b>').appendTo('#low');
            $('#low').append(low);

            var humidity = "Humidity: " +  data.forecast.simpleforecast.forecastday[index].avehumidity;
            $('#humidity').text('');
            $('<b>Humidity: <b>').appendTo('#humidity');
            $('#humidity').append(humidity);

           

        });

}

function getWeather(zipcode) {

    // Conditions
    $.get("http://api.wunderground.com/api/8e2d1db7242415ea/conditions/q/" +
        zipcode + ".json", function () { })
        .done(function (data) {

            console.log(data);

            $("#location").text(
                data.current_observation.display_location.city + ", " +
                data.current_observation.display_location.state);

            $("#temp_f").text("Temperature: " + data.current_observation.temperature_string);

            $("#temp_feel").text("Feels Like: " + data.current_observation.feelslike_string);

            $("#forcast_img").attr("src", data.current_observation.icon_url);

            $("#forcast_text").text(data.current_observation.icon);
        });


    // Ten Day Forcast
    $.get("http://api.wunderground.com/api/8e2d1db7242415ea/forecast10day/q/" +
        zipcode + ".json", function () { })
        .done(function (data) {

            console.log(data);

            $('#todays-forcast').text(data.forecast.txt_forecast.forecastday["0"].fcttext);

            $("#ten_day_forecast").empty();

            for (i = 0; i < 10; i++) {
                $("#ten_day_forecast").append("<li type='button' class='cell btn btn- info btn- lg' data-toggle='modal' data-target='#forcastModal'></li>");


                $("#ten_day_forecast li")
                    .last()
                    .append("<p class='text-center'>" +
                    data.forecast.simpleforecast.forecastday[i].date.weekday + "</p>")
                    .append("<p>" +
                    data.forecast.simpleforecast.forecastday[i].date.monthname + ", " +
                    data.forecast.simpleforecast.forecastday[i].date.day)
                    .append('<img src="' + data.forecast.simpleforecast.forecastday[i].icon_url + '" />')
            }
        });


    // Highlight Forcast Cell on Hover
    $(document).on("mouseenter", "li.cell", function () {
        $(this).addClass("cell_focus")
    });

    $(document).on("mouseleave", "li.cell", function () {
        $(this).removeClass("cell_focus");
    });


    


}





