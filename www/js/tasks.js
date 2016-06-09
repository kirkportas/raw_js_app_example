if (GFT_APP == undefined) { console.error("Incorrect JS load error"); }
var GFT_APP = window.GFT_APP || {};
GFT_APP.tasks = {
    // Include vars. Explicitly define locally used controllers etc.
    api: GFT_APP.api,
    core: GFT_APP,
    require_confirmation: true, // Require confirm on deleteions

    // State vars
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
        if (DEBUG) { console.log('deleteTask() for id: ' + task_id); }
        var confirmed = false;
        if (this.require_confirmation) {
            confirmed = window.confirm("Are you sure  to delete this?"); // Would be moved to a confirmation module
        }

        if (!this.require_confirmation || confirmed) {
            // Search task_items by ID
            var task = $.grep(this.task_items, function(item){ return item.id == task_id; }); // == for demo ease, === needed

            if (task.length == 1) {
                // access with task[0]. Delete task object
                var i = this.task_items.indexOf( task[0] );   // inefficient but effective
                this.task_items.splice(i,1);
            } else {
                if (task.length == 0) {
                    console.error('Task Not found');
                } else {
                    console.error("Duplicate Task IDs found: "+ task[0].id);
                }
            }

            this.api.saveTasks(this.task_items);
            this.refreshTaskList();
        } else {
            // Delete canceled.
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
            tasks: this.task_items
        };
        this.core.renderPage("landing", context, "#landing-content");
    }
};