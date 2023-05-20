const fillStyle = () => {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3,
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
    });    
}

const getFillColor = (value) => {
    let colors = [
        '#5ac8c8', '#ace4e4', '#e8e8e8', '#5698b9', 
        '#a5add3', '#dfb0d6', '#3b4994', '#8c62aa', '#be64ac'
    ];

    let values = [10, 11, 12, 13, 21,22,23, 31, 32, 33];
    let index = values.findIndex(val => val == value);
    

    return colors[index] || '#eeeeee';;
}


const vectorSource = new ol.source.Vector({
    url: '/Steglitz-Zehlendorf.geojson',
    format: new ol.format.GeoJSON() 
});
  
// vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));
const style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'red',
    }),
    stroke:new ol.style.Stroke({
        color:'#7a7a7a',
        width:0.5
    })
});

const vectorLayer = new ol.layer.Vector({
    background: '#1a2b39',
    source: vectorSource,
    style:function(feature) {
        const color = getFillColor(feature.get('G_BIV'));

        style.getFill().setColor(color);

        return style;
    }
});


// wms layers
const wmsLayer1 = new ol.layer.Image({  
    // <BoundingBox CRS="EPSG:3857" minx="1241520.543270163" miny="6668039.871372213" maxx="1670801.9004737705" maxy="7096647.46982627"/>  
    extent: [1241520.543270163, 6668039.871372213, 1670801.9004737705, 7096647.46982627],
    source: new ol.source.ImageWMS({
      url: 'https://isk.geobasis-bb.de/mapproxy/dop20c/service/wms?',
      params: {'LAYERS': 'bebb_dop20c'}
    }),
});

const wmsLayer2 = new ol.layer.Image({
    // <BoundingBox CRS="EPSG:3857" minx="1241520.543270163" miny="6668039.871535957" maxx="1670801.9004737705" maxy="7096647.469995237"/>
    extent: [1241520.543270163, 6668039.871535957, 1670801.9004737705, 7096647.469995237],
    source: new ol.source.ImageWMS({
      url: 'https://isk.geobasis-bb.de/mapproxy/webatlasde/service/wms?',
      params: {'LAYERS': 'WebAtlasDE_BEBB_halbton'},
      ratio: 1,
    }),
});

const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
});

let activeLayer = osmLayer;
let baseLayers = {
    'OSM':osmLayer,
    'WMS Layer 1':wmsLayer2,
    'Bodenauflösung Farbe':wmsLayer1
};

const map = new ol.Map({
    layers: [
        osmLayer,   
        vectorLayer   
    ],
    target: 'map',
    view: new ol.View({
        center:[1478021.6154847643, 6879129.629667632],
        zoom: 12,
    }),
});

// Mini Maps
const mapOne = new ol.Map({
    layers: [
        osmLayer 
    ],
    target: 'map1',
    view: new ol.View({
        center:[1477373.0257923533, 6877526.17154204],
        zoom: 12.5,
    }),
    controls: ol.control.defaults({
        zoom:false,
        attribution:false
    }),
    interactions:ol.interaction.defaults({
        doubleClickZoom:false,
        dragPan:false,
        pinchZoom:false,
        pinchRotate:false
    })
});

const mapTwo = new ol.Map({
    layers: [
        wmsLayer1
    ],
    target: 'map2',
    view: new ol.View({
        center:[1477373.0257923533, 6877526.17154204],
        zoom: 12.5,
    }),
    controls: ol.control.defaults({
        zoom:false,
        attribution:false
    }),
    interactions:ol.interaction.defaults({
        doubleClickZoom:false,
        dragPan:false,
        pinchZoom:false,
        pinchRotate:false
    })
});

const mapThree = new ol.Map({
    layers: [
        wmsLayer2
    ],
    target: 'map3',
    view: new ol.View({
        center:[1477373.0257923533, 6877526.17154204],
        zoom: 12.5,
    }),
    controls: ol.control.defaults({
        zoom:false,
        attribution:false
    }),
    interactions:ol.interaction.defaults({
        doubleClickZoom:false,
        dragPan:false,
        pinchZoom:false,
        pinchRotate:false
    })
});

mapOne.updateSize();
mapTwo.updateSize();
mapThree.updateSize();
// popup
/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new ol.Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

map.addOverlay(overlay);

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

// map events
let highlight;
const displayFeatureInfo = function (event) {
    let { pixel, coordinate } = event;

    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

    console.log(feature.N);
    let properties = feature.N;
    let keys = ['EW_21', 'EW_HA_21', 'QM_EW', 'A_1', 'VG_21', 'B_2', 'L_1', 'L_1N', 'G_BIV'];

    let contentInfo = keys.map(key => {
        return `<div class="popup-item">
            <div class="header">${key}</div>
            <div>${properties[key]}</div>
        </div>`;
    });

    content.innerHTML = `<div class="popup-content">
        ${contentInfo.join("")}
    </div>`;
    overlay.setPosition(coordinate);
}

map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }

    // update the popup
    // const pixel = map.getEventPixel(evt.originalEvent);
    // coordinates
    const coordinate = evt.coordinate;
    const lonLat = ol.proj.toLonLat(coordinate);

    document.querySelector('.coordinate-control').innerHTML = lonLat.map(val => val.toFixed(4)).join(", ");
});
  
map.on('singleclick', function (evt) {
    displayFeatureInfo(evt);
});
  


// toggle map size
document.getElementById("toggle-dashboard").onclick = (e) => {
    document.querySelector('.map-container').classList.toggle('open');

    map.updateSize();
    
}

// toggle basemaps
let basemapTogglers = document.querySelectorAll(".basemap-toggler");
let activeToggler = document.querySelector(".basemap-toggler.active");

basemapTogglers.forEach(toggler => {
    toggler.onclick = (e) => {

        activeToggler.classList.remove('active');
        let { dataset: { value }} = e.target;
        toggleBasemap(value);

        e.target.classList.add('active');
        activeToggler = e.target;
    }

});


function toggleBasemap(value) {
    let newLayer;

    Object.keys(baseLayers).forEach(key => {
        if(key == value) {
            newLayer = baseLayers[key];
        } 
    });

    console.log(activeLayer);

    map.getLayers().insertAt(0, newLayer);
    map.removeLayer(activeLayer);



    activeLayer = newLayer;
}


// toggle different tabs
const tabs = document.querySelectorAll(".tabs");
tabs.forEach(tabEl => {

    tabEl.addEventListener('shown.bs.tab', event => {
        event.target // newly activated tab
        event.relatedTarget // previous active tab

        console.log("Tab toggled");
    });

});