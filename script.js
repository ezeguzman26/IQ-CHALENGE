// Elementos
const menu = document.getElementById("menu");
const levelSelect = document.getElementById("level-select");
const startButton = document.getElementById("start-button");
const backToMenuBtn = document.getElementById("back-to-menu");
const levelsContainer = document.getElementById("levels-container");
let isDrawing = false;
let iq = parseInt(localStorage.getItem("iq")) || 0;
let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || [];

// Cargar niveles completados desde el almacenamiento local
function getCompletedLevels() {
  const stored = localStorage.getItem('completedLevels');
  return stored ? JSON.parse(stored) : [];
}

// Guardar niveles completados
function saveCompletedLevel(levelNumber) {
  const completed = getCompletedLevels();
  if (!completed.includes(levelNumber)) {
    completed.push(levelNumber);
    localStorage.setItem('completedLevels', JSON.stringify(completed));
  }
}

// Obtener IQ actual
function getIQ() {
  return parseInt(localStorage.getItem('iq') || '0');
}

// Guardar IQ
function setIQ(value) {
  localStorage.setItem('iq', value);
  document.getElementById('iq-points').textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
  setIQ(getIQ());
});


function updateIQDisplay() {
  const iqElements = document.querySelectorAll(".iq-counter");
  iqElements.forEach(el => el.textContent = `🧠 IQ: ${iq}`);
}

updateIQDisplay(); // Mostramos al iniciar



function resetDrawing() {
  connections.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("success-message").style.display = "none";
  startDot = null;
  currentPos = null;
  dots.forEach(dot => dot.classList.remove("selected"));
}

function showMenu() {
  menu.style.display = "flex";
  levelSelect.style.display = "none";
}

function showLevelSelect() {
  menu.style.display = "none";
  levelSelect.style.display = "flex";
}

// Eventos de navegación
startButton.addEventListener("click", showLevelSelect);
backToMenuBtn.addEventListener("click", showMenu);
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("back-to-levels")) {
    // Oculta todos los niveles
    document.querySelectorAll(".game-screen").forEach(screen => {
      screen.style.display = "none";
    });

    // Muestra selección de niveles
    levelSelect.style.display = "flex";
  }
});

// Crear 200 niveles dinámicamente
function createLevels() {
  for (let i = 1; i <= 200; i++) {
    const card = document.createElement("div");
    card.classList.add("level-card");
    card.dataset.level = i;
    card.innerHTML = `
      <span>Nivel ${i}</span>
      <div class="level-preview">🧩</div>
    `;
    levelsContainer.appendChild(card);
  }
}

createLevels();

// Manejar clics en los niveles
levelsContainer.addEventListener("click", (e) => {
  const levelCard = e.target.closest(".level-card");
  if (!levelCard) return;

  const level = levelCard.dataset.level;

  menu.style.display = "none";
  levelSelect.style.display = "none";

  const gameScreen = document.getElementById(`level-${level}`);
  if (gameScreen) {
    gameScreen.style.display = "flex";

    // Reiniciar lógica del nivel 1
    if (level === "1") {
      setTimeout(() => {
        resetLevel1Game();
        initLevel1Game();
      }, 100);
    }
  }
});

const gameScreensContainer = document.getElementById("game-screens");

function createGameScreens() {
  for (let i = 1; i <= 200; i++) {
    const screen = document.createElement("div");
    screen.classList.add("screen", "game-screen");
    screen.id = `level-${i}`;
    screen.style.display = "none"; // Oculto inicialmente

    if (i === 1) {
      screen.innerHTML = `
        <button class="back-button back-to-levels" data-target="level-select">←</button>
        <h2 class="level-title">Nivel ${i}</h2>
        <div class="connect-colors">
          <div class="side left">
            <div class="dot" data-color="red"></div>
            <div class="dot" data-color="blue"></div>
          </div>
          <canvas id="connection-canvas"></canvas>
          <div class="side right">
            <div class="dot" data-color="blue"></div>
            <div class="dot" data-color="red"></div>
          </div>
        </div>
        <div id="success-message" style="display:none;">✅ ¡Nivel completado!</div>
      `;
      
    } else {
      screen.innerHTML = `
        <button class="back-button back-to-levels" data-target="level-select">←</button>
        <h2 class="level-title">Nivel ${i}</h2>
        <!-- Aquí irá el juego del nivel ${i} -->
      `;
    }

    gameScreensContainer.appendChild(screen);
  }
}

