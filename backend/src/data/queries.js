const getData = `
SELECT json_build_object(
  'type',       'Feature',
  'geometry',   ST_AsGeoJSON(geom)::json,
  'properties', json_build_object(
    'gid', gid,
	  'name', name,
	  'type', type,
	  'link', link
  )
) AS dataDummy
FROM datadummy;`

module.exports = {
  getData,
}