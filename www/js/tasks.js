if (GFT_APP == undefined) { console.error("Incorrect JS load error"); }
var GFT_APP = window.GFT_APP || {};
GFT_APP.tasks = {
    // "include" required modules and controllers & give a convenient local name
    api: GFT_APP.api,    // *This is a load-order dependency

    // Set vars
    task_items: {},      // This will store task items

    createTask: function(task_name) {
        if (DEBUG) { console.log('createTask(): task_name: ' + task_name); }

        if (task_name.length != 0) {
            // imagine a binding to the input element
            var newTaskTitle = $('#new-task-title').value;
            var newtask = new Task({'title': taskTitle});

            this.task_items.append( newtask );

            this.refreshTaskList();
            // return task_items;
        } else {
            alert('You must enter a Task title.');
        }
    },
    deleteTask: function(task_id) {
        if (task_id !== null) { // e.g. Validate object
            // this.task_items.remove( Task.where('id': task_id) );
        } else {
            // Notify: invalid Task
        }
    },
    getTasks: function() {
        // Call this on page load
        // 1) Check localstorage / api & set 'task_items'
        // 2) Refresh list
        var tasks = this.api.loadTasks();
        return tasks;
    },
    refreshTaskList: function() {
        // This is an incomplete implementation. We'd want to refresh just the partial & not the whole page.
        var context = GFT_APP.defaultContext;
        this.renderPage("landing", context, "#landing-content")
    }

    // onDeleteConfirm: function (buttonIndex) {
    //     if (buttonIndex === 1) {
    //         auth.handleLogout();
    //     }
    // },
    // showConfirmationDialog: function () {
    //     window.confirm(
    //         'Are you sure you would like to log out?',
    //         this.onDeleteConfirm,
    //         null,
    //         null
    //     );
    // }
};