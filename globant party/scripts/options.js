$(document).ready(function() {

	var deleteDB = false;

	chrome.storage.local.get(function(settings){



		$('#hashtag').val(settings.hashtag);
		$('#query').val(settings.query);
		$('#hide').val(settings.filterWords);
		$('#tweetsQuantity').val(settings.tweetsQuantity);
		$('#updateInterval').val(settings.updateInterval);
		$('#timestamp').val(settings.timestamp);

		if(settings.timestamp == true)
		{
			$('#timestamp').attr('checked', true);
		}
		else
		{
			$('#timestamp').attr('checked', false);
		}



		console.log(settings);

	})

	$('#saveBtn').click(function(){

		var hashtag = $('#hashtag').val(),
			query = $('#query').val(),
			hide = $('#hide').val(),
			tweetsQuantity = $('#tweetsQuantity').val();
			updateInterval = $('#updateInterval').val();
			timestamp = $("#timestamp").is(":checked");


		// Save it using the Chrome extension storage API.
		chrome.storage.local.set({
			'query': query,
			'filterWords': hide,
			'hashtag': hashtag,
			'tweetsQuantity': tweetsQuantity,
			'updateInterval': updateInterval,
			'timestamp' : timestamp
		},
		function() {
			// Notify that we saved.
			//message('Settings saved');
			console.log('setting saveee', timestamp);


			if (deleteDB)
			{
				chrome.runtime.reload();

			}
			else
			{
				chrome.app.window.current().close();
			}






		});

	})



	function deleteDatabase() {

		console.log('click');
		var deleteDbRequest = indexedDB.deleteDatabase('TweetsDB');
		deleteDB = true;

		deleteDbRequest.onsuccess = function (event) {

			console.log('DB deleted');


		};
		deleteDbRequest.onerror = function (e) {
			console.log("Database error: " + e.target.errorCode);
		};
	}

	$('#deleteDB').click(function(){

		deleteDatabase();


	})


})
