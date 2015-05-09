/**
 * @file
 * Drupal to Google Maps API bridge.
 */

/*global jQuery, Drupal, GLatLng, GSmallZoomControl, GLargeMapControl, GMap2 */
/*global GMapTypeControl, GSmallMapControl, G_HYBRID_MAP, G_NORMAL_MAP */
/*global G_PHYSICAL_MAP, G_SATELLITE_MAP, GHierarchicalMapTypeControl */
/*global GKeyboardHandler, GLatLngBounds, GMenuMapTypeControl, GEvent */
/*global GOverviewMapControl, GScaleControl, GUnload */

(function () { // BEGIN closure
    var handlers = {};
    var maps = {};
    var ajaxoffset = 0;

    Drupal.gmap = {

        /**
         * Retrieve a map object for use by a non-widget.
         * Use this if you need to be able to fire events against a certain map
         * which you have the mapid for.
         * Be a good GMap citizen! Remember to send change()s after modifying variables!
         */
        getMap: function (mapid) {
            if (maps[mapid]) {
                return maps[mapid];
            }
            else {
                // Perhaps the user passed a widget id instead?
                mapid = mapid.split('-').slice(1, -1).join('-');
                if (maps[mapid]) {
                    return maps[mapid];
                }
            }
            return false;
        },

        unloadMap: function (mapid) {
            delete maps[mapid];
        },

        addHandler: function (handler, callback) {
            if (!handlers[handler]) {
                handlers[handler] = [];
            }
            handlers[handler].push(callback);
        },

        globalChange: function (name, userdata) {
            for (var mapid in Drupal.settings.gmap) {
                if (Drupal.settings.gmap.hasOwnProperty(mapid)) {
                    // Skip maps that are set up but not shown, etc.
                    if (maps[mapid]) {
                        maps[mapid].change(name, -1, userdata);
                    }
                }
            }
        },

        setup: function (settings) {
            var obj = this;

            var initcallback = function (mapid) {
                return (function () {
                    maps[mapid].change("bootstrap_options", -1);
                    maps[mapid].change("boot", -1);
                    maps[mapid].change("init", -1);
                    // Send some changed events to fire up the rest of the initial settings..
                    maps[mapid].change("maptypechange", -1);
                    maps[mapid].change("controltypechange", -1);
                    maps[mapid].change("alignchange", -1);
                    // Set ready to put the event system into action.
                    maps[mapid].ready = true;
                    maps[mapid].change("ready", -1);
                });
            };

            if (settings || (Drupal.settings && Drupal.settings.gmap)) {
                var mapid = obj.id.split('-');
                if (Drupal.settings['gmap_remap_widgets']) {
                    if (Drupal.settings['gmap_remap_widgets'][obj.id]) {
                        jQuery.each(Drupal.settings['gmap_remap_widgets'][obj.id].classes, function () {
                            jQuery(obj).addClass(this);
                        });
                        mapid = Drupal.settings['gmap_remap_widgets'][obj.id].id.split('-');
                    }
                }
                var instanceid = mapid.pop();
                mapid.shift();
                mapid = mapid.join('-');
                var control = instanceid.replace(/\d+$/, '');

                // Lazy init the map object.
                if (!maps[mapid]) {
                    if (settings) {
                        maps[mapid] = new Drupal.gmap.map(settings);
                    }
                    else {
                        maps[mapid] = new Drupal.gmap.map(Drupal.settings.gmap[mapid]);
                    }
                    // Prepare the initialization callback.
                    var callback = initcallback(mapid);
                    setTimeout(callback, 0);
                }

                if (handlers[control]) {
                    for (var i = 0; i < handlers[control].length; i++) {
                        handlers[control][i].call(maps[mapid], obj);
                    }
                }
                else {
                    // Element with wrong class?
                }
            }
        }
    };

    jQuery.fn.createGMap = function (settings, mapid) {
        return this.each(function () {
            if (!mapid) {
                mapid = 'auto' + ajaxoffset + 'ajax';
                ajaxoffset++;
            }
            settings.id = mapid;
            jQuery(this)
                .attr('id', 'gmap-' + mapid + '-gmap0')
                .css('width', settings.width)
                .css('height', settings.height)
                .addClass('gmap-control')
                .addClass('gmap-gmap')
                .addClass('gmap')
                .addClass('gmap-map')
                .addClass('gmap-' + mapid + '-gmap')
                .addClass('gmap-processed')
                .each(function () {
                    Drupal.gmap.setup.call(this, settings)
                });
        });
    };

})(); // END closure

Drupal.gmap.factory = {};

Drupal.gmap.map = function (v) {
    this.vars = v;
    this.map = undefined;
    this.ready = false;
    var _bindings = {};

    /**
     * Register interest in a change.
     */
    this.bind = function (name, callback) {
        if (!_bindings[name]) {
            _bindings[name] = [];
        }
        return _bindings[name].push(callback) - 1;
    };

    /**
     * Change notification.
     * Interested parties can act on changes.
     */
    this.change = function (name, id, userdata) {
        var c;
        if (_bindings[name]) {
            for (c = 0; c < _bindings[name].length; c++) {
                if (c !== id) {
                    _bindings[name][c](userdata);
                }
            }
        }
        if (name !== 'all') {
            this.change('all', -1, name, userdata);
        }
    };

    /**
     * Deferred change notification.
     * This will cause a change notification to be tacked on to the *end* of the event queue.
     */
    this.deferChange = function (name, id, userdata) {
        var obj = this;
        // This will move the function call to the end of the event loop.
        setTimeout(function () {
            obj.change(name, id, userdata);
        }, 0);
    };

    this.getMapTypeName = function (type) {
        if (type == 'map' || type == 'roadmap') return 'Map';
        if (type == 'hybrid') return 'Hybrid';
        if (type == 'physical' || type == 'terrain') return 'Physical';
        if (type == 'satellite') return 'Satellite';
    };

    this.getMapTypeId = function (type) {
        if (type == 'Map' || type == 'Roadmap') return google.maps.MapTypeId.ROADMAP;
        if (type == 'Hybrid') return google.maps.MapTypeId.HYBRID;
        if (type == 'Physical' || type == 'Terrain') return google.maps.MapTypeId.TERRAIN;
        if (type == 'Satellite') return google.maps.MapTypeId.SATELLITE;
    };
};

