const map = L.map('map')
let userPOI
let bufferLayer
let currentCoordinate = []
const userBuffer = $('.bufferValue')

let appIcon = L.Icon.extend({
  options: {
    iconSize: [39.5, 50],
    iconAnchor: [20, 50],
    // popupAnchor: [-3, -76]
  }
});

let homeIcon = new appIcon({ iconUrl: './asset/revised/homeIcon.png' })
let laundryIcon = new appIcon({ iconUrl: './asset/revised/laundryIcon.png' })
let restaurantIcon = new appIcon({ iconUrl: './asset/revised/restaurantIcon.png' })
let schoolIcon = new appIcon({ iconUrl: './asset/revised/schoolIcon.png' })
let dormitoryIcon = new appIcon({ iconUrl: './asset/revised/dormitoryIcon.png' })
// console.log(userBuffer, 'hehe');

// var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//   // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//   maxZoom: 25
// }).addTo(map);

const osmWithoutLabels = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 24,
  subdomains: ['a', 'b', 'c'], // Subdomains for better load balancing
}).addTo(map);

// const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
//   maxZoom: 20,
//   subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
// }).addTo(map)

const viewYogyakarta = [-7.75620196161177, 110.37538620922425]
let jatinangor = [-7.757427, 110.3773647]
map.setView(jatinangor, 16)

// L.geoJSON(jatinangor, { icon: homeIcon }).addTo(map)
// L.marker(jatinangor).addTo(map)

let coba = turf.point([110.37538620922425, -7.75620196161177])
L.geoJSON(coba, { icon: homeIcon }).addTo(map)
// ----------------------------------------------------------------------

const getData = async () => {
  const response = await fetch('http://localhost:3000/api/Skripsi/getData', {
    method: 'GET',
  })
  const data = await response.json()
  // console.log(data, 'hihu');
  return data
}
let data = await getData()
let arrayData = []
let spatialData

data.forEach(feature => {
  const {geometry, properties} = feature.datadummy

  arrayData.push(turf.point(geometry["coordinates"], properties))
  // arrayData.push(feature.datadummy)
  // console.log(feature.datadummy.geometry["coordinates"]);
  // console.log(turfCoba, 'turfCoba');
  // L.geoJSON(arrayData).addTo(map)
  // console.log(feature.datadummy.properties["type"]);
  // L.marker((feature.datadummy.geometry["coordinates"].reverse()), {icon: dormitoryIcon}).addTo(map)

  // if (feature.datadummy.properties["type"] === 'Dormitory') {
  //   let dorm = L.marker((feature.datadummy.geometry["coordinates"].reverse()), {icon: dormitoryIcon}).addTo(map)
  //   // console.log(dorm);
  // }
  // else if (feature.datadummy.properties["type"] === 'Restaurant') {
  //   L.marker((feature.datadummy.geometry["coordinates"].reverse()), {icon: restaurantIcon}).addTo(map)
  // }
  // else {
  //   L.marker((feature.datadummy.geometry["coordinates"].reverse()), {icon: laundryIcon}).addTo(map)
  // }

})
spatialData = turf.featureCollection(arrayData)
console.log(spatialData, 'spatialData');
// L.marker((spatialData.features.geometry, {icon: homeIcon})).addTo(map)

// let firstRoute = L.Routing.control({
//   waypoints: [
//     spatialData.features[0].geometry["coordinates"].reverse(),
//     spatialData.features[1].geometry["coordinates"].reverse(),
//   ],
//   routeWhileDragging: true,
// })

// firstRoute.addTo(map)
// L.geoJSON(spatialData).addTo(map)
// -------------------------------------------------------

let vari1 = L.latLng([-7.759548986, 110.3856352])
let vari = L.latLng([-7.659548986, 110.3856352])
let vari2 = L.latLng([-7.557280148, 110.3823574])

const routingControl = L.Routing.control({
  waypoints: [vari1, vari2],
  routeWhileDragging: true,
})
.addTo(map);
const routingControl2 = L.Routing.control({
  waypoints: [vari1, vari],
  routeWhileDragging: true,
})
// .addTo(map);

// routingControl.setWaypoints([vari1, vari2]);

$('.togglePOI').change((e) => {
  let mapContainer = map.getContainer()
  mapContainer.style.cursor = e.target.checked ? "pointer" : "auto"

  if (e.target.checked) {
    map.on('click', (event) => {
      if (userPOI) {
        map.removeLayer(userPOI)
      }
      userPOI = L.marker(event.latlng, { icon: homeIcon }).addTo(map)
      currentCoordinate = [event.latlng.lng, event.latlng.lat]

      updateBuffer()
    })
  }
  else {
    map.off('click')

    if (userPOI) {
      map.removeLayer(userPOI)
    }
    if (bufferLayer) {
      map.removeLayer(bufferLayer)
    }
  }
})

