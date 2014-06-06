(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['tweet'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<section>\r\n	<div class=\"userInfo\">\r\n		<div class=\"image\">\r\n			<img id=\"image";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />\r\n		</div>\r\n		<div class=\"info\">\r\n			<div class=\"date\">";
  if (helper = helpers.created_at_parsed) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.created_at_parsed); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\r\n			<div class=\"name\">\r\n				<strong>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</strong><br />\r\n				<span>@"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.screen_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\r\n			</div>\r\n		</div>\r\n	</div>\r\n\r\n	<div class=\"tweetContent\">\r\n		<div class=\"tweetText\">\r\n			";
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n		</div>\r\n\r\n		<div class=\"tweetImage\">\r\n			<img src=\"";
  if (helper = helpers.tweet_image_base64) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tweet_image_base64); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />\r\n		</div>\r\n	</div>\r\n</section>\r\n";
  return buffer;
  });
})();