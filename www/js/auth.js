var auth = {
    checkToken: function () {
        api.getToken()
            .done(function () {
                if (core.DEBUG) { console.info('Token is valid, we are not going to refresh it'); }
                app.showInventoryListView();  // Show the inventory list if we get a valid token
            }).fail(function () {
                // TODO: Decide if we need it
                // PhoneGapProxy.navigator.notification.vibrate();
                // PhoneGapProxy.navigator.notification.alert('Your session is expired. Please, sign in again');
                app.showLoginView();  //  Show the login view if we have no valid token
            });
    },
    handleLogin: function () {
        if (core.DEBUG) { console.info('Trying to sign in'); }

        var $loginButton = $('#loginButton');
        $loginButton.attr('disabled', 'disabled');  // disable the button so we can't resubmit while we wait

        var form = $('#loginForm');
        var username = $('#username', form).val();
        var password = $('#password', form).val();

        if (username.length === 0 || password.length === 0) {
            if (core.DEBUG) { console.error('Did not provide both username and password'); }
            PhoneGapProxy.navigator.notification.alert('Please enter both a username and password');
            $loginButton.removeAttr('disabled');
            return;
        }

        if (core.DEBUG) { console.log('Sending ' + username + ' (username) and ' + password + ' (password)'); }

        api.authorize({
            username: username,
            password: password
        }).done(function () {
                if (core.DEBUG) { console.info('Signed in!'); }
                $('#loginPage').hide();
                app.showInventoryListView();
            }).fail(function () {
                // TODO error handling for offline / wrong credentials should happen here not in api.js
                //if (core.DEBUG) { console.error('Login failed'); }
                //PhoneGapProxy.navigator.notification.vibrate();
                //PhoneGapProxy.navigator.notification.alert('Login failed');
            });

        // Enable login button (leaving here to catch successful login in case user logs out later)
        $loginButton.removeAttr('disabled');
    },
    handleLogout: function () {
        // Cleanup first
        localStorage.removeItem('image_requests');
        localStorage.removeItem('inventory_items');
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_at');

        $('body > div[id^="inventory"]').remove();
        $('body > div[id^="request"]').remove();
        
        $(':mobile-pagecontainer').pagecontainer('change', '#loginPage');
        $('#loginPage').show();
    },
    onConfirm: function (buttonIndex) {
        if (buttonIndex === 1) {
            auth.handleLogout();
        }
    },
    showLogoutConfirmationDialog: function () {
        PhoneGapProxy.navigator.notification.confirm(
            'Are you sure you would like to log out?',
            auth.onConfirm,
            null,
            null
        );
    }
};
