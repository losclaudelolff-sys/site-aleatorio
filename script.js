"use strict";

const content = document.querySelector("#content");
const confetti = document.querySelector("#confetti");
const initialPanel = content.firstElementChild.cloneNode(true);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let changing = false;
let cleanupTimer;

function clearConfetti() {
  window.clearTimeout(cleanupTimer);
  confetti.replaceChildren();
}

// Confetes leves e temporários, sem biblioteca e sem interceptar os toques.
function celebrate() {
  clearConfetti();
  if (reducedMotion.matches) return;
  const colors = ["#c66c80", "#e7bb65", "#91a780", "#e9a494", "#c4afd5"];
  const pieces = document.createDocumentFragment();
  for (let i = 0; i < 42; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--delay", `${Math.random() * 450}ms`);
    piece.style.setProperty("--duration", `${1800 + Math.random() * 1000}ms`);
    piece.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
    pieces.append(piece);
  }
  confetti.append(pieces);
  cleanupTimer = window.setTimeout(clearConfetti, 3400);
}

async function fade(keyframes, duration) {
  if (reducedMotion.matches || !content.animate) return;
  const animation = content.animate(keyframes, { duration, easing: "ease-out", fill: "both" });
  try {
    await animation.finished;
  } catch {
    // O conteúdo continua acessível se uma animação for interrompida.
  } finally {
    animation.cancel();
  }
}

// Um único listener atende também aos botões inseridos após a transição.
content.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button || changing) return;
  const answer = button.dataset.answer;
  const isBack = button.hasAttribute("data-back");
  if (!isBack && answer !== "happy" && answer !== "sad") return;

  changing = true;
  clearConfetti();
  await fade([{ opacity: 1 }, { opacity: 0 }], answer === "sad" ? 220 : 150);
  const next = isBack
    ? initialPanel.cloneNode(true)
    : document.querySelector(`#${answer}-template`).content.cloneNode(true);
  content.replaceChildren(next);
  // Leva a leitura por teclado e leitor de tela ao início da nova mensagem.
  content.querySelector("h1").focus({ preventScroll: true });
  if (answer === "happy") celebrate();
  await fade([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], answer === "sad" ? 340 : 230);
  changing = false;
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) clearConfetti();
});