////////////////////////////////////////
//             Map widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;
    var _ib = {};

    // Respond to incoming zooms
    _ib.zoom = obj.bind("zoom", function (zoom) {
        obj.map.setZoom(obj.vars.zoom);
    });

    // Respond to incoming moves
    _ib.move = obj.bind("move", function () {
        obj.map.panTo(new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude));
    });

    // Respond to incoming width changes.
    _ib.width = obj.bind("widthchange", function (w) {
        obj.map.getDiv().style.width = w;
        google.maps.event.trigger(obj.map);
    });
    // Send out outgoing width changes.
    // N/A
    // Respond to incoming height changes.
    _ib.height = obj.bind("heightchange", function (h) {
        obj.map.getDiv().style.height = h;
        google.maps.event.trigger(obj.map);
    });
    // Send out outgoing height changes.
    // N/A

    // Respond to incoming control type changes.
    _ib.ctc = obj.bind("controltypechange", function () {
        if (obj.vars.controltype === 'Small') {
            obj.map.setOptions({zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL}});
        }
        else if (obj.vars.controltype === 'Large') {
            obj.map.setOptions({zoomControlOptions: {style: google.maps.ZoomControlStyle.LARGE}});
        }
        // obsolete
        else if (obj.vars.controltype === 'Android') {
            obj.map.setOptions({zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL}});
        }
    });
    // Send out outgoing control type changes.
    // N/A

    // Respond to incoming map type changes.
    _ib.mtc = obj.bind("maptypechange", function () {
        obj.map.setMapTypeId(obj.getMapTypeId(obj.vars.maptype));
    });
    // Send out outgoing map type changes.
    // N/A

    obj.bind("bootstrap_options", function () {
        // Bootup options.
        var opts = {}; // Object literal google.maps.MapOptions
        obj.opts = opts;

        // Disable default UI for custom options
        opts.disableDefaultUI = true;

        // Set draggable property
        if (obj.vars.behavior.nodrag) {
            opts.draggable = false;
        }
        else if (obj.vars.behavior.nokeyboard) {
            opts.keyboardShortcuts = false;
        }

        // Set default map type (set to road map if nothing selected)
        switch (obj.vars.maptype) {
            case 'Hybrid':
                opts.mapTypeId = google.maps.MapTypeId.HYBRID;
                break;
            case 'Physical':
                opts.mapTypeId = google.maps.MapTypeId.TERRAIN;
                break;
            case 'Satellite':
                opts.mapTypeId = google.maps.MapTypeId.SATELLITE;
                break;
            case 'Map':
            default:
                opts.mapTypeId = google.maps.MapTypeId.ROADMAP;
                break;
        }

        // Null out the enabled types.
        opts.mapTypeIds = [];

        if (obj.vars.baselayers.Map) {
            opts.mapTypeIds.push(google.maps.MapTypeId.ROADMAP);
        }
        if (obj.vars.baselayers.Hybrid) {
            opts.mapTypeIds.push(google.maps.MapTypeId.HYBRID);
        }
        if (obj.vars.baselayers.Physical) {
            opts.mapTypeIds.push(google.maps.MapTypeId.TERRAIN);
        }
        if (obj.vars.baselayers.Satellite) {
            opts.mapTypeIds.push(google.maps.MapTypeId.SATELLITE);
        }

        if (obj.vars.draggableCursor) {
            opts.draggableCursor = obj.vars.draggableCursor;
        }
        if (obj.vars.draggingCursor) {
            opts.draggingCursor = obj.vars.draggingCursor;
        }
        if (obj.vars.backgroundColor) {
            opts.backgroundColor = obj.vars.backgroundColor;
        }

        // Map type control
        opts.mapTypeControl = true;
        opts.mapTypeControlOptions = {};
        if (obj.vars.mtc === 'standard') {
            opts.mapTypeControlOptions.style = google.maps.MapTypeControlStyle.DEFAULT;
        }
        else if (obj.vars.mtc === 'horiz') {
            opts.mapTypeControlOptions.style = google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
        }
        else if (obj.vars.mtc === 'menu') {
            opts.mapTypeControlOptions.style = google.maps.MapTypeControlStyle.DROPDOWN_MENU;
        }
        else if (obj.vars.mtc === 'none') {
            opts.mapTypeControl = false;
        }

        // Navigation control type
        if (obj.vars.controltype !== 'None') {
            opts.zoomControl = true;
        }
        if (obj.vars.pancontrol) {
            opts.panControl = true;
        }
        if (obj.vars.streetviewcontrol) {
            opts.streetViewControl = true;
        }
        if (obj.vars.controltype === 'Small') {
            obj.zoomControlOptions = {style: google.maps.ZoomControlStyle.SMALL};
        }
        else if (obj.vars.controltype === 'Large') {
            obj.zoomControlOptions = {style: google.maps.ZoomControlStyle.LARGE};
        }


        // Set scale control visibility
        opts.scaleControl = obj.vars.behavior.scale;

        // Scroll wheel control
        if (obj.vars.behavior.nomousezoom) {
            opts.scrollwheel = false;
        }
        // Disable double-click zoom
        if (obj.vars.behavior.nocontzoom) {
            opts.disableDoubleClickZoom = true;
        }
        // Overview Map
        if (obj.vars.behavior.overview) {
            opts.overviewMapControl = true;
            opts.overviewMapControlOptions = {opened: true};
        }

    });

    obj.bind("boot", function () {
        obj.map = new google.maps.Map(elem, obj.opts);
        //console.log(obj.map);
    });

    obj.bind("init", function () {
        var map = obj.map;

        // Not implemented in API v3
        // if (obj.vars.behavior.overview) {
        //   map.addControl(new GOverviewMapControl());
        // }
        // if (obj.vars.behavior.googlebar) {
        //   map.enableGoogleBar();
        // }

        if (obj.vars.extent) {
            var c = obj.vars.extent;
            var extent = new google.maps.LatLngBounds(new google.maps.LatLng(c[0][0], c[0][1]), new google.maps.LatLng(c[1][0], c[1][1]));
            obj.vars.latitude = extent.getCenter().lat();
            obj.vars.longitude = extent.getCenter().lng();
            obj.vars.zoom = map.getBoundsZoomLevel(extent);
        }
        if (obj.vars.behavior.collapsehack) {
            // Modify collapsable fieldsets to make maps check dom state when the resize handle
            // is clicked. This may not necessarily be the correct thing to do in all themes,
            // hence it being a behavior.
            setTimeout(function () {
                var r = function () {
                    var coord = map.getCenter();
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(new google.maps.LatLng(coord.lat(), coord.lng()), obj.vars.zoom);
                };
                jQuery(elem).parents('fieldset.collapsible').children('legend').children('a').click(r);
                jQuery('.vertical-tab-button', jQuery(elem).parents('.vertical-tabs')).children('a').click(r);
                jQuery(window).bind('hashchange', r);
                // Would be nice, but doesn't work.
                //$(elem).parents('fieldset.collapsible').children('.fieldset-wrapper').scroll(r);
            }, 0);
        }
        map.setCenter(new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude));
        map.setZoom(obj.vars.zoom);

        // Send out outgoing zooms
        google.maps.event.addListener(map, "zoom_changed", function () {
            obj.vars.zoom = map.getZoom();
            obj.change("zoom", _ib.zoom);
        });

        // Send out outgoing moves
        google.maps.event.addListener(map, "center_changed", function () {
            var coord = map.getCenter();
            obj.vars.latitude = coord.lat();
            obj.vars.longitude = coord.lng();
            obj.change("move", _ib.move);
        });

        // Send out outgoing map type changes.
        google.maps.event.addListener(map, "maptypeid_changed", function () {
            // If the map isn't ready yet, ignore it.
            if (obj.ready) {
                obj.vars.maptype = obj.getMapTypeName(map.getMapTypeId());
                obj.change("maptypechange", _ib.mtc);
            }
        });

        /*
         google.maps.event.addListener(map, 'click', function(event) {
         alert(Drupal.gmap.getIcon("big blue", 0));
         var marker = new google.maps.Marker({
         position: event.latLng,
         map: map
         });
         google.maps.event.addListener(marker, 'click', function() {
         marker.setMap(null);
         });
         });
         */
    });
});

