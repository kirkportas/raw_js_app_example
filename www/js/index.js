var app = {
    current_item_id: null,

    init: function () {
        auth.checkToken();

        $('#loginForm').on('submit', function () {
            auth.handleLogin();
        });
        $('#exit-button').on('click', function () {
            auth.handleLogout();
        });
    },
    showLoginView: function () {
        $(':mobile-pagecontainer').pagecontainer('change', '#loginPage');
        core.fixPaddingForIOS7();
        $('#loginPage').show();
    },
    showInventoryListView: function () {
        core.fixPaddingForIOS7();
        inventory.renderInventoryListPage();
        //block events on navbar partial for inv & request page
        $("a[data-icon='inventory']").click( function (event) {
            var activePageId = $('.ui-page-active').attr('id');
            if (activePageId == 'inventoryListPage') 
                { event.preventDefault(); }
        });
    },
    showRequestsListView: function () {
        core.fixPaddingForIOS7();
        requests.getList();
        $("a[data-icon='requests']").click( function (event) {
            var activePageId = $('.ui-page-active').attr('id');
            if (activePageId == 'requestListPage') 
                { event.preventDefault(); }
        });
    },
    hasConnection: function () {
        // Can implement a wifi/3g/4g split
        //var states = {};
        //states[Connection.UNKNOWN]  = 'Unknown connection';
        //states[Connection.ETHERNET] = 'Ethernet connection';
        //states[Connection.WIFI]     = 'WiFi connection';
        //states[Connection.CELL_2G]  = 'Cell 2G connection';
        //states[Connection.CELL_3G]  = 'Cell 3G connection';
        //states[Connection.CELL_4G]  = 'Cell 4G connection';
        //states[Connection.CELL]     = 'Cell generic connection';
        //states[Connection.NONE]     = 'No network connection';

        //alert('Connection type: ' + states[networkState]);

        return navigator.connection.type != Connection.NONE;
    }
};

$(document).on('deviceready', function () {
    app.init();
    navigator.splashscreen.hide();
    
    $(function () {
        FastClick.attach(document.body);
        if (core.DEBUG) { console.info('fastclick attached to body'); }
    });

    // Handling for hardware back button on Android
    if (core.isAndroid()) {
        document.addEventListener("backbutton", core.onBackKeyDown, false);

        $(document).bind("pageshow", function(e, data) {
            if (core.goingBack) {
                core.goingBack = false;
            } else {
                core.pageHistoryCount++;
                if (core.DEBUG) { console.log("Showing page #" + core.pageHistoryCount); }
            }
        });
    }

    document.addEventListener("online", toggleCon, false);
	document.addEventListener("offline", toggleCon, false);

    // fix bug where login page button is visible on register page
    $('#loginPage').on('pagebeforeshow',function(event){
        $('#loginPage').show();
        if (localStorage.cached_username) {
            $('#username').value = localStorage.cached_username;
        }
    });
    $('#noAccountPage').on('pagebeforeshow',function(event){
        $('#loginPage').hide();
    });

});
//app.init();   //Uncomment to run app in Ripple emulator.

function toggleCon(e) {
	if (core.DEBUG) { console.log("Called",e.type); }
    if(localStorage.queueList) {
        	queueList = $.parseJSON(localStorage.queueList);
            //alert(queueList.length);
     }
	if(e.type == "offline") {
        // Later we should put in Toast notifications
		//navigator.notification.alert("Sorry, you are offline.", function() {}, "Offline!");
	} else {
		//navigator.notification.alert("Woot, you are back online.", function() {}, "Online!");
        capture.uploadQueue();
	}
}