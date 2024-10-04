const canvas = document.getElementById('tetris'); 
const context = canvas.getContext('2d');

context.scale(20, 20);

const SHAPES = {
  O: [[1, 1], [1, 1]],
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  L: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  J: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
};

const colors = [null, 'yellow', 'cyan', 'red', 'green', 'orange', 'blue', 'purple'];

function createPiece(type) {
  const piece = SHAPES[type];
  switch (type) {
    case 'O': return { matrix: piece, color: 1 };
    case 'I': return { matrix: piece, color: 2 };
    case 'Z': return { matrix: piece, color: 3 };
    case 'S': return { matrix: piece, color: 4 };
    case 'L': return { matrix: piece, color: 5 };
    case 'J': return { matrix: piece, color: 6 };
    case 'T': return { matrix: piece, color: 7 };
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = player.color;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && 
         (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const pieces = 'OISZLJT';
  const newPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.matrix = newPiece.matrix;
  player.color = newPiece.color;
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

function draw() {
    context.fillStyle = '#000'; // Фон черный
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    if (isGameRunning) {
        // Если игра идет, рисуем матрицу
        drawMatrix(arena, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }
}


let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  color: 1,
};

let isGameRunning = false;

document.addEventListener('keydown', event => {
  if (isGameRunning) {
    switch (event.keyCode) {
      case 37: // Left arrow
        playerMove(-1);
        break;
      case 39: // Right arrow
        playerMove(1);
        break;
      case 40: // Down arrow
        playerDrop();
        break;
      case 38: // Up arrow
        playerRotate(1);
        break;
      case 81: // Q
        playerRotate(-1);
        break;
      default:
        break;
    }
  }
});

document.getElementById('left').addEventListener('click', () => {
  if (isGameRunning) {
    playerMove(-1);
  }
});

document.getElementById('right').addEventListener('click', () => {
  if (isGameRunning) {
    playerMove(1);
  }
});

document.getElementById('down').addEventListener('click', () => {
  if (isGameRunning) {
    playerDrop();
  }
});

document.getElementById('rotate').addEventListener('click', () => {
  if (isGameRunning) {
    playerRotate(1);
  }
});

// Функция для начала или сброса игры
function startGame() {
  const startButton = document.getElementById('start');
  
  if (!isGameRunning) {
    isGameRunning = true;
    arena.forEach(row => row.fill(0));
    playerReset();
    update();
    startButton.textContent = "Стоп"; // Изменение текста кнопки
    startButton.style.backgroundColor = "red"; // Изменение цвета кнопки
    console.log("Game started!");
  } else {
    // Сброс состояния игры
    isGameRunning = false;
    arena.forEach(row => row.fill(0));
    player.pos = { x: 0, y: 0 }; // Сброс позиции игрока
    player.matrix = null; // Сброс матрицы игрока
    startButton.textContent = "Старт"; // Изменение текста кнопки обратно
    startButton.style.backgroundColor = ""; // Сброс цвета кнопки
    console.log("Game reset! Press Start to play again.");
  }
}

// Обработчик кнопки "Старт"
document.getElementById('start').addEventListener('click', startGame);
