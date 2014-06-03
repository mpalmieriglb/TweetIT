
    
	/*---------------------------------------------*/
	
	/* 					GET OPTIONS
	
	/*---------------------------------------------*/
	
	options = new Object();
	var query;
	
	chrome.storage.local.get(function(result){
		
		console.log(result);
		
		options.hashtag = result.hashtag;
		options.query = result.query;
		options.tweetQuantity = result.tweetQuantity;
		options.filter = result.filter;
		options.updateInterval = result.updateInterval;
		options.highlight = result.highlight;
		
		options.backgroundColor = result.backgroundColor;
		options.titleColor = result.titleColor;
		options.textColor = result.textColor;
		
		console.log(options.query);
		
		query = options.query.replace(/\s+/, ' ').trim(),
        filter = options.filter.trim().split(/\s+/).join(' -');
		query = encodeURIComponent(query + (filter ? ' -' + filter : ''));
		
        //console.log(query);
        
		// Call Twitter API OAUTH
		oauth.authorize(onAuthorized);
	
			
	})
    
    
    /*---------------------------------------------*/
	
	/* 				TWITTER OAUTH
	
	/*---------------------------------------------*/

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
	
    responseTweet = new Object();


	
    /*---------------------------------------------*/
	
	/* 				CONTROLLER
	
	/*---------------------------------------------*/
	
    function tweetsListCtrl($scope)
    {
        
        
        $scope.tweets = $scope.responseTweet;
        
        $scope.responseTweet = new Object();
        
        window.setTimeout(function(){
        $scope.$apply(function(){
            onAuthorized();
            console.log("Timeout");
        })
        }, options.updateInterval * 1000);
        
       
    }

	


	

	function callback(resp, xhr) {
		// ... Process text response ...
		//console.log(resp);
		var response = $.parseJSON(resp);
		
        
        responseTweet = response.statuses;
    
        
        console.log("CALLBACK");
		console.log(responseTweet);
        
       
        
        angular.element(document).ready(function() {
            angular.bootstrap(document);
        });
        

	};

    
	function onAuthorized(response) {
		var url = 'https://api.twitter.com/1.1/search/tweets.json';
        //var url = 'https://stream.twitter.com/1/statuses/filter.json';
		var request = {
			'method': 'GET',
			'parameters': {
				
				'q': query,
				'include_entities': 'true',
				'result_type': 'recent',
				'count': options.tweetQuantity
			}
		};
    
		oauth.sendSignedRequest(url, callback, request);
	};



    
    
	
	


