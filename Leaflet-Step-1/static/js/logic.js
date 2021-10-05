'use strict';
const queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const depthColor = ['#B6F34C', '#E1F34F', '#F3DC4C', '#F3BA4C', '#EFA76A', '#ED6A6A'];

d3.json(queryUrl).then(function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup('<h3>' + feature.properties.place +
            '</h3><hr><p>' + 'Time: ' + new Date(feature.properties.time) +
            '</p><p>' + 'Magnitude: ' + (feature.properties.mag));
  }


  function markerColor(alt) {
    let idx = 0;
    if (alt< -10) {
      console.log('black');
      return '#000000';
    } else if (alt <=10) {
      idx = 0;
    } else if (alt<=30) {
      idx = 1;
    } else if (alt<=50) {
      idx = 2;
    } else if (alt <=70) {
      idx = 3;
    } else if (alt <=90) {
      idx = 4;
    } else if (alt > 90) {
      idx = 5;
    }
    return depthColor[idx];
  }

  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: earthquakeData.properties.mag * 10000,
        color: markerColor(latlng.alt),
      });
    },
    onEachFeature: onEachFeature,
  });
  createMap(earthquakes);
}

function createMap(earthquakes) {
  const lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href=\'https://www.mapbox.com/about/maps/\'>Mapbox</a> © <a href=\'http://www.openstreetmap.org/copyright\'>OpenStreetMap</a> <strong><a href=\'https://www.mapbox.com/map-feedback/\' target=\'_blank\'>Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/light-v10',
    accessToken: API_KEY,
  });
  const darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'dark-v10',
    accessToken: API_KEY,
  });
  const newLayer = new L.LayerGroup();
  const baseMaps = {
    'Light Map': lightmap,
    'Dark Map': darkmap,
  };

  const overlayMaps = {
    Earthquakes: earthquakes,
  };
  const myMap = L.map('map', {
    center: [
      37.09, -95.71,
    ],
    zoom: 5,
    layers: [lightmap, earthquakes, newLayer],
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);

  /* Legend specific*/
  const legend = L.control({position: 'bottomright'});

  legend.onAdd = function(myMap) {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML += `
    <i style="background: ${depthColor[0]}"></i><span>-10~10</span><br>
    <i style="background: ${depthColor[1]}"></i><span>10~30</span><br>
    <i style="background: ${depthColor[2]}"></i><span>30~50</span><br>
    <i style="background: ${depthColor[3]}"></i><span>50~70</span><br>
    <i style="background: ${depthColor[4]}"></i><span>70~90</span><br>
    <i style="background: ${depthColor[5]}"></i><span>90+</span><br>`;

    return div;
  };

  legend.addTo(myMap);
};
