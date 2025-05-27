// ===== FlexMaster: Flexbox Challenge Game =====

// Levels data (20 levels)
const levels = [
  { title: "Level 1: Center the boxes", css: { display: "flex", justifyContent: "center" } },
  { title: "Level 2: Space between", css: { display: "flex", justifyContent: "space-between" } },
  { title: "Level 3: Align right", css: { display: "flex", justifyContent: "flex-end" } },
  { title: "Level 4: Column layout", css: { display: "flex", flexDirection: "column" } },
  { title: "Level 5: Align bottom", css: { display: "flex", alignItems: "flex-end", height: "150px" } },
  { title: "Level 6: Center column", css: { display: "flex", flexDirection: "column", alignItems: "center", height: "150px" } },
  { title: "Level 7: Space around", css: { display: "flex", justifyContent: "space-around" } },
  { title: "Level 8: Reverse row", css: { display: "flex", flexDirection: "row-reverse" } },
  { title: "Level 9: Reverse column", css: { display: "flex", flexDirection: "column-reverse" } },
  { title: "Level 10: Stretch vertically", css: { display: "flex", alignItems: "stretch", height: "150px" } },
  { title: "Level 11: Baseline align", css: { display: "flex", alignItems: "baseline" } },
  { title: "Level 12: Wrap items", css: { display: "flex", flexWrap: "wrap" } },
  { title: "Level 13: Wrap reverse", css: { display: "flex", flexWrap: "wrap-reverse" } },
  { title: "Level 14: Justify content center, align items center", css: { display: "flex", justifyContent: "center", alignItems: "center", height: "150px" } },
  { title: "Level 15: Justify content flex-start, align items flex-end", css: { display: "flex", justifyContent: "flex-start", alignItems: "flex-end", height: "150px" } },
  { title: "Level 16: Column wrap", css: { display: "flex", flexDirection: "column", flexWrap: "wrap", height: "150px" } },
  { title: "Level 17: Align content center", css: { display: "flex", flexWrap: "wrap", alignContent: "center", height: "150px" } },
  { title: "Level 18: Align content space-between", css: { display: "flex", flexWrap: "wrap", alignContent: "space-between", height: "150px" } },
  { title: "Level 19: Justify content space-evenly", css: { display: "flex", justifyContent: "space-evenly" } },
  { title: "Level 20: Align items center, justify content space-around", css: { display: "flex", alignItems: "center", justifyContent: "space-around", height: "150px" } },
];

// Elements
const targetLayout = document.getElementById("target-layout");
const userLayout = document.getElementById("user-layout");
const levelTitle = document.getElementById("level-title");
const levelTracker = document.getElementById("level-tracker");
const scoreDisplay = document.getElementById("score");
const applyBtn = document.getElementById("apply-btn");
const checkBtn = document.getElementById("check-btn");
const resetBtn = document.getElementById("reset-btn");
const themeToggle = document.getElementById("theme-toggle");
const confettiWrapper = document.getElementById("confetti-wrapper");
const winSound = document.getElementById("win-sound");
const failSound = document.getElementById("fail-sound");

let currentLevel = 0;
let score = 0;

// Initialize CodeMirror for CSS input
const cssInput = CodeMirror.fromTextArea(document.getElementById("css-input"), {
  mode: "css",
  theme: "dracula",
  lineNumbers: true,
  extraKeys: { "Ctrl-Space": "autocomplete" },
  hintOptions: { completeSingle: false },
});

// Load saved progress or start fresh
function loadProgress() {
  const savedLevel = localStorage.getItem("flexmaster-level");
  const savedScore = localStorage.getItem("flexmaster-score");

  if (savedLevel !== null) currentLevel = parseInt(savedLevel);
  if (savedScore !== null) score = parseInt(savedScore);
}

function saveProgress() {
  localStorage.setItem("flexmaster-level", currentLevel);
  localStorage.setItem("flexmaster-score", score);
}

