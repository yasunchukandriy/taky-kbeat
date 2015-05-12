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
 
})(jQuery);

