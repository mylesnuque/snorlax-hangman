"use strict";

// This object models one complete game, including the word, guesses, and results.
class HangmanGame {
  constructor(words, maximumMistakes = 6) {
    this.words = words;
    this.maximumMistakes = maximumMistakes;
    this.round = 0;
    this.previousWord = null;
    this.startNewRound();
  }

  startNewRound() {
    const alternatives = this.words.filter(item => item.word !== this.previousWord);
    const choices = alternatives.length ? alternatives : this.words;
    const selection = choices[Math.floor(Math.random() * choices.length)];
    this.word = selection.word.toUpperCase();
    this.hint = selection.hint;
    this.previousWord = this.word;
    this.guessedLetters = new Set();
    this.incorrectGuesses = 0;
    this.gameOver = false;
    this.won = false;
    this.round += 1;
  }

  guess(letter) {
    const normalized = String(letter).trim().toUpperCase();
    if (this.gameOver) return { accepted: false, message: "Game over! Choose Play Again." };
    if (!/^[A-Z]$/.test(normalized)) return { accepted: false, message: "Please enter one letter from A to Z." };
    if (this.guessedLetters.has(normalized)) return { accepted: false, message: `You already guessed ${normalized}.` };

    this.guessedLetters.add(normalized);
    const correct = this.word.includes(normalized);
    if (!correct) this.incorrectGuesses += 1;

    this.won = [...this.word].every(character => this.guessedLetters.has(character));
    this.gameOver = this.won || this.incorrectGuesses >= this.maximumMistakes;
    return { accepted: true, correct, letter: normalized, message: correct ? `Nice! ${normalized} is in the word.` : `No ${normalized} this time!` };
  }
}

const elements = {
  hint: document.querySelector("#hint-text"),
  word: document.querySelector("#word-display"),
  progress: document.querySelector("#word-progress"),
  keyboard: document.querySelector("#keyboard"),
  form: document.querySelector("#guess-form"),
  input: document.querySelector("#letter-input"),
  guessButton: document.querySelector("#guess-button"),
  used: document.querySelector("#used-count"),
  round: document.querySelector("#round-label"),
  mistakes: document.querySelector("#mistake-count"),
  bars: document.querySelector("#mistake-bars"),
  alarm: document.querySelector("#alarm-scene"),
  progressImage: document.querySelector("#progress-snorlax"),
  pictureStage: document.querySelector("#picture-stage"),
  status: document.querySelector("#sleep-status"),
  encouragement: document.querySelector("#encouragement"),
  feedback: document.querySelector("#feedback"),
  result: document.querySelector("#result-panel"),
  resultIcon: document.querySelector("#result-icon"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  playAgain: document.querySelector("#play-again"),
  restart: document.querySelector("#restart-button"),
  hero: document.querySelector("#hero-snorlax"),
  bubble: document.querySelector("#sleep-bubble")
};

let game = null;

function animateElement(element, keyframes, options = {}) {
  // Web Animations API: required JavaScript-powered animation.
  if (typeof element.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.animate(keyframes, { duration: 360, easing: "ease-out", ...options });
  }
}

function createKeyboard() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const letter of alphabet) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-button";
    button.textContent = letter;
    button.dataset.letter = letter;
    button.setAttribute("aria-label", `Guess ${letter}`);
    button.addEventListener("click", () => submitGuess(letter));
    elements.keyboard.appendChild(button);
  }
}

function renderWord() {
  elements.word.replaceChildren();
  for (const character of game.word) {
    const tile = document.createElement("span");
    const revealed = game.guessedLetters.has(character) || (game.gameOver && !game.won);
    tile.className = `word-tile${revealed ? " revealed" : ""}${game.gameOver && !game.won && !game.guessedLetters.has(character) ? " missed" : ""}`;
    tile.textContent = revealed ? character : "";
    tile.setAttribute("aria-label", revealed ? character : "Unrevealed letter");
    elements.word.appendChild(tile);
  }
  const guessedCorrect = [...game.word].filter(letter => game.guessedLetters.has(letter)).length;
  elements.progress.textContent = game.gameOver ? "" : `${guessedCorrect} of ${game.word.length} letters revealed`;
}

function renderKeyboard() {
  elements.keyboard.querySelectorAll("button").forEach(button => {
    const letter = button.dataset.letter;
    const alreadyGuessed = game.guessedLetters.has(letter);
    button.disabled = alreadyGuessed || game.gameOver;
    button.classList.toggle("correct", alreadyGuessed && game.word.includes(letter));
    button.classList.toggle("incorrect", alreadyGuessed && !game.word.includes(letter));
  });
  elements.input.disabled = game.gameOver;
  elements.guessButton.disabled = game.gameOver;
  elements.used.textContent = `${game.guessedLetters.size} / 26 USED`;
}

// The exact order supplied by the user.
// Show the first sleeping Snorlax image as the starting preview,
// then use the same six images in order for wrong guesses 1 through 6.
const snorlaxStages = [
  { src: "images/stage1.gif", alt: "Animated line drawing of Snorlax asleep", caption: "STARTING IMAGE · 0 / 6" },
  { src: "images/stage1.gif", alt: "Animated line drawing of Snorlax asleep", caption: "STAGE 1 · SOUND ASLEEP" },
  { src: "images/stage2.jpg", alt: "Snorlax napping beside a forest pond with a bird", caption: "STAGE 2 · FOREST NAP" },
  { src: "images/stage3.jpg", alt: "Snorlax sleeping on a wooden dock", caption: "STAGE 3 · STILL NAPPING" },
  { src: "images/stage4.jpg", alt: "Snorlax lounging in a painted woodland scene", caption: "STAGE 4 · STARTING TO STIR" },
  { src: "images/stage5.jpg", alt: "Snorlax yawning in front of a town building", caption: "STAGE 5 · ALMOST AWAKE" },
  { src: "images/stage6.jpg", alt: "Snorlax roaring amid electric golden sparks", caption: "LAST STAGE · AWAKE!" }
];

