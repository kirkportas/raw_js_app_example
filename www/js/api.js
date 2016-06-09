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
                tasks = [{'id': 1, 'title': "Write Code"},
                         {'id': 2, 'title': "Push Code" },
                         {'id': 3, 'title': "Install Sublime3" }]
            }
        } else {
            // Load from API or other datastore
            console.error('No API Available. For demo, GFT_APP.api.use_localstorage must be true');
        }
        return tasks;
    }


}