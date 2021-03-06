var APP = {};

var pag_index = 0;
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

(function(){
  
  function Storage (argument) {
    var data = {options: null, tweets: null};
    this.setOptions = function(data) {
      var notification = webkitNotifications.createNotification("glb.gif", "Settings Saved", "Data was saved and will be automatically synced");
      chrome.storage.local.set({"options": data}, function(items) {
        data.options = items;
        notification.show();
      });
    };
    this.getOptions = function(callback) {
      if (!data.options) {
        chrome.storage.local.get("options", function(items) {
          data.options = items.options;
          callback(data.options);
        });
      } else {
        callback(data.options);
      }
    };
    this.setTweets = function (data) {
      chrome.storage.local.set({"tweets": data}, function(items) {
        data.tweets = items;
      });
    };
    this.getData = function(callback) {
      if (!data.tweets && !data.options) {
        chrome.storage.local.get(["options", "tweets"], function(items) {
          data = items;
          callback(data.options, data.tweets);
        });
      } else {
        callback(data.options, data.tweets);
      }
    };
	this.saveSingleImage = function(originalURL, successCallback, errorCallback) {
	
		function errorHandler() {
			errorCallback();
		}
		
		var originalName = originalURL.substring(originalURL.lastIndexOf("/")+1);
		webkitStorageInfo.requestQuota(PERSISTENT, 1 * 1024 * 1024, function(grantedBytes) {
			requestFileSystem(PERSISTENT,
							grantedBytes,
							function(fs) {
								$.ajax({
									type: 'GET',
									url: originalURL,
									async: false,
									beforeSend: function (xhr) {
										xhr.overrideMimeType("text/plain; charset=x-user-defined");
									},
									success: function(data) {
												fs.root.getFile(originalName, {'create': true}, function(fileEntry) {
												
													fileEntry.createWriter(function(fileWriter) {
													
														fileWriter.onwriteend = function(event) {												
															successCallback(fileEntry.toURL());
														}
														
														// string to binary
														var buffer = new Uint8Array(data.length);
														for (var i = 0; i < data.length; i++) {
															buffer[i] = data.charCodeAt(i) & 0xff;
														}
														
														var blob = new Blob([ buffer ], { type: 'image/jpeg' } );

														fileWriter.write(blob);
													}, errorHandler );
												});
									},
									error: errorHandler
								});
							},
							errorHandler)
		}, errorHandler);
	}
  }

  APP.storage = new Storage();

}());

(function(){

  function Options () {
    this.fields = {
      "eventHash": {"name": "event_hash", "multiple": false},
      "query": {"name": "query", "multiple": false},
      "backgroundColor": {"name": "bg_color", "multiple": true},
      "backgroundImage": {"name": "bg_image", "multiple": false},
      "titleColor": {"name": "title_color", "multiple": true},
      "textColor": {"name": "text_color", "multiple": true},
      "tweetCount": {"name": "tweets", "multiple": true},
      "wordFilter": {"name": "word_filter", "multiple": false},
      "updateInterval": {"name": "update_interval", "multiple": false},
      "highlight": {"name": "highlight", "multiple": false}
    };
    $($.proxy(function(){
      if ($("#btn_update").length && $("#content").length) {
        this.$container = $("#content");
        this.init($("#btn_update"));
      }
    }, this));
  }

  Options.prototype.init = function($trigger) {
    APP.storage.getOptions($.proxy(this.render, this));
    $trigger.click($.proxy(function(e){
      e.preventDefault();
      this.save();
    }, this));
  };

  Options.prototype.render = function(options) {
    var $container = this.$container, items = this.fields, i, cur, aux, $field;
    for (i in options) {
      if (options.hasOwnProperty(i)) {
        cur = options[i];
        aux = items[i];
        $field = $container.find("[name=" + aux.name + "]" + (aux.multiple ? "[value=" + cur + "]" : ""));
        if (aux.multiple) {
          $field.attr("checked", true);
        } else {
          $field.val(cur);
        }
      }
    }
  };

  Options.prototype.renderErrors = function(errors) {
    var $container = this.$container, i, aux, $sibling;
    for (i = errors.length - 1; i >= 0; i--) {
      aux = errors[i];
      $sibling = $container.find("[name=" + aux.field + "]").last();
      if ($sibling.parents(".second-row").length) {
        $sibling = $sibling.parents(".second-row");
      }
      $sibling.after($("<span>", {"class": "second-row error", "text": aux.msg}));
    }
  };

  Options.prototype.clearErrors = function() {
    this.$container.find(".error").remove();
  };

  Options.prototype.validateOptions = function(data) {
    var errors = [];
    // Event must have a hash
    if (!data.eventHash) {
      errors.push({field: "event_hash", msg: "Write a hashtag to identify the event"});
    }
    // Event must have a query
    if (!data.query) {
      errors.push({field: "query", msg: "Write some words to search for"});
    }
    // Event must have a bg color
    if (!data.backgroundColor) {
      errors.push({field: "bg_color", msg: "Select a color for the background"});
    }
    // Event may have an image
    // Event must have a title color
    if (!data.titleColor) {
      errors.push({field: "title_color", msg: "Select a color for the title"});
    }
    // Event must have a text color
    if (!data.textColor) {
      errors.push({field: "text_color", msg: "Select a color for the text"});
    }
    // Event must have a number of tweets to be displayed
    if (!data.tweetCount) {
      errors.push({field: "tweets", msg: "Select a a number of tweets to be displayed"});
    }
    // Event may have a list of restricted words	
    // Event must have an update interval
    if (!data.updateInterval) {
      errors.push({field: "update_interval", msg: "Specify an update interval"});
    } else {
		valid = /^[1-9]+[0-9]*$/.test(data.updateInterval);
		if(!valid) {
			errors.push({field: "update_interval", msg: "Specify a valid interval"});
		}
	}
    return errors;
  };

  Options.prototype.save = function() {
    var options = {}, errors, $container = this.$container, items = this.fields, i;
    this.clearErrors($container);
    for (i in items) {
      if (items.hasOwnProperty(i)) {
        options[i] = $container.find("[name=" + items[i].name + "]" + (items[i].multiple ? ":checked" : "")).val();
      }
    }
    errors = this.validateOptions(options);
    if (errors.length) {
      this.renderErrors(errors);
    } else {
      APP.storage.setOptions(options);
    }
  };

  APP.BO = new Options();

}());