function resetProgress() {
  localStorage.removeItem("flexmaster-level");
  localStorage.removeItem("flexmaster-score");
  currentLevel = 0;
  score = 0;
  loadLevel(currentLevel);
  updateScore();
  cssInput.setValue("");
  alert("Progress reset!");
}

// Render the target layout based on current level's CSS
function renderTargetLayout(level) {
  const cssProps = levels[level].css;

  // Clear inline styles first
  targetLayout.style.cssText = "";

  // Apply CSS properties from level
  for (const prop in cssProps) {
    // Convert camelCase to kebab-case for cssText
    let kebab = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
    targetLayout.style.setProperty(kebab, cssProps[prop]);
  }
}

// Update level info on screen
function updateLevelInfo() {
  levelTitle.textContent = levels[currentLevel].title;
  levelTracker.textContent = `Level ${currentLevel + 1} of ${levels.length}`;
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// Load a level
function loadLevel(level) {
  if (level >= levels.length) {
    alert("🎉 Congratulations! You completed all levels!");
    currentLevel = 0;
    score = 0;
    saveProgress();
  }

  renderTargetLayout(level);
  updateLevelInfo();
  updateScore();

  // Reset user layout styles & css editor
  userLayout.style.cssText = "";
  cssInput.setValue("");
}

// Apply user CSS from CodeMirror to user layout div
function applyUserCSS() {
  const cssText = cssInput.getValue();

  try {
    // Reset previous styles
    userLayout.style.cssText = "";
    // Apply user CSS text to user layout
    userLayout.style.cssText = cssText;
  } catch (error) {
    alert("Invalid CSS syntax!");
  }
}

// Compare if two style objects are equal for target vs user
function stylesMatch(targetStyle, userStyle) {
  for (const prop in targetStyle) {
    if (targetStyle[prop] !== userStyle[prop]) return false;
  }
  return true;
}

// Get computed styles from an element for all needed CSS props of current level
function getComputedStylesForLevel(element, level) {
  const neededProps = Object.keys(levels[level].css);
  const styles = window.getComputedStyle(element);
  const result = {};

  neededProps.forEach((prop) => {
    // camelCase to kebab-case for computedStyle getPropertyValue
    const kebab = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
    let val = styles.getPropertyValue(kebab);

    // Trim to normalize (remove whitespace)
    result[prop] = val.trim();
  });
  return result;
}

// Check if user CSS matches target layout style
function checkAnswer() {
  const targetStyles = getComputedStylesForLevel(targetLayout, currentLevel);
  const userStyles = getComputedStylesForLevel(userLayout, currentLevel);

  if (stylesMatch(targetStyles, userStyles)) {
    // Correct!
    score++;
    updateScore();
    currentLevel++;
    saveProgress();
    showConfetti();
    winSound.play();
    alert("✅ Correct! Moving to next level.");
    loadLevel(currentLevel);
  } else {
    failSound.play();
    alert("❌ Not quite right, try again!");
  }
}

// Confetti effect
function showConfetti() {
  const colors = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#577590"];
  const count = 80;

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.animationDuration = 2 + Math.random() * 2 + "s";
    confetti.style.opacity = 1;
    confettiWrapper.appendChild(confetti);

    // Remove confetti after animation
    confetti.addEventListener("animationend", () => {
      confetti.remove();
    });
  }
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  if (document.body.classList.contains("dark-theme")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
}

// Initialize app
function init() {
  loadProgress();
  loadLevel(currentLevel);

  applyBtn.addEventListener("click", applyUserCSS);
  checkBtn.addEventListener("click", checkAnswer);
  resetBtn.addEventListener("click", resetProgress);
  themeToggle.addEventListener("click", toggleTheme);

  // Trigger autocomplete on typing in CodeMirror
  cssInput.on("inputRead", function (cm, change) {
    if (change.text[0].match(/[a-zA-Z-]/)) {
      cm.showHint();
    }
  });
}

// Run init on page load
window.addEventListener("DOMContentLoaded", init);
