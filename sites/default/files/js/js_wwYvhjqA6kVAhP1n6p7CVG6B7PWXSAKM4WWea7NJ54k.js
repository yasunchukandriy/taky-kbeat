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
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress-wrapper" aria-live="polite"></div>');
  this.element.html('<div id ="' + id + '" class="progress progress-striped active">' +
                    '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                    '<div class="percentage sr-only"></div>' +
                    '</div></div>' +
                    '</div><div class="percentage pull-right"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.progress-bar', this.element).css('width', percentage + '%');
    $('div.progress-bar', this.element).attr('aria-valuenow', percentage);
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="alert alert-block alert-error"><a class="close" data-dismiss="alert" href="#">&times;</a><h4>Error message</h4></div>').append(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;

/**
 * JavaScript behaviors for the front-end display of webforms.
 */

(function ($) {

Drupal.behaviors.webform = Drupal.behaviors.webform || {};

Drupal.behaviors.webform.attach = function(context) {
  // Calendar datepicker behavior.
  Drupal.webform.datepicker(context);

  // Conditional logic.
  if (Drupal.settings.webform && Drupal.settings.webform.conditionals) {
    Drupal.webform.conditional(context);
  }
};

Drupal.webform = Drupal.webform || {};

Drupal.webform.datepicker = function(context) {
  $('div.webform-datepicker').each(function() {
    var $webformDatepicker = $(this);
    var $calendar = $webformDatepicker.find('input.webform-calendar');

    // Ensure the page we're on actually contains a datepicker.
    if ($calendar.length == 0) {
      return;
    }

    var startDate = $calendar[0].className.replace(/.*webform-calendar-start-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
    var endDate = $calendar[0].className.replace(/.*webform-calendar-end-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
    var firstDay = $calendar[0].className.replace(/.*webform-calendar-day-(\d).*/, '$1');
    // Convert date strings into actual Date objects.
    startDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);
    endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);

    // Ensure that start comes before end for datepicker.
    if (startDate > endDate) {
      var laterDate = startDate;
      startDate = endDate;
      endDate = laterDate;
    }

    var startYear = startDate.getFullYear();
    var endYear = endDate.getFullYear();

    // Set up the jQuery datepicker element.
    $calendar.datepicker({
      dateFormat: 'yy-mm-dd',
      yearRange: startYear + ':' + endYear,
      firstDay: parseInt(firstDay),
      minDate: startDate,
      maxDate: endDate,
      onSelect: function(dateText, inst) {
        var date = dateText.split('-');
        $webformDatepicker.find('select.year, input.year').val(+date[0]).trigger('change');
        $webformDatepicker.find('select.month').val(+date[1]).trigger('change');
        $webformDatepicker.find('select.day').val(+date[2]).trigger('change');
      },
      beforeShow: function(input, inst) {
        // Get the select list values.
        var year = $webformDatepicker.find('select.year, input.year').val();
        var month = $webformDatepicker.find('select.month').val();
        var day = $webformDatepicker.find('select.day').val();

        // If empty, default to the current year/month/day in the popup.
        var today = new Date();
        year = year ? year : today.getFullYear();
        month = month ? month : today.getMonth() + 1;
        day = day ? day : today.getDate();

        // Make sure that the default year fits in the available options.
        year = (year < startYear || year > endYear) ? startYear : year;

        // jQuery UI Datepicker will read the input field and base its date off
        // of that, even though in our case the input field is a button.
        $(input).val(year + '-' + month + '-' + day);
      }
    });

    // Prevent the calendar button from submitting the form.
    $calendar.click(function(event) {
      $(this).focus();
      event.preventDefault();
    });
  });
};

Drupal.webform.conditional = function(context) {
  // Add the bindings to each webform on the page.
  $.each(Drupal.settings.webform.conditionals, function(formKey, settings) {
    var $form = $('.' + formKey + ':not(.webform-conditional-processed)');
    $form.each(function(index, currentForm) {
      var $currentForm = $(currentForm);
      $currentForm.addClass('webform-conditional-processed');
      $currentForm.bind('change', { 'settings': settings }, Drupal.webform.conditionalCheck);

      // Trigger all the elements that cause conditionals on this form.
      Drupal.webform.doConditions($form, settings);
    })
  });
};

/**
 * Event handler to respond to field changes in a form.
 *
 * This event is bound to the entire form, not individual fields.
 */
Drupal.webform.conditionalCheck = function(e) {
  var $triggerElement = $(e.target).closest('.webform-component');
  var $form = $triggerElement.closest('form');
  var triggerElementKey = $triggerElement.attr('class').match(/webform-component--[^ ]+/)[0];
  var settings = e.data.settings;
  if (settings.sourceMap[triggerElementKey]) {
    Drupal.webform.doConditions($form, settings);
  }
};

/**
 * Processes all conditional.
 */
Drupal.webform.doConditions = function($form, settings) {
  // Track what has be set/shown for each target component.
  var targetLocked = [];

  $.each(settings.ruleGroups, function(rgid_key, rule_group) {
    var ruleGroup = settings.ruleGroups[rgid_key];

    // Perform the comparison callback and build the results for this group.
    var conditionalResult = true;
    var conditionalResults = [];
    $.each(ruleGroup['rules'], function(m, rule) {
      var elementKey = rule['source'];
      var element = $form.find('.' + elementKey)[0];
      var existingValue = settings.values[elementKey] ? settings.values[elementKey] : null;
      conditionalResults.push(window['Drupal']['webform'][rule.callback](element, existingValue, rule['value'] ));
    });

    // Filter out false values.
    var filteredResults = [];
    for (var i = 0; i < conditionalResults.length; i++) {
      if (conditionalResults[i]) {
        filteredResults.push(conditionalResults[i]);
      }
    }

    // Calculate the and/or result.
    if (ruleGroup['andor'] === 'or') {
      conditionalResult = filteredResults.length > 0;
    }
    else {
      conditionalResult = filteredResults.length === conditionalResults.length;
    }

    $.each(ruleGroup['actions'], function(aid, action) {
      var $target = $form.find('.' + action['target']);
      var actionResult = action['invert'] ? !conditionalResult : conditionalResult;
      switch (action['action']) {
        case 'show':
          if (actionResult != Drupal.webform.isVisible($target)) {
            var $targetElements = actionResult
                                    ? $target.find('.webform-conditional-disabled').removeClass('webform-conditional-disabled')
                                    : $target.find(':input').addClass('webform-conditional-disabled');
            $targetElements.webformProp('disabled', !actionResult);
            $target.toggleClass('webform-conditional-hidden', !actionResult);
            if (actionResult) {
              $target.show();
            }
            else {
              $target.hide();
              // Record that the target was hidden.
              targetLocked[action['target']] = 'hide';
            }
          }
          break;
        case 'require':
          var $requiredSpan = $target.find('.form-required, .form-optional').first();
          if (actionResult != $requiredSpan.hasClass('form-required')) {
            var $targetInputElements = $target.find("input:text,textarea,input[type='email'],select,input:radio,input:file");
            // Rather than hide the required tag, remove it so that other jQuery can respond via Drupal behaviors.
            Drupal.detachBehaviors($requiredSpan);
            $targetInputElements
              .webformProp('required', actionResult)
              .toggleClass('required', actionResult);
            if (actionResult) {
              $requiredSpan.replaceWith('<span class="form-required" title="' + Drupal.t('This field is required.') + '">*</span>');
            }
            else {
              $requiredSpan.replaceWith('<span class="form-optional"></span>');
            }
            Drupal.attachBehaviors($requiredSpan);
          }
          break;
        case 'set':
          var isLocked = targetLocked[action['target']];
          var $texts = $target.find("input:text,textarea,input[type='email']");
          var $selects = $target.find('select,select option,input:radio,input:checkbox');
          if (actionResult) {
            var multiple = $.map(action['argument'].split(','), $.trim);
            $selects.webformVal(multiple);
            $texts.val([action['argument']]);
            // A special case is made for markup. It is sanitized with filter_xss_admin on the server.
            // otherwise text() should be used to avoid an XSS vulnerability. text() however would
            // preclude the use of tags like <strong> or <a>
            $target.filter('.webform-component-markup').html(action['argument']);
          }
          if (!isLocked) {
            // If not previously hidden or set, disable the element readonly or readonly-like behavior.
            $selects.webformProp('disabled', actionResult);
            $texts.webformProp('readonly', actionResult);
            targetLocked[action['target']] = actionResult ? 'set' : false;
          }
          break;
      }
    }); // End look on each action for one conditional
  }); // End loop on each conditional
}

/**
 * Event handler to prevent propogation of events, typically click for disabling
 * radio and checkboxes.
 */
Drupal.webform.stopEvent = function() {
  return false;
}

Drupal.webform.conditionalOperatorStringEqual = function(element, existingValue, ruleValue) {
  var returnValue = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase() === ruleValue.toLowerCase()) {
      returnValue = true;
      return false; // break.
    }
  });
  return returnValue;
};

