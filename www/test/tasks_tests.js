var GFT_APP = window.GFT_APP || null;

QUnit.test( "Tasks: Module exists", function( assert ) {
  assert.ok( GFT_APP.tasks != null, "Passed!" );
});

// ### Some further setup would be needed to test refresh of Handlebars components (which the create/delete methods do)

// QUnit.test( "Tasks - createTask() creates a task", function( assert ) {
// 	var newTitle = "taskTitle";
// 	GFT_APP.tasks.newTaskTitle = newTitle;
// 	GFT_APP.tasks.createTask();

// 	// assert.equal( GFT_APP.tasks.task_items.length, 1, "Task created!" );
// });
    // createTask: function() {
    //   this.refreshTaskList();   //## This breaks the test because it relies on a handlebars var
