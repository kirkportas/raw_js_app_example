var GFT_APP = window.GFT_APP || {};
GFT_APP.api = {
    use_localstorage: true,
    loadTasks: function() {
        var tasks;

        if(this.use_localstorage == true) {
            if (localStorage.task_items) {
                tasks = JSON.parse(localStorage.task_items);
            } else {
                if (DEBUG) { console.log('No tasks available in localStorage'); }
                tasks = [ new Task({'title': "Write Code"}),
                          new Task({'title': "Push Code" }),
                          new Task({'title': "Install Sublime3"}) ]
            }
        } else {
            // Load from API or other datastore
            console.error('No API Available. For demo, GFT_APP.api.use_localstorage must be true');
        }
        return tasks;
    },
    // This is a simple overwrite, not an append.
    saveTasks: function(task_items) {
        if (DEBUG) { console.log('api.saveTasks()'); }

        if(this.use_localstorage == true) {
            // if (localStorage.task_items) {
            localStorage.task_items = JSON.stringify(task_items);  // Cache the results
        } else {
            // Save to API or other datastore
            console.error('No API Available. For demo, GFT_APP.api.use_localstorage must be true');
        }
    }


}