Drupal.webform.conditionalOperatorStringNotEqual = function(element, existingValue, ruleValue) {
  var found = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase() === ruleValue.toLowerCase()) {
      found = true;
    }
  });
  return !found;
};

Drupal.webform.conditionalOperatorStringContains = function(element, existingValue, ruleValue) {
  var returnValue = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) > -1) {
      returnValue = true;
      return false; // break.
    }
  });
  return returnValue;
};

Drupal.webform.conditionalOperatorStringDoesNotContain = function(element, existingValue, ruleValue) {
  var found = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) > -1) {
      found = true;
    }
  });
  return !found;
};

Drupal.webform.conditionalOperatorStringBeginsWith = function(element, existingValue, ruleValue) {
  var returnValue = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) === 0) {
      returnValue = true;
      return false; // break.
    }
  });
  return returnValue;
};

Drupal.webform.conditionalOperatorStringEndsWith = function(element, existingValue, ruleValue) {
  var returnValue = false;
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  $.each(currentValue, function(n, value) {
    if (value.toLowerCase().lastIndexOf(ruleValue.toLowerCase()) === value.length - ruleValue.length) {
      returnValue = true;
      return false; // break.
    }
  });
  return returnValue;
};

Drupal.webform.conditionalOperatorStringEmpty = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  var returnValue = true;
  $.each(currentValue, function(n, value) {
    if (value !== '') {
      returnValue = false;
      return false; // break.
    }
  });
  return returnValue;
};

Drupal.webform.conditionalOperatorStringNotEmpty = function(element, existingValue, ruleValue) {
  return !Drupal.webform.conditionalOperatorStringEmpty(element, existingValue, ruleValue);
};

Drupal.webform.conditionalOperatorSelectGreaterThan = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  return Drupal.webform.compare_select(currentValue[0], ruleValue, element) > 0;
};

Drupal.webform.conditionalOperatorSelectGreaterThanEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  var comparison = Drupal.webform.compare_select(currentValue[0], ruleValue, element);
  return comparison > 0 || comparison === 0;
};

Drupal.webform.conditionalOperatorSelectLessThan = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  return Drupal.webform.compare_select(currentValue[0], ruleValue, element) < 0;
};

Drupal.webform.conditionalOperatorSelectLessThanEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  var comparison = Drupal.webform.compare_select(currentValue[0], ruleValue, element);
  return comparison < 0 || comparison === 0;
};

Drupal.webform.conditionalOperatorNumericEqual = function(element, existingValue, ruleValue) {
  // See float comparison: http://php.net/manual/en/language.types.float.php
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  var epsilon = 0.000001;
  // An empty string does not match any number.
  return currentValue[0] === '' ? false : (Math.abs(parseFloat(currentValue[0]) - parseFloat(ruleValue)) < epsilon);
};

Drupal.webform.conditionalOperatorNumericNotEqual = function(element, existingValue, ruleValue) {
  // See float comparison: http://php.net/manual/en/language.types.float.php
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  var epsilon = 0.000001;
  // An empty string does not match any number.
  return currentValue[0] === '' ? true : (Math.abs(parseFloat(currentValue[0]) - parseFloat(ruleValue)) >= epsilon);
};

Drupal.webform.conditionalOperatorNumericGreaterThan = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  return parseFloat(currentValue[0]) > parseFloat(ruleValue);
};

Drupal.webform.conditionalOperatorNumericGreaterThanEqual = function(element, existingValue, ruleValue) {
  return Drupal.webform.conditionalOperatorNumericGreaterThan(element, existingValue, ruleValue) ||
         Drupal.webform.conditionalOperatorNumericEqual(element, existingValue, ruleValue);
};

Drupal.webform.conditionalOperatorNumericLessThan = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.stringValue(element, existingValue);
  return parseFloat(currentValue[0]) < parseFloat(ruleValue);
};

Drupal.webform.conditionalOperatorNumericLessThanEqual = function(element, existingValue, ruleValue) {
  return Drupal.webform.conditionalOperatorNumericLessThan(element, existingValue, ruleValue) ||
         Drupal.webform.conditionalOperatorNumericEqual(element, existingValue, ruleValue);
};

Drupal.webform.conditionalOperatorDateEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.dateValue(element, existingValue);
  return currentValue === ruleValue;
};

Drupal.webform.conditionalOperatorDateNotEqual = function(element, existingValue, ruleValue) {
  return !Drupal.webform.conditionalOperatorDateEqual(element, existingValue, ruleValue);
};

Drupal.webform.conditionalOperatorDateBefore = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.dateValue(element, existingValue);
  return (currentValue !== false) && currentValue < ruleValue;
};

Drupal.webform.conditionalOperatorDateBeforeEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.dateValue(element, existingValue);
  return (currentValue !== false) && (currentValue < ruleValue || currentValue === ruleValue);
};

Drupal.webform.conditionalOperatorDateAfter = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.dateValue(element, existingValue);
  return (currentValue !== false) && currentValue > ruleValue;
};

Drupal.webform.conditionalOperatorDateAfterEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.dateValue(element, existingValue);
  return (currentValue !== false) && (currentValue > ruleValue || currentValue === ruleValue);
};

Drupal.webform.conditionalOperatorTimeEqual = function(element, existingValue, ruleValue) {
  var currentValue = Drupal.webform.timeValue(element, existingValue);
  return currentValue === ruleValue;
};

Drupal.webform.conditionalOperatorTimeNotEqual = function(element, existingValue, ruleValue) {
  return !Drupal.webform.conditionalOperatorTimeEqual(element, existingValue, ruleValue);
};

Drupal.webform.conditionalOperatorTimeBefore = function(element, existingValue, ruleValue) {
  // Date and time operators intentionally exclusive for "before".
  var currentValue = Drupal.webform.timeValue(element, existingValue);
  return (currentValue !== false) && (currentValue < ruleValue);
};

Drupal.webform.conditionalOperatorTimeBeforeEqual = function(element, existingValue, ruleValue) {
  // Date and time operators intentionally exclusive for "before".
  var currentValue = Drupal.webform.timeValue(element, existingValue);
  return (currentValue !== false) && (currentValue < ruleValue || currentValue === ruleValue);
};

Drupal.webform.conditionalOperatorTimeAfter = function(element, existingValue, ruleValue) {
  // Date and time operators intentionally inclusive for "after".
  var currentValue = Drupal.webform.timeValue(element, existingValue);
  return (currentValue !== false) && (currentValue > ruleValue);
};

