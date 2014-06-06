/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	var Tweets = Backbone.Collection.extend({
		model: app.tweet,
	});

	app.tweets = new Tweets();
})();