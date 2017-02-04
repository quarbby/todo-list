var $ = require('jquery');
var todoTemplate = require("../views/partials/todo.hbs");

$(function(){
   initTodoObserver();

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
   
   $('ul').on('change', 'li :checkbox', function(){
      var $this = $(this),
         $input = $this[0],
         $li = $this.parent(),
         id = $li.attr('id'),
         checked = $input.checked,
         data = {done: checked };
         
      updateTodo(id, data, function(id){
         $this.next().toggleClass('checked');
      });
   });

   $('ul').on('keydown', 'li span', function(e) {
      var $this = $(this),
         $span = $this[0],
         $li = $this.parent(),
         id = $li.attr('id'),
         key = e.keyCode,
         target = e.target,
         text = $span.innerHTML,
         data = {text: text};
         
      $this.addClass('editing');
      
      if (key === 27) {    // esc key
         $this.removeClass('editing');
         document.execCommand('undo');
         target.blur();
      } else if (key === 13) {   // enter key
         updateTodo(id, data, function(d) {
            $this.removeClass('editing');
            target.blur();
         });
         e.preventDefault();
      }
   });
   
   $('ul').on('click', 'li a', function() {
      var $this = $(this),
         $input = $this[0],
         $li = $this.parent(),
         id = $li.attr('id');
         
      deleteTodo(id, function(e){
         deleteTodoLi($li);
      })
   });
   
   // Filtering the list 
   $('.filter').on('click', '.show-all', function() {
      $('.hide').removeClass('hide');
   });
   $('.filter').on('click', '.show-not-done', function() {
      $('.hide').removeClass('hide');
      $('.checked').closest('li').addClass('hide');
   });
   $('.filter').on('click', '.show-done', function() {
      $('.hide').removeClass('hide');
      $('.checked').closest('li').removeClass('hide');
   });
   
   // Clear list event handler 
   $('.clear').on('click', function() {
       var $doneLi = $('.checked').closest('li');
       for (var i=0; i < $doneLi.length; i++) {
          var $li = $($doneLi[i]);
          var id = $li.attr('id');
          (function($li){
             deleteTodo(id, function() {
                deleteTodoLi($li); 
             });
          })($li);
       }
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

var updateTodo = function(id, data, cb) {
  $.ajax({
     url: '/api/todos/' + id,
     type: 'PUT',
     data: data,
     dataType: 'json',
     success: function(data) {
        cb();
     }
  });
};

var deleteTodo = function(id, cb) {
  $.ajax({
     url: '/api/todos/' + id,
     type: 'DELETE',
     data: {
        id: id
     },
     dataType: 'json',
     success: function(data) {
        cb();
     }
  });
};

var deleteTodoLi = function($li) {
   $li.remove();
};

var initTodoObserver = function(){
   var target = $('ul')[0];
   var config = {attributes: true, childList: true, characterData: true};
   var observer = new MutationObserver(function(mutationRecords){
      $.each(mutationRecords, function(index, mutationRecord){
         updateTodoCount();
      });
   });
   if (target){
      observer.observe(target, config);
   }
   updateTodoCount();
}

var updateTodoCount = function () {
  $('.count').text($('li').length); 
};