////////////////////////////////////////
//            Zoom widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('zoom', function (elem) {
    var obj = this;
    // Respond to incoming zooms
    var binding = obj.bind("zoom", function () {
        elem.value = obj.vars.zoom;
    });
    // Send out outgoing zooms
    jQuery(elem).change(function () {
        obj.vars.zoom = parseInt(elem.value, 10);
        obj.change("zoom", binding);
    });
});

////////////////////////////////////////
//          Latitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('latitude', function (elem) {
//  var obj = this;
//  // Respond to incoming movements.
//  var binding = obj.bind("move", function () {
//    elem.value = '' + obj.vars.latitude;
//  });
//  // Send out outgoing movements.
//  $(elem).change(function () {
//    obj.vars.latitude = Number(this.value);
//    obj.change("move", binding);
//  });
});

////////////////////////////////////////
//         Longitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('longitude', function (elem) {
//  var obj = this;
//  // Respond to incoming movements.
//  var binding = obj.bind("move", function () {
//    elem.value = '' + obj.vars.longitude;
//  });
//  // Send out outgoing movements.
//  $(elem).change(function () {
//    obj.vars.longitude = Number(this.value);
//    obj.change("move", binding);
//  });
});

////////////////////////////////////////
//          Latlon widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('latlon', function (elem) {
    var obj = this;
    // Respond to incoming movements.
    var binding = obj.bind("move", function () {
        elem.value = '' + obj.vars.latitude + ',' + obj.vars.longitude;
    });
    // Send out outgoing movements.
    jQuery(elem).change(function () {
        var t = this.value.split(',');
        obj.vars.latitude = Number(t[0]);
        obj.vars.longitude = Number(t[1]);
        obj.change("move", binding);
    });
});

////////////////////////////////////////
//          Maptype widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('maptype', function (elem) {
    var obj = this;
    // Respond to incoming movements.
    var binding = obj.bind("maptypechange", function () {
        elem.value = obj.vars.maptype;
    });
    // Send out outgoing movements.
    jQuery(elem).change(function () {
        obj.vars.maptype = elem.value;
        obj.change("maptypechange", binding);
    });
});

(function () { // BEGIN CLOSURE
    var re = /([0-9.]+)\s*(em|ex|px|in|cm|mm|pt|pc|%)/;
    var normalize = function (str) {
        var ar;
        if ((ar = re.exec(str.toLowerCase()))) {
            return ar[1] + ar[2];
        }
        return null;
    };

    ////////////////////////////////////////
    //           Width widget             //
    ////////////////////////////////////////
    Drupal.gmap.addHandler('width', function (elem) {
        var obj = this;
        // Respond to incoming width changes.
        var binding = obj.bind("widthchange", function (w) {
            elem.value = normalize(w);
        });
        // Send out outgoing width changes.
        jQuery(elem).change(function () {
            var n;
            if ((n = normalize(elem.value))) {
                elem.value = n;
                obj.change('widthchange', binding, n);
            }
        });
        obj.bind('init', function () {
            jQuery(elem).change();
        });
    });

    ////////////////////////////////////////
    //           Height widget            //
    ////////////////////////////////////////
    Drupal.gmap.addHandler('height', function (elem) {
        var obj = this;
        // Respond to incoming height changes.
        var binding = obj.bind("heightchange", function (h) {
            elem.value = normalize(h);
        });
        // Send out outgoing height changes.
        jQuery(elem).change(function () {
            var n;
            if ((n = normalize(elem.value))) {
                elem.value = n;
                obj.change('heightchange', binding, n);
            }
        });
        obj.bind('init', function () {
            jQuery(elem).change();
        });
    });
})(); // END CLOSURE

////////////////////////////////////////
//        Control type widget         //
////////////////////////////////////////
Drupal.gmap.addHandler('controltype', function (elem) {
    var obj = this;
    // Respond to incoming height changes.
    var binding = obj.bind("controltypechange", function () {
        elem.value = obj.vars.controltype;
    });
    // Send out outgoing height changes.
    jQuery(elem).change(function () {
        obj.vars.controltype = elem.value
        obj.change("controltypechange", binding);
    });
});

