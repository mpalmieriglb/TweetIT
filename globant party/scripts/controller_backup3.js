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
			newImgSrcSanitizationWhiteList = currentImgSrcSanitizationWhitelist.toString().slice(0,-1)+'|filesystem:chrome-extension:'+'|data:'+'|blob:chrome-extension%3A'+currentImgSrcSanitizationWhitelist.toString().slice(-1);
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




	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;





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





	function initFS(fs){
		console.log("Welcome to Filesystem! It's showtime :)"); // Just to check if everything is OK :)
		// place the functions you will learn bellow here
	}

	function errorHandler(evt)
	{
		console.log('ERROR', evt) ;
	}









	/** ----------------------------------
	 *
	 *
	 *      1st Get query from Twitter API
	 *
	 *
	 *------------------------------------
	 */

	$http({method: 'GET', url: 'http://tweeter:8888/index.php?query=photo'}).
		success(function(data, status, headers, config) {

			function errorHandler(){
				console.log('An error occured');
			}

			$(data.statuses).each(function()
			{

				getImage(this);


			});


		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});






	/** ----------------------------------
	 *
	 *
	 *      2nd Get image from URL obtained from twitter request
	 *
	 *
	 *------------------------------------
	 */

	function getImage(tweet)
	{


		var imageURL = [];
		var imageReady = [];

		tweet.user.profile_image_url = tweet.user.profile_image_url.replace('_normal.', '_bigger.');

		imageURL.push({'profile_image': tweet.user.profile_image_url});

		if (tweet.entities['media'])
		{
			if (tweet.entities.media[0].type == 'photo')
			{
				console.warn('THIS HAS IMAGE');

				imageURL.push({'tweet_image': tweet.entities.media[0].media_url});

			}

		}

		console.log('::::::::::::::::::::::::::::', imageURL);


		function getProfileImage(imageURL)
		{

			var profile_image,
				tweet_image;

			$(imageURL).each(function(i){

				profile_image = this.profile_image;

				if()
				console.log(':::::::::: ---- ::::: ', this.profile_image);

			});

			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function()
			{
				if (this.readyState == 4 && this.status == 200){

					imageURL = window.webkitURL;

					var image = this.response,
						fileName = tweet.user.screen_name;

					console.log('BLOB', image);

					window.requestFileSystem(TEMPORARY, 1024*1024*5 /*5MB*/, function(fs)
					{

						var onWrite = function(evt)
						{
							console.log('::::::: PROFILE File Write Completed :::::::');

						};

						// Write file to the root directory.
						writeBlob(fs.root, image, fileName, onWrite, tweet);


					}, errorHandler);

				}
			};

			xhr.open('GET', imageURL, true);
			xhr.responseType = 'blob';
			xhr.send();
		}




		/*if (imageURL.length == 1)
		{
			getProfileImage(imageURL[0].profile_image);
		}
		else if (imageURL.length == 2)
		{
			getProfileImage(imageURL[0].profile_image);
			getTweetImage(imageURL[1].tweet_image);
		} */

		getProfileImage(imageURL);

	}










	/** ----------------------------------
	 *
	 *
	 *      3rd Write blob
	 *
	 *
	 *------------------------------------
	 */
	function writeBlob(dir, blob, fileName, opt_callback, tweet)
	{
		dir.getFile(fileName, {create: true, exclusive: true}, function(fileEntry)
		{

			fileEntry.createWriter(function(writer)
			{
				if (opt_callback) {
					writer.onwrite = opt_callback;
				}
				//writer.write(blob);
				console.log(blob.type);
				writer.write(blob, {type: blob.type});
			});

			var opt_callback = function()
			{
				console.log("::: FILE WROTE :::: ", this);


				showImage(this, tweet);

				//TODO: dividir que guarde la imagen del tweet en la base de datos.
			};

		});


	};







	/** ----------------------------------
	 *
	 *
	 *      4th Get blob and transform it to a BASE64 image
	 *
	 *
	 *------------------------------------
	 */

	function showImage(image, tweet)
	{

		console.log("READY! SHOW IMAGE");

		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

		window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

		//var xhr = new XMLHttpRequest();

		function onInitFs(fs) {

			var userName = tweet.user.screen_name;

			console.log('Opened file system: ' + fs.name);

			fs.root.getFile(userName, {}, function(fileEntry) {

				// Get a File object representing the file,
				// then use FileReader to read its contents.
				fileEntry.file(function(file)
				{
					var reader = new FileReader();

					reader.onloadend = function(e) {

						console.log(this.result);

						var response = this.result;

						//$('body').prepend('<img src="'+ response +'" width="50" height="50"><h1>'+userName+'</h1><br />');

						tweet.profile_image_base64 = response;

						console.log('ShowImage------> ' , response, tweet);

						saveToDB(tweet);

					};

					reader.readAsDataURL(file);

				}, errorHandler);

			}, errorHandler);

		}



		function errorHandler(evt) {
			console.log('ERROR', evt);
		}

		window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);

	}







	/** ----------------------------------
	 *
	 *
	 *      5th Save to DB
	 *
	 *
	 *------------------------------------
	 */

	function saveToDB(data)
	{
		transaction = db.transaction('tweets', 'readwrite');
		objectStore = transaction.objectStore('tweets');

		request = objectStore.add(data);

		transaction.oncomplete = function(event)
		{
			console.log(':::: ADDED TO DATABASE :::: ', event);

			getTweets();

		};
	}







	/** ----------------------------------
	 *
	 *
	 *      6th Get tweets from indexedDB
	 *
	 *
	 *------------------------------------
	 */

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

				//console.log(cursor.value);

				cursor.continue();
			}
			else
			{
				console.log('No more entries!');

				$scope.$apply(function(){

					$scope.tweets = tweetsArray;

				});

			}

		};

	}








	//showImage();





} // angular app

