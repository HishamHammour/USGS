// store API endpoint inside variable queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// do GET request to queryURL
d3.json(queryUrl, function(data) {
  // send data.features object from GeoJSON to createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // define onEachFeature function 
  // give each feature a Popup describing the place, time & magnitude of each earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Location: " + feature.properties.place +
      "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // create a GeoJSON layer containing the features array on the earthquakeData object
  // run function onEachFeature for each item in the array
  const earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      const geojsonMarkerOptions = {
        radius: 5 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        weight: 0.2,
        fillOpacity: 0.85
      };
      return L.circleMarker(latlng, geojsonMarkerOptions)
    }
  });

  // sent the earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Create a getColor function for fillColor and legend
function getColor(color) {
  return color <= 1 ? '#25E500' :
    color <= 2 ? '#6FDD00' :
    color <= 3 ? '#B4D500' :
    color <= 4 ? '#CEA800' :
    color <= 5 ? '#C65E00' :
    '#BF1900' ;
}

function createMap(earthquakes) {

  // define layers for streetmap and darkmap
  const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  const lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // define a object for baseMaps to hold base layers
  const baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Street Map": streetmap
  };

  // create overlay object to hold overlay layer
  const overlayMaps = {
    Earthquakes: earthquakes
  };

  // create the map and give it the streetmap and earthquakes layers on pageload
  const myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // add layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // add legend
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend'),
      levels = [0, 1, 2, 3, 4, 5],
      labels = [];
  
      // loop through magnitude ranges to generate legend values
      for (const i = 0; i < levels.length; i++) {
          div.innerHTML +=
          labels.push(
            '<i style="background:' + getColor(levels[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp&nbsp</i> ' + 
            levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+'));
    }
    div.innerHTML = '<h2>Magnitudes</h2><br>' + labels.join('<br>');

    return div;

  };

  // add legend to the map
  legend.addTo(myMap);
}