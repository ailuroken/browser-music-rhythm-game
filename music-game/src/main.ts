import "./style.scss";

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "b") {
    updateStartLabelForKeyboard();
  }

  activateKey(key);
});

function updateStartLabelForKeyboard() {
  const label = document.getElementById("start-label");
  if (label) {
    label.textContent = "B";
    setTimeout(() => {
      label.textContent = "Start";
    }, 1000);
  }
}

document.querySelectorAll(".game__key").forEach((keyEl) => {
  keyEl.addEventListener("touchstart", handleKeyTap, { passive: true });
  keyEl.addEventListener("click", handleKeyTap);
});

function handleKeyTap(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const key = target.getAttribute("data-key");

  if (!key) return;

  activateKey(key);
}

function activateKey(key: string) {
  const matchingKeyEl = document.querySelector(`.game__key[data-key="${key}"]`);

  if (matchingKeyEl) {
    matchingKeyEl.classList.add("game__key--active");

    setTimeout(() => {
      matchingKeyEl.classList.remove("game__key--active");
    }, 150);
  }
}
