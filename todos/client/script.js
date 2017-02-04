var $ = require('jquery');
var todoTemplate = require("../views/partials/todo.hbs");

$(function(){
   $(':button').on('click', addTodo);
   
   $(':text').on('keypress', function(e){
      var key = e.keyCode;
      if (key == 13 || key == 169) {
         addTodo();
         e.preventDefault();
         e.stopPropagation();
         return false;
      }
   });
   
   $('input').on('click', function(){
       $(this).parent().toggleClass('checked');
   }); 
});

var addTodo = function() {
  var text = $('#add-todo-text').val();
  
  $.ajax({
     url: '/api/todos',
     type: 'POST',
     data: {
        text: text
     },
     dataType: 'json',
     success: function(data) {
        var todo = data.todo;
        var newLiHtml = todoTemplate(todo);
        $('form + ul').append(newLiHtml);
        $('#add-todo-text').val('');
     }
  });
};