Drupal.webform.conditionalOperatorTimeAfterEqual = function(element, existingValue, ruleValue) {
  // Date and time operators intentionally inclusive for "after".
  var currentValue = Drupal.webform.timeValue(element, existingValue);
  return (currentValue !== false) && (currentValue > ruleValue || currentValue === ruleValue);
};

/**
 * Utility function to compare values of a select component.
 * @param string a
 *   First select option key to compare
 * @param string b
 *   Second select option key to compare
 * @param array options
 *   Associative array where the a and b are within the keys
 * @return integer based upon position of $a and $b in $options
 *   -N if $a above (<) $b
 *   0 if $a = $b
 *   +N if $a is below (>) $b
 */
Drupal.webform.compare_select = function(a, b, element) {
  var optionList = [];
  $('option,input:radio,input:checkbox', element).each(function() {
    optionList.push($(this).val());
  })
  var a_position = optionList.indexOf(a);
  var b_position = optionList.indexOf(b);
  if (a_position < 0 && b_position < 0) {
    return null;
  }
  else if (a_position < 0) {
    return 1;
  }
  else if (b_position < 0) {
    return -1;
  }
  else {
    return a_position - b_position;
  }
}

/**
 * Utility to return current visibility. Uses actual visibility, except for
 * hidden components which use the applied disabled class.
 */
Drupal.webform.isVisible = function($element) {
  return $element.hasClass('webform-component-hidden')
            ? !$element.find('input').first().hasClass('webform-conditional-disabled')
            : $element.closest('.webform-conditional-hidden').length == 0;
}

/**
 * Utility function to get a string value from a select/radios/text/etc. field.
 */
Drupal.webform.stringValue = function(element, existingValue) {
  var value = [];
  if (element) {
    var $element = $(element);
    if (Drupal.webform.isVisible($element)) {
      // Checkboxes and radios.
      $element.find('input[type=checkbox]:checked,input[type=radio]:checked').each(function() {
        value.push(this.value);
      });
      // Select lists.
      if (!value.length) {
        var selectValue = $element.find('select').val();
        if (selectValue) {
          if ($.isArray(selectValue)) {
            value = selectValue;
          }
          else {
            value.push(selectValue);
          }
        }
      }
      // Simple text fields. This check is done last so that the select list in
      // select-or-other fields comes before the "other" text field.
      if (!value.length) {
        $element.find('input:not([type=checkbox],[type=radio]),textarea').each(function() {
          value.push(this.value);
        });
      }
    }
  }
  else {
    switch ($.type(existingValue)) {
      case 'array':
        value = existingValue;
        break;
      case 'string':
        value.push(existingValue);
        break;
    }
  }
  return value;
};

/**
 * Utility function to calculate a millisecond timestamp from a time field.
 */
Drupal.webform.dateValue = function(element, existingValue) {
  var value = false;
  if (element) {
    var $element = $(element);
    if (Drupal.webform.isVisible($element)) {
      var day = $element.find('[name*=day]').val();
      var month = $element.find('[name*=month]').val();
      var year = $element.find('[name*=year]').val();
      // Months are 0 indexed in JavaScript.
      if (month) {
        month--;
      }
      if (year !== '' && month !== '' && day !== '') {
        value = Date.UTC(year, month, day) / 1000;
      }
    }
  }
  else {
    if ($.type(existingValue) === 'array' && existingValue.length) {
      existingValue = existingValue[0];
    }
    if ($.type(existingValue) === 'string') {
      existingValue = existingValue.split('-');
    }
    if (existingValue.length === 3) {
      value = Date.UTC(existingValue[0], existingValue[1], existingValue[2]) / 1000;
    }
  }
  return value;
};

/**
 * Utility function to calculate a millisecond timestamp from a time field.
 */
Drupal.webform.timeValue = function(element, existingValue) {
  var value = false;
  if (element) {
    var $element = $(element);
    if (Drupal.webform.isVisible($element)) {
      var hour = $element.find('[name*=hour]').val();
      var minute = $element.find('[name*=minute]').val();
      var ampm = $element.find('[name*=ampm]:checked').val();

      // Convert to integers if set.
      hour = (hour === '') ? hour : parseInt(hour);
      minute = (minute === '') ? minute : parseInt(minute);

      if (hour !== '') {
        hour = (hour < 12 && ampm == 'pm') ? hour + 12 : hour;
        hour = (hour === 12 && ampm == 'am') ? 0 : hour;
      }
      if (hour !== '' && minute !== '') {
        value = Date.UTC(1970, 0, 1, hour, minute) / 1000;
      }
    }
  }
  else {
    if ($.type(existingValue) === 'array' && existingValue.length) {
      existingValue = existingValue[0];
    }
    if ($.type(existingValue) === 'string') {
      existingValue = existingValue.split(':');
    }
    if (existingValue.length >= 2) {
      value = Date.UTC(1970, 0, 1, existingValue[0], existingValue[1]) / 1000;
    }
  }
  return value;
};

/**
 * Make a prop shim for jQuery < 1.9.
 */
$.fn.webformProp = function(name, value) {
  if (value) {
    $.fn.prop ? this.prop(name, true) : this.attr(name, true);
  }
  else {
    $.fn.prop ? this.prop(name, false) : this.removeAttr(name);
  }
  return this;
}

/**
 * Make a multi-valued val() function for setting checkboxes, radios, and select
 * elements.
 */
$.fn.webformVal = function(values) {
  this.each(function() {
    var $this = $(this);
    var value = $this.val();
    var on = $.inArray($this.val(), values) != -1;
    if (this.nodeName == 'OPTION') {
      $this.webformProp('selected', on ? value : false);
    }
    else {
      $this.val(on ? [value] : false);
    }
  });
  return this;
}

})(jQuery);
;
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
 * @name CSS3 InfoBubble with tabs for Google Maps API V3
 * @version 0.8
 * @author Luke Mahe
 * @fileoverview
 * This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
 * drop shadows and animations. It also allows tabs
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A CSS3 InfoBubble v0.8
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @extends {google.maps.OverlayView}
 * @constructor
 */
function InfoBubble(opt_options) {
  this.extend(InfoBubble, google.maps.OverlayView);
  this.tabs_ = [];
  this.activeTab_ = null;
  this.baseZIndex_ = 100;
  this.isOpen_ = false;

  var options = opt_options || {};

  if (options['backgroundColor'] == undefined) {
    options['backgroundColor'] = this.BACKGROUND_COLOR_;
  }

  if (options['borderColor'] == undefined) {
    options['borderColor'] = this.BORDER_COLOR_;
  }

  if (options['borderRadius'] == undefined) {
    options['borderRadius'] = this.BORDER_RADIUS_;
  }

  if (options['borderWidth'] == undefined) {
    options['borderWidth'] = this.BORDER_WIDTH_;
  }

  if (options['padding'] == undefined) {
    options['padding'] = this.PADDING_;
  }

  if (options['arrowPosition'] == undefined) {
    options['arrowPosition'] = this.ARROW_POSITION_;
  }

  if (options['disableAutoPan'] == undefined) {
    options['disableAutoPan'] = false;
  }

  if (options['disableAnimation'] == undefined) {
    options['disableAnimation'] = false;
  }

  if (options['minWidth'] == undefined) {
    options['minWidth'] = this.MIN_WIDTH_;
  }

  if (options['shadowStyle'] == undefined) {
    options['shadowStyle'] = this.SHADOW_STYLE_;
  }

  if (options['arrowSize'] == undefined) {
    options['arrowSize'] = this.ARROW_SIZE_;
  }

  if (options['arrowStyle'] == undefined) {
    options['arrowStyle'] = this.ARROW_STYLE_;
  }

  this.buildDom_();

  this.setValues(options);
}
window['InfoBubble'] = InfoBubble;


