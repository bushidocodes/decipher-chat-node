const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const { getRandomUsername } = require("./randomUsername.js");

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
  console.log(getRandomUsername());
  // When a new socket connection is established,
  // replay all of the past messages
  allTheMessages.forEach((msg, idx) => {
    console.log(`Attempting to send message #${idx} to ${socket.id}`);
    socket.emit("chat message", msg);
  });

  io.emit("new user", socket.id);

  // Something here sending past messages to a new user
  socket.on("chat message", function(msg) {
    // Add timestamp
    msg.timestamp = JSON.stringify(Date.now());
    msg.socketid = socket.id;
    // console.log("New Message: ", msg);
    // Save to in memory data structure
    allTheMessages.push(msg);
    // console.log("In-memory store of messages: ", allTheMessages);
    io.emit("chat message", msg);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
