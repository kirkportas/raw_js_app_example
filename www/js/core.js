DEBUG=true; // Global Debug Var

var GFT_APP = window.GFT_APP || {};
var GFT_APP = {
    // Extendable router of page names & mapped Template locations
    // Useful because the Handlebars/grunt config will change over time and this can be updated to match
    pageRouter: { 'landing': 'www/templates/landing.hbs' },

    init: function() {
        if (DEBUG) { console.log("GFT_APP: init()"); }

        // Define landing page context for template
        var context={
            placeholder: "Add items to list",
            tasks: GFT_APP.tasks.getTasks() // Checks goes thru Tasks=>Api if first load
        };

        this.renderPage("landing", context, "#landing-content")
    },

    renderPage: function (templateName, context, selector) {
        if (DEBUG) { console.log('rendering page: templateName: ' + templateName + ', context: ' +context+ ', selector: '+ selector); }

        // Get template from compiled JST object, pass in received context (just from init() for now)
        templateHtml = JST[ GFT_APP.pageRouter[templateName] ]( context );

        // Add compiled HTML to page, in defined selector.
        $(selector).html(templateHtml);

        // Update <html> dom object to track 'active' page.
        $('html').attr('data-activepage', templateName);
    }
};

//## Some useful JS utils
// var UTILS = {
//     logObjProperties: function (obj) {
//         for (var key in obj) {
//             if (obj.hasOwnProperty(key)) {
//                 if (GFT_APP.DEBUG) { console.info(key + ': ' + obj[key]); }
//             }
//         }
//     }
// }

// if (!String.prototype.startsWith) {
//     Object.defineProperty(String.prototype, 'startsWith', {
//         enumerable: false,
//         configurable: false,
//         writable: false,
//         value: function (searchString, position) {
//             position = position || 0;
//             return this.indexOf(searchString, position) === position;
//         }
//     });
// }

// Handlebars.registerHelper('ifMore', function(v1, v2, options) {
//     if(v1 > v2) {
//         return options.fn(this);
//     }
//     return options.inverse(this);
// });


//## Extend Storage with some localStorage get/set helpers
// Storage.prototype.setObject = function(key, value) {
//     this.setItem(key, JSON.stringify(value));
// }

// Storage.prototype.getObject = function(key) {
//     var value = this.getItem(key);
//     return value && JSON.parse(value);
// }