/**
 * Default arrow size
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_SIZE_ = 15;


/**
 * Default arrow style
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_STYLE_ = 0;


/**
 * Default shadow style
 * @const
 * @private
 */
InfoBubble.prototype.SHADOW_STYLE_ = 1;


/**
 * Default min width
 * @const
 * @private
 */
InfoBubble.prototype.MIN_WIDTH_ = 50;


/**
 * Default arrow position
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_POSITION_ = 50;


/**
 * Default padding
 * @const
 * @private
 */
InfoBubble.prototype.PADDING_ = 10;


/**
 * Default border width
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_WIDTH_ = 1;


/**
 * Default border color
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_COLOR_ = '#ccc';


/**
 * Default border radius
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_RADIUS_ = 10;


/**
 * Default background color
 * @const
 * @private
 */
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Builds the InfoBubble dom
 * @private
 */
InfoBubble.prototype.buildDom_ = function() {
  var bubble = this.bubble_ = document.createElement('DIV');
  bubble.style['position'] = 'absolute';
  bubble.style['zIndex'] = this.baseZIndex_;

  var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
  tabsContainer.style['position'] = 'relative';

  // Close button
  var close = this.close_ = document.createElement('IMG');
  close.style['position'] = 'absolute';
  close.style['width'] = this.px(12);
  close.style['height'] = this.px(12);
  close.style['border'] = 0;
  close.style['zIndex'] = this.baseZIndex_ + 1;
  close.style['cursor'] = 'pointer';
  close.src = 'http://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif';

  var that = this;
  google.maps.event.addDomListener(close, 'click', function() {
    that.close();
    google.maps.event.trigger(that, 'closeclick');
  });

  // Content area
  var contentContainer = this.contentContainer_ = document.createElement('DIV');
  contentContainer.style['overflowX'] = 'auto';
  contentContainer.style['overflowY'] = 'auto';
  contentContainer.style['cursor'] = 'default';
  contentContainer.style['clear'] = 'both';
  contentContainer.style['position'] = 'relative';

  var content = this.content_ = document.createElement('DIV');
  contentContainer.appendChild(content);

  // Arrow
  var arrow = this.arrow_ = document.createElement('DIV');
  arrow.style['position'] = 'relative';

  var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
  var arrowInner = this.arrowInner_ = document.createElement('DIV');

  var arrowSize = this.getArrowSize_();

  arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
  arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
  arrowOuter.style['height'] = arrowInner.style['height'] = '0';
  arrowOuter.style['width'] = arrowInner.style['width'] = '0';
  arrowOuter.style['marginLeft'] = this.px(-arrowSize);
  arrowOuter.style['borderWidth'] = this.px(arrowSize);
  arrowOuter.style['borderBottomWidth'] = 0;

  // Shadow
  var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
  bubbleShadow.style['position'] = 'absolute';

  // Hide the InfoBubble by default
  bubble.style['display'] = bubbleShadow.style['display'] = 'none';

  bubble.appendChild(this.tabsContainer_);
  bubble.appendChild(close);
  bubble.appendChild(contentContainer);
  arrow.appendChild(arrowOuter);
  arrow.appendChild(arrowInner);
  bubble.appendChild(arrow);

  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');

  /**
   * The animation for the infobubble
   * @type {string}
   */
  this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

  var css = '.' + this.animationName_ + '{-webkit-animation-name:' +
      this.animationName_ + ';-webkit-animation-duration:0.5s;' +
      '-webkit-animation-iteration-count:1;}' +
      '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
      '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
      '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

  stylesheet.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};


/**
 * Sets the background class name
 *
 * @param {string} className The class name to set.
 */
InfoBubble.prototype.setBackgroundClassName = function(className) {
  this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] =
    InfoBubble.prototype.setBackgroundClassName;


/**
 * changed MVC callback
 */
InfoBubble.prototype.backgroundClassName_changed = function() {
  this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] =
    InfoBubble.prototype.backgroundClassName_changed;


/**
 * Sets the class of the tab
 *
 * @param {string} className the class name to set.
 */
InfoBubble.prototype.setTabClassName = function(className) {
  this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] =
    InfoBubble.prototype.setTabClassName;


/**
 * tabClassName changed MVC callback
 */
InfoBubble.prototype.tabClassName_changed = function() {
  this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] =
    InfoBubble.prototype.tabClassName_changed;


/**
 * Gets the style of the arrow
 *
 * @private
 * @return {number} The style of the arrow.
 */
InfoBubble.prototype.getArrowStyle_ = function() {
  return parseInt(this.get('arrowStyle'), 10) || 0;
};


/**
 * Sets the style of the arrow
 *
 * @param {number} style The style of the arrow.
 */
InfoBubble.prototype.setArrowStyle = function(style) {
  this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] =
    InfoBubble.prototype.setArrowStyle;


/**
 * Arrow style changed MVC callback
 */
InfoBubble.prototype.arrowStyle_changed = function() {
  this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] =
    InfoBubble.prototype.arrowStyle_changed;


/**
 * Gets the size of the arrow
 *
 * @private
 * @return {number} The size of the arrow.
 */
InfoBubble.prototype.getArrowSize_ = function() {
  return parseInt(this.get('arrowSize'), 10) || 0;
};


/**
 * Sets the size of the arrow
 *
 * @param {number} size The size of the arrow.
 */
InfoBubble.prototype.setArrowSize = function(size) {
  this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] =
    InfoBubble.prototype.setArrowSize;


/**
 * Arrow size changed MVC callback
 */
InfoBubble.prototype.arrowSize_changed = function() {
  this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] =
    InfoBubble.prototype.arrowSize_changed;


/**
 * Set the position of the InfoBubble arrow
 *
 * @param {number} pos The position to set.
 */
InfoBubble.prototype.setArrowPosition = function(pos) {
  this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] =
    InfoBubble.prototype.setArrowPosition;


/**
 * Get the position of the InfoBubble arrow
 *
 * @private
 * @return {number} The position..
 */
InfoBubble.prototype.getArrowPosition_ = function() {
  return parseInt(this.get('arrowPosition'), 10) || 0;
};


/**
 * arrowPosition changed MVC callback
 */
InfoBubble.prototype.arrowPosition_changed = function() {
  var pos = this.getArrowPosition_();
  this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

  this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] =
    InfoBubble.prototype.arrowPosition_changed;


/**
 * Set the zIndex of the InfoBubble
 *
 * @param {number} zIndex The zIndex to set.
 */
