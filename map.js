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

const outlineStyle = () => {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'orange',
          width: 4,
        })
    }); 
}

const getFillColor = (value) => {
    let colors = [
        '#5ac8c8', '#ace4e4', '#e8e8e8', '#5698b9', 
        '#a5add3', '#dfb0d6', '#3b4994', '#8c62aa', '#be64ac'
    ];

    let values = [10, 11, 12, 13, 21,22,23, 31, 32, 33];
    let index = values.findIndex(val => val == value);
    

    return colors[index] || '#eeeeee';
}

const getFillColorGraduated = (value) => {
    let colors = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#08589e'];
    let valuesRange = [0, 1], step = 0.125;
    let values = [];

    for(let i=0; i<=1; i+=0.125) {
        values.push(i);
    };

    let index = values.findIndex(val => val == value);
    return colors[index] || '#eeeeee';
}


const vectorSource = new ol.source.Vector({
    url: './Steglitz-Zehlendorf.geojson',
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

// let url ='https://isk.geobasis-bb.de/ows/vg_wfs?version=1.1.0&request=GetFeature&typenames=app:bz&outputFormat=application/json&srsname=EPSG:25833&bbox='

// outputFormat=application%2Fgml%2Bxml%3B%20version%3D3.2
const bezirkeSource =  new ol.source.Vector({
    format: new ol.format.GML3(),
    url: function (extent) {
      return (
        'https://isk.geobasis-bb.de/ows/vg_wfs?'+
        'service=WFS&version=1.1.0&request=GetFeature&typename=app:bz&' +
        '&srsname=EPSG:3857&' +
        'bbox=' +
            extent.join(',') +
        ',EPSG:3857'
      );
    },
    strategy: ol.loadingstrategy.bbox,
});

const kreisgrenzenSource =  new ol.source.Vector({
    format: new ol.format.GML3(),
    url: function (extent) {
      return (
        'https://isk.geobasis-bb.de/ows/vg_wfs?'+
        'service=WFS&version=1.1.0&request=GetFeature&typename=app:ks&' +
        '&srsname=EPSG:3857&' +
        'bbox=' +
            extent.join(',') +
        ',EPSG:3857'
      );
    },
    strategy: ol.loadingstrategy.bbox,
});

const bezirkeLayer = new ol.layer.Vector({
    source: bezirkeSource,
    style: outlineStyle()
});

const kreisgrenzenLayer = new ol.layer.Vector({
    source: kreisgrenzenSource,
    style: outlineStyle()
});

// wms layers
const digitalImagery = new ol.layer.Image({  
    // <BoundingBox CRS="EPSG:3857" minx="1241520.543270163" miny="6668039.871372213" maxx="1670801.9004737705" maxy="7096647.46982627"/>  
    extent: [1241520.543270163, 6668039.871372213, 1670801.9004737705, 7096647.46982627],
    source: new ol.source.ImageWMS({
      url: 'https://isk.geobasis-bb.de/mapproxy/dop20c/service/wms?',
      params: {'LAYERS': 'bebb_dop20c'}
    }),
});

digitalImagery.name = "Digital";
const atlasMap = new ol.layer.Image({
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
    'Atlas Map':atlasMap,
    'Digital Orthophoto':digitalImagery
};

// scale control
let control;

function scaleControl() {
    control = new ol.control.ScaleLine({
        units: 'metric',
    });

    return control;
}

// map control
const map = new ol.Map({
    layers: [
        osmLayer,   
        bezirkeLayer,
        kreisgrenzenLayer,
        vectorLayer
    ],
    target: 'map',
    controls: ol.control.defaults({
        attribution:false,
        zoom:true,
        rotate:true
    }).extend([scaleControl()]),
    interactions:ol.interaction.defaults().extend([
        new ol.interaction.DragRotateAndZoom()
    ]),
    view: new ol.View({
        center:[1478021.6154847643, 6879129.629667632],
        zoom: 12,
        rotation:0.1
    }),
});


// remove ol-hidden
map.on('loadstart', function(e) {
    console.log("Load Start");

    document.querySelector("#map .ol-rotate").classList.remove("ol-hidden");
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
        atlasMap
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
        digitalImagery
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

    if(!feature) {
        return;
    }

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


// toggle WFS layers
let wfsLayers = {
    'bezirke':bezirkeLayer,
    'kreisgrenzen':kreisgrenzenLayer
};

const wfsTogglers = document.querySelectorAll('.wfs-toggler');
wfsTogglers.forEach(toggler => {

    toggler.onclick = (e) => {
        let { id, checked } = e.target;
        toggleWFSLayer(id, checked)
    }
});

function toggleWFSLayer(id, checked) {
    let layer = wfsLayers[id];

    if(checked) {
        map.getLayers().insertAt(1, layer);
    } else {
        map.removeLayer(layer);
    }
}

// fullscreen control
document.getElementById("fullscreen-btn").onclick = (e) => {
    e.stopPropagation();

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

// zoom to extent
document.getElementById("zoom-to-extent").onclick = (e) => {
    e.stopPropagation();

    map.setView(new ol.View({
        center:[1478021.6154847643, 6879129.629667632],
        zoom: 12,
    }))

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


// legend creation
function createCategoryLegend(field='G_BIV') {
    let values = vectorLayer.getSource().getFeatures().map(ft => ft.N[field]);
    values = [...new Set(values)].sort();

    console.log(values);

    let labels = [
        'First Low, Second Low',
        'First Low, Second Med',
        'First Low, Second high',
        'First Med, Second low',
        'First Med, Second Med',
        'First Med, Second High',
        'First High, Second low',
        'First High, Second Med',
        'First High, Second high',
    ];

    console.log(values)

    let items = values.map((val,i) => {
        let color = getFillColor(val);
        let label = labels[i];

        return `<div class="legend-item">
            <div class="legend-card" style="background:${color}"></div>
            <div class="legend-card-label">${label}</div>
        </div>`;

    });

    document.getElementById("legend-title").innerHTML = `Bivariate Styling: ${field}`;
    document.getElementById('legend-container').innerHTML = items.join("");
}

function createGraduatedLegend(field='G_UNIV') {
    let values = [];

    for(let i=0; i<=1; i+=0.125) {
        values.push(i);
    };

    // return;
    let items = values.slice(0, -1).map((val,i) => {
        let color = getFillColorGraduated(val);
        let label = i !== values.length ? `${val} - ${values[i+1]}` : `> ${val}`;

        return `<div class="legend-item">
            <div class="legend-card" style="background:${color}"></div>
            <div class="legend-card-label">${label}</div>
        </div>`;

    });

    document.getElementById("legend-title").innerHTML = `Univariate Styling: ${field}`;
    document.getElementById('legend-container').innerHTML = items.join("");
}

map.on('postrender', (e) => {
    console.log("Loaded");

    if(vectorLayer.getVisible()) {
        // createCategoryLegend();

        createGraduatedLegend();
    }
    
});


// changes in the attribute
let atttributeMapping = {
    'G_UNIV':'graduated',
    'G_BIV':'categorized'
};

document.getElementById("attribute").onchange = (e) => {
    let { value } = e.target;

    let stylingType = atttributeMapping[value];
    document.getElementById("style-type").value = stylingType;

    let styleCustom = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'white',
            lineDash: [4],
            width: 1,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)',
          }),
    });

    if(value == 'G_UNIV') {

        vectorLayer.getSource().getFeatures().forEach(ft => {
            console.log(ft.get(value));

            let color = getFillColorGraduated(ft.get(value));
            styleCustom.getFill().setColor(color);

            console.log(styleCustom.getFill());
            ft.setStyle(styleCustom);
        });

    } else if(value == 'G_BIV') {
       
        vectorLayer.getSource().getFeatures().forEach(ft => {
            console.log(ft.get(value));

            let color = getFillColor(ft.get(value));
            styleCustom.getFill().setColor(color);

            console.log(styleCustom.getFill());
            ft.setStyle(styleCustom);
        });
    }
}

