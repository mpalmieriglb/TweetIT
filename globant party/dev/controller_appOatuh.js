var tweetList = new Array();

// Connected or not?
var nav;
nav = navigator.onLine;

$(document).ready(function(){

	$('.close').click(function(){
	
		$(this).parent().slideUp('slow');
	
	})

})

		
var options = new Object();
var query;

// get options from the options' page and store them in the localStorage
function checkOptions()
{
	chrome.storage.local.get(function(result){
					
		console.log(result);
					
		localStorage.hashtag = result.hashtag;
		localStorage.query = result.query;
		localStorage.tweetQuantity = result.tweetQuantity;
		localStorage.filter = result.filter;
		localStorage.updateInterval = result.updateInterval;
		localStorage.highlight = result.highlight;
					
		localStorage.backgroundColor = result.backgroundColor;
		localStorage.titleColor = result.titleColor;
		localStorage.textColor = result.textColor;
		localStorage.bgImageURL = result.bgImageURL;
		localStorage.bgImageFile = result.bgImageFile;
		localStorage.font = result.font;
							
		query = localStorage.query.replace(/\s+/g, ' OR ').trim();
		filter = localStorage.filter.trim().split(/\s+/).join(' -');
		query = encodeURIComponent(query);
		//query = encodeURIComponent(query + (filter ? ' -' + filter : ''));
		
		
		if(localStorage.hashtag == "" || localStorage.query  == "" || localStorage.tweetQuantity  == "" || localStorage.updateInterval == "")
		{
			$('#error-message p').html("You must set some options first! Go <a class='optionsPage' target='_blank' href='options.html'>here</a> to do it!");
			$('##error-message').css('display', 'block');
		}
		else
		{
			$('#container').css('display', 'block');
		}
		
		

		console.log('QUERYYYY' + query);
	})
	
	// Add data- attributes to  the <body> for styling stuff
	$('body').attr('data-backgroundcolor', localStorage.backgroundColor);
	$('body').attr('data-titlecolor', localStorage.titleColor);
	$('body').attr('data-textcolor', localStorage.textColor);
	$('body').attr('data-font', localStorage.font)
	
	
	// If there is an image set, use it as background
	if(localStorage.bgImageURL != '')
	{
		$('body').css('background-image', 'url("'+ localStorage.bgImageURL +'")');
	}
	
	// This is to know how many "tweet cards" I have to show and style them accordingly 
	$('#container').attr('class','').addClass('quantity_' + localStorage.tweetQuantity);
		
	// Show the offical hashtag
	$('#hash').text(localStorage.hashtag);
}




// Execute the function to get the options
checkOptions();


// Database to store the tweets

var indexedDB =  window.webkitIndexedDB;
var IDBTransaction = window.webkitIDBTransaction;

var db;

function initDb() {
	
	console.log("DATABASE INIT--------");
    var request = indexedDB.open('tweetDB', 1);
	
    request.onsuccess = function (evt) {
        db = request.result;       
		console.log(evt);
		console.log(db);
    };
 
    request.onerror = function (evt) {
        console.log('IndexedDB error: ' + evt.target.errorCode);
    };
 
    request.onupgradeneeded = function (evt) {                   
        var objectStore = evt.currentTarget.result.createObjectStore('tweet', { keyPath: 'id', autoIncrement: true });
 
    };
}

initDb();



// Twitter oAuth data
var oauth = ChromeExOAuth.initBackgroundPage({
	'request_url': 'https://api.twitter.com/oauth/request_token',
	'authorize_url': 'https://api.twitter.com/oauth/authorize',
	'access_url': 'https://api.twitter.com/oauth/access_token',
	'consumer_key': 'wUhKqsC63P6Eevq2YSSFA',
	'consumer_secret': 'AOuZPfttnGIOvFYFccDZLK5ohJAtnjrDNNmQHhzs',
	'oauth_token' : '1037299597-OvRx7N5YjeCSmY9mrX5pyNeq7GmXXYVPZRqcs3a',
	'oauth_token_secret' : 'DW776xlpXaBjotlyV52ZzzGxqbzoVQTYUkaPYYIbc'
	//'scope': '',
	//'app_name': 'TweetIT2Mrks'
});

//responseTweet = new Object();

// Init Angular APP
angular.element(document).ready(function() {
	angular.bootstrap(document, ['myModule', 'ngSanitize']);
});
	

// Filter to add a class to the word to highlight
angular.module('myModule', []).filter('highlight', function() 
{
	return function(input) {
		var out = '';
		var highlight = localStorage.highlight;
		
		if(highlight != '')
		{
			var reg = new RegExp(highlight,'gi');
			out = input.replace(reg, "<span class='highlight'>"+highlight+"</span>");
			
		}
		else
		{
			out = input;
		}
		
		return out;		
		
	}
})
// Filter to show the bigger user profiles images of Twitter
.filter('biggerPicture', function() 
{
	return function(input) {
		var out = '';
		
		out = input.replace('_normal.', '.');
					
		return out;
	}
})
// Filter to show the image of the tweet
.filter('showImage', function(){

	return function(input){
		if(input)
		{
			var out = '';
				
			out = "<img src='"+input+"'/>";
				
			return out;
		}
	}

})
// Filter to filter (cuack) the chosen word, and to highlight the chosen user's tweet
.filter('filterWord', function(){

	return function(items, field){
		var result = new Array;
		
		
		angular.forEach(items, function(value, key) {
			
			console.log(value.text);

			var text = value.text;
						
			var user = value.user.screen_name;
			
			// Highlight tweet
			if(user == localStorage.highlight)
			{
				value.metadata.highlight = 'highlight';
			}
			
			// Filter Word
			var filteredWord = localStorage.filter;

			if (filteredWord != '')
			{
				filteredWord = filteredWord.replace(/\s+/g, '|').trim();
				filteredWord = '('+filteredWord+')';
				
				var reg = new RegExp(filteredWord,'ig');
				
				console.log('FILTER: ' + filteredWord + ' ' + text.search(reg));
				
				if (text.search(reg) >= 0)
				{
					value.metadata.filtered = 'filtered';
					console.log('---------- FILTERED ----------------')
				}
			}

			result[key] = value;
		});
		
		return result;
	}

});



