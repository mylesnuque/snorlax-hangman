# Snorlax Hangman — COMP2132 Project

A browser Hangman game themed around Snorlax. Guess a hidden Pokémon word using the on-screen A–Z keyboard, by typing in the letter box, or with your physical keyboard. Each wrong guess changes the Snorlax picture, ending with the glowing Snorlax picture after six incorrect guesses. Win by uncovering every letter or lose after six incorrect guesses.

## Run the game

**Use an HTTP server.** Opening `index.html` directly with `file://` will prevent `fetch()` from loading `data/words.json` in most browsers.

1. Open a terminal **inside** the `snorlax-hangman` folder.
2. Run `python -m http.server 8000` (or use the VS Code Live Server extension).
3. Visit `http://localhost:8000` in a browser.

## Folder structure

```text
snorlax-hangman/
├── index.html
├── css/style.css
├── scss/style.scss
├── js/game.js
├── data/words.json
├── images/snorlax1.webp
├── images/snorlax2.webp
├── images/snorlax3.webp
├── images/snorlax4.webp
├── images/snorlax5.webp
├── images/snorlax6.png
├── images/stage1.gif (first incorrect guess)
├── images/stage2.jpg (second)
├── images/stage3.jpg (third)
├── images/stage4.jpg (fourth)
├── images/stage5.jpg (fifth)
├── images/stage6.jpg (sixth / loss)
├── images/snorlax6.gif
└── README.md
```

## Checklist against requirements

- Random word and hint from **20 Pokémon-themed entries** in `data/words.json`.
- JavaScript `fetch()` over HTTP; error state when JSON cannot load.
- Single-letter guesses through an input field, clickable keyboard, or keyboard keys.
- Correct guesses reveal all matching positions.
- The six **Snorlax picture stages** use the latest six uploaded pictures in the exact order provided, one per incorrect guess. Before the first wrong guess, a neutral Snorlax mascot is shown.
- Used letters are disabled (both correct and incorrect); duplicate attempts are rejected.
- Win/loss screens, secret word on loss, and **Play Again** action.
- All guessing inputs are disabled on game over; replay fully resets the board.
- Custom `HangmanGame` JavaScript object/class and multiple custom functions.
- JavaScript animation via the Web Animations API (`Element.animate()`).
- SCSS source with a reusable `@mixin panel-surface`; matching compiled CSS included.
- **Six user-supplied stage images**, plus additional Snorlax artwork, all referenced with relative paths.
- Responsive desktop/mobile layout and accessible text feedback.

## Changing the word list

Edit `data/words.json`. Each entry needs `word` (letters A–Z only) and `hint` (text). Keep valid JSON syntax, with commas between objects and no trailing comma.

## Recompile SASS (optional)

After installing Dart Sass, run:

```bash
sass scss/style.scss css/style.css
```

Artwork is based on user-provided Pokémon/Snorlax images. Pokémon remains the property of its respective rights holders. Not an official Pokémon game.
