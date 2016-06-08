var capture = {
    CAMERA: 1,
    LIBRARY: 0,
    ALBUM: 2,
    ENCODING_TYPE: 1,  // 0 = JPG, 1 = PNG
    QUALITY: 25,
    WIDTH: 100,
    HEIGHT: 100,
    humanReadableSource: null,
    currentlyUploading: false,

    getHumanReadableSource: function (source) {
        if (source === capture.CAMERA) {
            capture.humanReadableSource = 'camera';
        } else if (source === capture.LIBRARY) {
            capture.humanReadableSource = 'library';
        } else {
            capture.humanReadableSource = 'album';
        }
    },
    onCaptureSuccess: function (imageURI) {

        var activePageId = $('.ui-page-active').attr('id');
        if (activePageId != 'capturePage') {
            capture.showImageUploadPage();
        }

        capture.displayImage(imageURI);
    },
    getPhoto: function (source) {
        capture.getHumanReadableSource(source);
        if (core.DEBUG) { console.info("Capturing image from " + capture.humanReadableSource); }

        var options = {
            //if (!core.isAndroid()) { 
            //    quality: capture.QUALITY, 
            //}
            quality: capture.QUALITY, 
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: source,  // 0 = Photo Library, 1 = Camera, 2 = Saved Album
            encodingType: capture.ENCODING_TYPE,
            correctOrientation: false,
            allowEdit: true//,
            //targetWidth: capture.WIDTH,
            //targetHeight: capture.HEIGHT
        };

        navigator.camera.getPicture(
            capture.onCaptureSuccess,
            function (message) {
                // We don't show error messages if user cancels image selection
                if (message != 'no image selected') {
                    //PhoneGapProxy.navigator.notification.alert("Failed because: " + message);
                    return;  // Stops from loading below
                }
                if (core.DEBUG) { console.error("Failed because: " + message); }
            },
            options
        );
    },
    displayImage: function (imageURI) {
        if (core.DEBUG) { console.info("Displaying " + imageURI); }
        $('.image-add-button').before('<img class="image-small" src="' + imageURI + '" />');
    },
    uploadImages: function () {
        if (core.DEBUG) { console.info('Uploading images'); }
        var $image = $('.image-small');
        var image_count = $image.length;
        var item = inventory.current_item_id;
        
        //PhoneGapProxy.navigator.notification.alert("Beginning upload of " + image_count + " photo(s). You'll receive a notification upon completion.");

        var queueList = [];
        if(localStorage.queueList) {
        	queueList = $.parseJSON(localStorage.queueList);
        }

        $image.each(function (index) {
			queueList.push({
             	id:    item,
                img : $(this).attr('src')
            });
		});
		localStorage.queueList = JSON.stringify(queueList);  // Add Queue
        window.plugins.toast.showShortCenter('Photo(s) added to upload queue!');

        var lastQueuedItem = queueList.length -1;
        if(navigator.onLine == true || navigator.onLine == "true") {
          $.ajax({
            	url: "http://www.google.com",
            	type: "GET",
            	success:function(data){
        	        capture.uploadQueue();    
            	},error: function(xhr, ajaxOptions, thrownError) {
            	    //alert("error : " + xhr.statusText + "(" + thrownError + ")");
                    if (core.DEBUG) { console.log("no internet connection"); }
                    //window.plugins.toast.showShortCenter('No internet connection.');
            	}
            });    
        }
        //inventory.showItemsDetailsView(queueList[lastQueuedItem].id);
        inventory.showItemsDetailsView(item);
        
    },
    showImageUploadPage: function () {
        core.renderPage('#capture-page', {android: core.isAndroid()}, 'capturePage');
    },
    updateDetailsPage: function (itemID, img) {
        if (core.DEBUG) { console.log('updateDetailsPage()'); }
        // Check if Request or Inventory pages are rendered, update if they are
        // Do not include # for id, core. method adds it.
        // This id handling is retarded, centralize to core.
        var invDetailPageIDForImage = 'inventoryDetailPage-' + itemID;
        var reqDetailPageIDForImage = 'requestDetailPage-' + itemID;
        var pageID;
        if (core.alreadyRendered(invDetailPageIDForImage)) {
            if (core.DEBUG) { console.log('Adding img to Inv Detail Page, id: ' + itemID); }
            pageID = '#' + invDetailPageIDForImage;
            capture.appendImgToDetailsPage(pageID, img);
        }
        // This shouldn't attempt to add to the req detail page, because it should be removed.
        /*
        if (core.alreadyRendered(reqDetailPageIDForImage)) {
            if (core.DEBUG) { console.log('Adding img to Req Detail Page, id: ' + itemID); }
            pageID = '#' + reqDetailPageIDForImage;
            capture.appendImgToDetailsPage(pageID, img);
        }
        */
    },
    appendImgToDetailsPage: function (pageID, img) {
        console.log('appendImgToDetailsPage(), pageID = ' + pageID);
        // Account for the a/b/c container grid used for images on Detail pages
        var index;
        var abc_arr = ['a','b','c','a']; // When C, +1 returns a. indexOf('a')==0
        var image_grid = $(pageID).find('.ui-grid-a').find('.ui-grid-b');
        try {
            var last_img_class = image_grid.children().last().attr('class');
            var cur_block_abc = last_img_class.slice(-1);
            index = abc_arr.indexOf(cur_block_abc);
        } catch (e) {
            index = -1; // If there is no image (grid a => 0), then set to -1 and start at a below  
        }

        var next_block = 'ui-block-' + abc_arr[index+1];
        var html =  '<div class="' + next_block + '">'
                +   '<img src="' + img + '" style="width:99%" />'
                +   '</div>';
        image_grid.append(html);

    },
    uploadQueue: function () {
        // Set a var to escape this function if it's currently running.
        if (capture.currentlyUploading == true) {
            if (core.DEBUG) { console.log('uploadQueue(), currently uploading'); }
            return;
        } else {
            capture.currentlyUploading = true;
        }

        var queueList = [];
        if(localStorage.queueList) {
        	queueList = $.parseJSON(localStorage.queueList);
        }
        if (queueList.length < 1) {
            capture.currentlyUploading = false;
            return;
        }
        var queuedID = queueList[0].id;
        var queuedImg = queueList[0].img;
        
        api.uploadImage(queuedID, queuedImg)
            .done(function () {
                capture.updateDetailsPage(queuedID, queuedImg);
                // If that page is already rendered, add image to page:
                // Call updated inventory to get images
                // Removing because all details pages are now deleted on a list refresh
                //api.getInventoryDetails(queuedID)
                //    .done(function () {})
                //    .fail(function () {});


                //inventory.showItemsDetailsView(queueList[0].id); // USE FOR BACK BUTTON 
                removeImageRequestByID(queuedID); // Remove item from request list
                $('#requestsList').find('a[href*=' + queuedID + ']').remove(); //Remove list item
                requests.getCounter();
                // Note this will remove the request without checking how many images were uploaded
                queueList.shift();
                localStorage.queueList = JSON.stringify(queueList);  // Update Queue
                
                // if no more images for that request in queuelist
                // Then remove request page and redirect to detail page
                var lastQueuedForItem = true;
                queueList.forEach( function (arrayItem)
                {
                    if (arrayItem.id === queuedID) {
                        lastQueuedForItem = false;
                        if (core.DEBUG) { console.log('Not last queued item, id: ' + arrayItem.id); }
                    }
                });
                if (lastQueuedForItem == true) {
                    var activePageId = $('.ui-page-active').attr('id');
                    var itemsReqPageID = '#requestDetailPage-' + queuedID;
                    if (activePageId == itemsReqPageID) {
                        inventory.showItemsDetailsView(queuedID);
                    }
                    $('body > ' + itemsReqPageID).remove(); 
                }

                // Display notification if queue is empty, or loop
                if (queueList.length < 1) {
                    PhoneGapProxy.navigator.notification.vibrate();
                    if (core.DEBUG) { console.log('All Photo(s) uploaded!'); }
                    window.plugins.toast.showShortCenter('All Photo(s) uploaded!');
                    capture.currentlyUploading = false;
                } else {
                    capture.currentlyUploading = false;
                    capture.uploadQueue();  
                }                                 
            }).fail(function () {
                PhoneGapProxy.navigator.notification.vibrate();
                window.plugins.toast.showShortCenter('Photo upload failed');
                if (core.DEBUG) { console.error('Photo upload failed'); }
                capture.currentlyUploading = false;
            });       
    }
};
