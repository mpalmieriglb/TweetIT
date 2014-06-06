(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['options'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"options\">\r\n    <span class=\"close\"></span>\r\n    <div class=\"inputWrapper\">\r\n        <label for=\"full-name\" class=\"t1-label field-name\">Event Hashtag</label>\r\n        <input type=\"text\" id=\"hashtag\" placeholder=\"globantParty\" value=\"";
  if (helper = helpers.hashtag) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.hashtag); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />\r\n    </div>\r\n\r\n    <div class=\"inputWrapper\">\r\n        <label>Show Tweets With...</label>\r\n        <input type=\"text\" id=\"query\" placeholder=\"globant OR party #globantParty\" value=\"";
  if (helper = helpers.query) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.query); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />\r\n    </div>\r\n\r\n    <div class=\"inputWrapper\">\r\n        <label>Hide Tweets Containing...</label>\r\n        <input type=\"text\" id=\"hide\" placeholder=\"boring ugly hungry\" value=\"";
  if (helper = helpers.filterWords) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.filterWords); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />\r\n    </div>\r\n\r\n    <button><a href=\"#\" id=\"saveBtn\">Save</a></button>\r\n    <button><a href=\"#\" id=\"deleteDB\">Delete DB</a></button>\r\n</div>\r\n\r\n<div class=\"modal-background\">asd</div>";
  return buffer;
  });
})();