import "./style.scss";
import type { Note } from "./notes";
import { notes } from "./notes";

const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const startLabel = document.getElementById("start-label");
const startKey = document.querySelector(".game__zone--start");
const tracks = document.querySelectorAll<HTMLDivElement>(".game__note-track");
let inGame = false;
let isPaused = false;
let pauseStartTime = 0;
let gameStartTime = 0;
let totalPausedDuration = 0;
let animationFrameId: number;
const spawnedNotes = new Set<number>();
let startLabelTimeout: ReturnType<typeof setTimeout> | null = null;

const audio = new Audio("Shmoopie.mp3");
audio.volume = 0.1;

const startGame = async () => {
  if (!inGame || audio.paused) {
    isPaused = false;
    totalPausedDuration = 0;
    pauseStartTime = 0;

    document.querySelectorAll(".note").forEach((el) => el.remove());
    spawnedNotes.clear();

    audio.currentTime = 0;

    try {
      await audio.play();
      gameStartTime = performance.now();

      inGame = true;

      requestAnimationFrame(gameLoop);
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  }
};

const gameLoop = (currentTime: number) => {
  if (isPaused) return;

  const elapsed = currentTime - gameStartTime - totalPausedDuration;

  notes.forEach((note, index) => {
    if (!spawnedNotes.has(index) && elapsed >= note.time) {
      createNote(note);
      spawnedNotes.add(index);
    }
  });

  animationFrameId = requestAnimationFrame(gameLoop);
};

const createNote = ({ lane }: Note) => {
  const noteEl = document.createElement("div");
  noteEl.classList.add("note");

  void noteEl.offsetWidth;
  noteEl.style.animation = "fall 2s linear";
  noteEl.style.animationPlayState = isPaused ? "paused" : "running";

  tracks[lane]?.appendChild(noteEl);
};

const togglePause = () => {
  if (!isPaused) {
    isPaused = true;
    pauseStartTime = performance.now();
    audio.pause();
    cancelAnimationFrame(animationFrameId);

    document.querySelectorAll<HTMLElement>(".note").forEach((note) => {
      note.style.animationPlayState = "paused";
    });
  } else {
    isPaused = false;
    const now = performance.now();
    totalPausedDuration += now - pauseStartTime;

    audio.play();

    document.querySelectorAll<HTMLElement>(".note").forEach((note) => {
      note.style.animationPlayState = "running";
    });

    requestAnimationFrame(gameLoop);
  }
};

const activateKey = (key: string) => {
  const keyEl = document.querySelector(`.game__zone[data-key="${key}"]`);
  keyEl?.classList.add("game__zone--active");
  setTimeout(() => keyEl?.classList.remove("game__zone--active"), 150);
};

const updateStartLabelForKeyboard = () => {
  if (!isMobile() && startLabel) {
    startLabel.textContent = "B";

    if (startLabelTimeout) clearTimeout(startLabelTimeout);

    startLabelTimeout = setTimeout(() => {
      if (!inGame) startLabel!.textContent = "Start";
    }, 30000);
  } else if (isMobile() && startLabel) {
    startLabel.textContent = "";
  }
};

document.addEventListener("keydown", ({ key }) => {
  const lowerKey = key.toLowerCase();

  if (lowerKey === "b") {
    if (!inGame || isPaused || audio.paused) {
      startGame();
    }
    updateStartLabelForKeyboard();
  }

  if (lowerKey === "p") togglePause();

  activateKey(lowerKey);
});

const handleKeyTap = (e: Event) => {
  const target = e.currentTarget as HTMLElement;
  const key = target.dataset.key;
  if (key) activateKey(key);
};

const endGame = () => {
  inGame = false;

  if (startLabel) {
    startLabel.textContent = "Start";
  }
};

const pauseBtn = document.getElementById("pause-btn");

pauseBtn?.addEventListener("click", () => {
  togglePause();
});

document.querySelectorAll(".game__zone").forEach((el) => {
  el.addEventListener("touchstart", handleKeyTap, { passive: true });
  el.addEventListener("click", handleKeyTap);
});

window.addEventListener("touchstart", startGame, { once: true });

startKey?.addEventListener("click", startGame);

audio.addEventListener("ended", () => {
  endGame();
});
