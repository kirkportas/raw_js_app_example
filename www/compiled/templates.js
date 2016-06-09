this["JST"] = this["JST"] || {};

Handlebars.registerPartial("add-task-input", Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"input-group\">\r\n    <input id=\"new-task-title\" type=\"text\" class=\"form-control\" placeholder=\""
    + ((stack1 = ((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"placeholder","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\">\r\n    <span class=\"input-group-btn\">\r\n        <button class=\"btn btn-default\" type=\"button\" onClick=\"GFT_APP.tasks.createTask()\">Add!</button>\r\n    </span>\r\n</div>\r\n";
},"useData":true}));

this["JST"]["www/templates/landing.hbs"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        <ul>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.tasks : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </ul>\r\n        <span id=\"task_count\"> "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.tasks : depth0)) != null ? stack1.length : stack1), depth0))
    + " items in list </span>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "            <li>\r\n                "
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.title : depth0), depth0))
    + "\r\n                <button class=\"btn btn-default\"> Delete </button>\r\n            </li>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"col-md-4 col-md-offset-4\">\r\n    <div class=\"header\">\r\n        <h1 class=\"\">Task App</h1>\r\n    </div>\r\n"
    + ((stack1 = container.invokePartial(partials["add-task-input"],depth0,{"name":"add-task-input","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    <div id=\"task-list\">\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.tasks : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n    <!--  -->\r\n\r\n    <!-- Footer -->\r\n</div>\r\n";
},"usePartial":true,"useData":true});