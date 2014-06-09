$(function(){
	var tweets,
		hashtag = 'Globant',
		searchQuery = 'globant',
		filterWords,
		tweetsQuantity,
		updateInterval,
		OptionsModel;

    var Tweet = Backbone.Model.extend({
    	initialize: function() {
    		var createdAt = this.attributes.created_at,
    			view;

			this.attributes.created_at_parsed = this.parseTwitterDate(createdAt);
			this.styleText('@', 'span');
			this.styleText('#', 'span');
			this.styleText('http', 'span');

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
		},
		styleText: function(symbol, label) {
			var text = this.attributes.text,
				position = text.search(symbol),
				hash = text.slice(position);

			while (position !== -1) {
				this.attributes.text = this.attributes.text.slice(0, -hash.length);
				hash = this.searchHtml(hash, label);
				position = hash.search(symbol);
				hash = hash.slice(position);
			}
		},
		searchHtml: function(text, tag) {
			text = '<'+tag+'>' + text;
			space = text.search(' ');

			if (space !== -1) {
				text = text.slice(0, space) + '</'+tag+'>' + text.slice(space);
			} else {
				text += '</'+tag+'>';
			}

			this.attributes.text += text;

			return text.slice(space);
		}
    });

    var TweetsList = Backbone.Collection.extend({
        model: Tweet,
        interval: '5000',

        initialize: function(){
        	var that = this;

        	this.interval = updateInterval;

            $.ajax({
				type: 'GET',
				url:'http://mpalmieriglb.byethost24.com/?searchQuery='+searchQuery+'%20-'+filterWords+'&sinceId=&count=4',
				success: function (data) {
					data = jQuery.parseJSON(data);

					if(data.errors) {
						console.log(data.errors[0].message);
					} else {
						$(data.statuses.reverse()).each(function() {
							new Tweet(this);
						});
						that.addNewTweet();
					}

				}
			});
        },
        addNewTweet: function() {
        	var that = this;

        	setInterval(function() {
        		var LastTweetID = $(that.models).last()[0].id;

	    		$.ajax({
					type: 'GET',
					url:'http://mpalmieriglb.byethost24.com/?searchQuery='+searchQuery+'&sinceId='+LastTweetID+'&count=',
					success: function (data) {
						data = jQuery.parseJSON(data);

						if(data.errors) {
							console.log(data.errors[0].message);
						} else {
							$(data.statuses.reverse()).each(function() {
								if (this.id !== LastTweetID) {
									new Tweet(this);
								}
							});							
						}
					}
				});
        	}, this.interval);
        }        
    });

    var TweetView = Backbone.View.extend({
        tagName: 'li',
        events: {
        	'click': 'removeTweet'
        },
        render: function(){
            var html = Handlebars.templates.tweet(this.model.attributes);

            this.backgroundOrientation();
            this.$el.html(html);
            return this;
        },
		backgroundOrientation: function() {
			var number = Math.floor((Math.random() * 100) + 1);
			if (number % 2 === 0) {
				this.$el.addClass('left-background');
			}
		},
		removeTweet: function() {
			this.remove();
			//tweets.remove(this.model);			
		}
    });

    var App = Backbone.View.extend({
        el: $('#TweetIT'),
        events: {
        	'click .fullscreen': 'toFullScreen',
        	'click .options': 'showOptions',
        },
        initialize: function(){
        	this.startChromeApp();
        },
        startChromeApp: function() {
        	OptionsModel = new Backbone.Model();

        	chrome.storage.local.get(function(settings) {

				hashtag = settings.hashtag;
				$('#header').find('strong').html(settings.hashtag);

				searchQuery = settings.query;
				
				filterWords = settings.filterWords.replace(/\s/g, '+-');
				
				tweetsQuantity = settings.tweetsQuantity;

				updateInterval = settings.updateInterval;

				if(updateInterval < 5000) {
					updateInterval = 5000;
				}

				OptionsModel = new Backbone.Model(settings);
				tweets = new TweetsList();
			});
			

        },
        toFullScreen: function() {
			if (chrome.app.window.current().isFullscreen()) {
				chrome.app.window.current().restore()
			} else {
				chrome.app.window.current().fullscreen()
			}
        },
        showOptions: function() {
	    	var options = new OptionsView({ model: OptionsModel });
	    	options.show();
        },
        msToTime: function(duration) {
		    var milliseconds = parseInt((duration%1000)/100)
		        , seconds = parseInt((duration/1000)%60)
		        , minutes = parseInt((duration/(1000*60))%60)
		        , hours = parseInt((duration/(1000*60*60))%24);

		    hours = (hours < 10) ? "0" + hours : hours;
		    minutes = (minutes < 10) ? "0" + minutes : minutes;
		    seconds = (seconds < 10) ? "0" + seconds : seconds;

		    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
		}
    });

	var OptionsView = Backbone.View.extend({
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

			// Save it using the Chrome extension storage API.
			chrome.storage.local.set({
				'query': query,
				'filterWords': hide,
				'hashtag': hashtag,
				'tweetsQuantity': tweetsQuantity,
				'updateInterval': updateInterval
			},
			function() {
				chrome.runtime.reload();				
			});			
        }
    });    

    new App();
});