// // Map cleanup.
// if (Drupal.jsEnabled) {
//   $(document).unload(GUnload);
// }

Drupal.behaviors.GMap = {
    attach: function (context, settings) {
        if (Drupal.settings && Drupal.settings['gmap_remap_widgets']) {
            jQuery.each(Drupal.settings['gmap_remap_widgets'], function (key, val) {
                jQuery('#' + key).addClass('gmap-control');
            });
        }
        jQuery('.gmap-gmap:not(.gmap-processed)', context).addClass('gmap-processed').each(function () {
            Drupal.gmap.setup.call(this)
        });
        jQuery('.gmap-control:not(.gmap-processed)', context).addClass('gmap-processed').each(function () {
            Drupal.gmap.setup.call(this)
        });
    },
    detach: function (context, settings) {
        jQuery('.gmap-processed', context).each(function (element) {
            //find mapid
            var id = jQuery(this).attr('id');
            var mapid = id.split('-', 2);

            //unload map
            Drupal.gmap.unloadMap(mapid[1]);
        });
    }
};
;
/**
 * @file
 * Common marker routines.
 */

/*global jQuery, Drupal, GEvent, GInfoWindowTab, GLatLng, GLatLngBounds */

Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;

    if (obj.vars.styleBubble && obj.vars.styleBubble.enableBubbleStyle == 1) {
        var infowindow = new InfoBubble(obj.vars.styleBubble.styleBubbleOptions);
    }
    else {
        var infowindow = new google.maps.InfoWindow();
    }

    obj.bind('init', function () {
        if (obj.vars.behavior.autozoom) {
            obj.bounds = new google.maps.LatLngBounds();
        }
    });

    obj.bind('addmarker', function (marker) {
        marker.opts.position = new google.maps.LatLng(marker.latitude, marker.longitude);
        marker.opts.map = obj.map;
        var m = Drupal.gmap.factory.marker(marker.opts);
        marker.marker = m;
        google.maps.event.addListener(m, 'click', function () {
            obj.change('clickmarker', -1, marker);
        });
        if (obj.vars.behavior.extramarkerevents) {
            google.maps.event.addListener(m, 'mouseover', function () {
                obj.change('mouseovermarker', -1, marker);
            });
            google.maps.event.addListener(m, 'mouseout', function () {
                obj.change('mouseoutmarker', -1, marker);
            });
            google.maps.event.addListener(m, 'dblclick', function () {
                obj.change('dblclickmarker', -1, marker);
            });
        }
        /**
         * Perform a synthetic marker click on this marker on load.
         */
        if (marker.autoclick || (marker.options && marker.options.autoclick)) {
            obj.deferChange('clickmarker', -1, marker);
        }
        if (obj.vars.behavior.autozoom) {
            obj.bounds.extend(new google.maps.LatLng(marker.latitude, marker.longitude));
        }
    });

    // Default marker actions.
    obj.bind('clickmarker', function (marker) {
        // Close infowindow if open to prevent multiple windows
        if (infowindow != null) {
            infowindow.close();
        }
        if (marker.text) {
            infowindow.setContent(marker.text);
            infowindow.open(obj.map, marker.marker);
        }
        // Info Window Query / Info Window Offset
        else if (marker.iwq || (obj.vars.iwq && typeof marker.iwo != 'undefined')) {
            var iwq, iwo;
            if (obj.vars.iwq) {
                iwq = obj.vars.iwq;
            }
            if (marker.iwq) {
                iwq = marker.iwq;
            }
            iwo = 0;
            if (marker.iwo) {
                iwo = marker.iwo;
            }
            // Create a container to store the cloned DOM elements.
            var el = document.createElement('div');
            // Clone the matched object, run through the clone, stripping off ids, and move the clone into the container.
            jQuery(iwq).eq(iwo).clone(false).find('*').removeAttr('id').appendTo(jQuery(el));
            marker.setContent(el);
            infowindow.open(obj.map, marker.marker);
        }
        // AJAX content
        else if (marker.rmt) {
            var uri = marker.rmt;
            // If there was a callback, prefix that.
            // (If there wasn't, marker.rmt was the FULL path.)
            if (obj.vars.rmtcallback) {
                uri = Drupal.settings.basePath + Drupal.settings.pathPrefix + obj.vars.rmtcallback + '/' + marker.rmt;
            }
            // @Bevan: I think it makes more sense to do it in this order.
            // @Bevan: I don't like your choice of variable btw, seems to me like
            // @Bevan: it belongs in the map object, or at *least* somewhere in
            // @Bevan: the gmap settings proper...
            //if (!marker.text && Drupal.settings.loadingImage) {
            //  marker.marker.openInfoWindowHtml(Drupal.settings.loadingImage);
            //}
            jQuery.get(uri, {}, function (data) {
                infowindow.setContent(data);
                infowindow.open(obj.map, marker.marker);
            });
        }
        // Tabbed content
        else if (marker.tabs) {
            var data = "";
            //tabs in an infowindow is no longer supported in API ver3.
            for (var m in marker.tabs) {
                data += marker.tabs[m];
            }
            infowindow.setContent(data);
            infowindow.open(obj.map, marker.marker);
        }
        // No content -- marker is a link
        else if (marker.link) {
            open(marker.link, '_self');
        }
    });

    obj.bind('markersready', function () {
        // If we are autozooming, set the map center at this time.
        if (obj.vars.behavior.autozoom) {
            if (!obj.bounds.isEmpty()) {
                obj.map.fitBounds(obj.bounds);
                var listener = google.maps.event.addListener(obj.map, "idle", function () {
                    if (obj.vars.maxzoom) {
                        var maxzoom = parseInt(obj.vars.maxzoom)
                        if (obj.map.getZoom() > maxzoom) obj.map.setZoom(maxzoom);
                        google.maps.event.removeListener(listener);
                    }
                });
            }
        }
    });

    obj.bind('clearmarkers', function () {
        // Reset bounds if autozooming
        // @@@ Perhaps we should have a bounds for both markers and shapes?
        if (obj.vars.behavior.autozoom) {
            obj.bounds = new google.maps.LatLngBounds();
        }
    });

    Drupal.gmap.getInfoWindow = function () {
        return infowindow;
    };

    // @@@ TODO: Some sort of bounds handling for deletemarker? We'd have to walk the whole thing to figure out the new bounds...
});
;
/**
 * @file
 * GIcon manager for GMap.
 * Required for markers to operate properly.
 */

