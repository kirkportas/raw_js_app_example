var GFT_APP = window.GFT_APP || {};
GFT_APP.api = {
    use_localstorage: true,
    load_tasks: function() {
        var tasks;

        if(use_localstorage == true) {
            if (localStorage.task_items) {
                tasks = JSON.parse(localStorage.task_items);
            } else {
                if (DEBUG) { console.log('No tasks available in localStorage'); }
            }
        } else {
            // Load from API or other datastore
            console.error('No API Available. For demo, GFT_APP.api.use_localstorage must be true');
        }
    }


}