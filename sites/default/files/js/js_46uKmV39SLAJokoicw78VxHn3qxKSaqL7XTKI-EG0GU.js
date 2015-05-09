Drupal.locale = { 'pluralFormula': function ($n) { return Number((((($n%10)==1)&&(($n%100)!=11))?(0):((((($n%10)>=2)&&(($n%10)<=4))&&((($n%100)<10)||(($n%100)>=20)))?(1):2))); }, 'strings': {"":{"Disabled":"\u041e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u043e","Enabled":"\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u043e","Edit":"\u041f\u0440\u0430\u0432\u043a\u0430","Configure":"\u041d\u0430\u0441\u0442\u0440\u043e\u0438\u0442\u044c","Done":"\u0413\u043e\u0442\u043e\u0432\u043e","Show":"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c","Select all rows in this table":"\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0432\u0441\u0435 \u0441\u0442\u0440\u043e\u043a\u0438 \u0442\u0430\u0431\u043b\u0438\u0446\u044b","Deselect all rows in this table":"\u0421\u043d\u044f\u0442\u044c \u043e\u0442\u043c\u0435\u0442\u043a\u0443 \u0441\u043e \u0432\u0441\u0435\u0445 \u043a\u043e\u043b\u043e\u043d\u043e\u043a \u0442\u0430\u0431\u043b\u0438\u0446\u044b","Not published":"\u041d\u0435 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e","Hide":"\u0421\u043a\u0440\u044b\u0442\u044c","By @name on @date":"@name, @date","By @name":"@name","Not in menu":"\u041d\u0435 \u0432 \u043c\u0435\u043d\u044e","Alias: @alias":"\u0421\u0438\u043d\u043e\u043d\u0438\u043c: @alias","No alias":"\u0421\u0438\u043d\u043e\u043d\u0438\u043c \u043d\u0435 \u0437\u0430\u0434\u0430\u043d","New revision":"\u041d\u043e\u0432\u0430\u044f \u0440\u0435\u0434\u0430\u043a\u0446\u0438\u044f","Drag to re-order":"\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u043c\u043e\u0436\u043d\u043e, \u043f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0432 \u043f\u0443\u043d\u043a\u0442 \u043c\u044b\u0448\u043a\u043e\u0439.","Changes made in this table will not be saved until the form is submitted.":"\u0421\u0434\u0435\u043b\u0430\u043d\u043d\u044b\u0435 \u0432 \u0441\u043f\u0438\u0441\u043a\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043d\u0435 \u0432\u0441\u0442\u0443\u043f\u044f\u0442 \u0432 \u0441\u0438\u043b\u0443, \u043f\u043e\u043a\u0430 \u0432\u044b \u043d\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0438\u0445.","The changes to these blocks will not be saved until the \u003Cem\u003ESave blocks\u003C\/em\u003E button is clicked.":"\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f, \u0441\u0434\u0435\u043b\u0430\u043d\u043d\u044b\u0435 \u0432 \u0431\u043b\u043e\u043a\u0430\u0445 \u043d\u0435 \u0432\u0441\u0442\u0443\u043f\u044f\u0442 \u0432 \u0441\u0438\u043b\u0443 \u043f\u043e\u043a\u0430 \u0432\u044b \u043d\u0435 \u043d\u0430\u0436\u043c\u0435\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 \u003Cem\u003E\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u043b\u043e\u043a\u0438\u003C\/em\u003E.","No revision":"\u041d\u0435\u0442 \u0440\u0435\u0434\u0430\u043a\u0446\u0438\u0438","@number comments per page":"@number \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0435\u0432 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443","Not restricted":"\u0411\u0435\u0437 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0439","(active tab)":"(\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u0432\u043a\u043b\u0430\u0434\u043a\u0430)","An AJAX HTTP error occurred.":"\u0412\u043e\u0437\u043d\u0438\u043a\u043b\u0430 AJAX HTTP \u043e\u0448\u0438\u0431\u043a\u0430.","HTTP Result Code: !status":"\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043d\u044b\u0439 \u043a\u043e\u0434 HTTP: !status","An AJAX HTTP request terminated abnormally.":"HTTP \u0437\u0430\u043f\u0440\u043e\u0441 AJAX \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d \u043d\u0435\u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e.","Debugging information follows.":"\u0421\u043b\u0435\u0434\u0443\u0435\u0442 \u043e\u0442\u043b\u0430\u0434\u043e\u0447\u043d\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f.","Path: !uri":"\u041f\u0443\u0442\u044c: !uri","StatusText: !statusText":"\u0422\u0435\u043a\u0441\u0442 \u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f: !statusText","ResponseText: !responseText":"\u0422\u0435\u043a\u0441\u0442 \u041e\u0442\u0432\u0435\u0442\u0430: !responseText","ReadyState: !readyState":"ReadyState: !readyState","Not customizable":"\u041d\u0435 \u043d\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u043c\u044b\u0439","Restricted to certain pages":"\u041e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043e \u0434\u043b\u044f \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0445 \u0441\u0442\u0440\u0430\u043d\u0438\u0446","The block cannot be placed in this region.":"\u0411\u043b\u043e\u043a \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0449\u0451\u043d \u0432 \u044d\u0442\u043e\u043c \u0440\u0435\u0433\u0438\u043e\u043d\u0435.","Customize dashboard":"\u041d\u0430\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u043f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f","Hide summary":"\u0421\u043a\u0440\u044b\u0442\u044c \u0430\u043d\u043e\u043d\u0441","Edit summary":"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0430\u043d\u043e\u043d\u0441","The selected file %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.":"\u0412\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u0444\u0430\u0439\u043b %filename \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d. \u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u0430\u0439\u043b\u043e\u0432 \u0442\u043e\u043b\u044c\u043a\u043e \u0441\u043e \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u043c\u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u044f\u043c\u0438: %extensions.","Re-order rows by numerical weight instead of dragging.":"\u0423\u043f\u043e\u0440\u044f\u0434\u043e\u0447\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0438 \u043f\u043e \u0432\u0435\u0441\u0443 \u0432\u043c\u0435\u0441\u0442\u043e \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u043d\u0438\u044f.","Show row weights":"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0435\u0441 \u0441\u0442\u0440\u043e\u043a","Hide row weights":"\u0421\u043a\u0440\u044b\u0442\u044c \u0432\u0435\u0441 \u0441\u0442\u0440\u043e\u043a","Autocomplete popup":"\u0412\u0441\u043f\u043b\u044b\u0432\u0430\u044e\u0449\u0435\u0435 \u0430\u0432\u0442\u043e\u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435","Searching for matches...":"\u041f\u043e\u0438\u0441\u043a \u0441\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0439...","Show description":"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435","Hide description":"\u0421\u043a\u0440\u044b\u0442\u044c \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435","Breadcrumbs":"\u0421\u0442\u0440\u043e\u043a\u0430 \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438","Translatable":"\u041f\u0435\u0440\u0435\u0432\u043e\u0434\u0438\u043c\u044b\u0439"}} };;
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
 * Attaches behaviors for the Dashboard module.
 */

