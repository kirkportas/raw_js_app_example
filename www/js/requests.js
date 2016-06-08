//## This is an alternate to using an onclick function to call the showRequestsListView() method
//$( "#requestsPage" ).on( "pageshow", function( event, ui ) {
//    if (core.DEBUG) { console.log('requestspage container load'); }
//    app.showRequestsListView();
//} );

var requests = {
    pagination_item_counter: 0,
    pagination_limit: 5,
    refreshList: function () {
        if (core.DEBUG) { console.log('RefreshList() for Requests'); }
        if (app.hasConnection()) {
            $.mobile.loading('show');

            var refreshRequestsButton = $('#refreshRequests');
            refreshRequestsButton.attr('disabled', 'disabled');
            window.plugins.toast.showShortCenter('Refreshing List & Upload Queue');

            api.getRequestList()
                .done(function () {
                    var source = $('#request-items').html();
                    if (core.DEBUG) { console.log('source: ' + source); }
                    var template = Handlebars.compile(source);
                    var image_requests = JSON.parse(localStorage.image_requests);
                    var context = {};
                    context.image_requests = image_requests;

                    var html = $(template(context));
                    if (core.DEBUG) { console.log('html: ' + html); }

                    $('#requestsList').empty(); //Empty list
                    $('#requestsList')
                        .append(html)
                        .listview()
                        .listview('refresh');

                    requests.getCounter();
                    window.plugins.toast.showShortCenter('Refreshed Image Requests');
                }).fail(function () {
                    PhoneGapProxy.navigator.notification.vibrate();
                    PhoneGapProxy.navigator.notification.alert('Could not fetch image requests');
                    if (core.DEBUG) { console.error('Could not fetch image requests'); }
                }).always(function () {
                    $.mobile.loading('hide');   
                    refreshRequestsButton.removeAttr('disabled');  
                });  

            $('body > div[id^="requestDetailPage"]').remove(); //Remove rendered request
            capture.uploadQueue();
        } else {
            if (core.DEBUG) { console.log('offline'); }
            window.plugins.toast.showShortCenter('Currently offline');
        }
    },
    getList: function () {
        if (core.DEBUG) { console.log('Called getRequestList()'); }
        var id = 'requestListPage';

        if (core.alreadyRendered(id)) {
            if (core.DEBUG) { console.info('No need to render Image Requests List again'); }
            core.showPage(id);
            core.setActiveMenuItem('requests');
            return;
        }

        if (!localStorage.inventory_items) {
            if (core.DEBUG) { console.info('Image items cache does not exist, going to create it'); }
            $.mobile.loading('show');
            api.getInventoryList()
                .done(function () {
                    requests.renderRequests();
                }).fail(function () {
                    PhoneGapProxy.navigator.notification.vibrate();
                    PhoneGapProxy.navigator.notification.alert('Could not fetch image requests');
                    if (core.DEBUG) { console.error('Could not fetch image requests'); }
                });
            $.mobile.loading('hide');
        } else {
            if (core.DEBUG) { console.log('Showing items from cache'); }
            requests.renderRequests();
        }
    },
    getCounter: function () {
        if (core.DEBUG) { console.log('Called getCounter() This function doesnt check API if local imgreqs exist'); }
        var image_requests = [];

        if (localStorage.image_requests) {
            image_requests = JSON.parse(localStorage.image_requests);
            if (image_requests.length > 0) {
                $('.badge').html(image_requests.length).fadeIn();  // Populate the message with the number of items
            }
        } else {
            if (app.hasConnection()) {
                api.getRequestList()
                    .done(function () {
                        image_requests = JSON.parse(localStorage.image_requests);
                        if (image_requests.length > 0) {
                            $('.badge').html(image_requests.length).fadeIn();  // Populate the message with the number of items
                        }
                    }).fail(function () {
                        if (core.DEBUG) { console.error('Could not fetch requests'); }
                    });
            }
        }
    },
    renderRequests: function () {
        if (core.DEBUG) { console.log('Called renderRequests()'); }
        var image_requests = JSON.parse(localStorage.image_requests);
        var context = {};

        context.image_requests = image_requests;

        var source = $('#request-list').html();
        var template = Handlebars.compile(source);
        var html = $(template(context));
        $.mobile.pageContainer.append(html);

        var partials = ['nav-bar-partial'];
        core.renderPage('#request-list', context, 'requestListPage', partials);
        core.setActiveMenuItem('requests');
        requests.getCounter();
    },
    showRequestDetailsView: function (itemId) {
        var id = 'requestDetailPage-' + itemId;

        if (core.alreadyRendered(id)) {
            if (core.DEBUG) { console.info('No need to render Image Request Details #' + itemId + ' again'); }
            core.showPage(id);
            core.setActiveMenuItem('requests');
            inventory.current_item_id = itemId;
            return;
        }

        //if app.online, refresh
        if (app.hasConnection()) {
            $.ajax({
                url: "http://www.google.com",
                type: "GET",
                success:function(data){                    
                    if (core.DEBUG) { console.log('Downloading photos'); }
                    $.mobile.loading('show');
                    api.getInventoryDetails(itemId)
                        .done(function () {
                            requests.renderRequestDetails(itemId);
                        }).fail(function () {
                            PhoneGapProxy.navigator.notification.vibrate();
                            PhoneGapProxy.navigator.notification.alert('Could not fetch items');
                            if (core.DEBUG) { console.error('Could not fetch items'); }
                        });
                },error: function(xhr, ajaxOptions, thrownError) {
                    //alert("error : " + xhr.statusText + "(" + thrownError + ")");
                    if (core.DEBUG) { console.log('No internet connection (ajax), showing photos from cache'); }
                    requests.renderRequestDetails(itemId);
                }
            });    
        } else {
            if (core.DEBUG) { console.log('No app.connection, showing photos from cache'); }
            requests.renderRequestDetails(itemId);
        }
    },
    renderRequestDetails: function (itemId) {
        if (core.DEBUG) { console.log('Called renderRequestDetails()'); }
        var item = null;
        var items = JSON.parse(localStorage.inventory_items);
        for (var j = 0; j < items.length; j++) {
            if (items[j].id == itemId) {
                item = items[j];
            }
        }

        if (!item) {
            PhoneGapProxy.navigator.notification.vibrate();
            if (core.DEBUG) { console.error('Could not find item ' + itemId); }
            requests.getList();
            return;
        }

        inventory.current_item_id = item.id;

        item.id = itemId;

        if ( ('photos.' + itemId) in localStorage ) {
            item.images = core.patchImagesWithLettersForGrid(JSON.parse(localStorage['photos.' + itemId]));
        }

        //core.logObjProperties(item);  // TODO: Debug mode only, remove in production

        var partials = ['nav-bar-partial', 'item-partial'];
        core.renderPage('#request-details', item, 'requestDetailPage-' + itemId, partials);
        core.setActiveMenuItem('requests');
        requests.getCounter();
    },
    showContactMessageView: function (itemId) {
        var image_request = getImageRequestByItemID(itemId);
        image_request.id = itemId;
        inventory.current_item_id = itemId;

//        core.logObjProperties(image_request);  // TODO: Debug mode only, remove in production

        var partials = ['nav-bar-partial'];
        core.renderPage('#contact-page', image_request, 'contactPage-' + itemId, partials);
        core.setActiveMenuItem('requests');
        requests.getCounter();
    },
    postMessage: function (itemId) {
        var messagestring = $('#contactMessage').val();
        api.uploadMessage(itemId, messagestring)
            .done(function () {
                $('body > div[id^="request"]').remove();
                app.showRequestsListView();
                window.plugins.toast.showShortCenter('Message sent');

                //This removal is duplicated in capture.uploadQueue()
                removeImageRequestByID(itemId); // Remove item from request list
                $('#requestsList').find('a[href*=' + itemId + ']').remove(); //Remove list item
                requests.getCounter();
                
            }).fail(function () {
                PhoneGapProxy.navigator.notification.vibrate();
                PhoneGapProxy.navigator.notification.alert('Could not post message. Please try again.');
                if (core.DEBUG) { console.error('Could not post message'); }
            });
    }
};

function getPlantItemFromArray(plantID) {
    return $.grep(JSON.parse(localStorage.inventory_items), function (n, i) {
        return n.id == plantID;
    })[0];
}

function getImageRequestByRequestItem(request_item) {
    return $.grep(JSON.parse(localStorage.image_requests), function (n, i) {
        return n.request_item == request_item;
    })[0];
}

function getImageRequestByItemID(itemID) {
    return $.grep(JSON.parse(localStorage.image_requests), function (n, i) {
        return n.nitem == itemID;
    })[0];
}
function removeImageRequestByID(plantID) {
    var image_requests = JSON.parse(localStorage.image_requests);
    for (i = 0; i < image_requests.length; i++) {
        if (image_requests[i].nitem == plantID) {
            if (core.DEBUG) { console.log(image_requests[i]); }
            image_requests.splice(i, 1); //Remove current request from array
        }
    };
    localStorage.image_requests = JSON.stringify(image_requests);
}
