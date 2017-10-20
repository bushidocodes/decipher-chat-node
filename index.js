var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function(req, res) {
  res.sendFile(__dirname + "/client.js");
});

// io.emit broadcasts to all including sender
io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    // Add timestamp
    msg.timestamp = JSON.stringify(Date.now());
    console.log("What does this message look like: ", msg);
    io.emit("chat message", msg);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
