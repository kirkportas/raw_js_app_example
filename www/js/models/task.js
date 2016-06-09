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

//## WIP - Return All Tasks
// Task.prototype.all = function (id) {
//   return ...
// }

//## WIP - Return Non-Deleted Tasks
// Task.prototype.active = function (id) {
//   return ....
// }

