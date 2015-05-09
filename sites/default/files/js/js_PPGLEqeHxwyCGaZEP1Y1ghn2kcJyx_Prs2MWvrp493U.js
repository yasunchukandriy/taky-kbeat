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
 * Provide the summary information for the menu attributes vertical tabs.
 */
Drupal.behaviors.menuAttributesOptionsSummary = {
  attach: function (context) {
    // Menu item title.
    $('fieldset#edit-title', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-textarea', context).val();
      if (!value) {
        return Drupal.t('No title');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

    // Menu item ID.
    $('fieldset#edit-id', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No ID');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

    // Menu item name.
    $('fieldset#edit-name', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No name');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

    // Menu item relationship.
    $('fieldset#edit-rel', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No relationship');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

    // Menu item classes.
    $('fieldset#edit-class', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No classes');
      }
      else {
        return Drupal.checkPlain(value.replace(/\s/g, ', '));
      }
    });

    // Menu item style.
    $('fieldset#edit-style', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No style');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

    // Menu item target.
    $('fieldset#edit-target', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }

      var value = $('.form-select option:selected', context).text();
      return Drupal.checkPlain(value);
    });

    // Menu item access key.
    $('fieldset#edit-accesskey', context).drupalSetSummary(function (context) {
      if (!$('input[type="checkbox"]:checked', context).val()) {
        return Drupal.t('Disabled');
      }
      var value = $('.form-text', context).val();
      if (!value) {
        return Drupal.t('No access key');
      }
      else {
        return Drupal.checkPlain(value);
      }
    });

  }
};

})(jQuery);
;