(function() {

  function Wall (argument) {
    $($.proxy(function(){
      if ($("#container").length) {
        this.$container = $("#container");
        $("#error-message > a").click(function(e) {
          e.preventDefault();
          $(this).parent().hide();
        });
        APP.storage.getData($.proxy(this.init, this));
      }
    }, this));
  }

  Wall.prototype.init = function(options, tweets) {
    if (!options) {
      this.displayError("You must set some options first!");
    } else {
      this.applyOptions(options);
      if (tweets) {
        this.renderTweets(tweets, options);
      }
      this.update(tweets, options);
    }
  };

  Wall.prototype.applyOptions = function(options) {
    //eventHash
    $("#hash").text("#" + options.eventHash);
    //backgroundColor
    $("body").addClass(options.backgroundColor);
    //backgroundImage
    if (options.backgroundImage) {
      $("body").css({
        "backgroundImage": "url(" + options.backgroundImage + ")",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "100%"
      });
    }
    //titleColor
    // See renderTweets
    //textColor
    // See renderTweets
  };

  Wall.prototype.renderTweets = function(tweets, options) {
    var length = parseInt(options.tweetCount, 10),
        $tmpl = $("#view-tweet"), i, data = [],
        aux = length === 4 ? "half" : length === 3 ? "third" : "";
    for (i = 0; i < tweets.length && i < length; i++) {
		if(tweets[i].alias == options.highlight) {
			data.push($.extend({klass: (aux + ' highlight')}, tweets[i]));
		} else {
			data.push($.extend({klass: aux}, tweets[i]));
		}
    }
    if (data.length) {
      $tmpl.mustache({tweets: data}).appendTo($('#container').empty());
    }
    //titleColor
	$(".name").addClass(options.titleColor + "text");
	$(".user").addClass(options.titleColor + "text");
    $("#container").addClass(options.textColor + "text");
    //textColor
  };

  Wall.prototype.displayError = function(msg) {
    $("#error-message > p").text(msg).parent().show();
  };
  


  Wall.prototype.update = function(tweets, options) {
    var query = options.query.replace(/\s+/, " ").trim(),
        filter = options.wordFilter.trim().split(/\s+/).join(" -");
    query = encodeURIComponent(query + (filter ? " -" + filter : ""));
	
	/*
	var oauth = ChromeExOAuth.initBackgroundPage({
		'request_url': 'https://api.twitter.com/oauth/request_token',
		'authorize_url': 'https://api.twitter.com/oauth/authorize',
		'access_url': 'https://api.twitter.com/oauth/access_token',
		'consumer_key': 'T0Uj2XhqcnNzphoFXt1fw',
		'consumer_secret': 'nE9ioDNZkwVojMAmrOQ3CzhZaQVw5LWvj1uKGcythI',
		'oauth_token' : '14202402-NExv1J7xqonCbvmoVh3eOLzqmJIMV6a8lmzShzq94',
		'oauth_token_secret' : 'CVhC9IEDo9ch9XPW47KdzUV6KIBB2yflClqJlfqYoY',
		//'scope': '',
		'app_name': 'TweetIT2Mrks'
	});
	
*/
		
	
	
	
	/*function onAuthorized(){
		console.log('Auth!');
		$.ajax({
			type: 'GET',
			//url: 'http://search.twitter.com/search.json?q=' + query + '&include_entities=true&result_type=recent&rpp=4',
			url: 'https://api.twitter.com/1.1/search/tweets.json?q=' + query + '&include_entities=true&result_type=recent&rpp=4',
			dataType: 'json',
			async: false,
			success: $.mixin(this, function(options, data) {
					this.preSave(tweets, data, options, 0, false);
				}, options),
			error: $.mixin(this, function(options, data) {
					var leftLimit = pag_index * options.tweetCount;
					var rightLimit = leftLimit + new Number(options.tweetCount);
					var slice;
					if(tweets.length >= rightLimit) {
						slice = tweets.slice(leftLimit, rightLimit);
					} else {
						slice = tweets.slice(leftLimit);
					}
					this.renderTweets(slice, options);
					if(tweets.length > ((pag_index + 1) * options.tweetCount)){
						pag_index++;
					} else {
						pag_index = 0;
					}
					setTimeout($.mixin(this, this.update, tweets, options), (options.updateInterval * 1000));
				}, options)
		});
	}*/
	
	
	/*
	function callback(resp, xhr) {
		// ... Process text response ...
		//console.log(resp);
		var response = $.parseJSON(resp);
		console.log(response);
		console.log(xhr);
		
	};

	console.log('query: ' + query);
	
	function onAuthorized() {
		var url = 'https://api.twitter.com/1.1/search/tweets.json';
		var request = {
			'method': 'GET',
			'parameters': {
				
				'q': query,
				'include_entities': 'true',
				'result_type': 'recent',
				'count': '4'
			}
		};
  

		// Send: GET https://docs.google.com/feeds/default/private/full?alt=json
		oauth.sendSignedRequest(url, callback, request);
	};

	
	oauth.authorize(onAuthorized);
	
	*/
  };
  
  Wall.prototype.preSave = function(oldTweets, data, options, index, saveTwitpic) {
	var originalURL;
	
	if(data && data.results && data.results.length) {	
		if(saveTwitpic) {
			originalURL = data.results[index].entities.media[0].media_url;
		} else {
			originalURL = data.results[index].profile_image_url;
		}
			
		APP.storage.saveSingleImage(originalURL, 
							function(localURL){
								if(saveTwitpic) {
									data.results[index].entities.media[0].media_url = localURL;
									
									if(index < data.results.length - 1) {
										Wall.prototype.preSave(oldTweets, data, options, (index+1), false);
									} else {
										Wall.prototype.save(oldTweets, data, options);
									}
								} else {
									data.results[index].profile_image_url = localURL;
									
									var aux = data.results[index];
									if ((aux = aux.entities.media) && (aux = aux[0]) && aux.type === "photo") {
										Wall.prototype.preSave(oldTweets, data, options, index, true);								
									} else {
										if(index < data.results.length - 1) {
											Wall.prototype.preSave(oldTweets, data, options, (index+1), false);
										} else {
											Wall.prototype.save(oldTweets, data, options);
										}
									}
								}
							},
							function() { Wall.prototype.displayError("Oops! It looks like something has failed.");
		});
	} else {
		Wall.prototype.save(oldTweets, data, options);
	}
  };

  Wall.prototype.save = function(oldTweets, data, options) {
    var arr = [], i, aux, obj;
	var concatenated;
    data = data.results;
	if(data && data.length) {
		for (i in data) {
		  aux = data[i];
		  obj = {
			name: aux.from_user_name,
			alias: aux.from_user,
			picture: aux.profile_image_url,
			text: aux.text
		  };
		  if ((aux = aux.entities.media) && (aux = aux[0]) && aux.type === "photo") {
			obj.media = aux.media_url;
		  }
		  arr.push(obj);
		}
		if(oldTweets) {
			concatenated = oldTweets.concat(arr);
		} else {
			concatenated = arr;
		}
		APP.storage.setTweets(concatenated);
	} else {
		concatenated = oldTweets;
	}
	if(concatenated.length > options.tweetCount) {
		this.renderTweets(concatenated.slice(concatenated.length-options.tweetCount), options);
	} else {
		this.renderTweets(concatenated, options);
	}
	pag_index = 0;
	setTimeout($.mixin(this, this.update, concatenated, options), (options.updateInterval * 1000));
  };

  APP.FO = new Wall();

}());

(function($){

  $.mixin = function (ctxt, fn, args) {
    args = Array.prototype.slice.call(arguments, 2);
    return function () {
      fn.apply(ctxt, args.concat(Array.prototype.slice.call(arguments)));
    };
  };

}(jQuery));
