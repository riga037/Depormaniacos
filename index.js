const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

app.use(express.static("public"));

const io = new Server(httpServer); // Puedes omitir el segundo argumento si no lo estás utilizando

var usuarios = [];
var puntos = [];
var time1 = 10;
var time2 = 15;

var preguntes;
var pregBio = require('./public/champions.json');
var quest = -1;

var loop;

io.on("connection", (socket) => {
  console.log('Cliente conectado.');
  
  io.emit("usuarios", usuarios);
  
  socket.on("nickname", (data) => {
    if (data === "admin") {
      socket.emit("admin", true);
    } else {
      usuarios.push(data);
      io.emit("usuarios", usuarios);
    }
  });
  
  
  socket.on("score", (data) => {
    const usuario = puntos.find((punto) => punto.nom === data.name);
    if (usuario) {
      usuario.punts += parseInt(data.puntos);
    }
  });
  
  
  socket.on("register", (data) => {
    preguntes = require(`./public/${data}.json`);
    loop = setInterval(updateTimers, 1000);
  });
  
  socket.on("restart", (data) => {
    clearInterval(loop);
    usuarios = [];
    puntos = [];
    time1 = 10;
    time2 = 15;
    quest = -1;
    io.emit("reestablish", true);
  });
});

function updateTimers() {
  if (time1 > 0) {
    puntos = usuarios.map((usuario) => ({ nom: usuario, punts: 0 }));
    time1--;
    io.sockets.emit('time1', time1);
  } else {
    io.emit("start", true);
    if (quest === -1) {
      puntos.sort((a, b) => b.punts - a.punts);
      io.sockets.emit('puntos', puntos);
      io.sockets.emit('pregunta', preguntes[++quest]);
    } else if (time2 > 0) {
      time2--;
      io.sockets.emit('time2', time2);
    } else if (time2 === 0 && quest < preguntes.length - 1) {
      time2 = 10;
      puntos.sort((a, b) => b.punts - a.punts);
      io.sockets.emit('puntos', puntos);
      io.sockets.emit('pregunta', preguntes[++quest]);
    } else if (time2 === 0 && quest === preguntes.length - 1) {
      io.sockets.emit('puntos', puntos);
      io.emit("end", true);
    }
  }
}


httpServer.listen(5005, () => {
  console.log(`Server listening at http://localhost:5005`);
});