function renderAlarm() {
  const count = game.incorrectGuesses;
  const stage = snorlaxStages[count];
  if (elements.progressImage.getAttribute("src") !== stage.src) {
    elements.progressImage.src = stage.src;
    animateElement(elements.progressImage, [
      { opacity: 0, transform: "scale(.94)" },
      { opacity: 1, transform: "scale(1)" }
    ], { duration: 420 });
  }
  elements.progressImage.alt = stage.alt;
  elements.pictureStage.textContent = stage.caption;
  elements.bars.querySelectorAll("span").forEach((bar, index) => {
    bar.classList.toggle("filled", index < count);
  });
  elements.alarm.setAttribute("aria-label", `Snorlax picture, ${count} of ${game.maximumMistakes} mistakes`);
  elements.bars.setAttribute("aria-label", `${count} of ${game.maximumMistakes} mistakes`);
  elements.mistakes.textContent = `${count} / ${game.maximumMistakes} mistakes`;
  const messages = [
    "Snorlax is sleeping peacefully. Guess a letter!",
    "First wrong guess! Snorlax keeps dreaming.",
    "Snorlax is beginning to stir. Keep trying!",
    "Halfway through your chances. You can do it!",
    "Snorlax is waking up. Choose carefully!",
    "One more wrong guess and the round is over!",
    "Six incorrect guesses. Try a new round!"
  ];
  elements.encouragement.textContent = messages[count];
  elements.status.textContent = count >= 6 ? "AWAKE!" : count >= 4 ? "STIRRING..." : count >= 2 ? "SLEEPY..." : "FAST ASLEEP";
  elements.status.classList.toggle("warning", count >= 4);
  elements.hero.src = count >= 6 ? "images/stage6.jpg" : "images/stage1.gif";
  elements.bubble.hidden = count >= 6;
}

function renderResult() {
  elements.result.hidden = !game.gameOver;
  if (!game.gameOver) return;
  elements.result.classList.toggle("loss", !game.won);
  elements.resultIcon.textContent = game.won ? "★" : "☾";
  elements.resultTitle.textContent = game.won ? "You won! Sweet dreams!" : "You lost! Snorlax woke up!";
  elements.resultDescription.textContent = game.won
    ? `Amazing! You guessed ${game.word} with ${game.incorrectGuesses} incorrect ${game.incorrectGuesses === 1 ? "guess" : "guesses"}.`
    : `The secret word was ${game.word}. Give it another try!`;
  elements.feedback.textContent = game.won ? "A perfect time for a nap." : "Every trainer gets another chance.";
  animateElement(elements.result, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 450 });
}

function renderGame() {
  elements.hint.textContent = game.hint;
  elements.round.textContent = `ROUND ${String(game.round).padStart(2, "0")}`;
  renderWord();
  renderKeyboard();
  renderAlarm();
  renderResult();
}

function submitGuess(letter) {
  if (!game) return;
  const outcome = game.guess(letter);
  elements.feedback.textContent = outcome.message;
  elements.input.value = "";
  if (!outcome.accepted) {
    animateElement(elements.input, [{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 230 });
    return;
  }
  renderGame();
  if (!game.gameOver) elements.feedback.textContent = outcome.message;
  if (outcome.correct) {
    animateElement(elements.word, [{ transform: "scale(.98)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }]);
  }
  if (!game.gameOver) elements.input.focus({ preventScroll: true });
}

function startAgain() {
  if (!game) return;
  game.startNewRound();
  elements.result.hidden = true;
  elements.feedback.textContent = "New word, new nap. Good luck!";
  elements.input.value = "";
  renderGame();
  animateElement(elements.word, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }]);
  elements.input.focus({ preventScroll: true });
}

async function initializeGame() {
  createKeyboard();
  elements.form.addEventListener("submit", event => {
    event.preventDefault();
    submitGuess(elements.input.value);
  });
  elements.playAgain.addEventListener("click", startAgain);
  elements.restart.addEventListener("click", startAgain);
  document.addEventListener("keydown", event => {
    if (!game || game.gameOver || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (/^[a-z]$/i.test(event.key) && event.target !== elements.input && !["BUTTON", "TEXTAREA"].includes(event.target.tagName)) {
      submitGuess(event.key);
    }
  });

  try {
    const response = await fetch("data/words.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const words = await response.json();
    if (!Array.isArray(words) || !words.length || !words.every(entry => /^[A-Za-z]+$/.test(entry.word) && typeof entry.hint === "string" && entry.hint.trim())) {
      throw new Error("Invalid word list format");
    }
    game = new HangmanGame(words);
    renderGame();
    elements.feedback.textContent = "Pick a letter to begin.";
  } catch (error) {
    console.error("Could not load the word list:", error);
    elements.hint.textContent = "Couldn't load the words. Start this project using an HTTP server.";
    elements.feedback.textContent = "Try: python -m http.server 8000, then visit localhost:8000.";
    elements.guessButton.disabled = true;
    elements.input.disabled = true;
    elements.keyboard.querySelectorAll("button").forEach(button => { button.disabled = true; });
    elements.restart.disabled = true;
  }
}

initializeGame();
