$(document).ready(function(){

	
	/*---------------------------------------------*/
	
	/* 				TABS
	
	/*---------------------------------------------*/
	
	$('.tabs .one').click(function(){
		
		$(this).addClass('selected');
		$('.tabs .two').removeClass('selected');
		$('.tab.one').show();
		$('.tab.two').hide();
		
	})
	
	$('.tabs .two').click(function(){
		
		$(this).addClass('selected');
		$('.tabs .one').removeClass('selected');
		$('.tab.two').show();
		$('.tab.one').hide();
		
	})
	
	/*---------------------------------------------*/
	
	/* 				GET OPTIONS PAGE
	
	/*---------------------------------------------*/
	
	chrome.storage.local.get(function(result){
		
		console.log(result);
		
		$('#field01').val(result.hashtag);
		$('#field02').val(result.query);
		$('#field03').val(result.bgImageURL);
		//$('.field_image_file.description').text(result.bgImageFileName);
		
		if(!result.tweetQuantity)
		{
			result.tweetQuantity = 5;
		}
		$('#tweetQuantity').val(result.tweetQuantity);
		$('#field04').val(result.filter);
		
		if(!result.updateInterval)
		{
			result.updateInterval = 10;
		}
		$('#updateInterval').val(result.updateInterval);
		$('#field06').val(result.highlight);
		$('#fonts').val(result.font);
		$('.exampleText, #liveExample').attr('data-font', result.font);
		
		$('#liveExample').css('background', $('input[type="radio"][name="bg_color"][value="'+result.backgroundColor+'"]').css('background-color'));
		$('#liveExample').attr('data-titlecolor', result.titleColor);
		$('#liveExample').css('color', $('input[type="radio"][name="text_color"][value="'+result.textColor+'"]').css('background-color'));
		
		
		$('input[type="radio"][name="bg_color"][value="'+result.backgroundColor+'"]').prop("checked", true);
		$('input[type="radio"][name="title_color"][value="'+result.titleColor+'"]').prop("checked", true);
		$('input[type="radio"][name="text_color"][value="'+result.textColor+'"]').prop("checked", true);
			
	})
	
	
	/*---------------------------------------------*/
	
	/* 				SAVE OPTIONS PAGE
	
	/*---------------------------------------------*/
	
	options = new Object();
	
	function saveOptions()
	{
		options.hashtag = $('#field01').val();
		options.query = $('#field02').val();
		options.bgImageURL = $('#field03').val();
		//options.bgImageFile = $('#field_image_file').get(0).files[0];
		//options.bgImageFileName = $('#field_image_file').get(0).files[0].name;
		options.tweetQuantity = $('#tweetQuantity').val();
		options.filter = $('#field04').val();
		options.updateInterval = $('#updateInterval').val();
		options.highlight = $('#field06').val();
		options.font = $('#fonts').val();
		
		options.backgroundColor = $('input[type="radio"][name="bg_color"]:checked').val();
		options.titleColor = $('input[type="radio"][name="title_color"]:checked').val();
		options.textColor = $('input[type="radio"][name="text_color"]:checked').val();
		
		console.log(options);
		
		chrome.storage.local.set(options, function(){
		
			console.log(options);
								  
			var notification = webkitNotifications.createNotification("glb.gif", "Settings Saved", "Data was saved and will be automatically synced");
			notification.show();
								  
			
		})
								  
		
		
		
	}
	
	chrome.tabs.query({'title': '*TweetIt*'}, function(query){
						   
			console.log(query);
			
			$.each(query, function(index, value){
				
				console.log(index, value);
				
				console.log(this.url);
				
				var url = this.url;
				
				if(url.search('wall.html') != -1)
				{
					//console.warn('THIS IS - Opener Tab: ' + this.openerTabId);
					$('.gotoapp').hide();
				}
				
			})
						   
		})
	
	
	var fileURL = "";
	
	
	$('#options_form').submit(function(event)
	{
	
		saveOptions();
		event.preventDefault();
		console.log("SUBMITTED");
		
		//console.log($('#field_image_file').get(0).files[0].toURL());
		
		//fileURL = $('#field_image_file').get(0).files[0];
			
		//$('body').append('<img src="'+ window.URL.createObjectURL(fileURL)+ '">');
		
		
	
	})
	

	function deleteDatabase() {
		   var deleteDbRequest = indexedDB.deleteDatabase('tweetDB');
		   deleteDbRequest.onsuccess = function (event) {
			  
				var notification = webkitNotifications.createNotification("glb.gif", "Success!", "The database was deleted");
				notification.show();
			   
		   };
		   deleteDbRequest.onerror = function (e) {
			  console.log("Database error: " + e.target.errorCode);
		   };
		}
	
	$('.deleteDB').click(function(){
		
		var r=confirm("Delete Database?");
		
		if (r==true)
		{
			deleteDatabase();
		}
		else
		{
			
		}
		
	})
	
	$('.field_image_file.description').click(function(){
		
		window.URL.revokeObjectURL(fileURL);
		$(this).text('');
		console.log("DELETED");
		
	})
	
	
	$('#fonts').change(function(){
	
		var selectedText = $('#fonts').val();
		$('.exampleText, #liveExample').attr('data-font', selectedText);
		
	})
	
	var queryField;
	
	$('#field01').focus(function(){
	
		queryField = $('#field02').val();
	})
	
	$('#field01').keyup(function(){
		
		//var query = $('#field02').val();
		
		//query = $(this).val() + query;
		
		$('#field02').val($(this).val() + ' ' + queryField);
		
	})
	
	$('.background input[type="radio"]').click(function(){
		
		var bgColor = $(this).css('background-color');
		$('#liveExample').css('background', bgColor);
		
	})
	
	function changeBG(){
		
		console.log('change BG');
		
		var imageURL = $('#field03').val();
		
		if(imageURL != '')
		{
			var imageURL = 'url('+ $('#field03').val() + ')';
		
			$('#liveExample').css({
				'background-image': imageURL,
				'background-size': 'cover',
				'background-repeat': 'no-repeat'
			});
		} 
		else
		{
			var bgColor = $(this).css('background-color');
			$('#liveExample').css('background', bgColor);
		}
		
		
	}
	
	$('#field03').change(function(){
		
		console.log("CHANGED change");
		changeBG()
	})
	
	$('#field03').focus(function(){
		
		console.log("CHANGED focus");
		changeBG()
	})
	
	$('#field03').blur(function(){
		
		console.log("CHANGED blur");
		changeBG()
	})
	
	$('.title input[type="radio"]').click(function(){
		
		var titleColor = $(this).css('background-color');
		$('#liveExample').attr('data-titlecolor', $(this).val());
		
	})
	
	$('.text.color input[type="radio"]').click(function(){
		
		var txtColor = $(this).css('background-color');
		$('#liveExample').css('color', txtColor);
		
	})
	
	
	
	
})