InfoBubble.prototype.setZIndex = function(zIndex) {
  this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;


/**
 * Get the zIndex of the InfoBubble
 *
 * @return {number} The zIndex to set.
 */
InfoBubble.prototype.getZIndex = function() {
  return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};


/**
 * zIndex changed MVC callback
 */
InfoBubble.prototype.zIndex_changed = function() {
  var zIndex = this.getZIndex();

  this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
  this.close_.style['zIndex'] = zIndex + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;


/**
 * Set the style of the shadow
 *
 * @param {number} shadowStyle The style of the shadow.
 */
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
  this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;


/**
 * Get the style of the shadow
 *
 * @private
 * @return {number} The style of the shadow.
 */
InfoBubble.prototype.getShadowStyle_ = function() {
  return parseInt(this.get('shadowStyle'), 10) || 0;
};


/**
 * shadowStyle changed MVC callback
 */
InfoBubble.prototype.shadowStyle_changed = function() {
  var shadowStyle = this.getShadowStyle_();

  var display = '';
  var shadow = '';
  var backgroundColor = '';
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
    case 1:
      shadow = '40px 15px 10px rgba(33,33,33,0.3)';
      backgroundColor = 'transparent';
      break;
    case 2:
      shadow = '0 0 2px rgba(33,33,33,0.3)';
      backgroundColor = 'rgba(33,33,33,0.35)';
      break;
  }
  this.bubbleShadow_.style['boxShadow'] =
      this.bubbleShadow_.style['webkitBoxShadow'] =
      this.bubbleShadow_.style['MozBoxShadow'] = shadow;
  this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
  if (this.isOpen_) {
    this.bubbleShadow_.style['display'] = display;
    this.draw();
  }
};
InfoBubble.prototype['shadowStyle_changed'] =
    InfoBubble.prototype.shadowStyle_changed;


/**
 * Show the close button
 */
InfoBubble.prototype.showCloseButton = function() {
  this.set('hideCloseButton', false);
};
InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;


/**
 * Hide the close button
 */
InfoBubble.prototype.hideCloseButton = function() {
  this.set('hideCloseButton', true);
};
InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;


/**
 * hideCloseButton changed MVC callback
 */
InfoBubble.prototype.hideCloseButton_changed = function() {
  this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
};
InfoBubble.prototype['hideCloseButton_changed'] =
    InfoBubble.prototype.hideCloseButton_changed;


/**
 * Set the background color
 *
 * @param {string} color The color to set.
 */
InfoBubble.prototype.setBackgroundColor = function(color) {
  if (color) {
    this.set('backgroundColor', color);
  }
};
InfoBubble.prototype['setBackgroundColor'] =
    InfoBubble.prototype.setBackgroundColor;


/**
 * backgroundColor changed MVC callback
 */
InfoBubble.prototype.backgroundColor_changed = function() {
  var backgroundColor = this.get('backgroundColor');
  this.contentContainer_.style['backgroundColor'] = backgroundColor;

  this.arrowInner_.style['borderColor'] = backgroundColor +
      ' transparent transparent';
  this.updateTabStyles_();
};
InfoBubble.prototype['backgroundColor_changed'] =
    InfoBubble.prototype.backgroundColor_changed;


/**
 * Set the border color
 *
 * @param {string} color The border color.
 */
InfoBubble.prototype.setBorderColor = function(color) {
  if (color) {
    this.set('borderColor', color);
  }
};
InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;


/**
 * borderColor changed MVC callback
 */
InfoBubble.prototype.borderColor_changed = function() {
  var borderColor = this.get('borderColor');

  var contentContainer = this.contentContainer_;
  var arrowOuter = this.arrowOuter_;
  contentContainer.style['borderColor'] = borderColor;

  arrowOuter.style['borderColor'] = borderColor +
      ' transparent transparent';

  contentContainer.style['borderStyle'] =
      arrowOuter.style['borderStyle'] =
      this.arrowInner_.style['borderStyle'] = 'solid';

  this.updateTabStyles_();
};
InfoBubble.prototype['borderColor_changed'] =
    InfoBubble.prototype.borderColor_changed;


/**
 * Set the radius of the border
 *
 * @param {number} radius The radius of the border.
 */
InfoBubble.prototype.setBorderRadius = function(radius) {
  this.set('borderRadius', radius);
};
InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;


/**
 * Get the radius of the border
 *
 * @private
 * @return {number} The radius of the border.
 */
InfoBubble.prototype.getBorderRadius_ = function() {
  return parseInt(this.get('borderRadius'), 10) || 0;
};


/**
 * borderRadius changed MVC callback
 */
InfoBubble.prototype.borderRadius_changed = function() {
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderRadius'] =
      this.contentContainer_.style['MozBorderRadius'] =
      this.contentContainer_.style['webkitBorderRadius'] =
      this.bubbleShadow_.style['borderRadius'] =
      this.bubbleShadow_.style['MozBorderRadius'] =
      this.bubbleShadow_.style['webkitBorderRadius'] = this.px(borderRadius);

  this.tabsContainer_.style['paddingLeft'] =
      this.tabsContainer_.style['paddingRight'] =
      this.px(borderRadius + borderWidth);

  this.redraw_();
};
InfoBubble.prototype['borderRadius_changed'] =
    InfoBubble.prototype.borderRadius_changed;


/**
 * Get the width of the border
 *
 * @private
 * @return {number} width The width of the border.
 */
InfoBubble.prototype.getBorderWidth_ = function() {
  return parseInt(this.get('borderWidth'), 10) || 0;
};


/**
 * Set the width of the border
 *
 * @param {number} width The width of the border.
 */
InfoBubble.prototype.setBorderWidth = function(width) {
  this.set('borderWidth', width);
};
InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;


/**
 * borderWidth change MVC callback
 */
InfoBubble.prototype.borderWidth_changed = function() {
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
  this.tabsContainer_.style['top'] = this.px(borderWidth);

  this.updateArrowStyle_();
  this.updateTabStyles_();
  this.borderRadius_changed();
  this.redraw_();
};
InfoBubble.prototype['borderWidth_changed'] =
    InfoBubble.prototype.borderWidth_changed;


/**
 * Update the arrow style
 * @private
 */
InfoBubble.prototype.updateArrowStyle_ = function() {
  var borderWidth = this.getBorderWidth_();
  var arrowSize = this.getArrowSize_();
  var arrowStyle = this.getArrowStyle_();
  var arrowOuterSizePx = this.px(arrowSize);
  var arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth));

  var outer = this.arrowOuter_;
  var inner = this.arrowInner_;

  this.arrow_.style['marginTop'] = this.px(-borderWidth);
  outer.style['borderTopWidth'] = arrowOuterSizePx;
  inner.style['borderTopWidth'] = arrowInnerSizePx;

  // Full arrow or arrow pointing to the left
  if (arrowStyle == 0 || arrowStyle == 1) {
    outer.style['borderLeftWidth'] = arrowOuterSizePx;
    inner.style['borderLeftWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
  }

  // Full arrow or arrow pointing to the right
  if (arrowStyle == 0 || arrowStyle == 2) {
    outer.style['borderRightWidth'] = arrowOuterSizePx;
    inner.style['borderRightWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
  }

  if (arrowStyle < 2) {
    outer.style['marginLeft'] = this.px(-(arrowSize));
    inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
  } else {
    outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
  }

  // If there is no border then don't show thw outer arrow
  if (borderWidth == 0) {
    outer.style['display'] = 'none';
  } else {
    outer.style['display'] = '';
  }
};


/**
 * Set the padding of the InfoBubble
 *
 * @param {number} padding The padding to apply.
 */
InfoBubble.prototype.setPadding = function(padding) {
  this.set('padding', padding);
};
InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;


/**
 * Set the padding of the InfoBubble
 *
 * @private
 * @return {number} padding The padding to apply.
 */
InfoBubble.prototype.getPadding_ = function() {
  return parseInt(this.get('padding'), 10) || 0;
};


/**
 * padding changed MVC callback
 */
InfoBubble.prototype.padding_changed = function() {
  var padding = this.getPadding_();
  this.contentContainer_.style['padding'] = this.px(padding);
  this.updateTabStyles_();

  this.redraw_();
};
InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;


/**
 * Add px extention to the number
 *
 * @param {number} num The number to wrap.
 * @return {string|number} A wrapped number.
 */
InfoBubble.prototype.px = function(num) {
  if (num) {
    // 0 doesn't need to be wrapped
    return num + 'px';
  }
  return num;
};


/**
 * Add events to stop propagation
 * @private
 */
InfoBubble.prototype.addEvents_ = function() {
  // We want to cancel all the events so they do not go to the map
  var events = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
      'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
      'dblclick', 'contextmenu', 'click'];

  var bubble = this.bubble_;
  this.listeners_ = [];
  for (var i = 0, event; event = events[i]; i++) {
    this.listeners_.push(
      google.maps.event.addDomListener(bubble, event, function(e) {
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      })
    );
  }
};


