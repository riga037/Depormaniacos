// Importar los módulos necesarios
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Crear la aplicación Express y el servidor HTTP
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Variables del juego
let users = [];
let points = [];
let time1 = 10;
let time2 = 15;
let questions;
let currentQuestionIndex = -1;
let gameLoop;

// Configurar el servidor de archivos estáticos
app.use(express.static('public'));

// Manejar la conexión de un cliente
io.on('connection', handleConnection);

// Función para manejar la conexión de un cliente
function handleConnection(socket) {
  console.log('Cliente conectado.');

  // Enviar la lista de usuarios al cliente
  socket.emit('usuarios', users);

  // Manejar el evento 'nickname'
  socket.on('nickname', handleNickname);

  // Manejar el evento 'score'
  socket.on('score', handleScore);

  // Manejar el evento 'register'
  socket.on('register', handleRegister);

  // Manejar el evento 'restart'
  socket.on('restart', handleRestart);

  // Función para manejar el evento 'nickname'
  function handleNickname(data) {
    if (data === 'admin') {
      socket.emit('admin', true);
    } else {
      if (!users.includes(data)) {
        users.push(data);
        io.emit('usuarios', users);
      } else {
        socket.emit('admin', false);
      }
    }
  }

  // Función para manejar el evento 'score'
  function handleScore(data) {
    const usuario = points.find((punto) => punto.nom === data.name);
    if (usuario) {
      usuario.punts += parseInt(data.puntos);
    }
  }

  // Función para manejar el evento 'register'
  function handleRegister(data) {
    if (!gameLoop) {
      const filePath = `./public/${data}.json`;
      questions = require(filePath);
      gameLoop = setInterval(updateTimers, 1000);
    }
  }

  // Función para manejar el evento 'restart'
  function handleRestart(data) {
    clearInterval(gameLoop);
    users = [];
    points = [];
    time1 = 10;
    time2 = 15;
    currentQuestionIndex = -1;
    gameLoop = null;
    io.emit('reestablish', true);
  }

  // Función para actualizar los temporizadores del juego
  function updateTimers() {
    if (time1 > 0) {
      points = users.map((usuario) => ({ nom: usuario, punts: 0 }));
      time1--;
      io.emit('time1', time1);
    } else {
      io.emit('start', true);

      if (currentQuestionIndex === -1) {
        points.sort((a, b) => b.punts - a.punts);
        io.emit('puntos', points);
        io.emit('pregunta', questions[++currentQuestionIndex]);
      } else if (time2 > 0) {
        time2--;
        io.emit('time2', time2);
      } else if (time2 === 0) {
        if (currentQuestionIndex < questions.length - 1) {
          time2 = 10;
          points.sort((a, b) => b.punts - a.punts);
          io.emit('puntos', points);
          io.emit('pregunta', questions[++currentQuestionIndex]);
       
        } else {
            io.emit('puntos', points);
            io.emit('end', true);
            clearInterval(gameLoop);
          }
        }
      }
    }
  }
  
  // Iniciar el servidor
  const PORT = 7000;
  httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
  