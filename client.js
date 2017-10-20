$(function() {
  var socket = io();
  $("form").submit(function() {
    // $('#m').val()
    // { nickname: string,
    // message: text }
    const messageObject = {
      nickname: "Karina Keen",
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
    console.log("msg", msg);
    window.scrollTo(0, document.body.scrollHeight);
  });
});
