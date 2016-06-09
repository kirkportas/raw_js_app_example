// function Task(properties) {
//   return (properties).pick('id', 'title', 'created_at', 'deleted_at');
// }


function Task(params) {
  this.title = params['title'];
  this.created_at = Date.now();
  this.deleted_at = null;
  this.id = Math.floor((Math.random() * 100000) + 1); // Random not sequential. Demo only.
}

Task.prototype.delete = function (id) {
  var deleted_at = Date.now()
  return this.deleted_at = deleted_at // this is assignment, not comparison
}

Task.prototype.all = function (id) {
  var deleted_at = Date.now()
  return this.deleted_at = deleted_at // this is assignment, not comparison
}

Task.prototype.active = function (id) {

  var deleted_at = Date.now()
  return this.deleted_at = deleted_at // this is assignment, not comparison
}

// Task.prototype.new = function (title) {
//   for (var idx = 0, len = this.pegs.length; idx < len; idx++) {
//     this.pegs[idx] = {x: x, y: y, hit: false}
//     if (orientation == 'horizontal') x += 1
//     else                             y += 1
//   }
// }
// Task.prototype.create = function (title) {
//   // Before calling this method you'd need to confirm
//   // that the position is legal (on the board and not
//   // conflicting with the placement of existing ships).
//   // `x` and `y` should reflect the coordinates of the
//   // upper-leftmost peg position.
//   for (var idx = 0, len = this.pegs.length; idx < len; idx++) {
//     this.pegs[idx] = {x: x, y: y, hit: false}
//     if (orientation == 'horizontal') x += 1
//     else                             y += 1
//   }
// }

