$(document).ready(function() {


	$('.options').click(function(){

		chrome.app.window.create('options.html', {
			'bounds': {
				'width': 900,
				'height': 500
			}
		});


	})


	$('.fullscreen').click(function(){

		if (chrome.app.window.current().isFullscreen())
		{
			chrome.app.window.current().restore()
		}
		else
		{
			chrome.app.window.current().fullscreen()
		}


	})


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
	angular.bootstrap(document, ['ngSanitize', 'app']);
});


angular.module('app', ['ngAnimate']).config([
		'$compileProvider',
		function( $compileProvider )
		{
			var currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist();
			newImgSrcSanitizationWhiteList = currentImgSrcSanitizationWhitelist.toString().slice(0,-1)+'|filesystem:chrome-extension:'+'|data:'+'|blob:chrome-extension%3A'+currentImgSrcSanitizationWhitelist.toString().slice(-1);

			$compileProvider.imgSrcSanitizationWhitelist(newImgSrcSanitizationWhiteList);
		}
]).filter('timeAgo', function () { // Filter to show relative time of creation
		'use strict';
		return function (input) {
			if (input) {

				//console.log(input);
				moment.lang('en');

				input = moment(input).fromNow();

				//input = $('<div/>').html(input).text();

				return input;
			}
		};

}).filter('htmlEntities', function () { // Filter to show relative time of creation
		'use strict';
		return function (input) {
			if (input) {


				//var timeAgo = moment(input).fromNow();

				input = $('<div/>').html(input).text();

				return input;
			}
		};

	});;







