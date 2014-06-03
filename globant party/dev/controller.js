/*global  $*/
/*jslint browser: true*/

var tweetList = [];

if((localStorage.firstRun == undefined) || (localStorage.firstRun == ''))
{
	console.log('FIRST RUN TRUEEE');
	window.location.reload();
	localStorage.firstRun = 'false';
	
}
else if(localStorage.firstRun == 'false')
{
	console.log('FIRST RUN FALSE');
}

// Connected or not?
//var nav;
var nav = navigator.onLine,
	chrome,
	console;

$(document).ready(function () {
	'use strict';
	
	$('.close').click(function () {
	
		$(this).parent().slideUp('slow');
	
	});
	

	$('.gofullscreen').click(function () {
		
		//document.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		
		chrome.windows.getCurrent(null, function (window) {
			
			if (window.state !== "fullscreen") {
				chrome.windows.update(window.id, {state: "fullscreen"});
			} else {
				chrome.windows.update(window.id, {state: "maximized"});
			}

		});

	});
	
});

		
//var options = {};
var query,
	queryFilter,
	filter;

// get options from the options' page and store them in the localStorage
function checkOptions() {
	'use strict';
	chrome.storage.local.get(function (result) {
					
		console.log("OPTIONS", result);
					
		localStorage.hashtag = result.hashtag;
		localStorage.query = result.query;
		localStorage.tweetQuantity = result.tweetQuantity;
		if((localStorage.tweetQuantity == 0) || (localStorage.tweetQuantity == ''))
		{
			localStorage.tweetQuantity = 1;
		}
		localStorage.filter = result.filter;
		localStorage.updateInterval = result.updateInterval;
		if((localStorage.updateInterval == 0) || (localStorage.updateInterval == ''))
		{
			localStorage.updateInterval = 5;
		}
		localStorage.highlight = result.highlight;
		localStorage.backgroundColor = result.backgroundColor;
		localStorage.titleColor = result.titleColor;
		localStorage.textColor = result.textColor;
		localStorage.bgImageURL = result.bgImageURL;
		localStorage.bgImageFile = result.bgImageFile;
		localStorage.font = result.font;
							
		query = localStorage.query.replace(/\s+/g, ' OR ').trim();
		filter = localStorage.filter.trim().split(/\s+/).join(' -');
		//query = encodeURIComponent(query);
			
		//queryFilter = query+' -'+filter;
		//queryFilter = encodeURIComponent(queryFilter);
			
		queryFilter = encodeURIComponent(query + (filter ? ' -' + filter : ''));
		
		
		if (localStorage.query  === "" || localStorage.tweetQuantity  === "" || localStorage.updateInterval === "") {
			$('#error-message p').html("You must set some options first! Go <a class='optionsPage' target='_blank' href='options.html'>here</a> to do it!");
			$('#error-message').css('display', 'block');
		} else {
			$('#container').css('display', 'block');
		}

		console.log('QUERYYYY' + query);
	
		// Add data- attributes to  the <body> for styling stuff
		$('body').attr('data-backgroundcolor', localStorage.backgroundColor);
		$('body').attr('data-titlecolor', localStorage.titleColor);
		$('body').attr('data-textcolor', localStorage.textColor);
		$('body').attr('data-font', localStorage.font);
			
		// If there is an image set, use it as background
		if (localStorage.bgImageURL !== '') {
			$('body').css('background-image', 'url("' + localStorage.bgImageURL + '")');
		}
		
		// This is to know how many "tweet cards" I have to show and style them accordingly 
		$('#container').attr('class', '').addClass('quantity_' + localStorage.tweetQuantity + ' mosaicflow');
			
		// Show the offical hashtag
		if (localStorage.hashtag !== '') {
			$('.marquee').show();
			$('#hash').text(localStorage.hashtag);
		} else {
			$('.marquee').hide();
		}
		
			
	});

}

// Execute the function to get the options
checkOptions();

// Database to store the tweets

var indexedDB =  window.webkitIndexedDB;
var IDBTransaction = window.webkitIDBTransaction;

var db;