(function ($) {

/**
 * Implements Drupal.behaviors for the Dashboard module.
 */
Drupal.behaviors.dashboard = {
  attach: function (context, settings) {
    $('#dashboard', context).once(function () {
      $(this).prepend('<div class="customize clearfix"><ul class="action-links"><li><a href="#">' + Drupal.t('Customize dashboard') + '</a></li></ul><div class="canvas"></div></div>');
      $('.customize .action-links a', this).click(Drupal.behaviors.dashboard.enterCustomizeMode);
    });
    Drupal.behaviors.dashboard.addPlaceholders();
    if (Drupal.settings.dashboard.launchCustomize) {
      Drupal.behaviors.dashboard.enterCustomizeMode();
    }
  },

  addPlaceholders: function() {
    $('#dashboard .dashboard-region .region').each(function () {
      var empty_text = "";
      // If the region is empty
      if ($('.block', this).length == 0) {
        // Check if we are in customize mode and grab the correct empty text
        if ($('#dashboard').hasClass('customize-mode')) {
          empty_text = Drupal.settings.dashboard.emptyRegionTextActive;
        } else {
          empty_text = Drupal.settings.dashboard.emptyRegionTextInactive;
        }
        // We need a placeholder.
        if ($('.dashboard-placeholder', this).length == 0) {
          $(this).append('<div class="dashboard-placeholder"></div>');
        }
        $('.dashboard-placeholder', this).html(empty_text);
      }
      else {
        $('.dashboard-placeholder', this).remove();
      }
    });
  },

  /**
   * Enters "customize" mode by displaying disabled blocks.
   */
  enterCustomizeMode: function () {
    $('#dashboard').addClass('customize-mode customize-inactive');
    Drupal.behaviors.dashboard.addPlaceholders();
    // Hide the customize link
    $('#dashboard .customize .action-links').hide();
    // Load up the disabled blocks
    $('div.customize .canvas').load(Drupal.settings.dashboard.drawer, Drupal.behaviors.dashboard.setupDrawer);
  },

  /**
   * Exits "customize" mode by simply forcing a page refresh.
   */
  exitCustomizeMode: function () {
    $('#dashboard').removeClass('customize-mode customize-inactive');
    Drupal.behaviors.dashboard.addPlaceholders();
    location.href = Drupal.settings.dashboard.dashboard;
  },

  /**
   * Sets up the drag-and-drop behavior and the 'close' button.
   */
  setupDrawer: function () {
    $('div.customize .canvas-content input').click(Drupal.behaviors.dashboard.exitCustomizeMode);
    $('div.customize .canvas-content').append('<a class="button" href="' + Drupal.settings.dashboard.dashboard + '">' + Drupal.t('Done') + '</a>');

    // Initialize drag-and-drop.
    var regions = $('#dashboard div.region');
    regions.sortable({
      connectWith: regions,
      cursor: 'move',
      cursorAt: {top:0},
      dropOnEmpty: true,
      items: '> div.block, > div.disabled-block',
      placeholder: 'block-placeholder clearfix',
      tolerance: 'pointer',
      start: Drupal.behaviors.dashboard.start,
      over: Drupal.behaviors.dashboard.over,
      sort: Drupal.behaviors.dashboard.sort,
      update: Drupal.behaviors.dashboard.update
    });
  },

  /**
   * Makes the block appear as a disabled block while dragging.
   *
   * This function is called on the jQuery UI Sortable "start" event.
   *
   * @param event
   *  The event that triggered this callback.
   * @param ui
   *  An object containing information about the item that is being dragged.
   */
  start: function (event, ui) {
    $('#dashboard').removeClass('customize-inactive');
    var item = $(ui.item);

    // If the block is already in disabled state, don't do anything.
    if (!item.hasClass('disabled-block')) {
      item.css({height: 'auto'});
    }
  },

  /**
   * Adapts block's width to the region it is moved into while dragging.
   *
   * This function is called on the jQuery UI Sortable "over" event.
   *
   * @param event
   *  The event that triggered this callback.
   * @param ui
   *  An object containing information about the item that is being dragged.
   */
  over: function (event, ui) {
    var item = $(ui.item);

    // If the block is in disabled state, remove width.
    if ($(this).closest('#disabled-blocks').length) {
      item.css('width', '');
    }
    else {
      item.css('width', $(this).width());
    }
  },

  /**
   * Adapts a block's position to stay connected with the mouse pointer.
   *
   * This function is called on the jQuery UI Sortable "sort" event.
   *
   * @param event
   *  The event that triggered this callback.
   * @param ui
   *  An object containing information about the item that is being dragged.
   */
  sort: function (event, ui) {
    var item = $(ui.item);

    if (event.pageX > ui.offset.left + item.width()) {
      item.css('left', event.pageX);
    }
  },

  /**
   * Sends block order to the server, and expand previously disabled blocks.
   *
   * This function is called on the jQuery UI Sortable "update" event.
   *
   * @param event
   *   The event that triggered this callback.
   * @param ui
   *   An object containing information about the item that was just dropped.
   */
  update: function (event, ui) {
    $('#dashboard').addClass('customize-inactive');
    var item = $(ui.item);

    // If the user dragged a disabled block, load the block contents.
    if (item.hasClass('disabled-block')) {
      var module, delta, itemClass;
      itemClass = item.attr('class');
      // Determine the block module and delta.
      module = itemClass.match(/\bmodule-(\S+)\b/)[1];
      delta = itemClass.match(/\bdelta-(\S+)\b/)[1];

      // Load the newly enabled block's content.
      $.get(Drupal.settings.dashboard.blockContent + '/' + module + '/' + delta, {},
        function (block) {
          if (block) {
            item.html(block);
          }

          if (item.find('div.content').is(':empty')) {
            item.find('div.content').html(Drupal.settings.dashboard.emptyBlockText);
          }

          Drupal.attachBehaviors(item);
        },
        'html'
      );
      // Remove the "disabled-block" class, so we don't reload its content the
      // next time it's dragged.
      item.removeClass("disabled-block");
    }

    Drupal.behaviors.dashboard.addPlaceholders();

    // Let the server know what the new block order is.
    $.post(Drupal.settings.dashboard.updatePath, {
        'form_token': Drupal.settings.dashboard.formToken,
        'regions': Drupal.behaviors.dashboard.getOrder
      }
    );
  },

  /**
   * Returns the current order of the blocks in each of the sortable regions.
   *
   * @return
   *   The current order of the blocks, in query string format.
   */
  getOrder: function () {
    var order = [];
    $('#dashboard div.region').each(function () {
      var region = $(this).parent().attr('id').replace(/-/g, '_');
      var blocks = $(this).sortable('toArray');
      $.each(blocks, function() {
        order.push(region + '[]=' + this);
      });
    });
    order = order.join('&');
    return order;
  }
};

})(jQuery);
;
