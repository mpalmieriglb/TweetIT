$(document).ready(function() {



})


var db,
	objectStore,
	request,
	response,
	transaction,
	console,
	tweetsArray = [],
	chrome,
	imageURL;

// Init Angular APP
angular.element(document).ready(function () {
	'use strict';
	angular.bootstrap(document, ['ngSanitize', 'myModule']);
});


angular.module('myModule', []).config([
		'$compileProvider',
		function( $compileProvider )
		{
			// Angular -1.2.0-rc2 : /^\s*(https?|ftp|file):|data:image\//
			var currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist();
			newImgSrcSanitizationWhiteList = currentImgSrcSanitizationWhitelist.toString().slice(0,-1)+'|filesystem:chrome-extension:'+'|blob:chrome-extension%3A'+currentImgSrcSanitizationWhitelist.toString().slice(-1);
			//console.log("Changing imgSrcSanitizationWhiteList from "+currentImgSrcSanitizationWhitelist+" to "+newImgSrcSanitizationWhiteList);

			$compileProvider.imgSrcSanitizationWhitelist(newImgSrcSanitizationWhiteList);
		}
	]).filter('biggerPicture', function () { // Filter to show the bigger user profiles images of Twitter
	'use strict';

	return function (input) {
		var out = '';

		out = input.replace('_normal.', '_bigger.');

		return out;

	};
});







// Angular controller
function tweetsController($scope, $http) {
	'use strict';

	//var indexedDB =  window.webkitIndexedDB;
	//var IDBTransaction = window.webkitIDBTransaction;


	$('.options').click(function(){

		chrome.app.window.create('options.html', {
			'bounds': {
				'width': 500,
				'height': 500
			}
		});

	})

	function initDb() {

		request = window.indexedDB.open('TweetsDB', 3);

		request.onerror = function(event)
		{
			console.warn('ERROR');
		};

		request.onsuccess = function(event)
		{
			console.log('SUCCES!!!!!!!');

			db = request.result;

		};


		request.onupgradeneeded = function(event)
		{
			db = event.target.result;

			// Create an objectStore for this database
			objectStore = db.createObjectStore('tweets', { autoIncrement: true });
		};

	}


	initDb();






	// Get Tweets from DB
	function getTweets()
	{
		objectStore = db.transaction('tweets').objectStore('tweets');

		objectStore.openCursor(null, 'prev').onsuccess = function(event)
		//objectStore.openCursor().onsuccess = function(event)
		{
			var cursor = event.target.result;

			if (cursor) {

				// Add tweets to an array
				tweetsArray.push(cursor.value);

				console.log(cursor.value);

				cursor.continue();
			}
			else
			{
				console.log('No more entries!');

				//console.log(JSON.stringify(tweetsArray));

				//tweetsArray = JSON.stringify(tweetsArray);

				//console.log(tweetsArray);

				$('body').prepend('<img src="'+ tweetsArray[3].image_blob +'" />');

				console.log(tweetsArray[3].image_blob);




				$scope.$apply(function(){

					$scope.tweets = tweetsArray;

				});

			}

		};

	}






	function getImage(image, tweet)
	{
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200){

				imageURL = window.webkitURL;

				transaction = db.transaction('tweets', 'readwrite');
				objectStore = transaction.objectStore('tweets');

				var image = (imageURL.createObjectURL(this.response));
				//var image = this.response;


				//$('body').prepend('<img src="'+ image +'" />');

				tweet.image_blob = image;

				request = objectStore.add(tweet);

				//console.log(image, tweet, '---------------------------------------------------------------');

				transaction.oncomplete = function(event)
				{
					console.log('READY!!! ADDED');
				};


				//return image;
			}
		};

		xhr.open('GET', image, true);
		xhr.responseType = 'blob';
		xhr.send();
	}






	$http({method: 'GET', url: 'http://tweeter:8888/index.php?query=google'}).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available

			//console.log(data, status, headers, config);


			//transaction = db.transaction('tweets', 'readwrite');
			//objectStore = transaction.objectStore('tweets');

			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

			window.requestFileSystem(window.TEMPORARY, 5*1024*1024, initFS, errorHandler);

			function initFS(fs){
				console.log("Welcome to Filesystem! It's showtime :)"); // Just to check if everything is OK :)
				// place the functions you will learn bellow here
			}

			function errorHandler(){
				console.log('An error occured');
			}


			$(data.statuses).each(function()
			{
				// Add entry to DB (uncomment)

				//console.log(getImage(this.user.profile_image_url), this);

				getImage(this.user.profile_image_url, this);

				//this.profile_image_blob = image;

				//console.log(image);

				//request = objectStore.add(this);


			});

			getTweets();



			/*transaction.oncomplete = function(event)
			{
				console.log('READY!!! ADDED');

				getTweets();


			};*/

		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});



} // angular app
