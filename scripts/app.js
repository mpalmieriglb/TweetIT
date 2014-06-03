$(function(){

    var Tweet = Backbone.Model.extend({

    });

    var TweetsList = Backbone.Collection.extend({
        model: Tweet
    });

    var tweets = new TweetsList( [
        new Tweet({ created_at_parsed: 'hoy', user: { name: 'Perros de la Calle', screen_name: 'perroscalle' }, text: 'mañana por ahora salimos sólo por radio. Las transmisiones en vivo por @foxlife_ar largan unos días después', tweet_image_base64: 'https://pbs.twimg.com/media/BpElyEpIIAAXUJI.jpg:large"' }),
        new Tweet({ created_at_parsed: 'hoy', user: { name: 'Perros de la Calle', screen_name: 'perroscalle' }, text: 'mañana por ahora salimos sólo por radio. Las transmisiones en vivo por @foxlife_ar largan unos días después', tweet_image_base64: 'https://pbs.twimg.com/media/BpElyEpIIAAXUJI.jpg:large"' }),
        new Tweet({ created_at_parsed: 'hoy', user: { name: 'Perros de la Calle', screen_name: 'perroscalle' }, text: 'mañana por ahora salimos sólo por radio. Las transmisiones en vivo por @foxlife_ar largan unos días después', tweet_image_base64: 'https://pbs.twimg.com/media/BpElyEpIIAAXUJI.jpg:large"' }),
        new Tweet({ created_at_parsed: 'hoy', user: { name: 'Perros de la Calle', screen_name: 'perroscalle' }, text: 'mañana por ahora salimos sólo por radio. Las transmisiones en vivo por @foxlife_ar largan unos días después', tweet_image_base64: 'https://pbs.twimg.com/media/BpElyEpIIAAXUJI.jpg:large"' }),
    ]);

    var TweetView = Backbone.View.extend({
        tagName: 'li',

        render: function(){
            var source = $('#template').html(),
                template = Handlebars.compile(source),
                context = this.model.attributes,
                html = template(context);

            this.$el.html(html);

            return this;
        }
    });

    var App = Backbone.View.extend({
        el: $('#mainWrapper'),

        initialize: function(){
            this.list = $('#tweets');

            tweets.each(function(tweet){

                var view = new TweetView({ model: tweet });
                this.list.append(view.render().el);

            }, this);
        },

        render: function(){

        }
    });

    new App();
});