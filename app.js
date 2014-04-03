/*jshint laxcomma: true */

var http      = require('http')
  , url       = require('url')
  , fs        = require('fs')
  , log       = require('npmlog')
  , qs        = require('querystring')
  , mongo     = require('mongodb').MongoClient
  , GeoJSON   = require('./lib/geojson')
  , validator = require('validator');

log.enableColor();
log.level = "error";

// Connect to mongo
var collection;
mongo.connect('mongodb://127.0.0.1:27017/bussurfer', function(err, db){
  if (err){
    console.log("Couldn't connect to mongo.  Are you sure it's installed?");
  }

  collection = db.collection('shapes');
});

// Create HTTP server
var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;
http
  .createServer(main)
  .listen(port, function(){
    log.info('Server running on port ' + port);
  });

// Handle requests, provide README if none given
function main(request, response){
  var url   = request.url
    , arr   = url.split('?')
    , path  = arr[0].split('/')
    , query = arr[1];

  // Very simple routing
  switch (path[1]){
    case 'wedge':
      wedge();
      break;
    case '':
      explain();
      break;
    default:
      explain();
      break;
  }

  // Given a latlon and a bearing, generate a wedge.
  function wedge(){

    if (!query){
      respond('Malformed or nonexistent query string', 400);
    }

    var params = qs.parse(query);

    // TODO: validate
    var lat     = parseFloat(params.lat, 10)
      , lon     = parseFloat(params.lon, 10)
      , bearing = parseFloat(params.bearing, 10);

    var coords = [[
      [lon, lat],
      getDestination(lat, lon, bearing + 1),
      getDestination(lat, lon, bearing - 1),
      [lon, lat]
    ]];

    var polygon = new GeoJSON.Feature('Polygon', coords);

    intersect(polygon, function(err, results){

      if (err){
        log.error(err);
      }

      respond(JSON.stringify(results));
    });

  }

  // Attempt to intersect polygon with shapes in mongodb.
  function intersect(polygon, cb){

    var geometry = polygon.geometry;

    collection
      .find({ geometry : { $geoIntersects : { $geometry : geometry }}})
      .toArray(cb);

  }

  function explain(){
    try {
      fs.readFile('README.md', 'utf8', function(err, md){
        respond(md, null, 'text/plain');
      });

    } catch(e){
      respond("Couldn't find README.md.", 404);
    }
  }

  function respond(string, code, type){

    code = code || 200;
    type = type || "text/plain";

    log.verbose(code + ': ' + string);

    response.writeHead(code, {
      "Content-Type": type,
      "Content-Length": string.length
    });
    response.write(string + '\n');
    response.end();
  }
}

// Given a lat, lon, bearing (degrees), and distance (km), calculate the destination.
// via http://www.movable-type.co.uk/scripts/latlong.html
function getDestination(lat1, lon1, brng, d){

  var R = 6378.1; // Earth's circumfrence, km

  // Convert to radians
  var m = (Math.PI / 180);

  brng = radians(brng);
  lat1 = radians(lat1);
  lon1 = radians(lon1);

  d = d || 30; //km

  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );

  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
      Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

  return [degrees(lon2), degrees(lat2)];

  function radians(number){
    return number * (Math.PI / 180);
  }

  function degrees(number){
    return number * (180 / Math.PI);
  }
}