/**
 * On Adding the InfoBubble to a map
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.onAdd = function() {
  if (!this.bubble_) {
    this.buildDom_();
  }

  this.addEvents_();

  var panes = this.getPanes();
  if (panes) {
    panes.floatPane.appendChild(this.bubble_);
    panes.floatShadow.appendChild(this.bubbleShadow_);
  }
};
InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;


/**
 * Draw the InfoBubble
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

  if (!latLng) {
    this.close();
    return;
  }

  var tabHeight = 0;

  if (this.activeTab_) {
    tabHeight = this.activeTab_.offsetHeight;
  }

  var anchorHeight = this.getAnchorHeight_();
  var arrowSize = this.getArrowSize_();
  var arrowPosition = this.getArrowPosition_();

  arrowPosition = arrowPosition / 100;

  var pos = projection.fromLatLngToDivPixel(latLng);
  var width = this.contentContainer_.offsetWidth;
  var height = this.bubble_.offsetHeight;

  if (!width) {
    return;
  }

  // Adjust for the height of the info bubble
  var top = pos.y - (height + arrowSize);

  if (anchorHeight) {
    // If there is an anchor then include the height
    top -= anchorHeight;
  }

  var left = pos.x - (width * arrowPosition);

  this.bubble_.style['top'] = this.px(top);
  this.bubble_.style['left'] = this.px(left);

  var shadowStyle = parseInt(this.get('shadowStyle'), 10);

  switch (shadowStyle) {
    case 1:
      // Shadow is behind
      this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
      this.bubbleShadow_.style['left'] = this.px(left);
      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] =
          this.px(this.contentContainer_.offsetHeight - arrowSize);
      break;
    case 2:
      // Shadow is below
      width = width * 0.8;
      if (anchorHeight) {
        this.bubbleShadow_.style['top'] = this.px(pos.y);
      } else {
        this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
      }
      this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] = this.px(2);
      break;
  }
};
InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;


/**
 * Removing the InfoBubble from a map
 */
InfoBubble.prototype.onRemove = function() {
  if (this.bubble_ && this.bubble_.parentNode) {
    this.bubble_.parentNode.removeChild(this.bubble_);
  }
  if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
    this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
  }

  for (var i = 0, listener; listener = this.listeners_[i]; i++) {
    google.maps.event.removeListener(listener);
  }
};
InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;


/**
 * Is the InfoBubble open
 *
 * @return {boolean} If the InfoBubble is open.
 */
InfoBubble.prototype.isOpen = function() {
  return this.isOpen_;
};
InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;


/**
 * Close the InfoBubble
 */
InfoBubble.prototype.close = function() {
  if (this.bubble_) {
    this.bubble_.style['display'] = 'none';
    // Remove the animation so we next time it opens it will animate again
    this.bubble_.className =
        this.bubble_.className.replace(this.animationName_, '');
  }

  if (this.bubbleShadow_) {
    this.bubbleShadow_.style['display'] = 'none';
    this.bubbleShadow_.className =
        this.bubbleShadow_.className.replace(this.animationName_, '');
  }
  this.isOpen_ = false;
};
InfoBubble.prototype['close'] = InfoBubble.prototype.close;


/**
 * Open the InfoBubble (asynchronous).
 *
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open = function(opt_map, opt_anchor) {
  var that = this;
  window.setTimeout(function() {
    that.open_(opt_map, opt_anchor);
  }, 0);
};

/**
 * Open the InfoBubble
 * @private
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open_ = function(opt_map, opt_anchor) {
  this.updateContent_();

  if (opt_map) {
    this.setMap(opt_map);
  }

  if (opt_anchor) {
    this.set('anchor', opt_anchor);
    this.bindTo('anchorPoint', opt_anchor);
    this.bindTo('position', opt_anchor);
  }

  // Show the bubble and the show
  this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
  var animation = !this.get('disableAnimation');

  if (animation) {
    // Add the animation
    this.bubble_.className += ' ' + this.animationName_;
    this.bubbleShadow_.className += ' ' + this.animationName_;
  }

  this.redraw_();
  this.isOpen_ = true;

  var pan = !this.get('disableAutoPan');
  if (pan) {
    var that = this;
    window.setTimeout(function() {
      // Pan into view, done in a time out to make it feel nicer :)
      that.panToView();
    }, 200);
  }
};
InfoBubble.prototype['open'] = InfoBubble.prototype.open;


/**
 * Set the position of the InfoBubble
 *
 * @param {google.maps.LatLng} position The position to set.
 */
InfoBubble.prototype.setPosition = function(position) {
  if (position) {
    this.set('position', position);
  }
};
InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;


/**
 * Returns the position of the InfoBubble
 *
 * @return {google.maps.LatLng} the position.
 */
InfoBubble.prototype.getPosition = function() {
  return /** @type {google.maps.LatLng} */ (this.get('position'));
};
InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;


/**
 * position changed MVC callback
 */
InfoBubble.prototype.position_changed = function() {
  this.draw();
};
InfoBubble.prototype['position_changed'] =
    InfoBubble.prototype.position_changed;


/**
 * Pan the InfoBubble into view
 */
InfoBubble.prototype.panToView = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.bubble_) {
    // No Bubble yet so do nothing
    return;
  }

  var anchorHeight = this.getAnchorHeight_();
  var height = this.bubble_.offsetHeight + anchorHeight;
  var map = this.get('map');
  var mapDiv = map.getDiv();
  var mapHeight = mapDiv.offsetHeight;

  var latLng = this.getPosition();
  var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
  var pos = projection.fromLatLngToContainerPixel(latLng);

  // Find out how much space at the top is free
  var spaceTop = centerPos.y - height;

  // Fine out how much space at the bottom is free
  var spaceBottom = mapHeight - centerPos.y;

  var needsTop = spaceTop < 0;
  var deltaY = 0;

  if (needsTop) {
    spaceTop *= -1;
    deltaY = (spaceTop + spaceBottom) / 2;
  }

  pos.y -= deltaY;
  latLng = projection.fromContainerPixelToLatLng(pos);

  if (map.getCenter() != latLng) {
    map.panTo(latLng);
  }
};
InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;


/**
 * Converts a HTML string to a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {Node} A HTML document fragment.
 * @private
 */
InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
  htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
  var tempDiv = document.createElement('DIV');
  tempDiv.innerHTML = htmlString;
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Removes all children from the node.
 *
 * @param {Node} node The node to remove all children from.
 * @private
 */
InfoBubble.prototype.removeChildren_ = function(node) {
  if (!node) {
    return;
  }

  var child;
  while (child = node.firstChild) {
    node.removeChild(child);
  }
};


/**
 * Sets the content of the infobubble.
 *
 * @param {string|Node} content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
  this.set('content', content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


/**
 * Get the content of the infobubble.
 *
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
  return /** @type {Node|string} */ (this.get('content'));
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;


/**
 * Sets the marker content and adds loading events to images
 */
InfoBubble.prototype.updateContent_ = function() {
  if (!this.content_) {
    // The Content area doesnt exist.
    return;
  }

  this.removeChildren_(this.content_);
  var content = this.getContent();
  if (content) {
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    this.content_.appendChild(content);

    var that = this;
    var images = this.content_.getElementsByTagName('IMG');
    for (var i = 0, image; image = images[i]; i++) {
      // Because we don't know the size of an image till it loads, add a
      // listener to the image load so the marker can resize and reposition
      // itself to be the correct height.
      google.maps.event.addDomListener(image, 'load', function() {
        that.imageLoaded_();
      });
    }
    google.maps.event.trigger(this, 'domready');
  }
  this.redraw_();
};

/**
 * Image loaded
 * @private
 */