/*global jQuery, Drupal, GIcon, GPoint, GSize, G_DEFAULT_ICON */

/**
 * Get the GIcon corresponding to a setname / sequence.
 * There is only one GIcon for each slot in the sequence.
 * The marker set wraps around when reaching the end of the sequence.
 * @@@ TODO: Move this directly into the preparemarker event binding.
 */
Drupal.gmap.getIcon = function (setname, sequence) {
    var othimg = ['printImage', 'mozPrintImage', 'printShadow', 'transparent'];
    // If no setname, return google's default icon.
    if (!setname) {
        return;
    }
    if (!this.gicons) {
        this.gicons = {};
    }
    if (!this.gshadows) {
        this.gshadows = {};
    }

    // If no sequence, synthesise one.
    if (!sequence) {
        // @TODO make this per-map.
        if (!this.sequences) {
            this.sequences = {};
        }
        if (!this.sequences[setname]) {
            this.sequences[setname] = -1;
        }
        this.sequences[setname]++;
        sequence = this.sequences[setname];
    }

    if (!this.gicons[setname]) {
        if (!Drupal.gmap.icons[setname]) {
            alert('Request for invalid marker set ' + setname + '!');
        }
        this.gicons[setname] = [];
        this.gshadows[setname] = [];
        var q = Drupal.gmap.icons[setname];
        var p, t;
        for (var i = 0; i < q.sequence.length; i++) {
            /*
             t = new GIcon();
             p = q.path;
             t.image = p + q.sequence[i].f;
             if (q.shadow.f !== '') {
             t.shadow = p + q.shadow.f;
             t.shadowSize = new GSize(q.shadow.w, q.shadow.h);
             }
             t.iconSize = new GSize(q.sequence[i].w, q.sequence[i].h);
             t.iconAnchor = new GPoint(q.anchorX, q.anchorY);
             t.infoWindowAnchor = new GPoint(q.infoX, q.infoY);
             */
            p = Drupal.settings.basePath + q.path;
            t = new google.maps.MarkerImage(p + q.sequence[i].f,
                new google.maps.Size(q.sequence[i].w, q.sequence[i].h),
                null,
                new google.maps.Point(q.anchorX, q.anchorY)
            );
            if (q.shadow.f !== '') {
                this.gshadows[setname][i] = new google.maps.MarkerImage(p + q.shadow.f,
                    new google.maps.Size(q.shadow.w, q.shadow.h),
                    null,
                    new google.maps.Point(q.anchorX, q.anchorY)
                );
            }
            else {
                this.gshadows[setname][i] = null;
            }

            for (var j = 0; j < othimg.length; j++) {
                if (q[othimg[j]] !== '') {
                    t[othimg[j]] = p + q[othimg[j]];
                }
            }
            // @@@ imageMap?
            this.gicons[setname][i] = t;
        }
        delete Drupal.gmap.icons[setname];
    }
    // TODO: Random, other cycle methods.
    return this.gicons[setname][sequence % this.gicons[setname].length];
};

Drupal.gmap.getShadow = function (setname, sequence) {
    if (this.gshadows) return this.gshadows[setname][sequence % this.gicons[setname].length];
};

/**
 * JSON callback to set up the icon defs.
 * When doing the JSON call, the data comes back in a packed format.
 * We need to expand it and file it away in a more useful format.
 */
Drupal.gmap.iconSetup = function () {
    Drupal.gmap.icons = {};
    var m = Drupal.gmap.icondata;
    var filef, filew, fileh, files;
    for (var path in m) {
        if (m.hasOwnProperty(path)) {
            // Reconstitute files array
            filef = m[path].f;
            filew = Drupal.gmap.expandArray(m[path].w, filef.length);
            fileh = Drupal.gmap.expandArray(m[path].h, filef.length);
            files = [];
            for (var i = 0; i < filef.length; i++) {
                files[i] = {f: filef[i], w: filew[i], h: fileh[i]};
            }

            for (var ini in m[path].i) {
                if (m[path].i.hasOwnProperty(ini)) {
                    jQuery.extend(Drupal.gmap.icons, Drupal.gmap.expandIconDef(m[path].i[ini], path, files));
                }
            }
        }
    }
};

/**
 * Expand a compressed array.
 * This will pad arr up to len using the last value of the old array.
 */
Drupal.gmap.expandArray = function (arr, len) {
    var d = arr[0];
    for (var i = 0; i < len; i++) {
        if (!arr[i]) {
            arr[i] = d;
        }
        else {
            d = arr[i];
        }
    }
    return arr;
};

/**
 * Expand icon definition.
 * This helper function is the reverse of the packer function found in
 * gmap_markerinfo.inc.
 */
Drupal.gmap.expandIconDef = function (c, path, files) {
    var decomp = ['key', 'name', 'sequence', 'anchorX', 'anchorY', 'infoX',
        'infoY', 'shadow', 'printImage', 'mozPrintImage', 'printShadow',
        'transparent'];
    var fallback = ['', '', [], 0, 0, 0, 0, {f: '', h: 0, w: 0}, '', '', '', ''];
    var imagerep = ['shadow', 'printImage', 'mozPrintImage', 'printShadow',
        'transparent'];
    var defaults = {};
    var sets = [];
    var i, j;
    // Part 1: Defaults / Markersets
    // Expand arrays and fill in missing ones with fallbacks
    for (i = 0; i < decomp.length; i++) {
        if (!c[0][i]) {
            c[0][i] = [ fallback[i] ];
        }
        c[0][i] = Drupal.gmap.expandArray(c[0][i], c[0][0].length);
    }
    for (i = 0; i < c[0][0].length; i++) {
        for (j = 0; j < decomp.length; j++) {
            if (i === 0) {
                defaults[decomp[j]] = c[0][j][i];
            }
            else {
                if (!sets[i - 1]) {
                    sets[i - 1] = {};
                }
                sets[i - 1][decomp[j]] = c[0][j][i];
            }
        }
    }
    for (i = 0; i < sets.length; i++) {
        for (j = 0; j < decomp.length; j++) {
            if (sets[i][decomp[j]] === fallback[j]) {
                sets[i][decomp[j]] = defaults[decomp[j]];
            }
        }
    }
    var icons = {};
    for (i = 0; i < sets.length; i++) {
        var key = sets[i].key;
        icons[key] = sets[i];
        icons[key].path = path;
        delete icons[key].key;
        delete sets[i];
        for (j = 0; j < icons[key].sequence.length; j++) {
            icons[key].sequence[j] = files[icons[key].sequence[j]];
        }
        for (j = 0; j < imagerep.length; j++) {
            if (typeof(icons[key][imagerep[j]]) === 'number') {
                icons[key][imagerep[j]] = files[icons[key][imagerep[j]]];
            }
        }
    }
    return icons;
};

