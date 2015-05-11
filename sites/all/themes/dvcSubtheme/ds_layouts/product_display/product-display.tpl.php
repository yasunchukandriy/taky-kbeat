<?php
/**
 * @file
 * Bootstrap template for Display Suite to display a product display page.
 */
?>


<<?php print $layout_wrapper; print $layout_attributes; ?> class="<?php print $classes; ?>">
  <?php if (isset($title_suffix['contextual_links'])): ?>
    <?php print render($title_suffix['contextual_links']); ?>
  <?php endif; ?>
    <?php if ($top): ?>
    <div class="row">
      <<?php print $top_wrapper; ?> class="col-xs-12 <?php print $top_classes; ?>">
        <?php print $top; ?>
      </<?php print $top_wrapper; ?>>
    </div>
  <?php endif; ?>
  <?php if ($center): ?>
    <div class="row">
      <<?php print $center_wrapper; ?> class="col-xs-12 <?php print $center_classes; ?>">
        <?php print $center; ?>
      </<?php print $center_wrapper; ?>>
    </div>
  <?php endif; ?>

  <?php if ($bottom): ?>
    <div class="row">
      <<?php print $bottom_wrapper; ?> class="col-xs-12 <?php print $bottom_classes; ?>">
        <?php print $bottom; ?>
      </<?php print $bottom_wrapper; ?>>
    </div>
  <?php endif; ?>
</<?php print $layout_wrapper ?>>


<!-- Needed to activate display suite support on forms -->
<?php if (!empty($drupal_render_children)): ?>
  <?php print $drupal_render_children ?>
<?php endif; ?>