createGameScreens();

function initLevel1Game() {
  const canvas = document.getElementById("connection-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let startDot = null;
  let currentPath = []; // array con {x,y} del trazo actual
  const connections = [];

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redrawConnections();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const dots = document.querySelectorAll("#level-1 .dot");

  dots.forEach(dot => {
    dot.addEventListener("mousedown", e => {
      e.preventDefault();
      if (dot.dataset.connected === "true") return;
      startDot = dot;
      currentPath = [];
      const pos = getEventPos(e);
      currentPath.push(pos);
      
    });

    dot.addEventListener("touchstart", e => {
      startDot = dot;
      currentPath = [];
      const pos = getEventPos(e);
      currentPath.push(pos);
      
    });
  });

  document.addEventListener("mousemove", e => {
    if (!startDot) return;
    e.preventDefault();
    const pos = getEventPos(e);
    currentPath.push(pos);
    redrawConnections();
 
    drawCurrentPath();
  });

  document.addEventListener("touchmove", e => {
    if (!startDot) return;
    e.preventDefault();
    const pos = getEventPos(e);
    currentPath.push(pos);
    redrawConnections();
    
    drawCurrentPath();
  }, { passive: false });

  document.addEventListener("mouseup", e => {
    if (!startDot) return;
    e.preventDefault();
    const pos = getEventPos(e);
    tryConnect(e.clientX, e.clientY);
    startDot = null;
    currentPath = [];
    redrawConnections();
    if (startDot) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!tryConnect(target)) {
      // si la conexión no se realizó (o fue incorrecta)
      resetDrawing();
      
    }
  }
  });

  document.addEventListener("touchend", e => {
    if (!startDot) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    tryConnect(touch.clientX, touch.clientY);
    startDot = null;
    currentPath = [];
    redrawConnections();
    resetDrawing()
  });

  function tryConnect(clientX, clientY) {
    const target = document.elementFromPoint(clientX, clientY);
    if (!target || !target.classList.contains("dot")) return;

    const color1 = startDot.dataset.color;
    const color2 = target.dataset.color;

    const isLeft = startDot.parentElement.classList.contains("left");
    const isRight = target.parentElement.classList.contains("right");

    if (color1 === color2 && isLeft && isRight) {
      // Verificar que no exista ya esta conexión
      const exists = connections.some(conn => {
        return (conn.d1 === startDot && conn.d2 === target) || (conn.d1 === target && conn.d2 === startDot);
      });
      if (exists) return;

      // Verificar que no cruce otra línea
      for (const conn of connections) {
        if (linesIntersectPath(currentPath, conn.path)) {
          // Cruza con otro cable
          return;
        }
      }

      // Guardar la conexión con el path dibujado
      connections.push({ d1: startDot, d2: target, path: [...currentPath] });
      if (connections.length === 2) {
        document.getElementById("success-message").style.display = "block";
        
      }
    }
    
  }

  function getEventPos(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  // Dibuja todas las conexiones guardadas (cables)
  function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(conn => {
      drawPath(conn.path, conn.d1.dataset.color);
    });
  }

  // Dibuja el path que está dibujando el usuario
  function drawCurrentPath() {
    if (currentPath.length < 2) return;
    ctx.strokeStyle = startDot.dataset.color;
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(currentPath[0].x - canvas.getBoundingClientRect().left, currentPath[0].y - canvas.getBoundingClientRect().top);
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x - canvas.getBoundingClientRect().left, currentPath[i].y - canvas.getBoundingClientRect().top);
    }
    ctx.stroke();
  }

  // Dibuja un path completo (array de puntos)
  function drawPath(path, color) {
    if (path.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x - canvas.getBoundingClientRect().left, path[0].y - canvas.getBoundingClientRect().top);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x - canvas.getBoundingClientRect().left, path[i].y - canvas.getBoundingClientRect().top);
    }
    ctx.stroke();
  }

  // Función para detectar si dos paths se intersectan
  // Aquí vamos a simplificar la detección solo con sus segmentos
  function linesIntersectPath(path1, path2) {
    for (let i = 0; i < path1.length - 1; i++) {
      const a1 = path1[i];
      const a2 = path1[i + 1];
      for (let j = 0; j < path2.length - 1; j++) {
        const b1 = path2[j];
        const b2 = path2[j + 1];
        if (linesIntersect({x1:a1.x,y1:a1.y,x2:a2.x,y2:a2.y}, {x1:b1.x,y1:b1.y,x2:b2.x,y2:b2.y})) {
          return true;
        }
      }
    }
    return false;
  }

  // Función para saber si dos líneas se cruzan (como ya tenías)
  function linesIntersect(a, b) {
    function ccw(p1, p2, p3) {
      return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    const A = { x: a.x1, y: a.y1 };
    const B = { x: a.x2, y: a.y2 };
    const C = { x: b.x1, y: b.y1 };
    const D = { x: b.x2, y: b.y2 };
    return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
  }
  // Agrega esta función para detectar si el puntero está sobre un círculo (dot)
function getDotAtPosition(x, y) {
  const dots = document.querySelectorAll("#level-1 .dot");
  for (const dot of dots) {
    const rect = dot.getBoundingClientRect();
    // Consideramos un área un poco mayor para "tocar"
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return dot;
    }

  }
  return null;
}

