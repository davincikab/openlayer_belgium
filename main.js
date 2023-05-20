const map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        })
    ],
    target: 'map',
    view: new ol.View({
        // projection:'EPSG:4326',
        center: [13.279463511028327, 52.434598827614145],
        zoom: 14,
    }),
});




