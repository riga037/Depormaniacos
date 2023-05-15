const socket = io();
const nick = document.getElementById("nick");
const nicknameInput = document.getElementById("nicknameInput");
const sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", send);
const validation = document.getElementById("validation");
const enespera = document.getElementById("enespera");
const tempo1 = document.getElementById("tempo1");
const jugadores = document.getElementById("jugadores");
const game = document.getElementById("game");
const tempo2 = document.getElementById("tempo2");
const pregunta = document.getElementById("pregunta");
const resultad = document.getElementById('result');
const ranking = document.getElementById('ranking');
const list = document.getElementById('top');
const paneldeadmin= document.getElementById('paneldeadmin');
const trato = document.getElementById('trato'); 
const propPreguntes = document.getElementById('propPreguntes');
const startgame = document.getElementById('startgame');
const closegame = document.getElementById('closegame');
startgame.addEventListener("click", gamestart);
closegame.addEventListener("click", gameclose);
var usuarios = [];
var ended = false;
var winner;
var admin = false;

function send() {
    if (!usuarios.includes(nicknameInput.value)) {
      [nick, enespera].forEach((el, i) => el.style.display = ["none", "block"][i]);
      socket.emit("nickname", nicknameInput.value);
    } else {
      validation.innerHTML = "Ya existe un jugador con este nombre.";
    }
  }
  socket.on('admin', (admin = data) => {
    nick.style.display = admin ? "none" : "block";
    paneldeadmin.style.display = admin ? "block" : "none";
  });
  

  socket.on('usuarios', (data) => {
    usuarios = data;
    jugadores.innerHTML = usuarios.map(user => `<span>${user}</span>`).join('');
  });
  

socket.on('time1', (data) => {
    tempo1.innerHTML = data;
});

socket.on('time2', (data) => {
    tempo2.innerHTML = data;
});

function gamestart() {
    socket.emit("register", propPreguntes.value);
    [trato, startgame, closegame].forEach((el, i) => el.style.display = ["none", "none", "inline"][i]);
  }
  

function gameclose() {
    socket.emit("restart", true);
    [trato, startgame, closegame].forEach((el, i) => el.style.display = ["block", "inline", "none"][i]);
  }
  




socket.on('start', (data) => {
    if (data) {
      nick.style.display = enespera.style.display = game.style.display = "none";
      ranking.style.display = "block";
      result.style.display = ended ? "block" : "none";
      if (ended) document.getElementById('winner').innerText = winner;
      else game.style.display = "block";
    }
  });
  

  socket.on('pregunta', (data) => {
    pregunta.innerHTML = data.pregunta;
    document.querySelectorAll(".box").forEach((button, i) => {
      button.classList.remove('correct', 'incorrect');
      button.innerHTML = data.respuestas[i];
      button.onclick = function() {
        if (button.onclick) {
          button.onclick = null;
          if (i === data.respostaCorrecta) {
            button.classList.add('correct');
            socket.emit('score', { name: nicknameInput.value, puntos: 55 + parseInt(tempo2.innerHTML) });
          } else {button.classList.add('incorrect');
          document.querySelector(`.box:nth-child(${data.respostaCorrecta + 1})`).classList.add('correct');
        }
      }
    };
  });
});
socket.on('puntos', (data) => {
  list.innerHTML = "";
  data.slice(0, 3).forEach((player, index) => {
    if (index === 0) {
      winner = player.nom;
    }
    list.innerHTML += `<li>${player.nom} - ${player.punts}</li>`;
  });
});

socket.on('pregunta', (data) => {
  pregunta.innerHTML = data.pregunta;
  document.querySelectorAll(".box").forEach((button, i) => {
    button.classList.remove('correct', 'incorrect');
    button.innerHTML = data.respuestas[i];
    button.onclick = function() {
      if (button.onclick) {
        button.onclick = null;
        if (i === data.respostaCorrecta) {
          button.classList.add('correct');
          socket.emit('score', { name: nicknameInput.value, puntos: 55 + parseInt(tempo2.innerHTML) });
        } else {
          button.classList.add('incorrect');
          document.querySelector(`.box:nth-child(${data.respostaCorrecta + 1})`).classList.add('correct');
        }
      }
    };
  });
});


socket.on('end', (data) => {
  ended = data;
});

socket.on('reestablish', (data) => {
  ended = false;
  usuarios = [];
  jugadores.innerHTML = "";
  nick.style.display = !admin ? "block" : "none";
  enespera.style.display = admin ? "block" : "none";
  game.style.display = "none";
  result.style.display = "none";
  ranking.style.display = "none";
  tempo1.innerHTML = 10;
});