// Dentro del evento mousemove y touchmove, agregá esto para la validación:

document.addEventListener("mousemove", e => {
  if (!startDot) return;
  e.preventDefault();
  const pos = getEventPos(e);
  
  // Verificamos si tocamos un círculo diferente al color correcto
  const dotAtPos = getDotAtPosition(pos.x, pos.y);
  if (dotAtPos) {
    if (dotAtPos === startDot) {
      // está sobre el mismo punto de inicio, todo ok
    } else {
      // Si tocamos otro círculo:
      // Comprobamos si es el color correcto y lado correcto para poder conectar
      const correctColor = (dotAtPos.dataset.color === startDot.dataset.color);
      const isLeftStart = startDot.parentElement.classList.contains("left");
      const isRightDot = dotAtPos.parentElement.classList.contains("right");
      
      if (!(correctColor && isLeftStart && isRightDot)) {
        currentPath = [];
        redrawConnections();
        startDot = null; // ← ¡esto es lo que faltaba!
        return;
      }

    }
  }

  currentPath.push(pos);
  redrawConnections();
  drawCurrentPath();
});

document.addEventListener("touchmove", e => {
  if (!startDot) return;
  e.preventDefault();
  const pos = getEventPos(e);

  const dotAtPos = getDotAtPosition(pos.x, pos.y);
  if (dotAtPos) {
    if (dotAtPos === startDot) {
      // todo ok
    } else {
      const correctColor = (dotAtPos.dataset.color === startDot.dataset.color);
      const isLeftStart = startDot.parentElement.classList.contains("left");
      const isRightDot = dotAtPos.parentElement.classList.contains("right");
      if (!(correctColor && isLeftStart && isRightDot)) {
        currentPath = [];
        redrawConnections();
        startDot = null; // ← esto también acá
        return;
      }

    }
  }

  currentPath.push(pos);
  redrawConnections();
  drawCurrentPath();
}, { passive: false });

}

// Reinicia el juego nivel 1 cuando vuelvas a entrar
function resetLevel1Game() {
  const canvas = document.getElementById("connection-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dots = document.querySelectorAll("#level-1 .dot");
  dots.forEach(dot => {
    dot.classList.remove("selected");
  });

  const success = document.getElementById("success-message");
  if (success) success.style.display = "none";
}




  function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const container = canvas.getBoundingClientRect();

    connections.forEach(([dot1, dot2]) => {
      const rect1 = dot1.getBoundingClientRect();
      const rect2 = dot2.getBoundingClientRect();

      const x1 = rect1.left + rect1.width / 2 - container.left;
      const y1 = rect1.top + rect1.height / 2 - container.top;
      const x2 = rect2.left + rect2.width / 2 - container.left;
      const y2 = rect2.top + rect2.height / 2 - container.top;

      ctx.strokeStyle = dot1.dataset.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }


function linesIntersect(a, b) {
  // Determina si las líneas (a1-a2) y (b1-b2) se cruzan
  function ccw(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }

  const A = { x: a.x1, y: a.y1 };
  const B = { x: a.x2, y: a.y2 };
  const C = { x: b.x1, y: b.y1 };
  const D = { x: b.x2, y: b.y2 };

  return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
}

function resetLevel1Game() {
  const canvas = document.getElementById("connection-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dots = document.querySelectorAll("#level-1 .dot");
  dots.forEach(dot => {
    dot.classList.remove("selected");
  });

  const success = document.getElementById("success-message");
  if (success) success.style.display = "none";
}
