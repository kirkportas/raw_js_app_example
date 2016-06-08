var PhoneGapProxy = {
    'navigator': {
        'notification': {
            'vibrate': function (a) {
                if (navigator.notification && navigator.notification.vibrate) {
                    navigator.notification.vibrate(a);
                } else {
                    console.warn('navigator.notification.vibrate');
                }
            },
            'alert': function (a, b, c, d) {
                if (navigator.notification && navigator.notification.alert) {
                    navigator.notification.alert(a, b, c, d);
                } else {
                    console.warn('navigator.notification.alert');
                    alert(a);
                }
            },
            'confirm': function (message, callback, title, labels) {
                if (navigator.notification && navigator.notification.confirm) {
                    navigator.notification.confirm(message, callback, title, labels);
                } else {
                    console.warn('navigator.notification.alert');
                    if (confirm(message)) {
                        auth.handleLogout();
                    }
                }
            }
        },
        'splashscreen': {
            'hide': function () {
                if (navigator.splashscreen) {
                    navigator.splashscreen.hide();
                } else {
                    console.warn('navigator.splashscreen.hide');
                }
            }
        }
    }
};

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

Handlebars.registerHelper('humanizeInches', function(value) {
    var threshold = 36;  // Convert everything bigger than 36 inches to feet

    if (value >= threshold) {
        var feet = Math.floor(value / 12);
        var inches = value % 12;
        var output = feet + '\' ';
        if (inches > 0) output += inches + '"';
        return output;
    } else {
        return value + '"';
    }
});

Handlebars.registerHelper('ifMore', function(v1, v2, options) {
    if(v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

var core = {
    DEBUG: false,
    pageHistoryCount: 0,
    goingBack: false,

    fixPaddingForIOS7: function () {
        if (window.device) {
            if (parseFloat(window.device.version) >= 7.0) {
                if (core.DEBUG) { console.info('Fixed top padding for iOS 7'); }
                $('.header_override').css({'padding-top': '20px'});
            }
        }
    },
    patchImagesWithLettersForGrid: function (images) {
        var letters = ['a', 'b', 'c'];
        var innerCounter = 0;  // We use it for counting 1-3, letters a, b, c)

        if (!images.length) return [];

        for (var i = 0; i < images.length; i++) {
            if (innerCounter == 3) innerCounter = 0;  // Time to reset
            images[i].letter = letters[innerCounter];
            innerCounter += 1;
        }

        return images;
    },
    // ANDROID ONLY
    exitApp: function () {
        if (core.DEBUG) { console.log("Exiting app"); }
        navigator.app.exitApp();
    },
    confirmExit: function () {
        navigator.notification.confirm("Are you sure you want to exit?", function(result){
            if (result == 2) {
                core.exitApp();
            } 
        }, 'Exit', 'No,Exit');
    },
    // Handle the back button
    onBackKeyDown: function (e) {
        e.preventDefault();

        var page = $(':mobile-pagecontainer').pagecontainer('getActivePage');

        //alert(page.attr('id'));
        
        if (page.attr('id') == 'inventoryListPage') {
            app.showRequestsListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else if (page.attr('id').startsWith('inventoryDetailPage')) {
            app.showInventoryListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else if (page.attr('id') == 'requestListPage') {
            app.showInventoryListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else if (page.attr('id').startsWith('requestDetailPage')) {
            app.showRequestsListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else if (page.attr('id') == 'contactPage') {
            requests.showRequestDetailsView(inventory.current_item_id);
            //app.showRequestsListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else if (page.attr('id') == 'loginPage') {
            core.confirmExit();
        } else if (page.attr('id') == 'noAccountPage') {
            app.showLoginView();
            core.pageHistoryCount = 0;
        } else if (page.attr('id') == 'capturePage') {
            inventory.showItemsDetailsView(inventory.current_item_id);
            //app.showInventoryListView();
            core.goingBack = true;
            core.pageHistoryCount--;
        } else {
            core.confirmExit();
        }
    },
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
    },
    showPage: function (id) {
        $(':mobile-pagecontainer').pagecontainer('change', '#' + id);
    },
    setActiveMenuItem: function (name) {
        $.mobile.activePage.find('a[data-icon="' + name + '"]').addClass('ui-btn-active');
    },
    removePage: function (pageId) {
        $('body > div[id="' + pageId + '"]').remove();
    }
};
