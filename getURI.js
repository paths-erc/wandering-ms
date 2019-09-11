/* jshint esversion: 6 */

const getURI = (debug) => {

  if(debug){
    return 'test-data.json';
  }

  const base = "https://db-dev.bradypus.net/api/paths/m_msplaces?verb=search&type=encoded";
  const join = [
    "JOIN paths__geodata as g ON g.id_link=place"
  ];
  const fields = [
    'fields[paths__m_msplaces.id_link]=id_link',
    'fields[paths__m_msplaces.type]=Type',
    'fields[paths__m_msplaces.place]=Place',
    'fields[g.geometry]=geometry'
  ];
  const limit_start = 0;
  const limit_end = 500;
  const query = " paths__m_msplaces.id_link IN ( SELECT id_link FROM  `paths__m_msplaces` GROUP BY (id_link) HAVING COUNT(DISTINCT `place`) > 1 ) ";

  const URI = `${base}&join=${join.join(' ')}&${fields.join('&')}&limit_start=${limit_start}&limit_end=${limit_end}&q_encoded=${btoa(query)}`;

  return encodeURI(URI);
};
