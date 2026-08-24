const startBtn = document.getElementById("start-btn");
const startMessage = document.getElementById("start-message");

const messages = [
  "주사위를 굴려보세요! 🎲",
  "첫 번째 팀부터 시작합니다!",
  "행운을 빌어요, 국어왕이 되어보세요!",
];

startBtn.addEventListener("click", () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  startMessage.textContent = message;
});
