<?php
/**
 * @file views-bootstrap-thumbnail-plugin-style.tpl.php
 * Default simple view template to display Bootstrap Thumbnails.
 *
 * - $rows contains a nested array of rows. Each row contains an array of
 *   columns.
 * - $column_type contains a number (default Bootstrap grid system column type).
 * - $class_prefix defines the default prefix to use for column classes.
 *
 * @ingroup views_templates
 */
?>

<?php if (!empty($title)): ?>
  <h3><?php print $title ?></h3>
<?php endif ?>

<div id="views-bootstrap-thumbnail-<?php print $id ?>" class="<?php print $classes ?>">
  <?php if ($options['alignment'] == 'horizontal'): ?>

    <?php foreach ($items as $row): ?>
      <div class="row">
        <?php foreach ($row['content'] as $column): ?>
          <?php
          $class_col = '';
          $pos = strpos($column['content'], 'views-field-field-format');

          if ($pos === FALSE) {
          } else {
            $column['content'] = trim($column['content']);
            preg_match_all('#<div class="views-field views-field-field-format">(.+?)</div>#is', $column['content'], $val_parse);
            if (!empty($val_parse[1])) {
              $val = $val_parse[1];
              $val = explode('>', $val[0]);
              $class_col = $val[1];
            }
          }

          ?>
          <div class="col <?php print $class_prefix ?>-<?php print $column_type ?> <?php print $class_col; ?>">
            <div class="thumbnail">
              <?php print $column['content'] ?>
            </div>
          </div>
        <?php endforeach ?>
      </div>
    <?php endforeach ?>

  <?php else: ?>

    <div class="row">
      <?php foreach ($items as $column): ?>
        <div class="col <?php print $class_prefix ?>-<?php print $column_type ?>">
          <?php foreach ($column['content'] as $row): ?>
            <div class="thumbnail">
              <?php print $row['content'] ?>
            </div>
          <?php endforeach ?>
        </div>
      <?php endforeach ?>
    </div>

  <?php endif ?>
</div>
