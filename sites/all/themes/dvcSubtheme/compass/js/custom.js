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
}
};
})(jQuery);

