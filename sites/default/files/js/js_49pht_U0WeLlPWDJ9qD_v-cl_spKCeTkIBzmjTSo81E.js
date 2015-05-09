(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').once().before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;

/**
 * @file
 * This file contains the javascript functions used to display a map when the
 * entity it is attached to is displayed.
 */

/**
 * Declare global variable by which to identify the map.
 */
var google_map_field_map;

/**
 * Add code to generate the map on page load.
 */
(function ($) {
  Drupal.behaviors.google_map_field = {
    attach: function (context) {
      googleMapFieldNodeDisplay();
    }
  };

  googleMapFieldNodeDisplay = function() {
    $(".google_map_field_display").each(function(index, item) {

      // Get the settings for the map from the Drupal.settings object.
      var lat = $(this).attr('data-lat');
      var lon = $(this).attr('data-lng');
      var zoom = parseInt($(this).attr('data-zoom'));

      // Create the map coords and map options.
      var latlng = new google.maps.LatLng(lat, lon);
      var mapOptions = {
        zoom: zoom,
        center: latlng,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      google_map_field_map = new google.maps.Map(this, mapOptions);

      google.maps.event.trigger(google_map_field_map, 'resize')

      // Drop a marker at the specified position.
      marker = new google.maps.Marker({
        position: latlng,
        optimized: false,
        map: google_map_field_map
      });

    });
  }

})(jQuery);
;
