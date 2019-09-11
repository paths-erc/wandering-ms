/* jshint esversion: 6 */

const compact = rows => {
  let data = {};
  let places = {};

  rows.map(e => {
    const ms = e.id_link;
    const type = e.type;
    const place = e.place;
    const wkt = e.geometry;

    if (typeof data[ms] == 'undefined'){
      data[ms] = {};
    }
    if (typeof data[ms][type] == 'undefined'){
      data[ms][type] = place;
    }
    places[place] = wkt2arr(wkt);
  });

  return [data, places];
};

const wkt2arr = wkt =>{
  return wkt.replace(/POINT\s?\(/, '').replace(/\s?\)/, '').split(' ');
};

const addArc = (from, to, arcs, places) => {
  if ( !from || !to ){
    return arcs;
  }
  const key = `${from}-${to}`;

  if (arcs[key]){
    arcs[key].tot += 1;
  } else {
    arcs[key] = {
      from: from,
      to: to,
      from_lat: parseFloat(places[from][1]),
      from_lon: parseFloat(places[from][0]),
      to_lat:   parseFloat(places[to][1]),
      to_lon:   parseFloat(places[to][0]),
      tot: 1
    };
  }
  return arcs;
};

const formatGeoJson = rows => {
  const [data, places] = compact(rows);
  let arcs = {};

  Object.entries(data).forEach( ([clm, pl]) => {
    let from;
    let to;

    if (pl.production && pl.storage && pl.discovery  &&  pl.storage !== pl.discovery) {
      from  = pl.storage;
      to    =  pl.discovery;

    } else if (pl.production && pl.storage   &&   pl.production !== pl.storage) {
      from  = pl.production;
      to    =  pl.storage;

    } else if (pl.production && pl.discovery   &&   pl.production !== pl.discovery) {
      from  = pl.production;
      to    =  pl.discovery;

    } else if (pl.storage && pl.discovery   &&   pl.storage !== pl.discovery) {
      from  = pl.storage;
      to    =  pl.discovery;

    } else {
      // console.log(clm, pl);
      return;
    }

    arcs = addArc(from, to, arcs, places);
  } );

  let geoJson = {
    "type":"FeatureCollection",
    "features":[]
  };

  let startPlaces = [];


  for (let [key, a] of Object.entries(arcs)) {
    let feature = {
       "type":"Feature",
       "geometry":{
          "type":"Point",
          "coordinates":[
             a.from_lat,
             a.from_lon
          ]
       },
       "properties":{
          "s_city_id":a.from,
          "s_city":a.from,
          "s_lat":a.from_lat,
          "s_lon":a.from_lon,
          "e_city_id":a.to,
          "e_City":a.to,
          "e_lat":a.to_lat,
          "e_lon":a.to_lon,
          "tot":a.tot
       }
    };

    geoJson.features.push(feature);

    if (!startPlaces.includes(a.from)){
      startPlaces.push(a.from);
    }
  }

   return [geoJson, startPlaces];
};
