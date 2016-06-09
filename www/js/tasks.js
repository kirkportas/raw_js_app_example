if (GFT_APP == undefined) { console.error("Incorrect JS load error"); }
var GFT_APP = window.GFT_APP || {};
GFT_APP.tasks = {
    // "include" required modules and controllers & give a convenient local name
    api: GFT_APP.api,    // *This is a load-order dependency
    core: GFT_APP,
    // Set vars
    task_items: [],      // This will store task items
    initLoad: true,
    // UI bound vars
    newTaskTitle: null,

    bindNewTaskTitle: function(taskTitle) {
        if (DEBUG) { console.log('bindNewTaskTitle(): ' + taskTitle); }
        this.newTaskTitle = taskTitle;
    },
    createTask: function() {
        var title = this.newTaskTitle;
        // var newTaskTitle = $('#new-task-title').val();
        if (DEBUG) { console.log('createTask(): title: ' + title); }
        if (title != null && title.length > 0) {
            // imagine a binding to the input element
            var newtask = new Task({'title': title});
            this.task_items.push( newtask );

            this.refreshTaskList();
        } else {
            alert('You must enter a Task title.');
        }

        this.newTaskTitle = null;     // Reset local bound var
        this.api.saveTasks(this.task_items);  // Update LocalStorage/API
    },

    deleteTask: function(task_id) {
        if (task_id !== null) { // e.g. Validate object
            // this.task_items.remove( Task.where('id': task_id) );
        } else {
            // Notify: invalid Task
        }
    },

    getTasks: function() {
        if (DEBUG) { console.log('tasks.getTasks()'); }
        // Call API for seed tasks on initial Load. Api vs. Local load logic could go here
        if (this.initLoad === true && this.task_items.length === 0) {
            this.initLoad = false;
            this.task_items = this.api.loadTasks();
        }
        return this.task_items;
    },

    refreshTaskList: function() {
        // This is an incomplete implementation. We'd want to refresh just the partial & not the whole page.
        var context = {
            placeholder: "Add items to list",
            tasks: this.task_items // ["Write Code", "Push Code"]
        };
        this.core.renderPage("landing", context, "#landing-content");
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