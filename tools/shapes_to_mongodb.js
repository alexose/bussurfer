/* jshint laxcomma : true */
// Convert GTFS shapes.txt to a geo-able MongoDB database.

var mongodb    = require('mongodb')
  , mongo      = mongodb.MongoClient
  , fs         = require('fs')
  , readStream = fs.createReadStream('../data/shapes.txt')
  , collection;

// Add FeatureCollection to mongo
mongo.connect('mongodb://127.0.0.1:27017/bussurfer', function(err, db){
  if (err){
    console.log("Couldn't connect to mongo.  Are you sure it's installed?");
  }

  // Begin parse!
  collection = db.collection('shapes');

  parse();
});

function parse(err, result){

  if (err){
    console.log("Couldn't create FeatureCollection in Mongo.");
  }

  // Generate linestrings and put them in the database
  var last = false,
      feature = {};

  readLines(readStream, function(line, exit){
    var arr = line.split(',').map(strip)
      , id  = parseInt(arr[0], 10);

    // Skip if ID can't be coerced to int
    if (isNaN(id) && !exit){
      return;
    }

    // Append new feature upon ID change
    if (id !== last || exit){

      if (last){
        collection.insert(feature, function(err, result){
        });
      }

      feature = {
        type : "Feature",
        geometry : {
          type : "LineString",
          coordinates : []
        },
        properties : {
          id : id
        }
      };
    }

    // Append coordinate pair
    feature.geometry.coordinates.push([arr[1], arr[2]]);

    last = id;
  });
}

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {

    remaining += data;

    var index = remaining.indexOf('\n');

    while (index > -1){

      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);

      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    func(remaining, true);
    process.exit(0);
  });

}

// Remove quotes from string
function strip(string){
  return string.substring(1, string.length-1);
}
