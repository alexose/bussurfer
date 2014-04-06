var app = {

    initialize: function(){
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        $('#modal').modal();
        $('#mainbutton').click(this.go);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

        // TODO: Some visuals for deviceready event?

        // Begin polling for location and bearing
        this.interval = setInterval(this.locate.bind(this), 5000);
    },

    locate : function(){

        var self = this;

        var errors = 0;

        var ele = {
          lat : $('#latitude'),
          lon : $('#longitude'),
          heading : $('#heading'),
          error : $('#error'),
          stats : $('#stats')
        };

        // Update coords and heading
        navigator.geolocation.getCurrentPosition(updatePosition, error);
        navigator.compass.getCurrentHeading(updateHeading, error);

        function updatePosition(position){

            self.coords = position.coords;

            var lat = self.coords.latitude,
                lon = self.coords.longitude;

            ele.lat.text(round(lat));
            ele.lon.text(round(lon));

            show();
        }

        function updateHeading(heading){

            console.log(heading);
            self.heading = heading.magneticHeading;

            ele.heading.text(self.heading);

            show();
        }

        function show(){
            if (this.coords && this.heading){
                ele.stats.slideDown();
                errors = 0;
            }
        }

        function error(){
            errors++;

            if (errors > 3){
                ele.error.slideDown();
            }
        }

        function round(number){
          return number.toFixed(3);
        }

    },

    go : function(e){
        e.preventDefault();
    }
};
