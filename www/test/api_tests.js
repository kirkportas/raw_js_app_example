var GFT_APP = window.GFT_APP || null;

//##  Dependencies:
// Task model

var example_tasks = [ new Task({'title': "Write Code"}),
                      new Task({'title': "Push Code" }),
                      new Task({'title': "Install Sublime3"}) ]

QUnit.test( "API: module exists", function( assert ) {
  assert.ok( GFT_APP.api != null, "Passed!" );
});

QUnit.test( "API: saveTasks() saves to localStorage", function( assert ) {
    assert.expect(2);

    GFT_APP.api.saveTasks( example_tasks );
    saved_tasks = JSON.parse(localStorage.task_items);

    assert.equal( saved_tasks.length, 3, "Items saved!" );
    assert.equal( saved_tasks[1]['title'], saved_tasks[1]['title'], "Saved values correct!" );
});

QUnit.test( "API: loadTasks() loads from localStorage", function( assert ) {
    assert.expect(2);

    localStorage.task_items = JSON.stringify( example_tasks );
    loaded_tasks = JSON.parse(localStorage.task_items);

    assert.equal( loaded_tasks.length, 3, "Items loaded!" );
    assert.equal( loaded_tasks[0]['title'], example_tasks[0]['title'], "Loaded values correct!" );
});