/**
 * We attach ourselves if we find a map somewhere needing markers.
 * Note: Since we broadcast our ready event to all maps, it doesn't
 * matter which one we attached to!
 */
Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;

    obj.bind('init', function () {
        // Only expand once.
        if (!Drupal.gmap.icons) {
            Drupal.gmap.iconSetup();
        }
    });

    obj.bind('ready', function () {
        // Compatibility event.
        if (Drupal.gmap.icondata) {
            obj.deferChange('iconsready', -1);
        }
    });

    if (!obj.vars.behavior.customicons) {
        // Provide icons to markers.
        obj.bind('preparemarker', function (marker) {
            marker.opts.icon = Drupal.gmap.getIcon(marker.markername, marker.offset);
            marker.opts.shadow = Drupal.gmap.getShadow(marker.markername, marker.offset);
        });
    }
});
;
/**
 * @file
 * Common marker highlighting routines.
 */

/**
 * Highlights marker on rollover.
 * Removes highlight on previous marker.
 *
 * Creates a "circle" at the given point
 * Circle is global variable as there is only one highlighted marker at a time
 * and we want to remove the previously placed polygon before placing a new one.
 *
 * Original code "Google Maps JavaScript API Example"
 * JN201304:
 *    converted rpolygons to circles (not using the shapes.js API, should we be?)
 *    move marker highlight events to custom handler here, to handle radius in pixels (note behavior.radiusInMeters to skip geodesic calcs)
 *    removed google.events and moved events to gmaps binds
 *    added overlay object for creating a shape based on pixels instead of meters (seems to be the use case?)
 *    added gmaps binds for marker higlights, and general highlights.
 * JN201305 refactored to use a single overlay.  move functions from draw method to solve zoom problem, and multiple
 *    highlights problem.
 *
 * You can add highlights to a map with:
 *    obj.change('highlightAdd',-1, {latitude:#, longitude:#} );
 * You can highlight a marker with:
 *    obj.change('markerHighlight',-1, marker);
 *      marker: that marker object used when creating the marker.  It can have options set at marker.highlight
 *
 * A Highlight object has to have either a <LatLng>Position or a <Number>latitude and <Number>longitude
 * Note the new highlight options = {
 *       radius: 10, // radius in pixels
 *       color: '#777777',
 *       weight: 2,
 *       opacity: 0.7,
 *       behavior: {
 *          draggable: false,
 *          editable: false,
 *       }
 *       opts: { actual google.maps.Circle opts can be put here for super custom cases }
 * }
 */

