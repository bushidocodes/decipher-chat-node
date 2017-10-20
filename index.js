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
const socketsToNames = {};

// io.emit broadcasts to all including sender
io.on("connection", function(socket) {
  socketsToNames[socket.id] = getRandomUsername();
  // When a new socket connection is established, replay all of the past messages
  allTheMessages.forEach(msg => {
    socket.emit("chat message", msg);
  });

  saveAndSendMessage("", `${socketsToNames[socket.id]} has joined the chat`);

  // Something here sending past messages to a new user
  socket.on("chat message", function(msg) {
    saveAndSendMessage(socketsToNames[socket.id], msg.message);
  });

  socket.on("set name", function(name) {
    const oldName = socketsToNames[socket.id];
    socketsToNames[socket.id] = name;
    saveAndSendMessage("", `${oldName} is now ${socketsToNames[socket.id]}`);
  });

  socket.on("disconnect", () => {
    saveAndSendMessage("", `${socketsToNames[socket.id]} has left the chat`);
  });

  function saveAndSendMessage(
    nickname,
    message,
    timestamp = JSON.stringify(Date.now())
  ) {
    const msg = { nickname, message, timestamp };
    // Save to in memory data structure
    allTheMessages.push(msg);
    // Broadcast to the clients
    io.emit("chat message", msg);
  }
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
