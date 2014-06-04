$(function(){
	var tweets,
		hashtag,
		searchQuery,
		filterWords,
		tweetsQuantity,
		updateInterval;

    var Tweet = Backbone.Model.extend({
    	initialize: function() {
    		var createdAt = this.attributes.created_at,
    			view;

			this.attributes.created_at_parsed = this.parseTwitterDate(createdAt);

    		view = new TweetView({ model: this });
    		
           	$('#tweets').prepend(view.render().el);

    		this.getImage();
            tweets.add(this);
    	},
    	getImage: function() {
    		var that = this,
    			uri = this.attributes.user.profile_image_url;

			var xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.onload = function() {
				document.getElementById('image'+that.id).src = window.URL.createObjectURL(xhr.response);
			}

			xhr.open('GET', uri, true);
			xhr.send();
    	},
    	parseTwitterDate: function(aDate){
			var newDate = moment(aDate).format();
			return newDate;
		}
    });

    var TweetsList = Backbone.Collection.extend({
        model: Tweet,
        interval: '3500',

        initialize: function(){
        	var that = this;

            $.ajax({
				type: 'GET',
				url:'http://localhost/tweetit/?searchQuery='+searchQuery+'%20-'+filterWords+'&sinceId=&count=4',
				success: function (data) {
					data = jQuery.parseJSON(data);
					
					$(data.statuses.reverse()).each(function() {
						new Tweet(this);
					});
					that.addNewTweet();
				}
			});
        },
        addNewTweet: function() {
        	var that = this;

        	setInterval(function() {
        		var LastTweetID = $(that.models).last()[0].id;

	    		$.ajax({
					type: 'GET',
					url:'http://localhost/tweetit/?searchQuery='+searchQuery+'&sinceId='+LastTweetID+'&count=',
					success: function (data) {
						data = jQuery.parseJSON(data);

						$(data.statuses.reverse()).each(function() {
							if (this.id !== LastTweetID) {
								new Tweet(this);
							}
						});						
					}
				});
        	}, this.interval);
        }        
    });

    var TweetView = Backbone.View.extend({
        tagName: 'li',

        render: function(){
            var html = Handlebars.templates.tweet(this.model.attributes);

            this.$el.html(html);
            return this;
        }
    });

    var App = Backbone.View.extend({
        el: $('#mainWrapper'),

        initialize: function(){
        	this.startChromeApp();            
        },
        startChromeApp: function() {
        	chrome.storage.local.get(function(settings) {

				hashtag = settings.hashtag || 'Globant';
				$('#hashtag').val(settings.hashtag);

				searchQuery = settings.query || 'globant';
				$('#query').val(settings.query);
				
				filterWords = settings.filterWords;
				$('#hide').val(settings.filterWords);
				tweetsQuantity = settings.tweetsQuantity;
				updateInterval = settings.updateInterval;

				OptionsModel = new Backbone.Model(settings);
				tweets = new TweetsList();
			});
        },
    });

    new App();

	$('.fullscreen').click(function(){
		if (chrome.app.window.current().isFullscreen()) {
			chrome.app.window.current().restore()
		} else {
			chrome.app.window.current().fullscreen()
		}
	});


	$('.options').click(function(){
    	var options = new OptionsView({ model: OptionsModel });
    	options.show();
	});

	var OptionsView = Backbone.View.extend({
		className: 'modal-background',
        events: {
            'click #saveBtn': 'save',
            'click .close': 'close',
            'click .modal-background': 'close'
        },
        render: function(){
            var source = $('#template').html(),
                html = Handlebars.templates.options(this.model.attributes);

            this.$el.html(html);
            return this;
        },
        show: function() {
            $(document.body).append(this.render().el);                
        },
        close: function() {
            this.remove();
        },
        save: function() {
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

				if (deleteDB) {
					chrome.runtime.reload();
				} else {
					chrome.app.window.current().close();
				}
			});			
        }
    });    
});