/* jshint esversion: 6 */

const composeMap = (geoJsonFeatureCollection, places) => {
  document.getElementById('map').innerHTML = '';

  const bounds = [
    [
      31.331975179713332,
      39.91028308868409
    ],
    [
      24.003229109442877,
      24.089970588684086
    ]
  ];

  const esri = L.esri.basemapLayer('DarkGray');
  const imperium = L.tileLayer('http://dare.ht.lu.se/tiles/imperium/{z}/{x}/{y}.png');

  const baseMaps = {
    "Imperium": imperium,
    "Esri dark": esri
  };

  const map = L.map('map', {
    layers: [esri, imperium]
  });
  map.fitBounds(bounds);
  L.control.layers(baseMaps).addTo(map);

  var oneToManyFlowmapLayer = L.canvasFlowmapLayer(geoJsonFeatureCollection, {
    originAndDestinationFieldIds: {
      originUniqueIdField: 's_city_id',
      originGeometry: {
        x: 's_lon',
        y: 's_lat'
      },
      destinationUniqueIdField: 'e_city_id',
      destinationGeometry: {
        x: 'e_lon',
        y: 'e_lat'
      }
    },
    pathDisplayMode: 'selection',
    animationStarted: true,
    animationEasingFamily: 'Cubic',
    animationEasingType: 'In',
    animationDuration: 2000,

    canvasBezierStyle: {
        type: 'classBreaks',
        field: 'tot',
        classBreakInfos: [{
          classMinValue: 0,
          classMaxValue: 1,
          symbol: {
            strokeStyle: '#ff7b7b',
            lineWidth: 0.5
          }
        }, {
          classMinValue: 2,
          classMaxValue: 10,
          symbol: {
            strokeStyle: '#ff5252',
            lineWidth: 1.5
          }
        }, {
          classMinValue: 11,
          classMaxValue: 13,
          symbol: {
            strokeStyle: '#ff0000',
            lineWidth: 2.5
          }
        }, {
          classMinValue: 14,
          classMaxValue: 100,
          symbol: {
            strokeStyle: '#a70000',
            lineWidth: 3.5
          }
        }],
        defaultSymbol: {
          strokeStyle: '#ffbaba',
          lineWidth: 0.5
        },
      }


  }).addTo(map);
  oneToManyFlowmapLayer.getAnimationEasingOptions();

  oneToManyFlowmapLayer.on('click', function(e) {
    if (e.sharedOriginFeatures.length) {
      oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
    }
    if (e.sharedDestinationFeatures.length) {
      oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, 'SELECTION_NEW');
    }
  });

  places.forEach((p, i)=>{
    oneToManyFlowmapLayer.selectFeaturesForPathDisplayById('s_city_id', p, true, 'SELECTION_ADD');
  });

  const customControl =  L.Control.extend({
    options: {
      position: 'bottomright'
    },
    onAdd: function (map) {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

      container.style.backgroundColor = 'white';
      container.style.backgroundSize = "30px 30px";
      container.style.padding = ".5rem 1rem";
      container.innerHTML = `<div>
        <h2 style="margin:.5rem 0 1rem 0">Legend</h2>
        <div style="margin-bottom:.6rem; border-bottom:.5px solid #ff7b7b;">1 manuscript</div>
        <div style="margin-bottom:.6rem; border-bottom:1.5px solid #ff5252;">2-10 manuscripts</div>
        <div style="margin-bottom:.6rem; border-bottom:2.5px solid #ff0000;">11-13 manuscripts</div>
        <div style="margin-bottom:.6rem; border-bottom:3.5px solid #a70000;">&gt;14 manuscripts</div>
      </div>`;

      return container;
    }
  });
  map.addControl(new customControl());
};