Drupal.gmap.factory.highlight = function (options) {
    /** @note it could be argued that we use the shapes library to create a circle,
     * but this requires the shapes library be loaded and it would make all highlights
     * repond to shapes events.
     */
    return new google.maps.Circle(options);
}

Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;
    obj.highlights = {};

    /**
     * This is a single overlay that can hold multiple highlight.
     * All highlight shapes will be creted in this overlay, and use
     * it to translate pixel dimensions to meters.
     */
    var highlightOverlay = function () {
        this.highlights = []; // this will hold all of the highlights that we created, in case we need to recalculate/deactivate them
    }
    highlightOverlay.prototype = new google.maps.OverlayView();

    // overlay method for when you .setMap( some map );
    highlightOverlay.prototype.onAdd = function (map) {
    }
    // overlay method for when you .setMap(null);
    highlightOverlay.prototype.onRemove = function () {
        // we have to recalculate radii for all shapes
        var self = this;
        jQuery.each(this.highlights, function (index, highlight) {
            if (highlight.shape.getMap()) { // don't calculate if we don't have a map.
                self.calculateHighlight(highlight); //recalculate all of those radii
            }
        });
    }

    // overlay method executed on any map change methods (zoom/move)
    highlightOverlay.prototype.draw = function () {
        // we have to recalculate radii for all shapes
        var self = this;
        jQuery.each(this.highlights, function (index, highlight) {
            if (highlight.shape.getMap()) { // don't calculate if we don't have a map.
                self.deactivateHighlight(highlight); //recalculate all of those radii
            }
        });
    }

    highlightOverlay.prototype.configHighlight = function (highlight) {
        if (!highlight.opts) {
            highlight.opts = {};
        } // sanity
        if (!highlight.behavior) {
            highlight.behavior = {};
        } // sanity
        if (!highlight.position) {
            highlight.position = new google.maps.LatLng(highlight.latitude, highlight.longitude);
        } // if you have a pos already then use it, otherwise gimme a lat/lon

        jQuery.each({ // collect the options from either the highlight.opts object, from the passed target value, as a behavior or a defaultVal value.
            radius: {target: 'radius', defaultVal: 10}, // radius in pixels
            strokeColor: {target: 'border', defaultVal: '#777777'},
            strokeWeight: {target: 'weight', defaultVal: 2},
            strokeOpacity: {target: 'opacity', defaultVal: 0.7},
            fillColor: {target: 'color', defaultVal: '#777777'},
            fillOpacity: {target: 'opacity', defaultVal: 0.7},
            draggable: {behavior: 'draggable', defaultVal: false},
            editable: {behavior: 'editable', defaultVal: false}
        }, function (key, config) {
            if (highlight.opts[key]) { // options was passed in
                return true;
            }
            else if (config.target && highlight[ config.target ]) { // highight[target] can give us a setting
                highlight.opts[key] = highlight[ config.target ];
            }
            else if (config.behavior && highlight.behavior && highlight.behavior[ config.behavior ]) { // value is a behaviour, should it be enabled?
                highlight.opts[key] = highlight.behavior[ config.behavior ];
            }
            else if (config.defaultVal) { // defaultVal value
                highlight.opts[key] = config.defaultVal;
            }
        });

        highlight.opts.center = highlight.position;
        // note that there is no opts.map, unless you passed one in.  maybe we should make sure that you didn't?

        // add this highlight to our list, so that we can draw it in the draw method (which will also redraw it after map change events.
        this.highlights.push(highlight);
    }
    // determine how big the circle should be in meters (as we were likely passed pixels).  This radius changes on zoom and move events.
    highlightOverlay.prototype.calculateHighlight = function (highlight) { // this nees a better name

        if (highlight.behavior.radiusInMeters) {
            highligh.opts.radiusInMeters = highlight.opts.radius;
        }
        else {
            var mapZoom = this.map.getZoom();
            var projection = this.getProjection();
            var center = projection.fromLatLngToDivPixel(highlight.opts.center, mapZoom);
            var radius = highlight.opts.radius;
            var radial = projection.fromDivPixelToLatLng(new google.maps.Point(center.x, center.y + radius), mapZoom); // find a point that is the radius distance away in pixels from the ccenter point.
            highlight.opts.radiusInMeters = google.maps.geometry.spherical.computeDistanceBetween(highlight.opts.center, radial);
        }

        if (highlight.shape) {
            highlight.shape.setOptions(highlight.opts);
            // we can use this if we don't care about other options changing : highlight.shape.setRadius(highlight.opts.radiusInMeters)
        }
        else {
            highlight.shape = Drupal.gmap.factory.highlight(jQuery.extend({}, highlight.opts, {radius: highlight.opts.radiusInMeters})); // only pass radiusinmeters to g.m.circle.  We keep the pixel radius in case we need to calculate again after a zoom
        }
    }
    highlightOverlay.prototype.activateHighlight = function (highlight) {
        if (!highlight.shape) {
            this.configHighlight(highlight);
            this.calculateHighlight(highlight);
        }
        highlight.shape.setMap(this.map);
    }
    highlightOverlay.prototype.deactivateHighlight = function (highlight) {
        if (highlight.shape) {
            highlight.shape.setMap(null);
        }
    }
    highlightOverlay.prototype.updateHighlight = function (highlight) {
        if (highlight.shape) {
            this.configHighlight(highlight);
            this.calculateHighlight(highlight);
        }
    }

    // prepare a single highlight overlay to be used for all highlights
    obj.bind('init', function (highlight) {
        obj.highlightOverlay = new highlightOverlay(obj.map);
        obj.highlightOverlay.setMap(obj.map); // this will trigger the onAdd() method, and the first draw()
    });

    // set and remove map highlights
    obj.bind('highlightAdd', function (highlight) { // if you activate an activated highlight, nothing happens.
        obj.highlightOverlay.activateHighlight(highlight);
    });
    obj.bind('highlightRemove', function (highlight) {
        obj.highlightOverlay.deactivateHighlight(highlight);
    });
    obj.bind('highlightUpdate', function (highlight) {
        obj.highlightOverlay.updateHighlight(highlight);
    });

    // Marker specific highlight events:
    var highlightedMarkers = []; // remember markers that have been highlighted. so that we can un-highlight them all at one.  The defaultVal behaviour is to allow only 1 marker highlighted at any time.
    obj.bind('markerHighlight', function (marker) {
        highlightedMarkers.push(marker);

        // If the highlight arg option is used in views highlight the marker.
        if (!marker.highlight) {
            marker.highlight = {}
        }
        if (!marker.highlight.color && obj.vars.styles.highlight_color) {
            marker.highlight.color = '#' + obj.vars.styles.highlight_color;
        }
        marker.highlight.position = marker.marker.getPosition();
        obj.change('highlightAdd', -1, marker.highlight);
    });
    obj.bind('markerUnHighlight', function (marker) {
        if (marker.highlight) {
            obj.change('highlightRemove', -1, marker.highlight);
            delete marker.highlight;
        }
    });
    obj.bind('markerUnHighlightActive', function () {
        var marker;
        while (marker = highlightedMarkers.pop()) {
            obj.change('highlightRemove', -1, marker);
        }
        ;
    });

    /**
     * Marker Binds
     *
     * Marker highlight code has been moved to this file from the marker.js
     *
     * Note that we rely on the obj.vars.behavior.highlight var to
     * decide if should highlight markers on events.
     * This decision could be made as an outer if conditional, instead
     * of repeated inside each bind, but this arrangement allows for
     * the behaviour to change, at a small cost.
     */
    obj.bind('addmarker', function (marker) {
        if (obj.vars.behavior.highlight) {
            google.maps.event.addListener(marker.marker, 'mouseover', function () {
                obj.change('markerHighlight', -1, marker);
            });
            google.maps.event.addListener(marker.marker, 'mouseout', function () {
                obj.change('markerUnHighlight', -1, marker);
            });
            google.maps.event.addListener(marker.marker, 'mouseout', function () {
                obj.change('markerUnHighlight', -1, marker);
            });
        }
        // If the highlight arg option is used in views highlight the marker.
        if (marker.opts.highlight == 1) {
            obj.change('markerHighlight', -1, marker);
        }
    });

// Originally I moved mouse highlights to the extra event binds before I realized that there is likely a usecase for highlights without enabling extra events
//   obj.bind('mouseovermarker', function(marker) {
//     if (obj.vars.behavior.highlight && marker) {
//       obj.change('markerHighlight',-1,marker);
//     }
//   });
//   obj.bind('mouseoutmarker', function(marker) {
//     if (obj.vars.behavior.highlight && marker) {
//       obj.change('markerUnHighlight',-1,marker);
//     }
//   });

});
;
/**
 * @file
 * GPolyLine / GPolygon manager
 */

/*global Drupal, GLatLng, GPoint */

Drupal.gmap.map.prototype.poly = {};

/**
 * Distance in pixels between 2 points.
 */
