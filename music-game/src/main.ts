import "./style.scss";

const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

const startLabel = document.getElementById("start-label");
const startKey = document.querySelector(".game__zone--start");
const tracks = document.querySelectorAll<HTMLDivElement>(".game__note--track");

interface Note {
  time: number;
  lane: number;
}

const notes: Note[] = [
  { time: 1000, lane: 0 },
  { time: 1500, lane: 1 },
  { time: 2000, lane: 2 },
  { time: 2500, lane: 3 },
  { time: 3000, lane: 4 },
];

const audio = new Audio("Shmoopie.mp3");
audio.volume = 0.1;

let isPaused = false;

const createNote = ({ lane }: Note) => {
  const noteEl = document.createElement("div");
  noteEl.classList.add("note");
  noteEl.style.animation = "fall 2s linear";
  tracks[lane]?.appendChild(noteEl);
};

const startGame = () => {
  audio.currentTime = 0;
  audio.play();
  notes.forEach((note) => setTimeout(() => createNote(note), note.time));
};

const togglePause = () => {
  isPaused = audio.paused;
  isPaused ? audio.play() : audio.pause();
};

const activateKey = (key: string) => {
  const keyEl = document.querySelector(`.game__zone[data-key="${key}"]`);
  keyEl?.classList.add("game__zone--active");
  setTimeout(() => keyEl?.classList.remove("game__zone--active"), 150);
};

const updateStartLabelForKeyboard = () => {
  if (!isMobile() && startLabel) {
    startLabel.textContent = "B";
    setTimeout(() => {
      startLabel!.textContent = "Start";
    }, 168000);
  }
  startGame();
};

document.addEventListener("keydown", ({ key }) => {
  const lowerKey = key;

  if (lowerKey === "b") updateStartLabelForKeyboard();
  if (lowerKey === "p") togglePause();

  activateKey(lowerKey);
});

document.querySelectorAll(".game__zone").forEach((el) => {
  el.addEventListener("touchstart", handleKeyTap, { passive: true });
  el.addEventListener("click", handleKeyTap);
});

function handleKeyTap(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const key = target.dataset.key;
  if (key) activateKey(key);
}

window.addEventListener("touchstart", startGame, { once: true });

startKey?.addEventListener("click", startGame);