// Angular controller
function tweetsController($scope, $http) {
	'use strict';



	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;





	function initDb() {

		request = window.indexedDB.open('TweetsDB', 3);

		request.onerror = function(event)
		{
			//console.warn('ERROR');
		};

		request.onsuccess = function(event)
		{
			console.log('SUCCES!!!!!!!');

			db = request.result;

			getTweetsFromTwitter();

		};


		request.onupgradeneeded = function(event)
		{
			db = event.target.result;

			// Create an objectStore for this database
			objectStore = db.createObjectStore('tweets', { autoIncrement: true });
		};

	}


	initDb();




	/*
	function initFS(fs){
		console.log("Welcome to Filesystem! It's showtime :)"); // Just to check if everything is OK :)
		// place the functions you will learn bellow here
	}
      */
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

	var hashtag,
		searchQuery,
		filterWords,
		tweetsQuantity,
		updateInterval,
		timestamp;



	function getSettings(getTweets)
	{


		/*chrome.storage.local.get(function(settings){

			//console.log(settings);

			hashtag = settings.hashtag;
			searchQuery = settings.query;
			filterWords = settings.filterWords;
			tweetsQuantity = settings.tweetsQuantity;
			updateInterval = settings.updateInterval;
			timestamp = settings.timestamp;

			if(!hashtag)
			{
				hashtag = 'globantPartyDefault';
			}

			if(!searchQuery)
			{
				searchQuery = 'globant';
			}

			if(!filterWords)
			{
				filterWords = '';
			}



			$scope.timestamp = timestamp;


			//searchQuery = searchQuery.replace(/\s+/g, ' OR ');

			searchQuery = $.trim(searchQuery);

			searchQuery = encodeURIComponent(searchQuery);

			searchQuery = searchQuery.replace(/%20/g, '+');

			console.log('SEARCH QUERY: ', searchQuery);

			$('#officialHashtag h2').text('#' + hashtag);

			if(getTweets)
			{
				//console.log('con gettweets');
				//getTweetsFromTwitter();
			}



		})*/

	}

	getSettings(true);


	var lengthOfTweets = 0,
		query = 'photo',
		result_type= 'recent',
		count = '12',
		maxID = {},
		biggerID,
		smallerID;




	function getTweetsFromTwitter()
	{

		getSettings(false);

		if (navigator.onLine)
		{


			lengthOfTweets = 0;

			console.log('MAX NUMBER ', maxID[0], 'MIN NUMBER ',  maxID[lengthOfTweets-1]);

			console.log('EXECUTING Get Tweets from API', 'http://tweeter:8888/index.php?count='+count+'&query='+searchQuery+'&result_type='+result_type+'&since_id='+smallerID+'&max_id='+biggerID);

			/*$http({method: 'GET', url: 'http://markoscc.com.ar/projects/tweetIT/tw-api/index.php?count='+count+'&searchquery='+searchQuery+'&result_type='+result_type+'&since_id='+smallerID+'&max_id='+biggerID}).
				success(function(data, status, headers, config) {

					function errorHandler(){
						console.log('An error occured');
					}


					$(data.statuses).each(function(i)
					{


						getImage(this);

						maxID[i] = this.id_str;

						console.log('TWEET MAXID - ' + i, this.id_str);


						lengthOfTweets++;

					});

					biggerID =  maxID[0];
					smallerID = maxID[lengthOfTweets-1];


					//var last_element = maxID[maxID.length - 1];


					//console.warn('lenghtoftweets ' + lengthOfTweets, data);

				}).
				error(function(data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
				});
		}*/
	}

	setInterval(getTweetsFromTwitter, 10000);







	/** ----------------------------------
	 *
	 *
	 *      2nd Get image from URL obtained from twitter request
	 *
	 *
	 *------------------------------------
	 */


	function parseTwitterDate(aDate)
	{
		//return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));

		//var newDate  = new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
		var newDate = moment(aDate).format();

		return newDate;

		//console.log(aDate, moment(aDate).format());

		//console.log('from time', moment(newDate).fromNow());
		//sample: Wed Mar 13 09:06:07 +0000 2013
	}

	function getImage(tweet)
	{

		console.log(tweet);

		var imageURL = [];
		var imageReady = [];
		var createdAt = tweet.created_at;

		tweet.created_at_parsed = parseTwitterDate(createdAt);


		tweet.user.profile_image_url = tweet.user.profile_image_url.replace('_normal.', '_bigger.');

		imageURL.push({'profile_image': tweet.user.profile_image_url});

		// If tweet has image attached
		if (tweet.entities['media'])
		{
			if (tweet.entities.media[0].type == 'photo')
			{
				//console.warn('THIS HAS IMAGE');

				imageURL.push({'tweet_image': tweet.entities.media[0].media_url});

			}

		}

		function getImageBlob(imageURL)
		{

			var profile_image,
				tweet_image,
				tweet_image_name,
				profile_image_name;

			$(imageURL).each(function(i){

				profile_image = this.profile_image;
				tweet_image = this.tweet_image;



				if (profile_image)
				{
					profile_image_name = tweet.user.screen_name;

					imageReady.profile_image_name = profile_image_name;

					//console.log('filename: ', profile_image_name);

					var xhr = new XMLHttpRequest();

					xhr.onreadystatechange = function()
					{
						if (this.readyState == 4 && this.status == 200){

							imageURL = window.webkitURL;

							var image = this.response,
								fileName = tweet.user.screen_name;

							//console.log('BLOB', image, fileName);

							window.requestFileSystem(TEMPORARY, 1024*1024*5 /*5MB*/, function(fs)
							{

								var onWrite = function(evt)
								{
									//console.log('::::::: PROFILE File Write Completed :::::::');

								};



								function writeBlob(dir, blob, fileName, opt_callback, tweet)
								{


									dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry)
									{

										fileEntry.createWriter(function(writer)
										{
											if (opt_callback) {
												writer.onwrite = opt_callback;
											}
											//writer.write(blob);
											//console.log(blob.type);
											writer.write(blob, {type: blob.type});
										});

										var opt_callback = function()
										{
											//console.log("::: FILE WROTE :::: ", this);

											imageReady.push({'profile_image': this});

											//console.warn(tweet);

											if(tweet_image)
											{

												getTweetImage();
											}
											else
											{

												transformToBase64(imageReady, tweet);
											}


											//showImage(this, tweet);

										};

									});
								}

								// Write file to the root directory.
								writeBlob(fs.root, image, fileName, onWrite, tweet);


							}, errorHandler);

						}
					};

					xhr.open('GET', profile_image, true);
					xhr.responseType = 'blob';
					xhr.send();
				}




				function getTweetImage()
				{
					tweet_image_name = tweet_image.split('/').pop();

					//console.log('filename: ', tweet_image_name);

					imageReady.tweet_image_name = tweet_image_name;

					var xhr2 = new XMLHttpRequest();

					xhr2.onreadystatechange = function()
					{
						if (this.readyState == 4 && this.status == 200){

							imageURL = window.webkitURL;

							var image = this.response,
								fileName = tweet_image_name;

							//console.log('BLOB', image);

							window.requestFileSystem(TEMPORARY, 1024*1024*5 /*5MB*/, function(fs)
							{

								var onWrite = function(evt)
								{
									//console.log('::::::: PROFILE File Write Completed :::::::');

								};

								// Write file to the root directory.
								writeBlob(fs.root, image, fileName, onWrite, tweet);

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
											//console.log(blob.type);
											writer.write(blob, {type: blob.type});
										});

										var opt_callback = function()
										{
											//console.log("::: FILE WROTE TWET :::: ", this);

											imageReady.push({'tweet_image': this});

											//console.log(imageReady);

											transformToBase64(imageReady, tweet);



											//showImage(this, tweet);

										};

									});
								}


							}, errorHandler);

						}
					};

					xhr2.open('GET', tweet_image, true);
					xhr2.responseType = 'blob';
					xhr2.send();
				}


			});


		}



	getImageBlob(imageURL);

	}











	/** ----------------------------------
	 *
	 *
	 *      3th Get blob and transform it to a BASE64 image
	 *
	 *
	 *------------------------------------
	 */

	var numberOfTweets = 0,
		tweetsToSave = [];



	function transformToBase64(image, tweet)
	{

		numberOfTweets++;


		Object.size = function(obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		};


		var size;



		//console.log("READY! SHOW IMAGE", image, tweet);

		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

		window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

		//var xhr = new XMLHttpRequest();



		function onInitFs(fs) {


			var fileName = image.profile_image_name;

			//console.log('Opened file system: ' + fs.name);

			fs.root.getFile(fileName, {}, function(fileEntry)
			{

				// Get a File object representing the file,
				// then use FileReader to read its contents.
				fileEntry.file(function(file)
				{
					var reader = new FileReader();

					reader.onloadend = function(e) {

						//console.log(this.result);

						var response = this.result;

						//$('body').prepend('<img src="'+ response +'" width="50" height="50"><h1>'+userName+'</h1><br />');

						tweet.profile_image_base64 = response;

						//console.log('ShowImage------> ' , response, tweet, image);

						if (image.tweet_image_name)
						{

							fileName = image.tweet_image_name;


							fs.root.getFile(fileName, {}, function(fileEntry)
							{


								// Get a File object representing the file,
								// then use FileReader to read its contents.
								fileEntry.file(function(file)
								{
									var reader = new FileReader();

									reader.onloadend = function(e) {

										//console.log(this.result);

										var response = this.result;

										//$('body').prepend('<img src="'+ response +'" width="50" height="50"><h1>'+userName+'</h1><br />');

										tweet.tweet_image_base64 = response;

										//console.log('ShowImage------> ' , response, tweet, image);

										tweetsToSave.push(tweet);

										saveToDB(tweet);


										size = Object.size(tweetsToSave);
										//console.log('PUSH with TWEET IMG', 'size ' + size + 'lenght of tweets ' + lenghtOfTweets);

										/*if (size == lengthOfTweets)
										{
											//saveToDB(tweetsToSave);
										} */

									};

									reader.readAsDataURL(file);

								}, errorHandler);

							}, errorHandler);
						}
						else
						{
							//saveToDB(tweet);
							tweetsToSave.push(tweet);

							saveToDB(tweet);

							//size = Object.size(tweetsToSave);
							//console.log('PUSH without TWEET IMG', 'size ' + size + ' lenght of tweets ' + lenghtOfTweets );
							/*
							if (size == lengthOfTweets)
							{
								saveToDB(tweetsToSave);
							} */
						}

					};

					reader.readAsDataURL(file);

				}, errorHandler);

			}, errorHandler);

		}


		//TODO: Hacer un timeout por si las imagenes tardan en cargar y se queda trabado



		function errorHandler(evt) {
			//console.log('ERROR', evt);
		}

		window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);


		//var size = Object.size(tweetsToSave);



	}







	/** ----------------------------------
	 *
	 *
	 *      4th Save to DB
	 *
	 *
	 *------------------------------------
	 */



	function saveToDB(data)
	{

		//console.warn('DATA TO SAVE', data);

		transaction = db.transaction('tweets', 'readwrite');
		objectStore = transaction.objectStore('tweets');


		$(data).each(function(){

			//console.log(this);

			request = objectStore.add(this);

		})





		transaction.oncomplete = function(event)
		{
			//console.log(':::: ADDED TO DATABASE :::: ', event);


		};
	}




	/** ----------------------------------
	 *
	 *
	 *      5th Get tweets from indexedDB
	 *
	 *
	 *------------------------------------
	 */



	function getTweets(numOfTweets)
	{



		var numOfTweets = numOfTweets,
			lastPosition = 0,
			from = 0,
			to = 0,
			deniedTweets = 0;

		function bringThem()
		{

			//console.log('EXECUTING Show Tweets');

			lastPosition = to;

			from = to + 1;

			to = to + numOfTweets;


			objectStore = db.transaction('tweets').objectStore('tweets');

			var keyBoundRange = IDBKeyRange.bound(from, to),
				counter = 0;

			objectStore.openCursor(keyBoundRange, 'prev').onsuccess = function(event)
			//objectStore.openCursor(keyBoundRange).onsuccess = function(event)
			{
				var cursor = event.target.result;

				if (cursor)
				{

					// Add tweets to an array


					counter++;

					var tweetText = cursor.value.text;
					var filter, reg;

					//TODO: Aca poner el filtro q trae de las settings!

					//console.log('Words to filter', filterWords);


					filter = filterWords;


					filter = filter.replace(/\s+/g, '|').trim();
					filter = '(' + filter + ')';

					reg = new RegExp(filter, 'ig');

					//console.log('FILTER: ' + filter + ' ' + tweetText.search(reg));

					if (tweetText.search(reg) > 0)
					{

						deniedTweets++

						console.log('---------- FILTERED ----------------', deniedTweets, numOfTweets);


						if (deniedTweets >= numOfTweets)
						{
							lastPosition = 0,
							from = 0,
							to = 0,
							deniedTweets = 0;

							tweetsArray = [];

							bringThem();

						}

					}
					else
					{
						tweetsArray.push(cursor.value);
					}





					cursor.continue();
				}
				else
				{
					//console.log('No more entries!');



					if (tweetsArray == '')
					{
						//console.log('NOMAS!!!', objectStore);

						lastPosition = 0;
						from = 0;
						to = 0;
						deniedTweets = 0;

						bringThem();
					}


					$scope.$apply(function(){

						$scope.tweets = tweetsArray;

					});

					tweetsArray = [];

				}

			};

			//console.warn('TWEET! from '  + from + ' to ' + to + ' last position ' + lastPosition);

			//setTimeout(bringThem, secs);
		}

		setInterval(bringThem, 10000);
		//console.log('tweetsArray', tweetsArray);

	   	//bringThem();



	}



	getTweets(3);



	//showImage();

} // angular app



