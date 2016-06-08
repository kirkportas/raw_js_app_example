var EXPIRATION_TIME = 60 * 60 * 24 * 30;  // 30 days

var api = {
    base_url: 'https://plantbid.com',
    /*
     These api functions need to include a demonstration of what they look like as curl commands.

     curl -k -X POST -H "Content-Type: application/json" -d '{ "username" : "xx", "password" : "xx" }' https://plantbid.com/api-get-token/
     curl -k -X GET https://plantbid.com/inventory/ -H 'Authorization: Token 4e85f3897d4a404493518296c756c94cea64c2d8'
     curl -k -X GET https://plantbid.com/image_requests/ -H 'Authorization: Token 4e85f3897d4a404493518296c756c94cea64c2d8'
     */
    setHeaders: function (request) {
        request.setRequestHeader('Access-Control-Allow-Origin', '*');
        request.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        request.setRequestHeader('Access-Control-Allow-Headers', 'X-Requested-With');
        if (localStorage.access_token) {
            request.setRequestHeader('Authorization', 'Token ' + localStorage.access_token);
        }

        return request;
    },
    getHeadersArray: function (filename) {
        //http://stackoverflow.com/questions/559902/android-how-can-i-convert-android-net-uri-object-to-java-net-uri-object/560006#560006
        // This content length header is a hack TODO
        // No established way to get filesize of an image
        var headers = {'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Connection': 'close',   // Used for Android
            'Authorization': 'Token ' + localStorage.access_token};
        if (device.platform == "Android") {
            headers["Content-Length"] = '400000';
        }

        return headers;
    },
    setToken: function (data) {
        localStorage.access_token = data.token;  // Cache the token
        var expiresAt = new Date().getTime() + EXPIRATION_TIME;
        localStorage.expires_at = expiresAt;
        if (core.DEBUG) { console.info('Token ' + data.token + ' will expire in ' + expiresAt + ' seconds'); }
    },
    getToken: function () {
        var deferred = $.Deferred();

        if (new Date().getTime() < localStorage.expires_at) {
            deferred.resolve({
                access_token: localStorage.access_token
            });
        } else {
            deferred.reject();
        }

        return deferred.promise();
    },
    authorize: function (options) {
        var deferred = $.Deferred();

        $.ajax({
            beforeSend: this.setHeaders,
            type: 'POST',
            url: api.base_url + '/api-get-token/',
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            data: options,
            success: function (data) {
                api.setToken(data);
                deferred.resolve(data);
                localStorage.cached_username = options.username;
            },
            error: function (request, textStatus, error) {
                if (textStatus == 'timeout') {
                    if (core.DEBUG) { console.error('Failed to sign in: ' + error); }
                    PhoneGapProxy.navigator.notification.alert('Internet connection required to login');
                    deferred.reject(error);
                } else {
                    if (core.DEBUG) { console.error('Failed to sign in: ' + error); }
                    PhoneGapProxy.navigator.notification.alert('Login failed');
                    deferred.reject(error);
                }
            }
        });

        return deferred.promise();
    },
    getInventoryList: function () {
        var deferred = $.Deferred();

        $.ajax({
            beforeSend: api.setHeaders,
            type: 'GET',
            url: api.base_url + '/inventory/',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                if (core.DEBUG) { console.info('Successfully fetched inventory items'); }
                var now = new Date();
                localStorage.inventory_date_updated = now;
                localStorage.inventory_items = JSON.stringify(data);  // Cache the results
                if (core.DEBUG) { console.info('Cached ' + data.length + ' items'); }
                deferred.resolve(data);
            },
            error: function (request, error) {
                if (core.DEBUG) { console.error('Failed to fetch inventory items: ' + error); }
                deferred.reject(error);
            }
        });

        return deferred.promise();
    },
    getInventoryDetails: function (itemId) {
        var deferred = $.Deferred();

        $.ajax({
            beforeSend: api.setHeaders,
            type: 'GET',
            url: api.base_url + '/inventory/' + itemId + '/',
            dataType: 'json',
            contentType: 'application/json',
            success: function (images) {
                if (core.DEBUG) { console.info('Successfully fetched inventory item ' + itemId); }
                localStorage['photos.' + itemId] = JSON.stringify(images);  // Cache the results
                if (core.DEBUG) { console.info('Cached item ' + itemId); }
                deferred.resolve(images);
            },
            error: function (request, error) {
                if (core.DEBUG) { console.error('Failed to fetch inventory item ' + itemId + ': ' + error); }
                //PhoneGapProxy.navigator.notification.vibrate();
                //PhoneGapProxy.navigator.notification.alert('Inventory item update failed');
                deferred.reject(error);
            }
        });

        return deferred.promise();
    },
    /*
     ### Requests list looks like this
     [{"landscaper": "Atto LLC",
     "nitem": "2797231",
     "plant": "Rhododendron 'conleb': encore azalea autumn embers",
     "request_item": 7495,
     "request_date": "2014-02-25T17:30:38.551Z",
     "has_responded": false, "response_text": ""}]
     */
    getRequestList: function () {
        var deferred = $.Deferred();

        $.ajax({
            beforeSend: api.setHeaders,
            type: 'GET',
            url: api.base_url + '/image_requests/',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                if (core.DEBUG) { console.info('Successfully fetched image requests'); }
                localStorage.image_requests = JSON.stringify(data);  // Cache the results
                if (core.DEBUG) { console.info('Cached ' + data.length + ' requests'); }
                deferred.resolve(data);
            },
            error: function (request, error) {
                if (core.DEBUG) { console.error('Failed to fetch image requests: ' + error); }
                deferred.reject(error);
            }
        });

        return deferred.promise();
    },
    uploadImage: function (itemId, imageURI) {
        if (core.DEBUG) { console.log('uploadImage(), itemId: ' + itemId); }
        var deferred = $.Deferred(),
            ft = new FileTransfer(),
            options = new FileUploadOptions();

        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        options.headers = api.getHeadersArray(options.fileName);

        //request.setRequestHeader('Content-Length', 'X-Requested-With');

        var upload_url = api.base_url + '/inventory/' + itemId + '/upload/';

        ft.upload(imageURI, upload_url,
            function (result) {
                //if (core.DEBUG) { console.info("Successfully uploaded image(s)"); }
                //alert("Successfully uploaded image(s)");
                if (core.DEBUG) { console.log('image uploaded (api.uploadImage())'); }
                deferred.resolve(result);
            },
            function (error) {
                //PhoneGapProxy.navigator.notification.alert("An error has occurred: Code = " + error.code);
                if (core.DEBUG) { console.error("api.uploadImage() error source " + error.source); }
                if (core.DEBUG) { console.error("api.uploadImage() error target " + error.target); }
                deferred.reject(error);
            },
            options, true
        );

        return deferred.promise();
    },
    // This uses the same API endpoint but includes a message field
    uploadMessage: function (itemId, messageStr) {
        var deferred = $.Deferred();

        // This should be passed in, but because that page is autogenerated we'll grab it here.
        //var messageStr = $('#contactMessage').val();

        if (messageStr.length < 2) {
            PhoneGapProxy.navigator.notification.alert('You must enter a message before sending.');
        } else {
            // Neither of the below work when passed into the data: field in AJAX call. Leaving here for reference.        
            //var options = '[{message: messageStr,dont_save: true}]';
            //var options = {
            //    message: messageStr,
            //    dont_save: true
            //};    Without json.stringify:  => passes an object.  With stringify => Passes all as key with no value

            $.ajax({
                beforeSend: this.setHeaders,
                type: 'POST',
                url: api.base_url + '/inventory/' + itemId + '/upload/',
                dataType: 'json',
                //processData: false,
                contentType: 'application/x-www-form-urlencoded',
                data: {message: messageStr, dont_save: true},
                success: function (data) {
                    if (core.DEBUG) { console.info('Successfully sent message: ' + data); }
                    deferred.resolve(data);
                },
                error: function (request, error) {
                    if (core.DEBUG) { console.error('Failed to send message: ' + error); }
                    deferred.reject(error);
                }
            });
        }

        return deferred.promise();
    },
    uploadImageWithMessage: function (itemId, imageURI) {
        var deferred = $.Deferred();
        var messageStr = $('#contactMessage').val();

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.headers = api.getHeadersArray();

        var params = {};
        params.message = messageStr;
        params.dont_save = true;
        options.params = params;

        if (messageStr.length < 2) {
            PhoneGapProxy.navigator.notification.alert('You must enter a message before sending.');
        } else {
            options = '[{message: messageStr,dont_save: true}]';

            $.ajax({
                beforeSend: this.setHeaders,
                type: 'POST',
                url: api.base_url + '/inventory/' + itemId + '/upload/',
                dataType: 'json',
                processData: false,
                contentType: 'application/x-www-form-urlencoded',
                data: options,
                success: function (data) {
                    if (core.DEBUG) { console.info('Successfully sent message: ' + data); }
                    deferred.resolve(data);
                },
                error: function (request, error) {
                    if (core.DEBUG) { console.error('Failed to send message: ' + error); }
                    deferred.reject(error);
                }
            });
        }

        return deferred.promise();
    }
};