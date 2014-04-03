/* jshint laxcomma : true */
// Convert GTFS shapes.txt to a geo-able MongoDB database.

var mongodb    = require('mongodb')
  , mongo      = mongodb.MongoClient
  , fs         = require('fs')
  , readStream = fs.createReadStream('../data/small.txt')
  , collection;

var obj = {
  _id : mongodb.ObjectID(),
    type : "FeatureCollection",
    features : [],
    properties : {
      city : 'Boston',
      last_updated : +new Date()
    }
};

// Add FeatureCollection to mongo
mongo.connect('mongodb://127.0.0.1:27017/bussurfer', function(err, db){
  if (err){
    console.log("Couldn't connect to mongo.  Are you sure it's installed?");
  }

  // Begin parse!
  collection = db.collection('shapes');


  collection.insert(obj, parse);
});

function parse(err, result){

  var query = { '_id' : obj._id };

  collection.find(query).toArray(function(err, results){
    console.log(results);
  });

  if (err){
    console.log("Couldn't create FeatureCollection in Mongo.");
  }

  // Generate linestrings and put them in the database
  var last = false,
      feature = {};

  readLines(readStream, function(line){
    var arr = line.split(',').map(strip)
      , id  = parseInt(arr[0], 10);

    // Skip if ID can't be coerced to int
    if (isNaN(id)){
      return;
    }

    // Append new feature upon ID change
    if (id !== last){

      collection.update(query, { $push : { features : feature }}, function(err, result){
        console.log(err, result);
      });

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
    if (remaining.length > 0) {
      func(remaining);
    }
    process.exit(0);
  });

}

// Remove quotes from string
function strip(string){
  return string.substring(1, string.length-1);
}
