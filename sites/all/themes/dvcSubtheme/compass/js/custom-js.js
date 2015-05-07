(function($) {
		 Drupal.behaviors.placeHolder = {
			attach: function(context, settings) {
				 //Placeholder
				 var thisForm = $('.webform-client-form .webform-component-textarea'),
						//thisFormInput = thisForm.find('.form-text, .form-textarea, .form-type-textfield, .form-type-textarea');
						//thisFormLabel = thisFormInput.closest('.form-item').find('label');
					
					thisFormInput = thisForm.find('.form-textarea');
					thisFormLabel = thisFormInput.closest('.form-item').find('label');
					
					thisFormLabel.click(function(){
					 $(this).hide();
					 $(this).closest('form-input').find('input, textarea').focus();
					});
					thisFormInput.blur(function() {
					 if ($(this).val() == '') {
						$(this).closest('.form-item').find('label').show();
					 } else {
						$(this).closest('.form-item').find('label').hide();
					 }
					});
					thisFormInput.focus(function(){
					 $(this).closest('.form-item').find('label').hide();
				 });
			}
		 };
		 
		 Drupal.behaviors.isotopMosaic = {
			attach: function(context, settings) {
					
					$('.view-content > .views-row > .vda').parent('.views-row').addClass('steelda');
					var $containerIner = $('.mosaik-preview-inslide > .view-content');
					// init
					$containerIner.isotope({
							 itemSelector: '.views-row.isometr',
							 layoutMode: 'masonry',
							 masonry: {
									 columnWidth: 380,
									 rowHeight: 50,
									 gutter: 13
							 }
					});
					
					var $containera = $('.mosaik-preview > .view-content');
					// init
					$containera.isotope({
							 itemSelector: '.views-row.isometr',
							 layoutMode: 'masonry',
							 masonry: {
									 columnWidth: 408,
									 rowHeight: 50,
									 gutter: 13
							 }
					});
					
					//$containera.isotope( 'insert', $( '.views-row' ) ); 
					
			}
		 };
		 
		 $( document ).ajaxComplete(function() {
					var $container = $('.mosaik-preview > .view-content');
					$container.isotope( 'destroy' );
					// init
					$container.isotope({
							 itemSelector: '.views-row.isometr',
							 layoutMode: 'masonry',
							 masonry: {
									 columnWidth: 408,
									 rowHeight: 50,
									 gutter: 13
							 }
					});
					//$container.isotope( 'appended', $( '.views-row' ) );
					
					var $containerInera = $('.mosaik-preview-inslide > .view-content');
					$containerInera.isotope( 'destroy' );
					// init
					$containerInera.isotope({
							 itemSelector: '.views-row.isometr',
							 layoutMode: 'masonry',
							 masonry: {
									 columnWidth: 380,
									 rowHeight: 50,
									 gutter: 13
							 }
					});
					
					
					//var $inSliderv = $('.mosaik-preview > .view-content .views-row.vertical');
					//$inSliderv.each(function() {
					//		 if ( $(this).find('.original-image').children().length > 2 ) {
					//					$(this).find('.black-image').css('display','none');
					//					$(this).find('.body').css('display','none');
					//					var $initBxv = $(this).find('.original-image');
					//					$initBxv.bxSlider({
					//							 slideMargin: 0,
					//							 minSlides: 1,
					//							 maxSlides: 1,
					//							 auto: true,
					//							 pager: true,
					//							 controls: false,
					//							 moveSlides:1,
					//							 infiniteLoop: true
					//							 
					//					});
					//		 }
					//});
					
					
		 });
		 
		 
		 Drupal.behaviors.videoVertical = {
			attach: function(context, settings) {
					$('.node.node-video .field-name-left-slider .view-video-gallery .view-content .views-row.views-row-first').once(function(){
							 $(this).hide();
						var textTilte =  $(this).find('.title-vid').text();
						$('.node-type-video h1.page-header').text(textTilte);
					});
					var CounId = 1
					$('.node.node-video .field-name-left-slider .view-video-gallery .view-content .views-row').each(function () {
							 $(this).attr('id','item'+CounId);
							 CounId++;
							 //console.log('item'+ CounId);
					});
					$('.node.node-video .field-name-field-video .view-content > .item1').once(function(){
							 $(this).addClass('active');
					});
					$('.node.node-video .field-name-description-text-video .description-text .view-content .item1').once(function(){
					$(this).addClass('active');
					});
					
					if ( $('.field-name-left-slider .view-video-gallery .view-content').children().length > 1 ) {
							 $('.node.node-video .field-name-left-slider .view-video-gallery .view-content .views-row').on( "click", function() {
										var textTilteAll =  $(this).find('.title-vid').text();
										$('.node-type-video h1.page-header').text(textTilteAll);
										$('.node.node-video .field-name-left-slider .view-video-gallery .view-content .views-row').not(this).show();
										
										// here is what I want to do
										$(this).toggle();
										
										
									 var IteId = $(this).attr('id');
										$('.node.node-video .field-name-field-video .view-content > .views-row').removeClass('active');
										$('.node.node-video .field-name-field-video .view-content > .views-row.' +IteId).addClass('active');
										$('.node.node-video .field-name-description-text-video .description-text .view-content .views-row').removeClass('active');
										$('.node.node-video .field-name-description-text-video .description-text .view-content .views-row.' +IteId).addClass('active');
							 });
					}
					
					if ( $('.field-name-left-slider .view-video-gallery .view-content').children().length > 4 ) {
							 var boxslifer= $(this)
							 $('.field-name-left-slider .view-video-gallery .view-content').bxSlider({
										mode: 'vertical',
										slideMargin: 5,
										minSlides: 3,
										maxSlides: 3,
										pager: false,
										slideWidth: 484,
										moveSlides:1,
										infiniteLoop: false
										
							 });
							  $('.node.node-video .field-name-left-slider .view-video-gallery .view-content .views-row').on( "click", function() {
										$('.field-name-left-slider .view-video-gallery .view-content').click(function(e){
												 e.preventDefault();
												 slider.reloadSlider({
												 mode: 'vertical',
												 slideMargin: 5,
												 minSlides: 3,
												 maxSlides: 3,
												 pager: false,
												 slideWidth: 484,
												 moveSlides:1,
												 infiniteLoop: false
										});
									});
								});
					}

		 	}
		 };
		 
		 
		 Drupal.behaviors.sliderMosaiks = {
			attach: function(context, settings) {
					var inSlider = $('.mosaik-preview-inslide > .view-content > .views-row.vertical, .mosaik-preview > .view-content > .views-row.vertical');
					inSlider.each(function() {
							 if ( $(this).find('.original-image').children().length > 2 ) {
										$(this).find('.black-image').css('display','none');
										$(this).find('.body').css('display','none');
										var $initBx = $(this).find('.original-image');
										$initBx.once(function(){
												 $initBx.bxSlider({
															slideMargin: 0,
															minSlides: 1,
															maxSlides: 1,
															auto: true,
															pager: true,
															controls: false,
															moveSlides:1,
															infiniteLoop: true
															
												 });
										});
							 }
							 
							 if ( $(this).find('.original-image').children().length == 1 ) {
										$(this).closest('.views-row.vertical').addClass('animab');
							 }
							 
					});
					
					var inSliderhor = $('.mosaik-preview-inslide > .view-content .views-row.horizontal, .mosaik-preview > .view-content .views-row.horizontal');
							 inSliderhor.each(function() {
										if ( $(this).find('.original-image').children().length == 2 ) {
												 $(this).closest('.views-row.horizontal').addClass('fototwo');
										}
							 });
					
					//var timeoutId;
					//$(".view-content .views-row.horizontal .views-field-field-video-sta .colorbox").hover(function() {
					//		var tHiS =  $(this);
					//		if (!timeoutId) {
					//				timeoutId = window.setTimeout(function() {
					//						timeoutId = null; // EDIT: added this line
					//						tHiS.click();
					//			 }, 1000);
					//		}
					//},
					//function () {
					//		if (timeoutId) {
					//				window.clearTimeout(timeoutId);
					//				timeoutId = null;
					//		}
					//		else {
					//			 
					//		}
					//});
					

		 	}
		 };
		 
		 
		 Drupal.behaviors.placeTitleHide = {
			attach: function(context, settings) {
					if (($(".node .field-name-field-image-to-text").length > 0)){
							 $('.node .field-name-foto-and-video-label-article').css('display','block');
					}
						
					if (($(".node .field-name-field-video-inslide").length > 0)){
							 $('.node .field-name-foto-and-video-label-article').css('display','block');
					}
					if (($(".node .field-name-field-avi-mp4-mpeg-3gp-mkv").length > 0)){
							 $('.node .field-name-foto-and-video-label-article').css('display','block');
					}
					
					
					var inAdSlider = $('.mosaik-preview-inslide > .view-content > .views-row .aved-slider  , .mosaik-preview > .view-content > .views-row .aved-slider ');
					inAdSlider.each(function() {
							 if ( $(this).find('.view-content').children().length > 1 ) {
										var $initBxAd = $(this).find('.view-content');
										$initBxAd.once(function(){
												 $initBxAd.bxSlider({
															slideMargin: 0,
															minSlides: 1,
															maxSlides: 1,
															auto: true,
															pager: true,
															controls: false,
															moveSlides:1,
															infiniteLoop: true
															
												 });
										});
							 }
							 
					});
					
					
			}
		 };
		 
		 Drupal.behaviors.EmptyBodyVie = {
			attach: function(context, settings) {
					$(".views-row.title-right-up  .field-content.tittle-zona .body, .views-row.title-left-up  .field-content.tittle-zona .body").each(function () {
							 var $numWords = $(this).text().length;
							 //var $numWords = $(this)[0].outerText;
							 var $elemBod = $(this);
								 //if ($numWords == 'empty' ) {
								 if ($numWords == 0 ) {  //'empty'
										 $(this).hide();
								 }
								 else {
										$(this).show();
								 }
						 
					});
			}
		 };
		 
})(jQuery);