// Angular controller
function tweetsListCtrl($scope)
{

	
	// Update interval
	var updateInt = window.setInterval(function(){
		$scope.$apply(function(){
			onAuthorized(); // <--- Function that gets the tweets
		})
	}, localStorage.updateInterval * 1000);
			
			
	
	function callback(resp, xhr) {
				
		var response = $.parseJSON(resp);
		
		// show tweets in the html
		$scope.tweets = response.statuses;
		
		// Save tweets to the IndexedDB 
		//var promise = objectStore.add(response.statuses);
		
		var transaction = db.transaction('tweet', 'readwrite' );
		
		var objectStore = transaction.objectStore('tweet');  
		
		var request = objectStore.add(response.statuses);
		
		request.onsuccess = function (evt) {
			// do something when the add succeeded 
			console.log("------------DATA ADDED to the DB----------");
			//console.log(evt);
			
		};
		
		console.log(response.statuses);
	};
		
	// Connect to the API and gets the tweets
	function onAuthorized() {
		
		// check if online or offline
		nav = navigator.onLine;
		
		
		if(nav == true) // if there is internet connection
		{
			
			var consumer_key = encodeURIComponent('wUhKqsC63P6Eevq2YSSFA');
			var consumer_secret = encodeURIComponent('AOuZPfttnGIOvFYFccDZLK5ohJAtnjrDNNmQHhzs');
			var keySecret = consumer_key + ':' + consumer_secret;
			keySecret = btoa(keySecret);
			
			
			$.ajax({
				type: 'POST',
				url: 'https://api.twitter.com/oauth2/token',
				data: {'Authorization': 'Basic ' + keySecret, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'body': 'grant_type=client_credentials'},
				success: function(resp){
					console.log(resp);
				}
			});
			
			
			//var request = require('request');
			/*
			var consumer_key = 'wUhKqsC63P6Eevq2YSSFA';
			var consumer_secret = 'AOuZPfttnGIOvFYFccDZLK5ohJAtnjrDNNmQHhzs';
			var enc_secret = keySecret; //new Buffer(consumer_key + ':' + consumer_secret).toString('base64');
			 
			var oauthOptions = {
			  url: 'https://api.twitter.com/oauth2/token',
			  headers: {'Authorization': 'Basic ' + enc_secret, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
			  body: 'grant_type=client_credentials'
			};
			 
			$.post(oauthOptions, function(e, r, body) {
			  console.log(body)
			});
			*/
			
			
					
			
			
			
			console.log(consumer_key, consumer_secret, keySecret);
			/*
			var url = 'https://api.twitter.com/1.1/search/tweets.json';
			//var url = 'https://stream.twitter.com/1.1/statuses/filter.json';
			var request = {
				'method': 'GET',
				'parameters': {
					'q': query,
					'include_entities': 'true',
					'result_type': 'recent',
					'count': localStorage.tweetQuantity
				}
			};
			
			//console.log(url, callback, request);
			oauth.sendSignedRequest(url, callback, request);
			
			// check the options page to see if something cheanged		
			checkOptions();
			*/
		}
		else // if there is NOT internet connection
		{
			console.log('FALSE');
	
			// Stop the interval update because we will fetch tweets from the DB
			updateInt = window.clearInterval(updateInt);
			
			var counter = 0;
			
			var transaction = db.transaction('tweet');  
			var objectStore = transaction.objectStore('tweet');  
			
			var request = objectStore.openCursor();
			
			request.onsuccess = function(evt) 
			{  
				var cursor = evt.target.result;  
				
				if (cursor) 
				{  
					console.log('OUTPUT--- ', cursor);
					
					for(var i=0; i < cursor.value.length; i++)
					{
						tweetList.push(cursor.value[i]);
					}
					
					cursor.continue();  
				}  
				else 
				{  
					console.log("No more entries!");  
				}  
			};
			
			var offlineCounter = 0;
			
			var updateOffline = window.setInterval(function(){
				
				$scope.$apply(function(){
					
					var tempTweets = new Array();
				
					//console.log("offline counter " + offlineCounter);
					
					// Make a group of tweets to show
					for(var i=0; i < localStorage.tweetQuantity; i++)
					{
						if (offlineCounter > tweetList.length){ offlineCounter = 0; }
						
						offlineCounter++
						
						console.log(i);
						tempTweets[i] = tweetList[offlineCounter]; 	
					}
					
					//console.log(tempTweets);
					$scope.tweets = tempTweets;
	
				})
				
				// Check if it's Online, if so, get new tweets
				if(nav == true){onAuthorized();}
				
				// check the options page	
				checkOptions();
				
			}, localStorage.updateInterval * 1000);

		}
		
		
	};
	

        
		
		
        
} // angular app

	


	

	


    
    
	
	

