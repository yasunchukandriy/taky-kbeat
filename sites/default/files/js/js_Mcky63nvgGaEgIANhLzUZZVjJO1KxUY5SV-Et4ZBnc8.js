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
(function ($) {

/**
 * Webform node form interface enhancments.
 */

Drupal.behaviors.webformAdmin = {};
Drupal.behaviors.webformAdmin.attach = function(context) {
  // On click or change, make a parent radio button selected.
  Drupal.webform.setActive(context);
  Drupal.webform.updateTemplate(context);
  // Update the template select list upon changing a template.
  // Select all link for file extensions.
  Drupal.webform.selectCheckboxesLink(context);
  // Enhance the normal tableselect.js file to support indentations.
  Drupal.webform.tableSelectIndentation(context);
  // Automatically download exports if available.
  Drupal.webform.downloadExport(context);
  // Enhancements for the conditionals administrative page.
  Drupal.webform.conditionalAdmin(context);
  // Trigger radio/checkbox change when label click automatically selected by
  // browser.
  Drupal.webform.radioLabelAutoClick(context);
}

Drupal.webform = Drupal.webform || {};

Drupal.webform.setActive = function(context) {
  var setActiveOnChange = function(e) {
    if ($(this).val()) {
      var $checkbox = $(this).closest('.form-type-radio').find('input[type=radio]');
      $.fn.prop ? $checkbox.prop('checked', true) : $checkbox.attr('checked', true);
    }
    e.preventDefault();
  };
  var setActiveOnClick = function(e) {
    var $checkbox = $(this).closest('.form-type-radio').find('input[type=radio]');
    $.fn.prop ? $checkbox.prop('checked', true) : $checkbox.attr('checked', true);
  };
  $('.webform-inline-radio', context).click(setActiveOnClick);
  $('.webform-set-active', context).change(setActiveOnChange);

  // Firefox improperly selects the parent radio button when clicking inside
  // a label that contains an input field. The only way of preventing this
  // currently is to remove the "for" attribute on the label.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=213519.
  if (navigator.userAgent.match(/Firefox/)) {
    $('.webform-inline-radio', context).removeAttr('for');
  }
};

// Upldate e-mail templates between default and custom.
Drupal.webform.updateTemplate = function(context) {
  var defaultTemplate = $('#edit-templates-default').val();
  var $templateSelect = $('#webform-template-fieldset select#edit-template-option', context);
  var $templateTextarea = $('#webform-template-fieldset textarea:visible', context);

  var updateTemplateSelect = function() {
    if ($(this).val() == defaultTemplate) {
      $templateSelect.val('default');
    }
    else {
      $templateSelect.val('custom');
    }
  }

  var updateTemplateText = function() {
    if ($(this).val() == 'default' && $templateTextarea.val() != defaultTemplate) {
      if (confirm(Drupal.settings.webform.revertConfirm)) {
        $templateTextarea.val(defaultTemplate);
      }
      else {
        $(this).val('custom');
      }
    }
  }

  $templateTextarea.keyup(updateTemplateSelect);
  $templateSelect.change(updateTemplateText);
}

Drupal.webform.selectCheckboxesLink = function(context) {
  function selectCheckboxes() {
    var group = this.className.replace(/.*?webform-select-link-([^ ]*).*/, '$1');
    var $checkboxes = $('.webform-select-group-' + group + ' input[type=checkbox]');
    var reverseCheck = !$checkboxes[0].checked;
    $checkboxes.each(function() {
      this.checked = reverseCheck;
    });
    $checkboxes.trigger('change');
    return false;
  }
  $('a.webform-select-link', context).click(selectCheckboxes);
}

Drupal.webform.tableSelectIndentation = function(context) {
  var $tables = $('th.select-all', context).parents('table');
  $tables.find('input.form-checkbox').change(function() {
    var $rows = $(this).parents('table:first').find('tr');
    var $checkbox;
    var row = $(this).parents('tr:first').get(0);
    var rowNumber = $rows.index(row);
    var rowTotal = $rows.size();
    var indentLevel = $(row).find('div.indentation').size();
    for (var n = rowNumber + 1; n < rowTotal; n++) {
      if ($rows.eq(n).find('div.indentation').size() <= indentLevel) {
        break;
      }
      $checkbox = $rows.eq(n).find('input.form-checkbox');
      $.fn.prop ? $checkbox.prop('checked', this.checked) : $checkbox.attr('checked', this.checked);
    }
  });
}

/**
 * Attach behaviors for Webform results download page.
 */
Drupal.webform.downloadExport = function(context) {
  if (context === document && Drupal.settings && Drupal.settings.webformExport && document.cookie.match(/webform_export_info=1/)) {
    window.location = Drupal.settings.webformExport;
    delete Drupal.settings.webformExport;
  }
}

/**
 * Attach behaviors for Webform conditional administration.
 */
Drupal.webform.conditionalAdmin = function(context) {
  var $context = $(context);
  // Bind to the entire form and allow events to bubble-up from elements. This
  // saves a lot of processing when new conditions are added/removed.
  $context.find('#webform-conditionals-ajax:not(.webform-conditional-processed)')
      .addClass('webform-conditional-processed')
      .bind('change', function(e) {

    var $target = $(e.target);
    if ($target.is('.webform-conditional-source select')) {
      Drupal.webform.conditionalSourceChange.apply(e.target);
    }

    if ($target.is('.webform-conditional-operator select')) {
      Drupal.webform.conditionalOperatorChange.apply(e.target);
    }

    if ($target.is('.webform-conditional-andor select')) {
      Drupal.webform.conditionalAndOrChange.apply(e.target);
    }

    if ($target.is('.webform-conditional-action select')) {
      Drupal.webform.conditionalActionChange.apply(e.target);
    }
  });

  // Add event handlers to delete the entire row if the last rule or action is removed.
  $context.find('.webform-conditional-rule-remove:not(.webform-conditional-processed)').bind('click', function() {
    this.webformRemoveClass = '.webform-conditional-rule-remove';
    window.setTimeout($.proxy(Drupal.webform.conditionalRemove, this), 100);
  }).addClass('webform-conditional-processed');
  $context.find('.webform-conditional-action-remove:not(.webform-conditional-processed)').bind('click', function() {
    this.webformRemoveClass = '.webform-conditional-action-remove';
    window.setTimeout($.proxy(Drupal.webform.conditionalRemove, this), 100);
  }).addClass('webform-conditional-processed');

  // Trigger default handlers on the source element, this in turn will trigger
  // the operator handlers.
  $context.find('.webform-conditional-source select').trigger('change');

  // Trigger defaults handlers on the action element.
  $context.find('.webform-conditional-action select').trigger('change');

  // When adding a new table row, make it draggable and hide the weight column.
  if ($context.is('tr.ajax-new-content') && $context.find('.webform-conditional').length === 1) {
    Drupal.tableDrag['webform-conditionals-table'].makeDraggable($context[0]);
    $context.find('.webform-conditional-weight').closest('td').addClass('tabledrag-hide');
    if ($.cookie('Drupal.tableDrag.showWeight') !== '1') {
      Drupal.tableDrag['webform-conditionals-table'].hideColumns();
    }
    $context.removeClass('ajax-new-content');
  }
}

/**
 * Event callback for the remove button next to an individual rule.
 */
Drupal.webform.conditionalRemove = function() {
  // See if there are any remaining rules in this element.
  var rowCount = $(this).parents('.webform-conditional:first').find(this.webformRemoveClass).length;
  if (rowCount <= 1) {
    var $tableRow = $(this).parents('tr:first');
    var $table = $('#webform-conditionals-table');
    if ($tableRow.length && $table.length) {
      $tableRow.remove();
      Drupal.webform.restripeTable($table[0]);
    }
  }
}

/**
 * Event callback to update the list of operators after a source change.
 */
Drupal.webform.conditionalSourceChange = function() {
  var source = $(this).val();
  var dataType = Drupal.settings.webform.conditionalValues.sources[source]['data_type'];
  var $operator = $(this).parents('.webform-conditional-rule:first').find('.webform-conditional-operator select');

  // Store a the original list of all operators for all data types in the select
  // list DOM element.
  if (!$operator[0]['webformConditionalOriginal']) {
    $operator[0]['webformConditionalOriginal'] = $operator[0].innerHTML;
  }

  // Reference the original list to create a new list matching the data type.
  var $originalList = $($operator[0]['webformConditionalOriginal']);
  var $newList = $originalList.filter('optgroup[label=' + dataType + ']');
  var newHTML = $newList[0].innerHTML;

  // Update the options and fire the change event handler on the list to update
  // the value field, only if the options have changed. This avoids resetting
  // existing selections.
  if (newHTML != $operator.html()) {
    $operator.html(newHTML);
  }
  // Trigger the change in case the source component changed from one select
  // component to another.
  $operator.trigger('change');

}

/**
 * Event callback to update the value field after an operator change.
 */
Drupal.webform.conditionalOperatorChange = function() {
  var source = $(this).parents('.webform-conditional-rule:first').find('.webform-conditional-source select').val();
  var dataType = Drupal.settings.webform.conditionalValues.sources[source]['data_type'];
  var operator = $(this).val();
  var $value = $(this).parents('.webform-conditional-rule:first').find('.webform-conditional-value');
  var name = $value.find('input, select, textarea').attr('name');
  var originalValue = false;

  // Given the dataType and operator, we can determine the form key.
  var formKey = Drupal.settings.webform.conditionalValues.operators[dataType][operator]['form'];
  var formSource = typeof Drupal.settings.webform.conditionalValues.forms[formKey] == 'undefined' ? false : source;

  // On initial request, save the default field as printed on the original page.
  if (!$value[0]['webformConditionalOriginal']) {
    $value[0]['webformConditionalOriginal'] = $value[0].innerHTML;
    originalValue = $value.find('input:first').val();
  }
  // On changes to an existing operator, check if the form key is different
  // (and any per-source form, such as a select option list) before replacing
  // the form with an identical version.
  else if ($value[0]['webformConditionalFormKey'] == formKey && $value[0]['webformConditionalFormSource'] == formSource) {
    return;
  }

  // Store the current form key for checking the next time the operator changes.
  $value[0]['webformConditionalFormKey'] = formKey;
  $value[0]['webformConditionalFormSource'] = formSource;

  // If using the default (a textfield), restore the original field.
  if (formKey === 'default') {
    $value[0].innerHTML = $value[0]['webformConditionalOriginal'];
  }
  // If the operator does not need a source value (i.e. is empty), hide it.
  else if (formKey === false) {
    $value[0].innerHTML = '&nbsp;';
  }
  // If there is a per-source form for this operator (e.g. option lists), use
  // the specialized value form.
  else if (typeof Drupal.settings.webform.conditionalValues.forms[formKey] == 'object') {
    $value[0].innerHTML = Drupal.settings.webform.conditionalValues.forms[formKey][source];
  }
  // Otherwise all the sources use a generic field (e.g. a text field).
  else {
    $value[0].innerHTML = Drupal.settings.webform.conditionalValues.forms[formKey];
  }

  // Set the name attribute to match the original placeholder field.
  var $firstElement = $value.find('input, select, textarea').filter(':first');
  $firstElement.attr('name', name);

  if (originalValue) {
    $firstElement.val(originalValue);
  }
}

/**
 * Event callback to make sure all group and/or operators match.
 */
Drupal.webform.conditionalAndOrChange = function() {
  $(this).parents('.webform-conditional:first').find('.webform-conditional-andor select').val(this.value);
}

/**
 * Event callback to show argument only for appropriate actions.
 */
Drupal.webform.conditionalActionChange = function() {
  var action = $(this).val();
  var $argument = $(this).parents('.webform-conditional:first').find('.webform-conditional-argument input');
  var isShown = $argument.is(':visible');
  switch (action) {
    case 'show':
    case 'require':
      if (isShown) {
        $argument.hide();
      }
      break;
    case 'set':
      if (!isShown) {
        $argument.show();
      }
      break;
  }
}

/**
 * Given a table's DOM element, restripe the odd/even classes.
 */
Drupal.webform.restripeTable = function(table) {
  // :even and :odd are reversed because jQuery counts from 0 and
  // we count from 1, so we're out of sync.
  // Match immediate children of the parent element to allow nesting.
  $('> tbody > tr, > tr', table)
    .filter(':odd').filter('.odd')
      .removeClass('odd').addClass('even')
    .end().end()
    .filter(':even').filter('.even')
      .removeClass('even').addClass('odd');
};

/**
 * Triggers a change event when a label receives a click.
 *
 * When the browser automatically selects a radio button when it's label is
 * clicked, the FAPI states jQuery code doesn't receive an event. This function
 * ensures that automatically-selected radio buttons keep in sync with the
 * FAPI states.
 */
Drupal.webform.radioLabelAutoClick = function(context) {
  $('label').once('webform-label').click(function(){
    $(this).prev('input:radio').change();
  });
}

})(jQuery);
;
(function ($) {

/**
 * Automatically display the guidelines of the selected text format.
 */
Drupal.behaviors.filterGuidelines = {
  attach: function (context) {
    $('.filter-guidelines', context).once('filter-guidelines')
      .find(':header').hide()
      .closest('.filter-wrapper').find('select.filter-list')
      .bind('change', function () {
        $(this).closest('.filter-wrapper')
          .find('.filter-guidelines-item').hide()
          .siblings('.filter-guidelines-' + this.value).show();
      })
      .change();
  }
};

})(jQuery);
;
(function ($) {

Drupal.behaviors.tableSelect = {
  attach: function (context, settings) {
    // Select the inner-most table in case of nested tables.
    $('th.select-all', context).closest('table').once('table-select', Drupal.tableSelect);
  }
};

Drupal.tableSelect = function () {
  // Do not add a "Select all" checkbox if there are no rows with checkboxes in the table
  if ($('td input:checkbox', this).length == 0) {
    return;
  }

  // Keep track of the table, which checkbox is checked and alias the settings.
  var table = this, checkboxes, lastChecked;
  var strings = { 'selectAll': Drupal.t('Select all rows in this table'), 'selectNone': Drupal.t('Deselect all rows in this table') };
  var updateSelectAll = function (state) {
    // Update table's select-all checkbox (and sticky header's if available).
    $(table).prev('table.sticky-header').andSelf().find('th.select-all input:checkbox').each(function() {
      $(this).attr('title', state ? strings.selectNone : strings.selectAll);
      this.checked = state;
    });
  };

  // Find all <th> with class select-all, and insert the check all checkbox.
  $('th.select-all', table).prepend($('<input type="checkbox" class="form-checkbox" />').attr('title', strings.selectAll)).click(function (event) {
    if ($(event.target).is('input:checkbox')) {
      // Loop through all checkboxes and set their state to the select all checkbox' state.
      checkboxes.each(function () {
        this.checked = event.target.checked;
        // Either add or remove the selected class based on the state of the check all checkbox.
        $(this).closest('tr').toggleClass('selected', this.checked);
      });
      // Update the title and the state of the check all box.
      updateSelectAll(event.target.checked);
    }
  });

  // For each of the checkboxes within the table that are not disabled.
  checkboxes = $('td input:checkbox:enabled', table).click(function (e) {
    // Either add or remove the selected class based on the state of the check all checkbox.
    $(this).closest('tr').toggleClass('selected', this.checked);

    // If this is a shift click, we need to highlight everything in the range.
    // Also make sure that we are actually checking checkboxes over a range and
    // that a checkbox has been checked or unchecked before.
    if (e.shiftKey && lastChecked && lastChecked != e.target) {
      // We use the checkbox's parent TR to do our range searching.
      Drupal.tableSelectRange($(e.target).closest('tr')[0], $(lastChecked).closest('tr')[0], e.target.checked);
    }

    // If all checkboxes are checked, make sure the select-all one is checked too, otherwise keep unchecked.
    updateSelectAll((checkboxes.length == $(checkboxes).filter(':checked').length));

    // Keep track of the last checked checkbox.
    lastChecked = e.target;
  });
};

Drupal.tableSelectRange = function (from, to, state) {
  // We determine the looping mode based on the the order of from and to.
  var mode = from.rowIndex > to.rowIndex ? 'previousSibling' : 'nextSibling';

  // Traverse through the sibling nodes.
  for (var i = from[mode]; i; i = i[mode]) {
    // Make sure that we're only dealing with elements.
    if (i.nodeType != 1) {
      continue;
    }

    // Either add or remove the selected class based on the state of the target checkbox.
    $(i).toggleClass('selected', state);
    $('input:checkbox', i).each(function () {
      this.checked = state;
    });

    if (to.nodeType) {
      // If we are at the end of the range, stop.
      if (i == to) {
        break;
      }
    }
    // A faster alternative to doing $(i).filter(to).length.
    else if ($.filter(to, [i]).r.length) {
      break;
    }
  }
};

})(jQuery);
;