let buffer
let selectedFeaturesLayer

let updateBuffer = () => {
  if (userBuffer.val() !== "") {
    if (userPOI) {
      const bufferDistance = parseFloat(userBuffer.val())

      if (!isNaN(bufferDistance)) {
        buffer = turf.buffer(turf.point(currentCoordinate), bufferDistance, { units: 'meters' })

        if (bufferLayer) {
          map.removeLayer(bufferLayer)
        }
        bufferLayer = L.geoJSON(buffer).addTo(map)

        const selectedFeatures = []
        const spatialDataCopy = JSON.parse(JSON.stringify(spatialData));

        spatialDataCopy["features"].forEach(feature => {
          if (turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates), buffer)) {
            selectedFeatures.push(feature);
          }
        });

        // console.log(selectedFeatures[0].geometry["coordinates"]);
        // routingControl.spliceWaypoints(routingControl.getWaypoints().length, 0, (L.latLng(selectedFeatures[1].geometry.coordinates.reverse()), L.latLng(selectedFeatures[0].geometry.coordinates.reverse())))
        // spatialData["features"].forEach(feature => {
        //   if (turf.booleanIntersects(buffer, feature) === true) {
        //     console.log(feature, 'feature');
        //     selectedFeatures.push(feature)
        //   }
        // })

        if (selectedFeaturesLayer) {
          map.removeLayer(selectedFeaturesLayer)
        }

        // routingControl.setWaypoints([selectedFeatures[1].geometry["coordinates"].reverse(), selectedFeatures[0].geometry["coordinates"].reverse()])

        let marker
        selectedFeaturesLayer = L.geoJSON(selectedFeatures, {
          pointToLayer: (feature, latlng) => {

            if (feature.properties["type"] === 'Dormitory') {
              marker = L.marker(feature.geometry["coordinates"].reverse(), { icon: dormitoryIcon })
            }
            else if (feature.properties["type"] === 'Restaurant') {
              marker = L.marker(feature.geometry["coordinates"].reverse(), { icon: restaurantIcon })
            }
            else {
              marker = L.marker(feature.geometry["coordinates"].reverse(), { icon: laundryIcon })
            }
            return marker
          },
          onEachFeature: (feature, layer) => {
            console.log(feature);
            // layer.bindPopup(`${feature.properties["name"]}`)
            layer.bindPopup(`${feature.properties.name}`)

          },
        }).addTo(map)
        // routingControl.setWaypoints([selectedFeatures[1].geometry["coordinates"].reverse(), selectedFeatures[0].geometry["coordinates"].reverse()])
        // console.log(selectedFeaturesLayer);

        // console.log(selectedFeaturesLayer);
      }
      else {
        alert('Invalid Buffer Distace')
      }
    }
  }
}

$(userBuffer).change(updateBuffer)




// let spatial = turf.flatten(spatialData)
// console.log(spatial, 'special');
// L.geoJSON(spatialData.features[0]).addTo(map)
// console.log(spatialData.features, 'spatial');

// L.geoJSON(spatialData).addTo(map)




// turf.featureEach(spatialData, (currentFeature, featureIndex) => {
// console.log(currentFeature, 'currentFeature');
// console.log(featureIndex, 'featureIndex');
// })
// console.log(data, 'data');

// console.log(data[0].datadummy.geometry["coordinates"], 'coordinates');

// let layerGroup = L.featureGroup()
// console.log(layerGroup, 'layerGroup');

// data.forEach(feature => {
//   let featureLayer = L.geoJSON(feature.datadummy)
//   // console.log(featureLayer,' huhu');
//   layerGroup.addLayer(featureLayer)
// })
// layerGroup.addTo(map)
// console.log(layerGroup, 'after');

// if ()

// ----------------------------------------------
$('.navMenu').click(() => {
  const toggleButton = $('.expandToggle');
  toggleButton.toggleClass('closeToggle');

  const navMenu = $('.navMenu-content');

  if (navMenu.css('display') === "none") {
    navMenu.css({
      'display': 'flex',
      'flex-direction': 'column',
    });
  } else {
    navMenu.css('display', 'none');
  }
});

$('.toggleMarker').click(() => {
  $('.toggleMarker').toggleClass('checked')
})

