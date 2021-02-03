var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

var plateurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

d3.json(url, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function getColor(range) {
    return range >= 6.0 ? '#ffffcc' :
        range > 5.4 ? '#c2e699' :
            range > 2.5 ? '#78c679' :
                range > 0 ? '#31a354' :
                    'white';
}

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function bananas(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.title +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function geojsonMarkerOptions(feature) {
        return {
            radius: feature.properties.mag * 2,
            color: getColor(feature.properties.mag),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

    function circles(feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: circles,
        onEachFeature: bananas,
        style: geojsonMarkerOptions
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Add a new layer group
    var platesLayer = new L.LayerGroup();

    d3.json(plateurl, function (data) {
        var tectonicplates = L.geoJSON(data, {
            style: {
                fillOpacity: 0
            }
        });
        tectonicplates.addTo(platesLayer)
    });

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": platesLayer,
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
            37.09, -95.71
        ],
        zoom: 4,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 2.5, 5.4, 6.0],
            labels = [];

        div.innerHTML = '<p> Magnitude Ranges </p>'
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    // function makePlates() {
    //     d3.json(plateurl, function (data) {
    //         // Once we get a response, send the data.features object to the createFeatures function
    //         var tectonicplates = L.geoJSON(data);

    //         return tectonicplates
    //     });
    //     return tectonicplates
    // };
}