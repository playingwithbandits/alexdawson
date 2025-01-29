<?php
    ini_set('memory_limit', '6G');
    header('Content-Type: text/html; charset=utf-8');

    function file_get_contents_curl($url){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Googlebot/2.1 (+http://www.google.com/bot.html)');
        $html = curl_exec($ch); 
        curl_close($ch);
        
        return $html;
    }

    echo file_get_contents_curl($_GET['q']);

?>