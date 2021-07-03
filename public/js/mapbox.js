/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicHJpbmNlMTciLCJhIjoiY2txOTBoNHlxMDRtbTJ2bnl6YTVuMGhzbiJ9.OyRx4WyPRpiiw7XySALV5Q';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/prince17/ckq99vd3702ai17k0pyzb0ww6',
    //   scrollZoom: false,
    //   center: [-80.185942, 25.774772],
    //   zoom: 6,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Creating marker
    const ele = document.createElement('div');
    ele.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: ele,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