InfoBubble.prototype.imageLoaded_ = function() {
  var pan = !this.get('disableAutoPan');
  this.redraw_();
  if (pan && (this.tabs_.length == 0 || this.activeTab_.index == 0)) {
    this.panToView();
  }
};

/**
 * Updates the styles of the tabs
 * @private
 */
InfoBubble.prototype.updateTabStyles_ = function() {
  if (this.tabs_ && this.tabs_.length) {
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      this.setTabStyle_(tab.tab);
    }
    this.activeTab_.style['zIndex'] = this.baseZIndex_;
    var borderWidth = this.getBorderWidth_();
    var padding = this.getPadding_() / 2;
    this.activeTab_.style['borderBottomWidth'] = 0;
    this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
  }
};


/**
 * Sets the style of a tab
 * @private
 * @param {Element} tab The tab to style.
 */
InfoBubble.prototype.setTabStyle_ = function(tab) {
  var backgroundColor = this.get('backgroundColor');
  var borderColor = this.get('borderColor');
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();
  var padding = this.getPadding_();

  var marginRight = this.px(-(Math.max(padding, borderRadius)));
  var borderRadiusPx = this.px(borderRadius);

  var index = this.baseZIndex_;
  if (tab.index) {
    index -= tab.index;
  }

  // The styles for the tab
  var styles = {
    'cssFloat': 'left',
    'position': 'relative',
    'cursor': 'pointer',
    'backgroundColor': backgroundColor,
    'border': this.px(borderWidth) + ' solid ' + borderColor,
    'padding': this.px(padding / 2) + ' ' + this.px(padding),
    'marginRight': marginRight,
    'whiteSpace': 'nowrap',
    'borderRadiusTopLeft': borderRadiusPx,
    'MozBorderRadiusTopleft': borderRadiusPx,
    'webkitBorderTopLeftRadius': borderRadiusPx,
    'borderRadiusTopRight': borderRadiusPx,
    'MozBorderRadiusTopright': borderRadiusPx,
    'webkitBorderTopRightRadius': borderRadiusPx,
    'zIndex': index,
    'display': 'inline'
  };

  for (var style in styles) {
    tab.style[style] = styles[style];
  }

  var className = this.get('tabClassName');
  if (className != undefined) {
    tab.className += ' ' + className;
  }
};


/**
 * Add user actions to a tab
 * @private
 * @param {Object} tab The tab to add the actions to.
 */
InfoBubble.prototype.addTabActions_ = function(tab) {
  var that = this;
  tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
    that.setTabActive_(this);
  });
};


/**
 * Set a tab at a index to be active
 *
 * @param {number} index The index of the tab.
 */
InfoBubble.prototype.setTabActive = function(index) {
  var tab = this.tabs_[index - 1];

  if (tab) {
    this.setTabActive_(tab.tab);
  }
};
InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;


/**
 * Set a tab to be active
 * @private
 * @param {Object} tab The tab to set active.
 */
InfoBubble.prototype.setTabActive_ = function(tab) {
  if (!tab) {
    this.setContent('');
    this.updateContent_();
    return;
  }

  var padding = this.getPadding_() / 2;
  var borderWidth = this.getBorderWidth_();

  if (this.activeTab_) {
    var activeTab = this.activeTab_;
    activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
    activeTab.style['paddingBottom'] = this.px(padding);
    activeTab.style['borderBottomWidth'] = this.px(borderWidth);
  }

  tab.style['zIndex'] = this.baseZIndex_;
  tab.style['borderBottomWidth'] = 0;
  tab.style['marginBottomWidth'] = '-10px';
  tab.style['paddingBottom'] = this.px(padding + borderWidth);

  this.setContent(this.tabs_[tab.index].content);
  this.updateContent_();

  this.activeTab_ = tab;

  this.redraw_();
};


/**
 * Set the max width of the InfoBubble
 *
 * @param {number} width The max width.
 */
InfoBubble.prototype.setMaxWidth = function(width) {
  this.set('maxWidth', width);
};
InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;


/**
 * maxWidth changed MVC callback
 */
InfoBubble.prototype.maxWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxWidth_changed'] =
    InfoBubble.prototype.maxWidth_changed;


/**
 * Set the max height of the InfoBubble
 *
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxHeight = function(height) {
  this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;


/**
 * maxHeight changed MVC callback
 */
InfoBubble.prototype.maxHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxHeight_changed'] =
    InfoBubble.prototype.maxHeight_changed;


/**
 * Set the min width of the InfoBubble
 *
 * @param {number} width The min width.
 */
InfoBubble.prototype.setMinWidth = function(width) {
  this.set('minWidth', width);
};
InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;


/**
 * minWidth changed MVC callback
 */
InfoBubble.prototype.minWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minWidth_changed'] =
    InfoBubble.prototype.minWidth_changed;


/**
 * Set the min height of the InfoBubble
 *
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinHeight = function(height) {
  this.set('minHeight', height);
};
InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;


/**
 * minHeight changed MVC callback
 */
InfoBubble.prototype.minHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minHeight_changed'] =
    InfoBubble.prototype.minHeight_changed;


/**
 * Add a tab
 *
 * @param {string} label The label of the tab.
 * @param {string|Element} content The content of the tab.
 */
InfoBubble.prototype.addTab = function(label, content) {
  var tab = document.createElement('DIV');
  tab.innerHTML = label;

  this.setTabStyle_(tab);
  this.addTabActions_(tab);

  this.tabsContainer_.appendChild(tab);

  this.tabs_.push({
    label: label,
    content: content,
    tab: tab
  });

  tab.index = this.tabs_.length - 1;
  tab.style['zIndex'] = this.baseZIndex_ - tab.index;

  if (!this.activeTab_) {
    this.setTabActive_(tab);
  }

  tab.className = tab.className + ' ' + this.animationName_;

  this.redraw_();
};
InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;

/**
 * Update a tab at a speicifc index
 *
 * @param {number} index The index of the tab.
 * @param {?string} opt_label The label to change to.
 * @param {?string} opt_content The content to update to.
 */
InfoBubble.prototype.updateTab = function(index, opt_label, opt_content) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  if (opt_label != undefined) {
    tab.tab.innerHTML = tab.label = opt_label;
  }

  if (opt_content != undefined) {
    tab.content = opt_content;
  }

  if (this.activeTab_ == tab.tab) {
    this.setContent(tab.content);
    this.updateContent_();
  }
  this.redraw_();
};
InfoBubble.prototype['updateTab'] = InfoBubble.prototype.updateTab;


/**
 * Remove a tab at a specific index
 *
 * @param {number} index The index of the tab to remove.
 */
InfoBubble.prototype.removeTab = function(index) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  tab.tab.parentNode.removeChild(tab.tab);

  google.maps.event.removeListener(tab.tab.listener_);

  this.tabs_.splice(index, 1);

  delete tab;

  for (var i = 0, t; t = this.tabs_[i]; i++) {
    t.tab.index = i;
  }

  if (tab.tab == this.activeTab_) {
    // Removing the current active tab
    if (this.tabs_[index]) {
      // Show the tab to the right
      this.activeTab_ = this.tabs_[index].tab;
    } else if (this.tabs_[index - 1]) {
      // Show a tab to the left
      this.activeTab_ = this.tabs_[index - 1].tab;
    } else {
      // No tabs left to sho
      this.activeTab_ = undefined;
    }

    this.setTabActive_(this.activeTab_);
  }

  this.redraw_();
};
InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;


/**
 * Get the size of an element
 * @private
 * @param {Node|string} element The element to size.
 * @param {number=} opt_maxWidth Optional max width of the element.
 * @param {number=} opt_maxHeight Optional max height of the element.
 * @return {google.maps.Size} The size of the element.
 */
