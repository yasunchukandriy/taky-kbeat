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
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;

/**
 * @file
 * This file contains the javascript functions used by the google map field
 * widget.
 */

/**
 * Add code to generate the maps on page load.
 */
(function ($) {

  Drupal.behaviors.google_map_field = {
    attach: function (context) {

      googleMapFieldPreviews();

    }
  };

})(jQuery);
;

(function ($) {

  var dialog;
  var google_map_field_map;

  googleMapFieldSetter = function(delta) {

    btns = {};

    btns[Drupal.t('Insert map')] = function () {
      var latlng = google_map_field_map.getCenter();
      var zoom = google_map_field_map.getZoom();
      $('input[data-lat-delta="'+delta+'"]').attr('value', latlng.lat());
      $('input[data-lng-delta="'+delta+'"]').attr('value', latlng.lng());
      $('input[data-zoom-delta="'+delta+'"]').attr('value', zoom);
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-lat', latlng.lat());
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-lng', latlng.lng());
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-zoom', zoom);
      googleMapFieldPreviews();
      $(this).dialog("close");
    };

    btns[Drupal.t('Cancel')] = function () {
      $(this).dialog("close");
    };

    dialogHTML = '';
    dialogHTML += '<div id="google_map_field_dialog">';
    dialogHTML += '  <p>' + Drupal.t('Use the map below to drop a marker at the required location.') + '</p>';
    dialogHTML += '  <div id="gmf_container"></div>';
    dialogHTML += '  <div id="centre_on">';
    dialogHTML += '    <label>Enter an address/town/postcode etc to centre the map on:<input type="text" name="centre_map_on" id="centre_map_on" value=""/></label>';
    dialogHTML += '    <button onclick="return doCentre();" type="button" role="button">find</button>';
    dialogHTML += '    <div id="map_error"></div>';
    dialogHTML += '  </div>';
    dialogHTML += '</div>';

    $('body').append(dialogHTML);

    dialog = $('#google_map_field_dialog').dialog({
      modal: true,
      autoOpen: false,
      width: 750,
      height: 550,
      closeOnEscape: true,
      resizable: false,
      draggable: false,
      title: Drupal.t('Set Map Marker'),
      dialogClass: 'jquery_ui_dialog-dialog',
      buttons: btns,
      close: function(event, ui) {
        $(this).dialog('destroy').remove();
      }
    });

    dialog.dialog('open');

    // Create the map setter map.
    // get the lat/lon from form elements
    var lat = $('input[data-lat-delta="'+delta+'"]').attr('value');
    var lng = $('input[data-lng-delta="'+delta+'"]').attr('value');
    var zoom = $('input[data-zoom-delta="'+delta+'"]').attr('value');

    lat = googleMapFieldValidateLat(lat);
    lng = googleMapFieldValidateLng(lng);

    if (zoom == null || zoom == '') {
      var zoom = '9';
    }

    var latlng = new google.maps.LatLng(lat, lng);
    var mapOptions = {
      zoom: parseInt(zoom),
      center: latlng,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    google_map_field_map = new google.maps.Map(document.getElementById("gmf_container"), mapOptions);

    // drop a marker at the specified lat/lng coords
    marker = new google.maps.Marker({
      position: latlng,
      optimized: false,
      draggable: true,
      map: google_map_field_map
    });

    // add a click listener for marker placement
    google.maps.event.addListener(google_map_field_map, "click", function(event) {
      latlng = event.latLng;
      marker.setMap(null);
      google_map_field_map.panTo(latlng);
      marker = new google.maps.Marker({
        position: latlng,
        optimized: false,
        draggable: true,
        map: google_map_field_map
      });
    });
    google.maps.event.addListener(marker, 'dragend', function(event) {
      google_map_field_map.panTo(event.latLng);
    });
    return false;
  }

  googleMapFieldPreviews = function() {

    $('.google-map-field-preview').each(function() {
      var data_delta = $(this).attr('data-delta');
      var data_name  = $('input[data-name-delta="'+data_delta+'"]').val();
      var data_lat   = $('input[data-lat-delta="'+data_delta+'"]').val();
      var data_lng   = $('input[data-lng-delta="'+data_delta+'"]').val();
      var data_zoom  = $('input[data-zoom-delta="'+data_delta+'"]').val();

      data_lat = googleMapFieldValidateLat(data_lat);
      data_lng = googleMapFieldValidateLng(data_lng);

      if (data_zoom == null || data_zoom == '') {
        var data_zoom = '9';
      }

      var latlng = new google.maps.LatLng(data_lat, data_lng);

      // Create the map preview.
      var mapOptions = {
        zoom: parseInt(data_zoom),
        center: latlng,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      google_map_field_map = new google.maps.Map(this, mapOptions);

      // drop a marker at the specified lat/lng coords
      marker = new google.maps.Marker({
        position: latlng,
        optimized: false,
        map: google_map_field_map
      });

      $('#map_setter_' + data_delta).unbind();
      $('#map_setter_' + data_delta).bind('click', function(event) {
        event.preventDefault();
        googleMapFieldSetter($(this).attr('data-delta'));
      });

    });  // end .each

  }

  googleMapFieldValidateLat = function(lat) {
    lat = parseFloat(lat);
    if (lat >= -180 && lat <= 180) {
      return lat;
    }
    else {
      return '51.524295';
    }
  }

  googleMapFieldValidateLng = function(lng) {
    lng = parseFloat(lng);
    if (lng >= -90 && lng <= 90) {
      return lng;
    }
    else {
      return '-0.127990';
    }
  }

  doCentre = function() {
    var centreOnVal = $('#centre_map_on').val();

    if (centreOnVal == '' || centreOnVal == null) {
      $('#centre_map_on').css("border", "1px solid red");
      $('#map_error').html(Drupal.t('Enter a value in the field provided.'));
      return false;
    }
    else {
      $('#centre_map_on').css("border", "1px solid lightgrey");
      $('#map_error').html('');
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': centreOnVal}, function (result, status) {
      if (status == 'OK') {
        var latlng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        google_map_field_map.panTo(latlng);
        marker.setMap(null);
        marker = new google.maps.Marker({
          position: latlng,
          draggable: true,
          map: google_map_field_map
        });
        google.maps.event.addListener(marker, 'dragend', function(event) {
          google_map_field_map.panTo(event.latLng);
        });
        $('#centre_map_on').val('');
      } else {
        $('#map_error').html(Drupal.t('Could not find location.'));
      }
    });

    return false;

  }

})(jQuery);

;
