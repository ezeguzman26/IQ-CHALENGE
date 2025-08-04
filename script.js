// Selección de elementos
const menu = document.getElementById("menu");
const levelSelect = document.getElementById("level-select");
const game = document.getElementById("game");
const startButton = document.getElementById("start-button");
const backToMenuBtn = document.getElementById("back-to-menu");
const levelsContainer = document.getElementById("levels-container");

// Evento botón comenzar en menú
startButton.addEventListener("click", () => {
  menu.style.display = "none";
  levelSelect.style.display = "flex";
});

// Evento botón volver al menú desde selección niveles
backToMenuBtn.addEventListener("click", () => {
  levelSelect.style.display = "none";
  menu.style.display = "flex";
});

// Crear niveles dinámicamente (por ahora solo nivel 1)
const totalLevels = 1;

function createLevelCards() {
  // Ya existe nivel 1 en el HTML, si hubiera más niveles se agregan aquí
  for (let i = 2; i <= totalLevels; i++) {
    const card = document.createElement("div");
    card.classList.add("level-card");
    card.dataset.level = i;
    card.innerHTML = `<span>Nivel ${i}</span><div class="level-preview">🧩</div>`;
    levelsContainer.appendChild(card);
  }
}

createLevelCards();

// Event delegation para seleccionar nivel
levelsContainer.addEventListener("click", (e) => {
  const levelCard = e.target.closest(".level-card");
  if (!levelCard) return;

  const level = levelCard.dataset.level;
  startGame(level);
});

// Función placeholder para iniciar juego (a modificar luego)
function startGame(level) {
  levelSelect.style.display = "none";
  game.style.display = "flex";

  game.innerHTML = `<h2 style="text-align:center; margin-top:40vh; font-size:8vw;">
    Jugando nivel ${level} (Aquí irá el juego IQ)
  </h2>`;
}
