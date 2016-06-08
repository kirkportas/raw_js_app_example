var inventory = {
    current_item_id: null,
    pagination_item_counter: 0,
    pagination_limit: 5,
    refreshList: function () {
        if (core.DEBUG) { console.log('RefreshList() for Inventory'); }
        if (app.hasConnection()) {
            $.mobile.loading('show');

            var refreshInventoryButton = $('#refreshInventory');
            refreshInventoryButton.attr('disabled', 'disabled');
            window.plugins.toast.showShortCenter('Refreshing List & Upload Queue');

            api.getInventoryList()
                .done(function () {
                    // This is only called when the inventory API update is successful
                    // Or when a $%^&*& android somehow clears the dom on reload while offline
                    inventory.refreshInventoryListFromCache();
                    
                }).fail(function () {
                    PhoneGapProxy.navigator.notification.vibrate();
                    PhoneGapProxy.navigator.notification.alert('Could not fetch inventory');
                    if (core.DEBUG) { console.error('Could not fetch inventory'); }
                }).always(function () {
                    $.mobile.loading('hide');
                    refreshInventoryButton.removeAttr('disabled');  
                });

            $('body > div[id^="inventoryDetailPage"]').remove();  // Remove all rendered pages
            capture.uploadQueue();
        } else {
            if (core.DEBUG) { console.log('offline'); }
            window.plugins.toast.showShortCenter('Currently offline');
        }
    },
    refreshInventoryListFromCache: function () {
        var items = JSON.parse(localStorage.inventory_items);

        var source = $('#inventory-items').html();
        var template = Handlebars.compile(source);
        var context = {};
        context.itemsCount = items.length;  // Populate the message with the number of items
        context.items = inventory.fixDiscountPrice(items);

        var html = $(template(context));
        if (core.DEBUG) { console.log('html: ' + html); }

        $('#inventoryList').empty(); //Empty list
        $('#inventoryList')
            .append(html)
            .listview()
            .listview('refresh');

        window.plugins.toast.showShortCenter('Refreshed Inventory List');
    },
    fixDiscountPrice: function (items) {
        var result = [];
        $.each(items, function (index, item) {
            if (item.discount_price >= item.catalog_price) {
                item.discount_price = 0.0;
            }
            result.push(item);
        });

        return result;
    },
    renderInventoryListPage: function () {
        if (core.DEBUG) { console.log('renderInventoryListPage()'); }
        var id = 'inventoryListPage';

        if (core.alreadyRendered(id)) {
            if (core.DEBUG) { console.info('No need to render Inventory List again'); }
            core.showPage(id);
            core.setActiveMenuItem('inventory');
            return;
        }

        //var items = JSON.parse(localStorage.inventory_items);
        //var lastUpdated = new Date();
        //var dateStr;
        var context = {};

        //try {
        //    lastUpdated = new Date(localStorage.inventory_date_updated);
        //} catch (e) {
        //    if (core.DEBUG) { console.error('Not able to parse date: ' + e); }
        //}

        //dateStr = (lastUpdated.getMonth() + 1) + '/' + lastUpdated.getDate() + '/' + lastUpdated.getFullYear();

        //context.itemsCount = items.length;  // Populate the message with the number of items
        //context.lastUpdated = dateStr;  // Populate the date of last update
        //context.items = inventory.fixDiscountPrice(items);

        var partials = ['nav-bar-partial'];
        core.renderPage('#inventory-list', context, 'inventoryListPage', partials);
        core.setActiveMenuItem('inventory');
        requests.getCounter();

        if (core.isAndroid()) {           // Only run android invlist hack for android
            if (app.hasConnection()) {    // If online:
                inventory.refreshList();  // normal operation
            } else {
                inventory.refreshInventoryListFromCache(); // Reload wiped page list from cache
            }
        } else {
            inventory.refreshList();      // iPhone normal operation
        }
    },
    showItemsDetailsView: function (itemId) {
        var id = 'inventoryDetailPage-' + itemId;

        if (core.alreadyRendered(id)) {
            if (core.DEBUG) { console.info('No need to render Inventory Details #' + itemId + ' again'); }
            core.showPage(id);
            core.setActiveMenuItem('inventory');
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
                            inventory.renderItemDetails(itemId);
                        }).fail(function () {
                            PhoneGapProxy.navigator.notification.vibrate();
                            PhoneGapProxy.navigator.notification.alert('Could not fetch item.');
                            if (core.DEBUG) { console.error('Could not fetch item.'); }
                        });
                },error: function(xhr, ajaxOptions, thrownError) {
                    //alert("error : " + xhr.statusText + "(" + thrownError + ")");
                    if (core.DEBUG) { console.log("no internet connection"); }
                    inventory.renderItemDetails(itemId);
                }
            });    

        } else {
            if (core.DEBUG) { console.log('Showing photos from cache'); }
            inventory.renderItemDetails(itemId);
        }
    },
    renderItemDetails: function (itemId) {
        if (core.DEBUG) { console.log('Called renderItemDetails()'); }
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
            //inventory.refreshList();  //was getlist()
            PhoneGapProxy.navigator.notification.alert('Item is not cached, please refresh the inventory list.');
            return;
        }

        inventory.current_item_id = item.id;

        // If images exist in cache, then pass them to the template.
        if ( ('photos.' + itemId) in localStorage ) {
            item.images = core.patchImagesWithLettersForGrid(JSON.parse(localStorage['photos.' + itemId]));
        }
//        core.logObjProperties(item);  // TODO: Debug mode only, remove in production

        var context = item;
        context.android = core.isAndroid();

        var partials = ['nav-bar-partial', 'item-partial'];
        core.renderPage('#inventory-details', context, 'inventoryDetailPage-' + itemId, partials);
        core.setActiveMenuItem('inventory');
        requests.getCounter();
    }
};