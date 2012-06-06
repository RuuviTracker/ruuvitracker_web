
define([
    'underscore'
  , 'activity'
  , 'intent'
  , 'leaflet'
  , 'collections/trackers'
  , 'hbs!tmpls/map/index'
], function(_, Activity, Intent, Leaflet, Trackers) {

    var mapActivity = Activity.extend();

    mapActivity.uid = 'mapActivity';
    mapActivity.template = 'map/index';

    mapActivity._markers = [];

    mapActivity.show = function(intent) {
        if (!this.rendered) {
            this.loading();
            this.render({}, function() {
                this.show(intent);
            });
        } else {
            //
        }
    };

    mapActivity.registerIntent('map:show', mapActivity.show);

    mapActivity.initMap = function() {
        if (this.map) {
            throw "Map already initialized!";
        }

        //this.sel('.map-container').append(
            //$('<div></div>').attr('id', 'map')
                ////.css({width: '100%', height: '100%', 'margin-top': '40px'})
        //);

        //var container = 'map';
        //
        this.sel('.map-container').addClass('full');
        var map = this.map = new Leaflet.Map(
            this.sel('.map-container')[0]
          , {
                center: new Leaflet.LatLng(51.505, -0.09)
              , zoom: 11
            }
        );


        var cloudmade = new L.TileLayer(
            'http://{s}.tile.cloudmade.com/b1e35f2aca4f49899b04ab9e89ae3b18/997/256/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
                }
            );

        var osm = new L.TileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'OpenStreetMaps'
              , minzoom: 8
              , maxZoom: 12
            }
        );


        //map.addLayer(cloudmade);
        map.addLayer(osm);

        this.trackers = new Trackers();

        this.trackers.on('reset', function(e) {
            console.log('tracker updated');
            Intent.create('map:loadEvents').send();
        });

        var me = this;
        this.map.on('load', function() {
            me.trackers.fetchWithSettings();
            _.off(me.map, 'load');
        });

        return true;
    };

    mapActivity.onRender(mapActivity.initMap);

    mapActivity.loadEvents = function() {
        if (!this.trackers || this.trackers.length === 0) {
            return;
        }

        var me = this;
        this.trackers.each(function(tracker) {
            console.log('tracker::loadEvents', tracker);
            tracker.get('events').on('reset', function(events) {
                console.log('tracker::events', events);

                if (tracker.marker === undefined) {
                    events.each(function(ev) {
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(
                                ev.get('location').latitude
                              , ev.get('location').longitude
                            )
                          , map: me.map

                        });
                        me._markers.push(marker);

                        if (me._markers.length == 1) {
                            var loc = marker.getPosition();
                            console.log(loc);
                            me.map.setCenter(loc);
                        }

                    });

                    console.log(me);
                } else {
                    // set marker
                }
            });

            tracker.get('events').fetch();
        });

    };
    mapActivity.registerIntent('map:loadEvents', mapActivity.loadEvents);

    return mapActivity;
});