function initDb() {
	'use strict';
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

var ChromeExOAuth,
	angular;

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

// Init Angular APP
angular.element(document).ready(function () {
	'use strict';
	angular.bootstrap(document, ['myModule', 'ngSanitize']);
});
	
// Filter to add a class to the word to highlight
angular.module('myModule', []).filter('highlight', function () {
	'use strict';
	return function (input) {
		
		var out = '',
			highlight = localStorage.highlight,
			reg = new RegExp(highlight, 'gi');
		
		if (highlight !== '') {
			out = input.replace(reg, "<span class='highlight'>" + highlight + "</span>");
			
		} else {
			out = input;
		}
		
		return out;
	};
}).filter('biggerPicture', function () { // Filter to show the bigger user profiles images of Twitter
	'use strict';
	return function (input) {
		var out = '';

		out = input.replace('_normal.', '.');
					
		return out;
	};
}).filter('showImage', function () { // Filter to show the image of the tweet
	'use strict';
	return function (input) {
		if (input) {
			var out = '';
					
			out = 'showImage';// "<img src='"+input+"'/>";
					
			return out;
		}
	};

}).filter('filterWord', function () { // Filter to filter (:P) the chosen word, and to highlight the chosen user's tweet
	'use strict';
	
	return function (items, field) {
		
		var result = [];
			
		angular.forEach(items, function (value, key) {
				
			console.log(value.text);
	
			var text = value.text,
				user = value.user.screen_name,
				highlight = localStorage.highlight,
				reg = '',
				filteredWord = localStorage.filter;
				
		
			// Highlight tweet
			console.warn(user, localStorage.highlight);
				
			if (localStorage.highlight !== '') {
					
				highlight = highlight.replace(/\s+/g, '|').trim();
				highlight = '(' + highlight + ')';
				
				reg = new RegExp(highlight, 'ig');
				
				console.log('FILTER: ' + highlight + ' ' + user.search(reg));
				
				if (user.search(reg) >= 0) {
					value.metadata.highlight = 'highlight';
					console.log('---------- FILTERED ----------------');
				}
			}
				
			if (user === localStorage.highlight) {
				value.metadata.highlight = 'highlight';
			}
				
	
			if (filteredWord !== '') {
				filteredWord = filteredWord.replace(/\s+/g, '|').trim();
				filteredWord = '(' + filteredWord + ')';
					
				reg = new RegExp(filteredWord, 'ig');
					
				console.log('FILTER: ' + filteredWord + ' ' + text.search(reg));
					
				if (text.search(reg) >= 0) {
					value.metadata.filtered = 'filtered';
					console.log('---------- FILTERED ----------------');
				}
			}
	
			result[key] = value;
		});
			
		return result;
	};

});


var countRuns = 0;

// Angular controller
function tweetsListCtrl($scope) {
	'use strict';
	
	var intervalTime = localStorage.updateInterval;
	var tweetQuantity = localStorage.tweetQuantity;
	
	
	// Update interval
	var updateInt = window.setInterval(function () {
		$scope.$apply(function () {
			onAuthorized(); // <--- Function that gets the tweets
		});
	}, intervalTime * 1000);

	function callback(resp, xhr) {
				
		var response = $.parseJSON(resp),
			transaction = db.transaction('tweet', 'readwrite'),
			objectStore = transaction.objectStore('tweet'),
			request = objectStore.add(response.statuses);
		
		
		// show tweets in the html
		$scope.tweets = response.statuses;
		
		// Save tweets to the IndexedDB 
		//var promise = objectStore.add(response.statuses);
	
		
		request.onsuccess = function (evt) {
			// do something when the add succeeded 
			//console.log("------------DATA ADDED to the DB----------");
			//console.log(evt);
			
		};
		
		countRuns = countRuns + 1;
		console.log("RUNS " + countRuns);
		
		if (countRuns === 1) {
			$('.loading p').text('Almost Ready!');
		}
		
		if (countRuns === 2) {
			$('.loading').hide('slow');
		}
		
		console.log(response.statuses);
	}
		
	// Connect to the API and get the tweets
	function onAuthorized() {
		
		// check if online or offline
		nav = navigator.onLine;
		
		console.warn(queryFilter);
		
		//queryFilter = '%40markoscc%20-hermosa';
		
		var url = 'https://api.twitter.com/1.1/search/tweets.json',
			request = '';
		
		if (nav === true) {// if there is internet connection 

			//var url = 'https://stream.twitter.com/1.1/statuses/filter.json';
			request = {
				'method': 'GET',
				'parameters': {
					'q': queryFilter,
					'include_entities': 'true',
					'result_type': 'recent',
					'count': tweetQuantity
				}
			};
			
			//console.log(url, callback, request);
			oauth.sendSignedRequest(url, callback, request);
			
			// check the options page to see if something cheanged		
			checkOptions();
			
		} else {// if there is NOT internet connection
			
			console.log('FALSE');
	
			// Stop the interval update because we will fetch tweets from the DB
			updateInt = window.clearInterval(updateInt);
			
			var transaction = db.transaction('tweet'),
				objectStore = transaction.objectStore('tweet'),
				i = 0;
			
			request = objectStore.openCursor();
			
			request.onsuccess = function (evt) {
				
				var cursor = evt.target.result;
				
				if (cursor) {
					console.log('OUTPUT--- ', cursor);
					
					for (i = 0; i < cursor.value.length; i = i + 1) {
						tweetList.push(cursor.value[i]);
					}
					
					cursor.continue();
				} else {
					console.log("No more entries!");
				}
			};
			
			var offlineCounter = 0,
				updateOffline;
			
			updateOffline = window.setInterval(function () {
				
				$scope.$apply(function () {
					
					var tempTweets = [],
						i = 0;
				
					//console.log("offline counter " + offlineCounter);
					
					// Make a group of tweets to show
					for (i = 0; i < localStorage.tweetQuantity; i = i + 1) {
						if (offlineCounter > tweetList.length) { offlineCounter = 0; }
						
						offlineCounter = offlineCounter + 1;
						
						console.log(i);
						tempTweets[i] = tweetList[offlineCounter];
					}
					
					//console.log(tempTweets);
					$scope.tweets = tempTweets;
	
				});
				
				// Check if it's Online, if so, get new tweets
				if (nav === true) { onAuthorized(); }
				
				// check the options page	
				checkOptions();
				
			}, localStorage.updateInterval * 1000);
		}
	}
        
} // angular app

	