/*jshint laxcomma: true */

var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog')
  , validator  = require('validator');

log.enableColor();

log.level = "verbose";

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

http
  .createServer(main)
  .listen(port, function(){
    log.info('Server running on port ' + port);
  });

// Handle requests, provide README if none given
function main(request, response){
  var arr = request.url.split('/');

  // Very simple routing
  switch (arr[1]){
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

  function wedge(){
    console.log(arr);
    respond('Wedge.');
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

