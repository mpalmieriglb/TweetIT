<?php
ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
$settings = array(
    'oauth_access_token' => "1037299597-OvRx7N5YjeCSmY9mrX5pyNeq7GmXXYVPZRqcs3a",
    'oauth_access_token_secret' => "DW776xlpXaBjotlyV52ZzzGxqbzoVQTYUkaPYYIbc",
    'consumer_key' => "wUhKqsC63P6Eevq2YSSFA",
    'consumer_secret' => "AOuZPfttnGIOvFYFccDZLK5ohJAtnjrDNNmQHhzs"
);

/** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
$url = 'https://api.twitter.com/1.1/blocks/create.json';
$requestMethod = 'POST';

/** POST fields required by the URL above. See relevant docs as above **/
$postfields = array(
    'screen_name' => 'usernameToBlock', 
    'skip_status' => '1'
);

$query = $_GET['searchquery'];
$count = $_GET['count'];
$result_type = $_GET['result_type'];
$since_id = $_GET['since_id'];
$max_id = $_GET['max_id'];




$query = urldecode($query);

$query = str_replace(' ', '+', $query);

//echo 'SINCE......' . $since_id . '---' . $max_id . '<br />';

if( (isset($max_id)) && ($max_id === true))
{
     $queryURL = '?q='. $query . '&result_type=' . $result_type . '&count=' . $count . '&since_id' . $since_id . '&max_id='. $max_id;
    // echo $queryURL;
}
else
{
	$queryURL = '?q='. $query . '&result_type=' . $result_type . '&count=' . $count;
   // echo $queryURL;
}

/** Perform a POST request and echo the response *
$twitter = new TwitterAPIExchange($settings);
echo $twitter->buildOauth($url, $requestMethod)
             ->setPostfields($postfields)
             ->performRequest();               */

/** Perform a GET request and echo the response **/
/** Note: Set the GET field BEFORE calling buildOauth(); **/
$url = 'https://api.twitter.com/1.1/search/tweets.json';
$getfield = $queryURL; //'?q='. $query . '&result_type=' . $result_type . '&count=' . $count . '&since_id' . $since_id . '&max_id='. $max_id;
$requestMethod = 'GET';
$twitter = new TwitterAPIExchange($settings);
echo $twitter->setGetfield($getfield)
             ->buildOauth($url, $requestMethod)
             ->performRequest();
