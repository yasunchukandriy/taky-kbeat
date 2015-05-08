<?php
/** CONNECTION */

/**
 * Config Connection form
 * @return mixed
 */
function unisender_config_connection()
{
    $form['unisender_apikey'] = array(
        '#type'     => 'textfield',
        '#title'    => t('Unisender API Key'),
        '#size'     => 33,
        '#required' => true,
        '#description'      => t('This key you can find on <a href="http://cp.unisender.com/ru/v5/user/info/api" target="_blank">Unisender account page</a>'),
        '#default_value'    => variable_get('unisender_apikey'),
    );

    $apiKey = variable_get('unisender_apikey');
    if (!empty($apiKey)) {
        $form['unisender_default_list'] = array(
            '#type'     => 'select',
            '#title'    => t('Default List'),
            '#required' => true,
            '#options'  => UnisenderApi::getSelectLists(true),
            '#description'      => t('List used by default'),
            '#default_value'    => variable_get('unisender_default_list'),
        );
    }

    return system_settings_form($form);
}

/**
 * Validate Config Connection form
 *
 * @param $form
 * @param $form_state
 */
function unisender_config_connection_validate($form, &$form_state)
{
    $newApiKey = $form_state['values']['unisender_apikey'];
    $apiKey = variable_get('unisender_apikey');
    $defaultListId = !empty($form_state['values']['unisender_default_list'])
        ? $form_state['values']['unisender_default_list']
        : null;

    if (empty($apiKey) || $apiKey !== $newApiKey) {
        if (!UnisenderApi::isEnabled($newApiKey, true)) {
            form_set_error('unisender_apikey', t('This Key is incorrect or your API is disabled'));
        }
    }
    if (!empty($apiKey) && (empty($defaultListId) || !is_numeric($defaultListId))) {
        form_set_error('unisender_default_list', t('Default list is required'));
    }
}

/** FORM */

/**
 * Config Form form
 * @return mixed
 */
function unisender_config_form()
{
    drupal_add_css(unisender_getModuleUrl() . 'css/admin.css');

    checkSettings();

    $form['general'] = array(
        '#type'     => 'fieldset',
        '#title'    => t('GENERAL'),
        '#weight'   => 5,
        '#collapsible'  => false,
        '#collapsed'    => false,
        '#attributes'   => array('class' => array('unisender_fieldset')),
    );
    // Is form enabled
    $form['general']['unisender_form_general_enabled'] = array(
        '#type' => 'checkbox',
        '#title' => t('Display the subscription form'),
        '#default_value' => variable_get('unisender_form_general_enabled', false),
    );
    // Form List Id
    $form['general']['unisender_form_general_list'] = array(
        '#type' => 'select',
        '#title' => t('List used with form'),
        '#options' => UnisenderApi::getSelectLists(),
        '#default_value' => variable_get('unisender_form_general_list', 0),
    );
    // List of fields
    $form['general']['unisender_form_general_fields'] = array(
        '#type'     => 'checkboxes',
        '#title'    => t('Form fields'),
        '#options'  => array(
            'email'     => t('E-mail'),
            'phone'     => t('Phone'),
            'name'      => t('Name'),
        ),
        '#default_value' => variable_get('unisender_form_general_fields', array()),
    );

    $form['display'] = array(
        '#type'     => 'fieldset',
        '#title'    => t('DISPLAY'),
        '#weight'   => 10,
        '#collapsible'  => false,
        '#collapsed'    => false,
        '#attributes'   => array('class' => array('unisender_fieldset')),
    );
    // Block Title
    $form['display']['unisender_form_display_title'] = array(
        '#type'     => 'textfield',
        '#title'    => t('Form Title'),
        '#default_value' => variable_get('unisender_form_display_title', t('Subscribe')),
    );
    // Required fields
    $form['display']['unisender_form_display_required_field'] = array(
        '#type'     => 'radios',
        '#title'    => t('Required fields'),
        '#required' => TRUE,
        '#options'  => array(
            'both'      => t('Both'),
            'email'     => t('Only E-mail'),
            'phone'     => t('Only Phone'),
        ),
        '#default_value' => variable_get('unisender_form_display_required_field', 'email'),
    );
    // Show labels and placeholders
    $form['display']['unisender_form_display_caption'] = array(
        '#type'     => 'radios',
        '#title'    => t('Enable labels or placeholders'),
        '#required' => TRUE,
        '#options'  => array(
            'both'          => t('Both'),
            'label'         => t('Only label'),
            'placeholder'   => t('Only placeholder'),
        ),
        '#default_value' => variable_get('unisender_form_display_caption', 'placeholder'),
    );

    $form['clear'] = array(
        '#type'     => 'fieldset',
        '#weight'   => 95,
        '#attributes'   => array('class' => array('clear')),
    );

    return system_settings_form($form);
}

/**
 * Validate Config Form form
 * @param $form
 * @param $form_state
 */
function unisender_config_form_validate($form, &$form_state)
{
    // If Empty fields
    if (!is_string($form_state['values']['unisender_form_general_fields']['email'])
        && !is_string($form_state['values']['unisender_form_general_fields']['phone'])) {
        form_set_error('general', t('You can\'t disable both required fields'));
    }

    // If Required field disabled
    $required = $form_state['values']['unisender_form_display_required_field'];
    $isEmail = is_string($form_state['values']['unisender_form_general_fields']['email']);
    $isPhone = is_string($form_state['values']['unisender_form_general_fields']['phone']);

    if ( ($isEmail && in_array($required, array('both', 'email')))
        || ($isPhone && in_array($required, array('both', 'phone'))) ) {
    } else {
        form_set_error('general', t('You chosen required field and disable them'));
    }
}

/** REGISTRATION */

/**
 * Config Registration form
 * @return mixed
 */
function unisender_config_registration()
{
    checkSettings();

    // Enable/disable subs on registration
    $form['unisender_registration_enabled'] = array(
        '#type'     => 'checkbox',
        '#title'    => t('Enable subscription on registration'),
        '#default_value'    => variable_get('unisender_registration_enabled', false),
    );

    // Enable/disable checkbox on registration page
    $form['unisender_registration_hide_checkbox'] = array(
        '#type'     => 'checkbox',
        '#title'    => t('Show checkbox about subscription'),
        '#default_value'    => variable_get('unisender_registration_hide_checkbox', true),
        '#description'      => t('If disabled, user will be subscribed automatically'),
    );

    // List Id
    $form['general']['unisender_registration_list'] = array(
        '#type' => 'select',
        '#title' => t('List used with registration'),
        '#options' => UnisenderApi::getSelectLists(),
        '#default_value' => variable_get('unisender_registration_list', 0),
    );

    return system_settings_form($form);
}
