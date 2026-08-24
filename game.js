// ============================================================
// 국어 브루마블 - 게임판 로직
//
// 보드 칸 배치와 이동/문제 출제 로직입니다. 문제 내용을 바꾸고
// 싶다면 이 파일이 아니라 questions.js를 수정하세요.
// ============================================================

const GRID_SIZE = 7; // 보드 한 변의 칸 수 (테두리를 따라 말판이 놓입니다)
const CATEGORY_CYCLE = ["맞춤법", "문학", "문법", "찬스"];
const CATEGORY_ICON = {
  출발: "🚩",
  맞춤법: "📝",
  문학: "📖",
  문법: "🔤",
  찬스: "🎁",
};

function buildPerimeterCells(n) {
  const cells = [];
  for (let col = 1; col <= n; col++) cells.push({ row: 1, col });
  for (let row = 2; row <= n; row++) cells.push({ row, col: n });
  for (let col = n - 1; col >= 1; col--) cells.push({ row: n, col });
  for (let row = n - 1; row >= 2; row--) cells.push({ row, col: 1 });
  return cells;
}

function buildBoardSquares() {
  const cells = buildPerimeterCells(GRID_SIZE);
  return cells.map((cell, i) => {
    const category = i === 0 ? "출발" : CATEGORY_CYCLE[(i - 1) % CATEGORY_CYCLE.length];
    return { ...cell, category };
  });
}

const squares = buildBoardSquares();

let currentIndex = 0;
let currentTeam = 1;
let isMoving = false;

const boardEl = document.getElementById("board");
const turnIndicatorEl = document.getElementById("turn-indicator");
const questionPanelEl = document.getElementById("question-panel");
const categoryTagEl = document.getElementById("category-tag");
const questionTextEl = document.getElementById("question-text");
const answerTextEl = document.getElementById("answer-text");
const revealBtn = document.getElementById("reveal-btn");

function renderBoard() {
  boardEl.innerHTML = "";

  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <div class="board-title">국어 브루마블</div>
    <div class="dice-result" id="dice-result"></div>
    <button id="roll-btn" class="btn-primary">주사위 굴리기 🎲</button>
  `;
  boardEl.appendChild(center);

  squares.forEach((sq, i) => {
    const el = document.createElement("div");
    el.className = `square cat-${sq.category}`;
    el.style.gridRow = sq.row;
    el.style.gridColumn = sq.col;
    el.dataset.index = i;
    el.innerHTML = `
      <span class="icon">${CATEGORY_ICON[sq.category]}</span>
      <span>${sq.category}</span>
    `;
    boardEl.appendChild(el);
  });

  updateTokenDisplay();
  document.getElementById("roll-btn").addEventListener("click", rollDice);
}

function updateTokenDisplay() {
  document.querySelectorAll(".square").forEach((el) => el.classList.remove("has-token"));
  const currentEl = boardEl.querySelector(`.square[data-index="${currentIndex}"]`);
  if (currentEl) currentEl.classList.add("has-token");
}

function rollDice() {
  if (isMoving) return;
  isMoving = true;
  hideQuestionPanel();

  const rollValue = Math.floor(Math.random() * 6) + 1;
  const diceResultEl = document.getElementById("dice-result");
  diceResultEl.textContent = `🎲 ${rollValue}`;

  let steps = 0;
  const moveInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % squares.length;
    updateTokenDisplay();
    steps++;
    if (steps >= rollValue) {
      clearInterval(moveInterval);
      isMoving = false;
      onLanded();
    }
  }, 250);
}

function onLanded() {
  const square = squares[currentIndex];

  if (square.category === "출발") {
    showMessage("출발", "한 바퀴를 돌아 출발 칸으로 돌아왔습니다! 🎉");
  } else {
    const pool = QUESTIONS[square.category] || [];
    if (pool.length === 0) {
      showMessage(square.category, "아직 등록된 문제가 없어요. questions.js에 문제를 추가해보세요!");
    } else {
      const q = pool[Math.floor(Math.random() * pool.length)];
      showQuestion(square.category, q);
    }
  }

  currentTeam = currentTeam === 1 ? 2 : 1;
  turnIndicatorEl.textContent = `${currentTeam}팀 차례`;
}

function showQuestion(category, q) {
  categoryTagEl.textContent = category;
  categoryTagEl.className = `category-tag cat-${category}`;
  questionTextEl.textContent = q.question;
  answerTextEl.textContent = "";
  answerTextEl.classList.remove("visible");

  if (q.answer) {
    revealBtn.style.display = "inline-block";
    revealBtn.onclick = () => {
      answerTextEl.textContent = `정답: ${q.answer}`;
      answerTextEl.classList.add("visible");
    };
  } else {
    revealBtn.style.display = "none";
  }

  questionPanelEl.classList.add("visible");
}

function showMessage(category, message) {
  categoryTagEl.textContent = category;
  categoryTagEl.className = `category-tag cat-${category}`;
  questionTextEl.textContent = message;
  answerTextEl.textContent = "";
  answerTextEl.classList.remove("visible");
  revealBtn.style.display = "none";
  questionPanelEl.classList.add("visible");
}

function hideQuestionPanel() {
  questionPanelEl.classList.remove("visible");
}

renderBoard();
