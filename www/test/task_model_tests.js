var GFT_APP = window.GFT_APP || null;

QUnit.test( "Model - Task: Model Exists", function( assert ) {
  assert.ok( new Task({}), "Passed!" );
});

QUnit.test( "Model - Task: Model Accepts a Title Param", function( assert ) {
	var title = "TaskTitle!";
	var task = new Task({'title':title});
    assert.equal(title, task.title, "Model 'Title' attr created properly." );
});

QUnit.test( "Model - Task: 'created_at' attr assigned on creation", function( assert ) {
	assert.expect(2);
	var title = "TaskTitle!";
	var task = new Task({'title':title});
    assert.ok( task.created_at !== undefined, "'created_at' attr created properly." );
    // 5 seconds?
    assert.ok( Date.now() - task.created_at < 50000, "'created_at' timestamp ~ correct." );
});

QUnit.test( "Model - Task: delete() soft deletes with 'deleted_at'", function( assert ) {
	assert.expect(2);
	var title = "TaskTitle!";
	var task = new Task({'title':title});
	task.delete();

    assert.ok( task.deleted_at !== undefined, "'deleted_at' attr created properly." );
    assert.ok( Date.now() - task.deleted_at < 50000, "'deleted_at' timestamp ~ correct." );
});