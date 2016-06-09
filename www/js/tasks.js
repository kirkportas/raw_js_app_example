var GFT_APP = window.GFT_APP || {};
GFT_APP.tasks = {
    task_items: {}, // This will store task items

    addTask: function(task_obj) {
        if (task_obj !== null) { // e.g. Validate object
            this.task_items.append( task_obj );
        } else {
            // Notify: invalid Task
        }
    },
    deleteTask: function(task_obj) {
        if (task_obj !== null) { // e.g. Validate object
            this.task_items.remove( task_obj );
        } else {
            // Notify: invalid Task
        }
    },
    getTasks: function() {
        // Call this on page load
        // 1) Check localstorage / api & set 'task_items'
        // 2) Refresh list

        return [{'id': 1, 'title': "Write Code"},
                {'id': 2, 'title': "Push Code" },
                {'id': 3, 'title': "Install Sublime3" }]
    },
    refreshTasks: function () {
        if (GFT_APP.DEBUG) { console.log('tasks: refreshTasksFromCache()'); }
        var tasks = GFT_APP.api.loadTasks;


        var source = $('#inventory-items').html();
        var template = Handlebars.compile(source);
        var context = {};
        context.itemsCount = items.length;  // Populate the message with the number of items
        context.items = inventory.fixDiscountPrice(items);

        var html = $(template(context));

        $('#inventoryList').empty(); //Empty list
        $('#inventoryList')
            .append(html)
            .listview()
            .listview('refresh');

        window.plugins.toast.showShortCenter('Refreshed Inventory List');
    },

    renderInventoryListPage: function () {
        if (GFT_APP.DEBUG) { console.log('renderInventoryListPage()'); }
        var id = 'inventoryListPage';

        if (core.alreadyRendered(id)) {
            if (GFT_APP.DEBUG) { console.info('No need to render Inventory List again'); }
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
        //    if (GFT_APP.DEBUG) { console.error('Not able to parse date: ' + e); }
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
            if (GFT_APP.DEBUG) { console.info('No need to render Inventory Details #' + itemId + ' again'); }
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
                    if (GFT_APP.DEBUG) { console.log('Downloading photos'); }
                    $.mobile.loading('show');
                    api.getInventoryDetails(itemId)
                        .done(function () {
                            inventory.renderItemDetails(itemId);
                        }).fail(function () {
                            PhoneGapProxy.navigator.notification.vibrate();
                            PhoneGapProxy.navigator.notification.alert('Could not fetch item.');
                            if (GFT_APP.DEBUG) { console.error('Could not fetch item.'); }
                        });
                },error: function(xhr, ajaxOptions, thrownError) {
                    //alert("error : " + xhr.statusText + "(" + thrownError + ")");
                    if (GFT_APP.DEBUG) { console.log("no internet connection"); }
                    inventory.renderItemDetails(itemId);
                }
            });

        } else {
            if (GFT_APP.DEBUG) { console.log('Showing photos from cache'); }
            inventory.renderItemDetails(itemId);
        }
    },



    onDeleteConfirm: function (buttonIndex) {
        if (buttonIndex === 1) {
            auth.handleLogout();
        }
    },
    showLogoutConfirmationDialog: function () {
        PhoneGapProxy.navigator.notification.confirm(
            'Are you sure you would like to log out?',
            GFT_APP.tasks.onDeleteConfirm,
            null,
            null
        );
    }
};