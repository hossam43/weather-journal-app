//Esri Libraries
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapGallery",
  "esri/Graphic",
], (Map, MapView, BasemapGallery, Graphic) => {
  /* Global Variables */
  // Create a new date instance dynamically with JS
  let d = new Date();
  const newDate = d.getMonth() + 1 + "." + d.getDate() + "." + d.getFullYear();
  const myApiKey = "0220d5d668111700ed629b8c4d5623ff&units=metric";
  const countryCode = "us";
  //TODO a Url using user input >> api.openweathermap.org/data/2.5/weather?zip=94111,us&appid=0220d5d668111700ed629b8c4d5623ff&units=metric"
  //generate weather data on click
  const generateData = document.getElementById("generate");
  generateData.addEventListener("click", async () => {
    const zipCode = document.getElementById("zip").value; //user add a zip code - click the button - zipCode reads whatever value the user had input
    const feelingsCode = document.getElementById("feelings").value;
    const fullUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${myApiKey}`;
    // console.log("User's fullUrl (zip + country + myKey) >>>", fullUrl);
    try {
      // get lat and long in an array
      var latLogArray = await getLongAndLat(fullUrl); //var to be accesable in the myMapView
      //if this value == undefined  will not run
      latLogArray !== undefined
        ? await latLogArray
        : console.log("You have entered invalid zip code");
      // removeGraphic(myPointGraphic); //to remove existent graphic if there is any
      // myMapView.graphics.remove(myPointGraphic);
      myMapView.graphics.removeAll();
      goToLatandLong(latLogArray);
      await addGraphic(latLogArray, latLogArray); //to add a new graphic corresponding to user's input

      let temprture = await getUserInput(fullUrl);
      let dataObject = {
        date: newDate,
        feelings: feelingsCode,
        temp: temprture,
      };

      await postWeatherData("/addweather", dataObject);
      upDateUI();
    } catch (error) {
      console.log(error, "ERROR");
    }
  });

  const getUserInput = async (url) => {
    try {
      const fullResponse = await fetch(url);
      //Full fetch Response in JSON format
      const fullResponseJSON = await fullResponse.json();
      const getMainTemp = await fullResponseJSON.main.temp;
      // console.log(`${getMainTemp} it works`);
      return getMainTemp;
    } catch (error) {
      console.log(error, "it doesn't work");
    }
  };

  //this function return the lat and long in an array
  const getLongAndLat = async (url) => {
    try {
      const fullResponseJSON = await (await fetch(url)).json();
      const lat = fullResponseJSON.coord.lat;
      const long = fullResponseJSON.coord.lon;
      const coordArray = [long, lat];
      return coordArray;
    } catch (error) {
      console.log(error, "ERROR");
    }
  };

  //this is the function that will post the data to the server in /addweather route
  const postWeatherData = async (url = "", postData = {}) => {
    const secondResponse = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      //Conver the json object (dataObject) to be in a string format
      body: JSON.stringify(postData),
    });
  };
  //this function goes to the returened lat and long
  const goToLatandLong = async (usercoord) => {
    myMapView.goTo(
      {
        center: usercoord,
        zoom: 10,
      },
      { duration: 3000 }
    );
    return usercoord;
  };

  const upDateUI = async () => {
    const data = await (await fetch("http://localhost:5000/getweather")).json();
    try {
      const tempo = (document.getElementById(
        "temp"
      ).innerHTML = `Temprture: ${data.temp} &degC`);
      document.getElementById("date").innerHTML = `Date: ${data.date}`;
      document.getElementById(
        "content"
      ).innerHTML = `Feelings: ${data.feelings}`;
    } catch (error) {
      console.log("couldn't update user UI", error);
    }
  };

  //defult display
  const myMap = new Map({
    basemap: "osm",
  });
  const myMapView = new MapView({
    map: myMap,
    container: "myDiv",
    zoom: 5,
    center: [-98.5795, 39.8283], //myMapView.center = somevalue
  });

  var myPoint = {
    type: "point", // autocasts as new Point()
    longitude: -98.5795,
    latitude: 39.8283,
  };

  // Create a symbol for drawing the point
  var markerSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
  };

  // Create a graphic and add the geometry and symbol to it
  var myPointGraphic = new Graphic({
    geometry: myPoint,
    symbol: markerSymbol,
  });

  myMapView.graphics.add(myPointGraphic);

  //add new Graphics
  let addGraphic = async (graphicLong, graphicLat) => {
    var myPoint = {
      type: "point", // autocasts as new Point()
      longitude: 0,
      latitude: 0,
    };
    myPoint.longitude = graphicLong[0];
    myPoint.latitude = graphicLat[1];

    // Create a symbol for drawing the point
    var markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [226, 119, 40],
    };

    // Create a graphic and add the geometry and symbol to it
    var myPointGraphic = new Graphic({
      geometry: myPoint,
      symbol: markerSymbol,
    });

    myMapView.graphics.add(myPointGraphic);
    // console.log("GRAPHIC HAS BEEN ADED 🟢");
  };

  //my wiedgte adding a basemab with a botton
  const myGallery = new BasemapGallery({
    view: myMapView,
  });
  myMapView.ui.add(myGallery, "bottom-right");

  let btnBaseMape = document.getElementById("toggler");
  let flag = true;
  btnBaseMape.addEventListener("click", () => {
    if (flag == true) {
      myMapView.ui.remove(myGallery);
      btnBaseMape.innerHTML = "Show Map Gallery";
      flag = false;
    } else {
      myMapView.ui.add(myGallery, "bottom-right");
      btnBaseMape.innerHTML = "Hide Map Gallery";
      flag = true;
    }
  });
});
