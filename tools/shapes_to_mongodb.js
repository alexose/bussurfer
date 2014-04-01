// Convert GTFS shapes.txt to a geo-able MongoDB database.

var mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://127.0.0.1:27017/bussurfer', function(err, db){
  if (err){
    console.log("Couldn't connect to mongo.  Are you sure it's installed?");
  }

  // Stream in shapes.txt one line at a time
}

