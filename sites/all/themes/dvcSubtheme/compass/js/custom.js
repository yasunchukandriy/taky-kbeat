(function ($) {
 Drupal.behaviors.acardioneeCustom = {
  attach: function(context, settings) {
   $('.view-questions-and-answers .view-content').once(function(){
    if ($(".sidebar-content-taxonomy .panel.panel-default .panel-collapse .panel-body .views-field-title a.active" ).hasClass("active")) {
     var $Tyy = $(".view-questions-and-answers .panel.panel-default .panel-collapse .panel-body .views-field-title a.active");
     $Tyy.closest('.panel.panel-default').find('a.accordion-toggle').addClass('activa');
     $Tyy.closest('.panel.panel-default').find('a.accordion-toggle').click();
    }
   });

   $(".view-questions-and-answers .panel.panel-default a.accordion-toggle").on( "click", function() {
         if ($(this).hasClass('activa')) {
     $(".view-questions-and-answers .panel.panel-default a.accordion-toggle").removeClass('activa');
     }
     else {
     $(".view-questions-and-answers .panel.panel-default a.accordion-toggle").removeClass('activa');
    $(this).addClass('activa');
    }
   });

   if ($('body').hasClass('node-type-news')) {
    $('ul.menu.nav li.news a').addClass('active');
   }
   if ($('body').hasClass('node-type-services')) {
    $('ul.menu.nav li.services a').addClass('active');
   }
  }
 };
 
 
Drupal.behaviors.footerIfIeCustom = {
  attach: function(context, settings) {
  
    var HeightFoo = $('body > footer');
    $(HeightFoo).outerHeight( true );
    var pxH = $(HeightFoo).outerHeight( true );
    //alert(pxH);
    //console.log(pxH)
    $('body').css('position','relative');
    HeightFoo.css('position','absolute');
    $('body').css('padding-bottom',pxH);
    
    
  
  }
};

Drupal.behaviors.siteMap = {
  attach: function(context, settings) {
    var HeightFoo = $('ul.dropdown-menu');
    $('.page-site-map .region-content .menu').find( 'ul.dropdown-menu').removeClass('dropdown-menu');
  }
};


Drupal.behaviors.servisesUnited = {
  attach: function(context, settings) {
    $('.region-footer ul.menu li ul').remove();
    $('.region-footer ul.menu li.dropdown a').removeAttr('data-target');
    $('.region-footer ul.menu li.dropdown a').removeAttr('dropdown');
    $('.region-footer ul.menu li.dropdown a').removeAttr('data-toggle');
    $('.region-footer ul.menu li span.caret').remove();
    $('.region-footer ul.menu li').removeClass('expanded dropdown');
    $('.node-type-services .field-name-field-add-file, .node-type-services  .field-name-field-links').wrapAll( "<div class='newwrapper' />");

    if ($('.view-questions-and-answers').length > 0) {
      $('.view-questions-and-answers .view-content .panel.panel-default:first-child a').click();
    }
    // $('.node-type-services.i18n-ru .field-name-field-add-file a').each(function(){
    //   $(this).text('Скачать перечень документов');
    // });
    // $('.node-type-services.i18n-en .field-name-field-add-file a').each(function(){
    //   $(this).text('Download the list of documents');
    // });
    
    // $('.node-type-services.i18n-ru .field-name-field-links .field-item a').each(function(){
    //   $(this).text('Таможенный реестр на сайте ГТС РК');
    // });
    // $('.node-type-services.i18n-en .field-name-field-links .field-item a').each(function(){
    //   $(this).text('Customs Register online CTA RK');
    // });
    
    
    
  }
};

 
})(jQuery);