Drupal.gmap.map.prototype.poly.distance = function (point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

/**
 * Circle -- Following projection.
 */
Drupal.gmap.map.prototype.poly.computeCircle = function (obj, center, point2) {
    var numSides = 36;
    var sideInc = 10; // 360 / 20 = 18 degrees
    var convFactor = Math.PI / 180;
    var points = [];
    var radius = obj.poly.distance(center, point2);
    // 36 sided poly ~= circle
    for (var i = 0; i <= numSides; i++) {
        var rad = i * sideInc * convFactor;
        var x = center.x + radius * Math.cos(rad);
        var y = center.y + radius * Math.sin(rad);
        //points.push(obj.map.getCurrentMapType().getProjection().fromPixelToLatLng(new GPoint(x,y),obj.map.getZoom()));
        points.push(new GPoint(x, y));
    }
    return points;
};

Drupal.gmap.map.prototype.poly.calcPolyPoints = function (center, radM, numPoints, sAngle) {
    if (!numPoints) {
        numPoints = 32;
    }
    if (!sAngle) {
        sAngle = 0;
    }

    var d2r = Math.PI / 180.0;
    var r2d = 180.0 / Math.PI;
    var angleRad = sAngle * d2r;
    // earth semi major axis is about 6378137 m
    var latScale = radM / 6378137 * r2d;
    var lngScale = latScale / Math.cos(center.latRadians());

    var angInc = 2 * Math.PI / numPoints;
    var points = [];
    for (var i = 0; i < numPoints; i++) {
        var lat = parseFloat(center.lat()) + latScale * Math.sin(angleRad);
        var lng = parseFloat(center.lng()) + lngScale * Math.cos(angleRad);
        points.push(new GLatLng(lat, lng));
        angleRad += angInc;
    }

    // close the shape and return it
    points.push(points[0]);
    return points;
};
;
/**
 * @file
 * Location chooser interface.
 */

/*global $, Drupal, google.maps */

(function ($) {
    Drupal.gmap.addHandler('gmap', function (elem) {
        var obj = this;

        var binding = obj.bind("locpickchange", function () {
            obj.locpick_invalid = !(obj.locpick_coord && obj.locpick_coord.lat && obj.locpick_coord.lng);// has a proper coord has been set since we last checked
            if (obj.locpick_invalid) {
                return; // invalid coord
            }

            if (!obj.locpick_point) {
                obj.locpick_point = new google.maps.Marker({ // should we use obj.bind('addmarker',-1,{position:obj.locpick_coord}); ?
                    position: obj.locpick_coord,
                    map: obj.map,
                    draggable: true
                });

                google.maps.event.addListener(obj.locpick_point, 'drag', function () {
                    obj.locpick_coord = obj.locpick_point.getPosition();
                    obj.change('locpickchange', binding);
                });
                google.maps.event.addListener(obj.locpick_point, 'dragend', function () {
                    obj.locpick_coord = obj.locpick_point.getPosition();
                    obj.map.panTo(obj.locpick_coord);
                    obj.change('locpickchange', binding);
                });
                obj.map.panTo(obj.locpick_coord);
                obj.change('locpickchange', binding);
            }
            else {
                obj.locpick_point.setPosition(obj.locpick_coord);
            }
        });

        obj.bind("locpickremove", function () {
            if (obj.locpick_point) obj.locpick_point.setMap(null);
            obj.locpick_point = null;
            obj.locpick_coord = null;
            obj.change('locpickchange', -1);
        });

        obj.bind("init", function () {
            if (obj.vars.behavior.locpick) {
                obj.locpick_coord = new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude);

                google.maps.event.addListener(obj.map, "click", function (event) {
                    google.maps.event.trigger(obj.map, "resize");
                    if (event) {
                        obj.locpick_coord = event.latLng;
                        obj.change('locpickchange');
                    }
                    else {
                        // Unsetting the location
                        obj.change('locpickremove');
                    }
                });
            }
        });

        obj.bind("ready", function () {
            // Fake a click to set the initial point, if one was set.
            if (obj.vars.behavior.locpick) {
                if (!obj.locpick_invalid) {
                    obj.locpick_coord = new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude);
                    obj.change('locpickchange');
                }
            }
        });

    });

    Drupal.gmap.addHandler('locpick_latitude', function (elem) {
        var obj = this;

        obj.bind("init", function () {
            if (elem.value !== '') {
                obj.vars.latitude = Number(elem.value);
                obj.locpick_coord = new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude);
            }
            else {
                obj.locpick_coord = null;
                obj.locpick_invalid = true;
            }
        });

        var binding = obj.bind("locpickchange", function () {
            if (obj.locpick_coord) {
                elem.value = obj.locpick_coord.lat();
            }
            else {
                elem.value = '';
            }
        });

        $(elem).change(function () {
            if (elem.value !== '') {
                if (obj.locpick_coord) {
                    obj.locpick_coord = new google.maps.LatLng(Number(elem.value), obj.locpick_coord.lng());
                    obj.change('locpickchange', binding);
                }
                else {
                    obj.locpick_coord = new google.maps.LatLng(Number(elem.value), 0.0);
                }
            }
            else {
                obj.change('locpickremove', -1);
            }
        });
    });

    Drupal.gmap.addHandler('locpick_longitude', function (elem) {
        var obj = this;

        obj.bind("init", function () {
            if (elem.value !== '') {
                obj.vars.longitude = Number(elem.value);
                //obj.locpick_coord = new GLatLng(obj.vars.latitude, obj.vars.longitude);
                obj.locpick_coord = new google.maps.LatLng(obj.vars.latitude, obj.vars.longitude);
            }
            else {
                obj.locpick_invalid = true;
            }
        });

        var binding = obj.bind("locpickchange", function () {
            if (obj.locpick_coord) {
                elem.value = obj.locpick_coord.lng();
            }
            else {
                elem.value = '';
            }
        });

        $(elem).change(function () {
            if (elem.value !== '') {
                if (obj.locpick_coord) {
                    obj.locpick_coord = new google.maps.LatLng(obj.locpick_coord.lat(), Number(elem.value));
                    obj.change('locpickchange', binding);
                }
                else {
                    obj.locpick_coord = new google.maps.LatLng(0.0, Number(elem.value));
                }
            }
            else {
                obj.change('locpickremove');
            }
        });
    });
})(jQuery);
;
