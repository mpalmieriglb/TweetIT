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






	function initFS(fs){
		console.log("Welcome to Filesystem! It's showtime :)"); // Just to check if everything is OK :)
		// place the functions you will learn bellow here
	}

	function errorHandler(evt)
	{
		console.log('ERROR', evt) ;
	}

	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;




	/**
	 * Writes a Blob to the filesystem.
	 *
	 * @param {DirectoryEntry} dir The directory to write the blob into.
	 * @param {Blob} blob The data to write.
	 * @param {string} fileName A name for the file.
	 * @param {function(ProgressEvent)} opt_callback An optional callback.
	 *     Invoked when the write completes.
	 */
	function writeBlob(dir, blob, fileName, opt_callback) {
		dir.getFile(fileName, {create: true, exclusive: true}, function(fileEntry) {

			fileEntry.createWriter(function(writer) {
				if (opt_callback) {
					writer.onwrite = opt_callback;
				}
				//writer.write(blob);
				console.log(blob.type);
				writer.write(blob, {type: blob.type});
			});

			var opt_callback = function()
			{
				console.log("LISto----------", this, '-----------------');


				var file = this;
				var fileEntry = this;
				//for (var i = 0, f; f = files[i]; i++) {

					// Only process image files.
					/*if (!files.type.match('image.*')) {
						continue;
					} */
				//console.log(chrome.extension.getURL(this));

			/*	chrome.fileSystem.getWritableEntry(file, function(readOnlyEntry) {

					readOnlyEntry.file(function(file) {
						var reader = new FileReader();

						reader.onerror = errorHandler;
						reader.onloadend = function(e) {
							console.log(e.target.result);
						};

						reader.readAsText(file);
					});
				});
                    */

				getImg(file);

				function getImg(fileEntry)
				{


					fileEntry.file(function(fileEntry)
					{
						var reader = new FileReader();
						reader.onload = function(e) {
							console.log( e.target.result);
						};
						reader.readAsDataURL(fileEntry);
					});
				}/*
				chrome.fileSystem.chooseEntry(
					{
						type: 'openFile', accepts:[{
						extensions: ['html']
					}]
					},
					function(fileEntry) {

						fileEntry.file(function(file)
						{
							var reader = new FileReader();
							reader.onload = function(e) {
								document.getElementById("HTMLFile").value = e.target.result;
							};
							reader.readAsText(file);
						});

					});

				/*
					var reader = new FileReader();

					console.log(reader);
					// Closure to capture the file information.
					reader.onload = function(file) {
						//return function(e) {

						console.log(this);
						//console.log('image.----', this.target.result, files);


						//};
					};

					// Read in the image file as a data URL.
					reader.readAsDataURL(this);
				//}

				/*
				var url = 'filesystem:http://example.com/temporary/myfile.png';
				window.resolveLocalFileSystemURL(url, function(fileEntry) {

				});
                  */
			}

		});


	};

	                  /*

	function handleFileSelect(evt) {
		var files = evt.target.files; // FileList object

		// Loop through the FileList and render image files as thumbnails.
		for (var i = 0, f; f = files[i]; i++) {

			// Only process image files.
			if (!f.type.match('image.*')) {
				continue;
			}

			var reader = new FileReader();

			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
					// Render thumbnail.
					var span = document.createElement('span');
					span.innerHTML = ['<img class="thumb" src="', e.target.result,
						'" title="', escape(theFile.name), '"/>'].join('');
					document.getElementById('list').insertBefore(span, null);
				};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsDataURL(f);
		}
	}

           */




	function getImage(image, tweet)
	{
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200){

				imageURL = window.webkitURL;

				transaction = db.transaction('tweets', 'readwrite');
				objectStore = transaction.objectStore('tweets');

				//var image = (imageURL.createObjectURL(this.response));
				var image = this.response;

				console.log(image);
				//$('body').prepend('<img src="'+ image +'" />');

				var fileName = tweet.user.screen_name;

				//tweet.image_blob = image;

				window.requestFileSystem(TEMPORARY, 1024*1024*5 /*5MB*/, function(fs) {
					var onWrite = function(evt) {
						console.log('Write completed.');
					};

					// Write file to the root directory.
					writeBlob(fs.root, image, fileName, onWrite);
				}, errorHandler);

				request = objectStore.add(tweet);



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

				//$('body').prepend('<img src="'+ tweetsArray[3].image_blob +'" />');

				//console.log(tweetsArray[3].image_blob);




				$scope.$apply(function(){

					$scope.tweets = tweetsArray;

				});

			}

		};

	}









	$http({method: 'GET', url: 'http://tweeter:8888/index.php?query=google'}).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available

			//console.log(data, status, headers, config);


			transaction = db.transaction('tweets', 'readwrite');
			objectStore = transaction.objectStore('tweets');




			function errorHandler(){
				console.log('An error occured');
			}


			$(data.statuses).each(function()
			{
				//console.log(getImage(this.user.profile_image_url), this);

				getImage(this.user.profile_image_url, this);

				//this.profile_image_blob = image;

				//console.log(image);

				//request = objectStore.add(this);


			});





			transaction.oncomplete = function(event)
			{
				console.log('READY!!! ADDED');

				//getTweets();


			};

		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});



} // angular app
