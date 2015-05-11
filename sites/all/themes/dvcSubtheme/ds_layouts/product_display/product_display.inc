<?php
function ds_product_display() {
  return array(
    'label' => t('Product Display'),
    'regions' => array(
      'top' => t('Top'),
      'center' => t('Center'),
      // 'topright1' => t('Upper Right 1'),
      // 'topright2' => t('Upper Right 2'),
      // 'bottomright' => t('Lower Right'),
      'bottom' => t('Bottom'),
    ),
    'image' => FALSE,
  );
}
