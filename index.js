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

// In-memory data structure persisting all messages
const allTheMessages = [];

// io.emit broadcasts to all including sender
io.on("connection", function(socket) {
  console.log(`${socket.id} has joined the chat`);
  // When a new socket connection is established,
  // replay all of the past messages
  allTheMessages.forEach((msg, idx) => {
    console.log(`Attempting to send message #${idx} to ${socket.id}`);
    socket.emit("chat message", msg);
  });
  // Something here sending past messages to a new user
  socket.on("chat message", function(msg) {
    // Add timestamp
    msg.timestamp = JSON.stringify(Date.now());
    console.log("New Message: ", msg);
    // Save to in memory data structure
    allTheMessages.push(msg);
    console.log("In-memory store of messages: ", allTheMessages);
    io.emit("chat message", msg);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
