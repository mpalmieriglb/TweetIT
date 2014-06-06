var app = app || {};

(function ($) {
	'use strict';

	app.AppView = Backbone.View.extend({
		el: '#mainWrapper',

		initialize: function () {
			console.log('init');
		},
	});
})(jQuery);