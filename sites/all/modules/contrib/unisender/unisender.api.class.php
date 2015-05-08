<?php
/**
 * Unisender Api Client
 */
class UnisenderApi
{
    const UNISENDER_URI = 'http://api.unisender.com/ru/api/';

    protected static $instance;

    protected $apiKey;
    protected $lists;

    /**
     * @return UnisenderApi
     */
    public static function getInstance()
    {
        return (self::$instance === null) ?
            self::$instance = new self() :
            self::$instance;
    }

    public function getLists($apiKey = null)
    {
        if (empty($this->lists)) {
            $lists = array();
            $method = 'getLists';
            $vars['api_key'] = $apiKey == null ? $this->apiKey : $apiKey;

            $listsTmp = $this->exec($method, $vars);
            // error
            if (!empty($listsTmp['error'])) {
                unset($this->lists);
                return $listsTmp;
            }

            foreach ($listsTmp['result'] as $list) {
                $lists[$list['id']] = $list['title'];
            }
            $this->lists = $lists;
        }
        return $this->lists;
    }

    static public function getSelectLists($withoutDefault = false)
    {
        $lists = array();
        if (!$withoutDefault) {
            $lists[0] = t('Default list');
        }
        $lists += self::getInstance()->getLists();

        return $lists;
    }

    static public function isEnabled($apiKey, $replace = false)
    {
        $api = new self($apiKey);
        if (empty($api->lists)) {
            return false;
        }

        if ( $replace === true) {
            self::$instance = $api;
        }
        return true;
    }

    public function subscribe($data, $listIds = null)
    {
        $method = 'subscribe';
        $vars = array(
            'api_key' => $this->apiKey,
        );
        if (!empty($listIds)) {
            $vars['list_ids'] = $listIds;
        }
        if (!empty($data['email'])) {
            $vars['fields[email]'] = $data['email'];
        }
        if (!empty($data['phone'])) {
            $vars['fields[phone]'] = $data['phone'];
        }
        if (!empty($data['name'])) {
            $vars['fields[Name]'] = $data['name'];
        }

        $response = $this->exec($method, $vars);
        return $response;
    }

    protected function __construct($apiKey = null)
    {
        $this->apiKey = $apiKey ? : variable_get('unisender_apikey');
        $this->getLists();
    }

    protected function exec($method, $vars)
    {
        $url = self::UNISENDER_URI . $method;
        $vars['format']         = 'json';
        $vars['overwrite']      = 2;
        $vars['double_optin']   = 1;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_MAXREDIRS, 3);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($curl, CURLOPT_USERAGENT, 'HAC');
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $vars);

        $response = curl_exec($curl);
        $response = json_decode($response, 1);
        curl_close($curl);

        if (!empty($response['error'])) {
            return $this->getError($response);
        }

        return $response;
    }

    protected function getError($response)
    {
        $errors = array(
            'invalid_api_key' => _('invalid_api_key'),
        );
        return array(
            'error' => isset($errors[$response['code']]) ? $errors[$response['code']] : $response['error']
        );
    }
}


