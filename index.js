const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const os = require("os");
const v8 = require("v8");
const port = process.env.PORT || 3000;
const { getRandomUsername } = require("./randomUsername.js");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function(req, res) {
  res.sendFile(__dirname + "/client.js");
});

app.get("/metrics.json", function(req, res) {
  const {
    total_heap_size,
    total_heap_size_executable,
    total_physical_size,
    total_available_size,
    used_heap_size,
    heap_size_limit,
    malloced_memory,
    peak_malloced_memory
  } = v8.getHeapStatistics();
  res.json({
    // total amount of system memory in bytes as an integer.
    "system/total_mem": os.totalmem(),
    //system uptime in ms
    "system/uptime": Math.floor(os.uptime() * 1000),
    "runtime/uptime": Math.floor(process.uptime() * 1000),
    "runtime/total_heap_size": total_heap_size,
    "runtime/total_heap_size_executable": total_heap_size_executable,
    "runtime/total_physical_size": total_physical_size,
    "runtime/total_available_size": total_available_size,
    "runtime/used_heap_size": used_heap_size,
    "runtime/heap_size_limit": heap_size_limit,
    "runtime/malloced_memory": malloced_memory,
    "runtime/peak_malloced_memory": peak_malloced_memory
  });
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
