$(function() {
  var socket = io();
  $("form").submit(function() {
    const messageObject = {
      message: $("#m").val()
    };
    socket.emit("chat message", messageObject);
    $("#m").val("");
    return false;
  });
  socket.on("chat message", function(msg) {
    $("#messages").append(
      $("<li>").text(`${msg.nickname} ${msg.message} ${msg.timestamp}`)
    );
    window.scrollTo(0, document.body.scrollHeight);
  });
});
