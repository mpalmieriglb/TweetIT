chrome.app.runtime.onLaunched.addListener(function() {

	chrome.app.window.create('window.html', {
		'bounds': {
			'width': 1024,
			'height': 576
		},
		'frame': 'chrome'
	});


});

