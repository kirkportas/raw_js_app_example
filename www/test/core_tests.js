var GFT_APP = window.GFT_APP || null;

QUnit.test( "Core: GFT_APP loaded", function( assert ) {
  assert.ok( GFT_APP != null, "Passed!" );
});




// QUnit.test( "Core: renderPage works for 'landing' page", function( assert ) {
// 	var test_selector = 'test_div';
// 	var $test_div = $("<div id="+test_selector+"></div>");
// 	var context={
// 	    placeholder: "Add items to list",
// 	    tasks:  [ new Task({'title': "Write Code"}),
// 	              new Task({'title': "Push Code" }),
// 	              new Task({'title': "Install Sublime3"}) ]
// 	};

// 	$('html').append($test_div);
		// ### testing a router will be a bit more time than planned
// 	GFT_APP.pageRouter['test_page'] ..
// 	GFT_APP.renderPage("landing", context, "#"+test_selector)

//     assert.ok( test_div has content );
// });
