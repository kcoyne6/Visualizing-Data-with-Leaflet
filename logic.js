// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // console.log(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Define function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#adff2f" 
    }
    else if (magnitude < 2) {
      return "#ffff4d"
    }
    else if (magnitude < 3) {
      return "#ffbb33"
    }
    else if (magnitude < 4) {
      return "#ff8833"
    }
    else if (magnitude < 5) {
      return "#ff531a"
    }
    else {
      return "#ff3333"
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define grayscalemap layers
  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create our map, giving it the grayscalemap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [earthquakes, grayscalemap]
  });


  // color function for the legend
  function getColor(d) {
    return d > 5 ? '#ff3333' :
           d > 4  ? '#ff531a' :
           d > 3  ? '#ff8833' :
           d > 2  ? '#ffbb33' :
           d > 1  ? '#ffff4d' :
                    '#adff2f';
  }

  // Add legend to the map
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        limits = [0, 1, 2, 3, 4, 5],
        labels = [];
  
      // Loop through limits, using getColor function to add colors
      for (var i = 0; i < limits.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(limits[i] + 1) + '"></i> ' +
              limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
      }
      return div;
  };
  
  // Add legend to map
  legend.addTo(myMap);
}
