if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        }
    });
}

Handlebars.registerHelper('ifMore', function(v1, v2, options) {
    if(v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

var core = {
    DEBUG: false,
    pageHistoryCount: 0,

    // confirmExit: function () {
    //     navigator.notification.confirm("Are you sure you want to exit?", function(result){
    //         if (result == 2) {
    //             core.exitApp();
    //         }
    //     }, 'Exit', 'No,Exit');
    // },

    isAndroid: function () {
        return window.device && window.device.platform == 'Android';
    },
    logObjProperties: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (core.DEBUG) { console.info(key + ': ' + obj[key]); }
            }
        }
    },
    renderPage: function (templateId, context, selector, partials) {
        //if (core.DEBUG) { console.log('rendering page: templateId: ' + templateId + ', context: ' +context+ ', selector: '+ selector+', partials: ' + partials); }
        var source = $(templateId).html();
        var template = Handlebars.compile(source);

        if (partials && partials.length) {
            for (var i = 0; i < partials.length; i++) {
                Handlebars.registerPartial(partials[i], $('#' + partials[i]).html());
            }
        }
        var html = $(template(context));
        html.attr('id', selector);  // Set the unique ID

        $('body > #' + selector).remove();  // This is how we avoid dupes
        $.mobile.pageContainer.append(html);
        $("div[data-role='page']").not('[id]').remove(); // Remove dupe request page with no id
        //if (core.DEBUG) { console.log('requesthtml: ' + html); }
        $.mobile.loading('hide');
        $(':mobile-pagecontainer').pagecontainer('change', html);

        if (app.hasConnection()) {
            capture.uploadQueue();
        }
    },
    alreadyRendered: function (id) {
        return $('body > div#' + id).length;
    }
};
