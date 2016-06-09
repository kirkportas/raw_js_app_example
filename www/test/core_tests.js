var GFT_APP = window.GFT_APP || null;

QUnit.test( "GFT_APP loaded", function( assert ) {
  assert.ok( GFT_APP != null, "Passed!" );
});


// QUnit.test( "GFT_APP render works", function( assert ) {
// 	assert.equal( $("#task-list").length, 1, "Task-list rendered successfully!" );
// });