InfoBubble.prototype.getElementSize_ = function(element, opt_maxWidth,
                                                opt_maxHeight) {
  var sizer = document.createElement('DIV');
  sizer.style['display'] = 'inline';
  sizer.style['position'] = 'absolute';
  sizer.style['visibility'] = 'hidden';

  if (typeof element == 'string') {
    sizer.innerHTML = element;
  } else {
    sizer.appendChild(element.cloneNode(true));
  }

  document.body.appendChild(sizer);
  var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);

  // If the width is bigger than the max width then set the width and size again
  if (opt_maxWidth && size.width > opt_maxWidth) {
    sizer.style['width'] = this.px(opt_maxWidth);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  // If the height is bigger than the max height then set the height and size
  // again
  if (opt_maxHeight && size.height > opt_maxHeight) {
    sizer.style['height'] = this.px(opt_maxHeight);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  document.body.removeChild(sizer);
  delete sizer;
  return size;
};


/**
 * Redraw the InfoBubble
 * @private
 */
InfoBubble.prototype.redraw_ = function() {
  this.figureOutSize_();
  this.positionCloseButton_();
  this.draw();
};


/**
 * Figure out the optimum size of the InfoBubble
 * @private
 */
InfoBubble.prototype.figureOutSize_ = function() {
  var map = this.get('map');

  if (!map) {
    return;
  }

  var padding = this.getPadding_();
  var borderWidth = this.getBorderWidth_();
  var borderRadius = this.getBorderRadius_();
  var arrowSize = this.getArrowSize_();

  var mapDiv = map.getDiv();
  var gutter = arrowSize * 2;
  var mapWidth = mapDiv.offsetWidth - gutter;
  var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
  var tabHeight = 0;
  var width = /** @type {number} */ (this.get('minWidth') || 0);
  var height = /** @type {number} */ (this.get('minHeight') || 0);
  var maxWidth = /** @type {number} */ (this.get('maxWidth') || 0);
  var maxHeight = /** @type {number} */ (this.get('maxHeight') || 0);

  maxWidth = Math.min(mapWidth, maxWidth);
  maxHeight = Math.min(mapHeight, maxHeight);

  var tabWidth = 0;
  if (this.tabs_.length) {
    // If there are tabs then you need to check the size of each tab's content
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      var tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
      var contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);

      if (width < tabSize.width) {
        width = tabSize.width;
      }

      // Add up all the tab widths because they might end up being wider than
      // the content
      tabWidth += tabSize.width;

      if (height < tabSize.height) {
        height = tabSize.height;
      }

      if (tabSize.height > tabHeight) {
        tabHeight = tabSize.height;
      }

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  } else {
    var content = /** @type {string|Node} */ (this.get('content'));
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    if (content) {
      var contentSize = this.getElementSize_(content, maxWidth, maxHeight);

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  }

  if (maxWidth) {
    width = Math.min(width, maxWidth);
  }

  if (maxHeight) {
    height = Math.min(height, maxHeight);
  }

  width = Math.max(width, tabWidth);

  if (width == tabWidth) {
    width = width + 2 * padding;
  }

  arrowSize = arrowSize * 2;
  width = Math.max(width, arrowSize);

  // Maybe add this as a option so they can go bigger than the map if the user
  // wants
  if (width > mapWidth) {
    width = mapWidth;
  }

  if (height > mapHeight) {
    height = mapHeight - tabHeight;
  }

  if (this.tabsContainer_) {
    this.tabHeight_ = tabHeight;
    this.tabsContainer_.style['width'] = this.px(tabWidth);
  }

  this.contentContainer_.style['width'] = this.px(width);
  this.contentContainer_.style['height'] = this.px(height);
};


/**
 *  Get the height of the anchor
 *
 *  This function is a hack for now and doesn't really work that good, need to
 *  wait for pixelBounds to be correctly exposed.
 *  @private
 *  @return {number} The height of the anchor.
 */
InfoBubble.prototype.getAnchorHeight_ = function() {
  var anchor = this.get('anchor');
  if (anchor) {
    var anchorPoint = /** @type google.maps.Point */(this.get('anchorPoint'));

    if (anchorPoint) {
      return -1 * anchorPoint.y;
    }
  }
  return 0;
};

InfoBubble.prototype.anchorPoint_changed = function() {
  this.draw();
};
InfoBubble.prototype['anchorPoint_changed'] = InfoBubble.prototype.anchorPoint_changed;


/**
 * Position the close button in the right spot.
 * @private
 */
InfoBubble.prototype.positionCloseButton_ = function() {
  var br = this.getBorderRadius_();
  var bw = this.getBorderWidth_();

  var right = 2;
  var top = 2;

  if (this.tabs_.length && this.tabHeight_) {
    top += this.tabHeight_;
  }

  top += bw;
  right += bw;

  var c = this.contentContainer_;
  if (c && c.clientHeight < c.scrollHeight) {
    // If there are scrollbars then move the cross in so it is not over
    // scrollbar
    right += 15;
  }

  this.close_.style['right'] = this.px(right);
  this.close_.style['top'] = this.px(top);
};;
/**
 * @file
 * Adds two new methods to the Infobubble.prototype class.
 */

if (typeof InfoBubble === 'function') {
    /* First new method: bubbleBackgroundClassName allows theming of the whole
     popup bubble via css. */
    InfoBubble.prototype.setBubbleBackgroundClassName = function (className) {
        this.contentContainer_.classList.add(className);
    };
    InfoBubble.prototype['setBubbleBackgroundClassName'] =
        InfoBubble.prototype.setBubbleBackgroundClassName;

    /* Second new method: closeImage allows reference to a custom image to
     close the popup window. */
    InfoBubble.prototype.setCloseImage = function (image) {
        this.close_.src = image;
    };
    InfoBubble.prototype['setCloseImage'] =
        InfoBubble.prototype.setCloseImage;

    /* Third new method: closePosition allows you to set the position to something
     other than absolute. */
    InfoBubble.prototype.setClosePosition = function (position) {
        this.close_.style['position'] = position;
    };
    InfoBubble.prototype['setClosePosition'] =
        InfoBubble.prototype.setClosePosition;

    /* Fourth new method: closeWidth allows you to specify a custom close image width */
    InfoBubble.prototype.setCloseWidth = function (width) {
        this.close_.style['width'] = width;
    };
    InfoBubble.prototype['setCloseWidth'] =
        InfoBubble.prototype.setCloseWidth;

    /* Fifth new method: closeHeight allows you to specify a custom close image height */
    InfoBubble.prototype.setCloseHeight = function (height) {
        this.close_.style['height'] = height;
    };
    InfoBubble.prototype['setCloseHeight'] =
        InfoBubble.prototype.setCloseHeight;

    /* Sixth new method: closeBorder allows you to add a border to the close image. */
    InfoBubble.prototype.setCloseBorder = function (border) {
        this.close_.style['border'] = border;
    };
    InfoBubble.prototype['setCloseBorder'] =
        InfoBubble.prototype.setCloseBorder;

    /* Seventh new method: closeZIndex allows you to set a custom zindex for your
     close image. */
    InfoBubble.prototype.setCloseZIndex = function (zIndex) {
        this.close_.style['zIndex'] = zIndex;
    };
    InfoBubble.prototype['setCloseZIndex'] =
        InfoBubble.prototype.setCloseZIndex;

    /* Eighth new method: closeCursor allows you change what your cursor turns
     into on hovering on the close image. */
    InfoBubble.prototype.setCloseCursor = function (cursor) {
        this.close_.style['cursor'] = cursor;
    };
    InfoBubble.prototype['setCloseCursor'] =
        InfoBubble.prototype.setCloseCursor;
}
;
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
