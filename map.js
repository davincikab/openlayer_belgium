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

    let colorIndex = 0;
    values.forEach((a,i) => {
        let nextValue = values[i + 1];

        if(!nextValue) { 
            return; 
        }

        if(nextValue > value && a <= value) {
            colorIndex = i;
        }

    });

    
    // let index = values.findIndex(val => val == value);
    return colors[colorIndex] || '#eeeeee';
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

    map.setView(new ol.View({
        center:[...coordinate],
        zoom: 15,
    }))

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

    setTimeout((e) => {
        map.updateSize();
    }, 100);
    
    
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
    console.log("Category: GBIV");

    // let values = vectorLayer.getSource().getFeatures().map(ft => ft.N[field]);
    // values = [...new Set(values)].sort();
    let values = [10, 11, 12, 21, 22, 23, 31, 32, 33];

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

    console.log(values);

    let items = values.map((val,i) => {
        let color = getFillColor(val);
        let label = labels[i];

        return `<div class="legend-item">
            <div class="legend-card" style="background:${color}"></div>
            <div class="legend-card-label">${label}</div>
        </div>`;

    });

    // console.log(items.join(""))
    document.getElementById("legend-title").innerHTML = `Bivariate Styling: ${field}`;
    document.getElementById("legend-container").innerHTML = items.join("");
}

function createGraduatedLegend(field='G_UNIV') {
    console.log('Creating G UNIV Legend');

    let values = [];

    for(let i=0; i<=1; i+=0.125) {
        values.push(i);
    };

    console.log(values);

    // return;
    let items = values.slice(0, -1).map((val, i) => {
        console.log("Value: ", val);
        let color = getFillColorGraduated(val);

        console.log("Color: ", color);
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
        // createGraduatedLegend();
    }
    
});

console.log("Updated ")
createCategoryLegend();


// changes in the attribute
let atttributeMapping = {
    'G_UNIV':'graduated',
    'G_BIV':'categorized',
    'A_1':'graduated',
    'B_2':'graduated',
    'L_1N':'graduated'
};

let colorMapping = {
    'G_UNIV':'graduated',
    'G_BIV':'categorized',
    'A_1':'graduated',
    'B_2':'graduated',
    'L_1N':'graduated'
};

document.getElementById("attribute").onchange = (e) => {
    let { value } = e.target;

    let stylingType = atttributeMapping[value];
    document.getElementById("style-type").value = stylingType;

    let strokeStyle = new ol.style.Stroke({
        color: 'white',
        width: 0.6,
    });

    if(value == 'G_UNIV') {

        vectorLayer.getSource().getFeatures().forEach(ft => {
            // console.log(ft.get(value));

            let color = getFillColorGraduated(ft.get(value));
            let style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: color,
                }),
                stroke:strokeStyle
            });

            // console.log(styleCustom.getFill());
            ft.setStyle(style);
        });

        createGraduatedLegend('G_UNIV');

    } else if(value == 'G_BIV') {
        vectorLayer.getSource().getFeatures().forEach(ft => {
            // console.log(ft.get(value));

            let color = getFillColor(ft.get('G_BIV'));
            let style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: color,
                }),
                stroke:strokeStyle
            });

            // styleCustom.getFill().setColor(color);

            // console.log(styleCustom.getFill());
            ft.setStyle(style);
        });

        createCategoryLegend('G_BIV');
    }


}

// Calculation option
class ComputationModule {
    constructor() {
        this.colorSchemes = '';
        this.attr1 = 'G_UNIV';
        this.attr2 = 'A_1';

        this.field_name = "new_field";

        this.operator = "sum";

        this.fields = ['G_UNIV', 'A_1', 'L_1', 'L_1N', 'QM_EW', 'VG_21', 'B_2'];

        this.loadData();
    }

    loadData() {
        fetch('Steglitz-Zehlendorf.geojson')
        .then(res => res.json())
        .then(data => {
            console.log(data);

            this.dataset = JSON.parse(JSON.stringify(data));
        })
        .catch(console.error)
    }

    fireEventListeners() {
        document.getElementById("attr1").onchange = (e) => {
            this.attr1 = e.target.value;
            this.updateOption();
        }

        document.getElementById("attr2").onchange = (e) => {
            this.attr2 = e.target.value;

            console.log("Attr: ", this.attr2);
        }

        document.getElementById("operator").onchange = (e) => {
            this.attr1 = e.target.value;
        }

        document.getElementById("field_name").oninput = (e) => {
            this.field_name = e.target.value;
        }

        // download btn
        document.getElementById("btn-download").onclick = (e) => {
            this.exportDataToCSV();
        }

        // calulate btn
        document.getElementById("btn-compute").onclick = (e) => {
            this.calculateNewField();
        }
    }

    updateOption() {
        document.getElementById("attr2").innerHTML = "";
        this.fields.filter(field => field != this.attr1).map((field,i) => {

            if(i == 0) {
                document.getElementById("attr2").innerHTML += `<option value="${field}" selected>${field}</option>`;
                this.attr2 = field;

                return;
            } 
            document.getElementById("attr2").innerHTML += `<option value="${field}">${field}</option>`
        });        
    }

    chooseColorScheme() {

    }

    calculateNewField() {
        switch(this.operator) {
            case 'sum':
                this.dataset.features = this.dataset.features.map(ft => {
                    ft.properties[this.field_name] = ft.properties[this.attr1] + ft.properties[this.attr2];

                    return ft;
                })          
            case 'multiply':
                this.dataset.features = this.dataset.features.map(ft => {
                    ft.properties[this.field_name] = ft.properties[this.attr1] * ft.properties[this.attr2];

                    return ft;
                })
            case 'division':
                this.dataset.features = this.dataset.features.map(ft => {
                    ft.properties[this.field_name] = ft.properties[this.attr1] / ft.properties[this.attr2];

                    return ft;
                })
        }

        // update the visual with new data;
        // choose the color scheme
    }

    exportDataToCSV() {
        // create a csv file
        let csvContent = "data:text/csv;charset=utf-8,";

        csvContent +=  Object.keys(this.dataset.features[0].properties).join(",") + "\r\n";

        this.dataset.features.forEach(ft => {
            console.log(ft);

            let row = Object.values(ft.properties).join(",");
            csvContent += row + "\r\n";
        });

        let downloadAnchor = document.getElementById("download-link");
        var encodedUri = encodeURI(csvContent);
        downloadAnchor.href = encodedUri;

        downloadAnchor.click();
    }

}

const computeInstance = new ComputationModule();
computeInstance.fireEventListeners();



// default fields: EW_21, AREA_QM, EW_HA_21, TYPE, 
// A_1, B_2, L_1N, G_BIV, G_UNIV