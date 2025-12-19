// TrackMate - app.js (Coding_v4: stable + editable + progressive suggestions)
// Drop-in replacement for /js/app.js

// -------------------------
// Screen navigation helpers
// -------------------------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("screen--active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("screen--active");
}

// -------------------------
// Storage helpers
// -------------------------
const STORAGE_KEYS = {
  profile: "trackmateProfile",
  oneRM: "trackmateOneRM",
  workoutState: "trackmateWorkoutState",
  oneRMEquip: "trackmateOneRMEquip"
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Could not save ${key}`, e);
    return false;
  }
}

function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

// -------------------------
// Workout day display helpers
// -------------------------
function getDisplayDayNumber(dayIndex) {
  const dayNumbers = [1, 2, 3, 5, 6];
  return dayNumbers[dayIndex] ?? (dayIndex + 1);
}

// -------------------------
// Exercise descriptions (Info modal)
// -------------------------
const exerciseDescriptions = {
  "Wide-Grip Pull-Ups or Lat Pulldown": {
    muscles: "Lats, upper back, biceps",
    description:
      "Pull the elbows down and back while keeping the chest lifted. Maintain a controlled descent and avoid swinging."
  },
  "Bent-Over Barbell Rows": {
    muscles: "Lats, mid-back, posterior delts, forearms",
    description:
      "Hinge at the hips with a neutral spine and pull the bar toward the lower ribs. Drive elbows back and maintain torso stability."
  },
  "One-Arm DB Rows or Machine Row (Superset)": {
    muscles: "Lats, mid-back, rear delts, biceps",
    description:
      "Pull the dumbbell or machine handle toward the hip, keeping the torso stable. Focus on squeezing the back at the top."
  },
  "Straight-Arm Rope Pulldown": {
    muscles: "Lats, teres major, triceps (long head)",
    description:
      "Keep arms nearly straight and pull the rope down toward the thighs. Emphasise lat engagement by keeping chest tall."
  },
  "Rear Delt Cable Fly (Face Pull Style)": {
    muscles: "Rear delts, upper back, traps",
    description:
      "Pull the handles outward and slightly back at shoulder height. Lead with elbows and avoid shrugging."
  },
  "DB Hammer Curl + EZ-Bar Curl (Superset)": {
    muscles: "Biceps (brachialis, brachii), forearms",
    description:
      "Keep elbows tight and curl with control. Hammer curls target brachialis; EZ curls emphasise peak contraction."
  },
  "Side Plank Reach-Throughs": {
    muscles: "Obliques, core stabilisers, shoulders",
    description:
      "Hold a strong side plank and rotate under the body to reach through. Maintain a straight line from head to feet."
  }
};

// -------------------------
// Exercise library (equipment + alternatives + category browsing)
// -------------------------
const exerciseLibrary = {
  "Wide-Grip Pull-Ups or Lat Pulldown": {
    category: "Back",
    equipment: "MC",
    alternatives: ["Bent-Over Barbell Rows", "One-Arm DB Rows or Machine Row (Superset)", "Straight-Arm Rope Pulldown"]
  },
  "Bent-Over Barbell Rows": {
    category: "Back",
    equipment: "BB",
    alternatives: ["One-Arm DB Rows or Machine Row (Superset)", "Wide-Grip Pull-Ups or Lat Pulldown", "Straight-Arm Rope Pulldown"]
  },
  "One-Arm DB Rows or Machine Row (Superset)": {
    category: "Back",
    equipment: "DB",
    alternatives: ["Bent-Over Barbell Rows", "Wide-Grip Pull-Ups or Lat Pulldown", "Straight-Arm Rope Pulldown"]
  },
  "Straight-Arm Rope Pulldown": {
    category: "Back",
    equipment: "MC",
    alternatives: ["Wide-Grip Pull-Ups or Lat Pulldown", "Bent-Over Barbell Rows"]
  },
  "Rear Delt Cable Fly (Face Pull Style)": {
    category: "Shoulders",
    equipment: "MC",
    alternatives: ["Rear Delt Bent-Over Flys", "Side-Angle DB Lateral Raise"]
  },
  "Rear Delt Bent-Over Flys": {
    category: "Shoulders",
    equipment: "DB",
    alternatives: ["Rear Delt Cable Fly (Face Pull Style)", "Side-Angle DB Lateral Raise"]
  },
  "DB Hammer Curl + EZ-Bar Curl (Superset)": {
    category: "Arms",
    equipment: "DB",
    alternatives: ["Bicep Spider Curls + Rope Hammer Curls (Superset)"]
  },
  "Bicep Spider Curls + Rope Hammer Curls (Superset)": {
    category: "Arms",
    equipment: "DB",
    alternatives: ["DB Hammer Curl + EZ-Bar Curl (Superset)"]
  },
  "Overhead Triceps Extensions (Rope or DB)": {
    category: "Arms",
    equipment: "MC",
    alternatives: ["Triceps Rope Pushdowns + Dips (Superset)"]
  },
  "Triceps Rope Pushdowns + Dips (Superset)": {
    category: "Arms",
    equipment: "MC",
    alternatives: ["Overhead Triceps Extensions (Rope or DB)"]
  },
  "Side Plank Reach-Throughs": {
    category: "Core",
    equipment: "BW",
    alternatives: ["Russian Twists (Weighted)", "Knee Raises + In-and-Out Crunches"]
  },
  "Russian Twists (Weighted)": {
    category: "Core",
    equipment: "DB",
    alternatives: ["Side Plank Reach-Throughs", "Cable Woodchoppers or Weighted Decline Sit-Ups"]
  }
};

const exerciseCategories = {
  Back: ["Wide-Grip Pull-Ups or Lat Pulldown", "Bent-Over Barbell Rows", "One-Arm DB Rows or Machine Row (Superset)", "Straight-Arm Rope Pulldown"],
  Chest: ["Incline Barbell or Dumbbell Press", "Chest Press (Machine)", "Cable Fly (High to Low)", "Incline Chest Fly (DB)"],
  Shoulders: ["Rear Delt Cable Fly (Face Pull Style)", "Rear Delt Bent-Over Flys", "Side-Angle DB Lateral Raise", "Seated DB Shoulder Press or Military Press", "Front DB Raise or Barbell Raise"],
  Legs: ["Front Squats (BB or Goblet)", "Leg Press", "Romanian Deadlift (BB or DB)", "Walking Lunges (DB)", "Leg Extensions (Slow Tempo)"],
  Arms: ["DB Hammer Curl + EZ-Bar Curl (Superset)", "Bicep Spider Curls + Rope Hammer Curls (Superset)", "Triceps Rope Pushdowns + Dips (Superset)", "Overhead Triceps Extensions (Rope or DB)"],
  Core: ["Side Plank Reach-Throughs", "Russian Twists (Weighted)", "Cable Woodchoppers or Weighted Decline Sit-Ups", "Knee Raises + In-and-Out Crunches"]
};

// -------------------------
// BMI / Units helpers
// -------------------------
function calculateBMI(weight, height, units) {
  if (!weight || !height) return null;
  let kg;
  let metres;

  if (units === "imperial") {
    kg = weight * 0.453592;
    metres = height * 0.0254;
  } else {
    kg = weight;
    metres = height / 100;
  }
  if (!metres || metres <= 0) return null;
  return kg / (metres * metres);
}

// -------------------------
// 1RM + Working weight helpers
// -------------------------
function estimateOneRM(weightKg, reps) {
  const w = Number(weightKg);
  const r0 = Number(reps);
  if (!Number.isFinite(w) || w <= 0) return null;
  if (!Number.isFinite(r0) || r0 <= 0) return null;
  const r = Math.min(r0, 12);
  return w * (1 + r / 30);
}

function getPercentForReps(targetReps) {
  const r = parseInt(targetReps, 10);
  if (!Number.isFinite(r) || r <= 0) return null;
  if (r <= 5) return 0.85;
  if (r <= 6) return 0.80;
  if (r <= 8) return 0.75;
  if (r <= 10) return 0.70;
  if (r <= 12) return 0.65;
  return 0.60;
}

function roundToIncrement(value, increment) {
  if (!Number.isFinite(value)) return null;
  if (!Number.isFinite(increment) || increment <= 0) return value;
  return Math.round(value / increment) * increment;
}

function calcWorkingWeightKg(oneRMKg, targetReps, equipmentCode) {
  const oneRM = Number(oneRMKg);
  if (!Number.isFinite(oneRM) || oneRM <= 0) return null;
  const pct = getPercentForReps(targetReps);
  if (!pct) return null;

  const raw = oneRM * pct;
  const code = (equipmentCode || "").toUpperCase();
  const increment = (code === "BB" || code === "MC") ? 2.5 : 1;
  return roundToIncrement(raw, increment);
}

function getTargetRepsFromPrescription(prescription) {
  const p = (prescription || "").replace(/\s+/g, " ").trim();
  // Prefer range, then explicit x, then any number
  const range = p.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (range) {
    const a = parseInt(range[1], 10);
    const b = parseInt(range[2], 10);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.round((a + b) / 2);
  }
  const single = p.match(/[x×]\s*(\d{1,2})\b/);
  if (single) return parseInt(single[1], 10);

  const any = p.match(/\b(\d{1,2})\b/);
  if (any) return parseInt(any[1], 10);

  return null;
}

// Map key lifts to stored 1RM keys
const oneRMKeyMap = {
  "Bent-Over Barbell Rows": "row",
  "Incline Barbell or Dumbbell Press": "bench_press",
  "Front Squats (BB or Goblet)": "squat",
  "Romanian Deadlift (BB or DB)": "deadlift"
};

function isCoreOrBW(exName) {
  const n = (exName || "").toLowerCase();
  return (
    n.includes("plank") ||
    n.includes("reach-through") ||
    n.includes("knee raises") ||
    n.includes("crunch") ||
    n.includes("rollout") ||
    n.includes("hanging") ||
    n.includes("woodchopper") ||
    n.includes("twist")
  );
}

// Conservative caps for isolation/cable
function profileFallbackSuggestionKg(exName, profileWeightKg, equipmentCode) {
  if (isCoreOrBW(exName)) return "00";

  const n = (exName || "").toLowerCase();
  const hasProfile = Number.isFinite(profileWeightKg) && profileWeightKg > 0;

  let raw;

  if (hasProfile) {
    let factor = 0.45;

    if (n.includes("squat") || n.includes("deadlift") || n.includes("leg press") || n.includes("hip thrust") || n.includes("glute bridge")) {
      factor = 0.70;
    } else if (n.includes("press") || n.includes("row") || n.includes("pulldown") || n.includes("pull-up")) {
      factor = 0.50;
    }

    if (n.includes("rear delt") || n.includes("lateral raise") || n.includes("front raise") || n.includes("fly") ||
        n.includes("curl") || n.includes("triceps") || n.includes("extension") || n.includes("straight-arm")) {
      factor = 0.20;
    }

    raw = profileWeightKg * factor;
  } else {
    // Conservative defaults (kg) used when profile/1RM has been cleared.
    if (n.includes("rear delt") || n.includes("lateral raise") || n.includes("front raise")) raw = 6;
    else if (n.includes("fly")) raw = 10;
    else if (n.includes("curl")) raw = 12;
    else if (n.includes("triceps") || n.includes("extension")) raw = 15;
    else if (n.includes("straight-arm") || n.includes("rope pulldown")) raw = 20;
    else if (n.includes("pulldown") || n.includes("row") || n.includes("press")) raw = 30;
    else if (n.includes("leg press")) raw = 60;
    else if (n.includes("squat") || n.includes("deadlift")) raw = 40;
    else raw = 20;
  }

  // caps
  if (n.includes("rear delt") || n.includes("lateral raise") || n.includes("front raise")) raw = Math.min(raw, 12);
  if (n.includes("curl")) raw = Math.min(raw, 20);
  if (n.includes("triceps") || n.includes("extension")) raw = Math.min(raw, 25);
  if (n.includes("straight-arm") || n.includes("rope pulldown")) raw = Math.min(raw, 35);
  if (n.includes("fly")) raw = Math.min(raw, 30);

  const inc = (equipmentCode === "BB" || equipmentCode === "MC") ? 2.5 : 1;
  const rounded = roundToIncrement(raw, inc);
  return rounded ? String(rounded) : "";
}

function getOneRMBasedSuggestion(exName, targetReps, equipmentCode) {
  if (isCoreOrBW(exName)) return "00";
  const key = oneRMKeyMap[exName];
  if (!key) return "";
  const oneRMData = readJSON(STORAGE_KEYS.oneRM, {});
  const oneRM = oneRMData?.[key];
  if (!Number.isFinite(oneRM) || oneRM <= 0) return "";
  const suggested = calcWorkingWeightKg(oneRM, targetReps, equipmentCode);
  return suggested ? String(suggested) : "";
}

// -------------------------
// Progressive overload (week-to-week suggestion)
// -------------------------
function getIncrementForEquipment(equipmentCode) {
  const code = (equipmentCode || "MC").toUpperCase();
  if (code === "BB" || code === "MC") return 2.5;
  if (code === "DB" || code === "KB") return 1;
  return 0;
}

function meetsTargetReps(actualReps, targetReps) {
  const a = parseInt(actualReps, 10);
  const t = parseInt(targetReps, 10);
  if (!Number.isFinite(a) || !Number.isFinite(t) || t <= 0) return false;
  return a >= t;
}

// -------------------------
// Program data (Week 1 template; weeks cloned)
// -------------------------
const programWeek1 = [
  {
    id: "day1_pull",
    theme: "PULL",
    goal: "Back thickness, rear delts, biceps, core control",
    exercises: [
      { name: "Wide-Grip Pull-Ups or Lat Pulldown", prescription: "4 × 6–8", notes: "Weighted if possible" },
      { name: "Bent-Over Barbell Rows", prescription: "4 × 8" },
      { name: "One-Arm DB Rows or Machine Row (Superset)", prescription: "3 × 12", notes: "Superset variation" },
      { name: "Straight-Arm Rope Pulldown", prescription: "3 × 15", notes: "Time under tension" },
      { name: "Rear Delt Cable Fly (Face Pull Style)", prescription: "3 × 15–20" },
      { name: "DB Hammer Curl + EZ-Bar Curl (Superset)", prescription: "3 × 12 each" },
      { name: "Side Plank Reach-Throughs", prescription: "3 × 10/side", notes: "Core" }
    ]
  },
  {
    id: "day2_posterior",
    theme: "LOWER",
    goal: "Hamstring, glute, and lower back hypertrophy",
    exercises: [
      { name: "Leg Press", prescription: "4 × 10" },
      { name: "Romanian Deadlift (BB or DB)", prescription: "4 × 10" },
      { name: "Glute Bridges or Hip Thrusts (Weighted)", prescription: "3 × 12" },
      { name: "Walking Lunges (DB)", prescription: "3 × 16 steps" },
      { name: "Seated Leg Curl or Nordic Curl", prescription: "3 × 12" },
      { name: "Reverse Hyperextension or Back Extensions", prescription: "3 × 15" },
      { name: "Ab Rollouts or Hanging Leg Raises", prescription: "3 × 10–12", notes: "Core" }
    ]
  },
  {
    id: "day3_push",
    theme: "PUSH",
    goal: "Chest, shoulder, and triceps strength & hypertrophy",
    exercises: [
      { name: "Incline Barbell or Dumbbell Press", prescription: "4 × 8–10" },
      { name: "Cable Fly (High to Low)", prescription: "3 × 15" },
      { name: "Seated DB Shoulder Press or Military Press", prescription: "4 × 10" },
      { name: "Side-Angle DB Lateral Raise", prescription: "3 × 15" },
      { name: "Overhead Triceps Extensions (Rope or DB)", prescription: "3 × 12" },
      { name: "Front DB Raise or Barbell Raise", prescription: "2 × 15" },
      { name: "Russian Twists (Weighted)", prescription: "3 × 20", notes: "10/side, core" }
    ]
  },
  {
    id: "day5_quad",
    theme: "LOWER",
    goal: "Quad hypertrophy and single-leg strength",
    exercises: [
      { name: "Front Squats (BB or Goblet)", prescription: "4 × 8" },
      { name: "Leg Press (Wide Stance)", prescription: "3 × 12" },
      { name: "Step-Ups or Bulgarian Split Squats (DB)", prescription: "3 × 10/leg" },
      { name: "Leg Extensions (Slow Tempo)", prescription: "3 × 15" },
      { name: "Thigh Abduction + Adduction (Superset)", prescription: "3 × 20 each" },
      { name: "Cable Woodchoppers or Weighted Decline Sit-Ups", prescription: "3 × 12", notes: "Core" }
    ]
  },
  {
    id: "day6_pump",
    theme: "PUMP",
    goal: "Isolation, blood flow, arm-pump day",
    exercises: [
      { name: "Chest Press (Machine)", prescription: "3 × 12" },
      { name: "DB Arnold Press + Lateral Raise (Superset)", prescription: "3 × 12 each" },
      { name: "Bicep Spider Curls + Rope Hammer Curls (Superset)", prescription: "3 × 12 each" },
      { name: "Triceps Rope Pushdowns + Dips (Superset)", prescription: "3 × 12 each" },
      { name: "Incline Chest Fly (DB)", prescription: "3 × 15" },
      { name: "Rear Delt Bent-Over Flys", prescription: "3 × 15–20" },
      { name: "Knee Raises + In-and-Out Crunches", prescription: "2 rounds", notes: "Core circuit" }
    ]
  }
];

const programByWeek = { 1: deepClone(programWeek1), 2: deepClone(programWeek1), 3: deepClone(programWeek1), 4: deepClone(programWeek1), 5: deepClone(programWeek1), 6: deepClone(programWeek1) };
function getProgramForWeek(weekNumber) {
  return programByWeek[weekNumber] || programByWeek[1];
}

// -------------------------
// Workout state persistence
// -------------------------
function getWorkoutState() {
  return readJSON(STORAGE_KEYS.workoutState, { weeks: {} });
}

function saveWorkoutState(state) {
  writeJSON(STORAGE_KEYS.workoutState, state);
}

function ensureDayState(state, week, dayIndex) {
  const wKey = String(week);
  const dKey = String(dayIndex);
  if (!state.weeks[wKey]) state.weeks[wKey] = {};
  if (!state.weeks[wKey][dKey]) state.weeks[wKey][dKey] = { completed: false, exercises: {} };
  return state.weeks[wKey][dKey];
}

function getSetState(state, week, dayIndex, exIndex, setIndex) {
  const dayState = ensureDayState(state, week, dayIndex);
  const exKey = String(exIndex);
  const sKey = String(setIndex);
  if (!dayState.exercises[exKey]) dayState.exercises[exKey] = { sets: {}, equipment: null };
  if (!dayState.exercises[exKey].sets[sKey]) dayState.exercises[exKey].sets[sKey] = { w: "", r: "" };
  return dayState.exercises[exKey].sets[sKey];
}


// ===============================
// RESET HELPERS
// ===============================
function resetDay(week, dayIndex) {
  const state = getWorkoutState();
  const wKey = String(week);
  const dKey = String(dayIndex);
  if (state.weeks?.[wKey]?.[dKey]) {
    delete state.weeks[wKey][dKey];
    if (Object.keys(state.weeks[wKey]).length === 0) state.weeks[wKey] = {};
    saveWorkoutState(state);
  }
}

function resetWeek(week) {
  const state = getWorkoutState();
  const wKey = String(week);
  if (state.weeks?.[wKey]) {
    delete state.weeks[wKey];
    saveWorkoutState(state);
  }
}


function getExerciseState(state, week, dayIndex, exIndex) {
  const dayState = ensureDayState(state, week, dayIndex);
  const exKey = String(exIndex);
  if (!dayState.exercises[exKey]) dayState.exercises[exKey] = { sets: {}, equipment: null };
  return dayState.exercises[exKey];
}

// -------------------------
// DOMContentLoaded - main
// -------------------------
document.addEventListener("DOMContentLoaded", () => {

  // Disclosure (dropdown) toggles
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tm-disclosure-toggle");
    if (!btn) return;

    const key = btn.getAttribute("data-disclosure");
    const panel = document.querySelector(`[data-disclosure-content="${key}"]`);
    if (!panel) return;

    const isOpen = !panel.hasAttribute("hidden");
    if (isOpen) {
      panel.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    } else {
      panel.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
    }
  });


  // Back buttons
  document.querySelectorAll(".link-back").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) showScreen(target);
    });
  });

  // Welcome
  document.getElementById("btn-welcome-setup")?.addEventListener("click", () => showScreen("screen-profile"));
  document.getElementById("btn-welcome-programs")?.addEventListener("click", () => showScreen("screen-programs"));
  document.getElementById("btn-welcome-continue")?.addEventListener("click", () => {
    closeWorkoutMenu();
    showScreen("screen-workout");
    renderWorkoutDay(0);
  });

  // Program selection
  document.getElementById("btn-program-sklar")?.addEventListener("click", () => showScreen("screen-start-choice"));

  // Start choice
  document.getElementById("btn-start-workouts")?.addEventListener("click", () => {
    closeWorkoutMenu();
    showScreen("screen-workout");
    renderWorkoutDay(0);
  });
  document.getElementById("btn-go-1rm")?.addEventListener("click", () => showScreen("screen-1rm"));

  // Profile
  const profileForm = document.getElementById("profile-form");
  const nameInput = document.getElementById("profile-name");
  const sexHidden = document.getElementById("profile-sex");
  const sexButtons = document.querySelectorAll("[data-sex-option]");
  const unitsHidden = document.getElementById("profile-units");
  const unitsButtons = document.querySelectorAll("[data-units-option]");
  const heightInput = document.getElementById("profile-height");
  const weightInput = document.getElementById("profile-weight");
  const ageInput = document.getElementById("profile-age");
  const bmiDisplay = document.getElementById("profile-bmi");
  const labelHeight = document.getElementById("label-height-unit");
  const labelWeight = document.getElementById("label-weight-unit");

  function updateUnitLabels() {
    const units = unitsHidden.value || "metric";
    if (units === "imperial") {
      labelHeight.textContent = "Height (in)";
      labelWeight.textContent = "Weight (lb)";
      heightInput.placeholder = "e.g. 69";
      weightInput.placeholder = "e.g. 154";
    } else {
      labelHeight.textContent = "Height (cm)";
      labelWeight.textContent = "Weight (kg)";
      heightInput.placeholder = "e.g. 175";
      weightInput.placeholder = "e.g. 70";
    }
  }

  function updateBMI() {
    const units = unitsHidden.value || "metric";
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    const bmi = calculateBMI(w, h, units);
    bmiDisplay.textContent = (bmi && Number.isFinite(bmi)) ? bmi.toFixed(1) : "—";
  }

  sexButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sexButtons.forEach((b) => b.classList.remove("segmented-option--active"));
      btn.classList.add("segmented-option--active");
      sexHidden.value = btn.dataset.sexOption;
    });
  });

  unitsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      unitsButtons.forEach((b) => b.classList.remove("segmented-option--active"));
      btn.classList.add("segmented-option--active");
      unitsHidden.value = btn.dataset.unitsOption;
      updateUnitLabels();
      updateBMI();
    });
  });

  heightInput?.addEventListener("input", updateBMI);
  weightInput?.addEventListener("input", updateBMI);
  updateUnitLabels();

  profileForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = {
      name: nameInput.value.trim(),
      sex: sexHidden.value || null,
      units: unitsHidden.value || "metric",
      height: parseFloat(heightInput.value) || null,
      weight: parseFloat(weightInput.value) || null,
      age: ageInput.value ? parseInt(ageInput.value, 10) : null,
      bmi: (bmiDisplay.textContent && bmiDisplay.textContent !== "—") ? parseFloat(bmiDisplay.textContent) : null
    };
    writeJSON(STORAGE_KEYS.profile, profile);
    showScreen("screen-start-choice");
  });

  // Week tabs
  const weekTabs = document.querySelectorAll(".week-tab");
  let currentWeek = 1;
  let currentDayIndex = 0;

  function setActiveWeekTab(week) {
    weekTabs.forEach((tab) => tab.classList.toggle("week-tab--active", parseInt(tab.dataset.week, 10) === week));
  }

  weekTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const w = parseInt(tab.dataset.week, 10);
      if (!Number.isNaN(w)) {
        currentWeek = w;
        setActiveWeekTab(w);
        renderWorkoutDay(currentDayIndex);
      }
    });
  });

  // Workout elements
  const workoutDaySelect = document.getElementById("workout-day-select");
  const workoutThemeBadge = document.getElementById("workout-theme-badge");
  const workoutGoal = document.getElementById("workout-goal");
  const workoutExerciseList = document.getElementById("workout-exercise-list");
  const workoutCompletedBadge = document.getElementById("workout-completed-badge");

  function getCurrentDayState() {
    const state = getWorkoutState();
    return ensureDayState(state, currentWeek, currentDayIndex);
  }

  function isCurrentDayCompleted() {
    return !!getCurrentDayState()?.completed;
  }

  function syncWorkoutCompletionUI() {
    const completed = isCurrentDayCompleted();

    // Visual overlay on cards
    workoutExerciseList?.classList.toggle("workout-day--completed", completed);
    if (workoutExerciseList) workoutExerciseList.dataset.completed = completed ? "true" : "false";

    // Completed pill: grey when incomplete, teal when complete
    if (workoutCompletedBadge) {
      workoutCompletedBadge.classList.toggle("is-complete", completed);
      workoutCompletedBadge.classList.toggle("is-incomplete", !completed);
    }

    // Bottom button label + style
    const completeBtn = document.querySelector(".workout-complete");
    if (completeBtn) {
      if (completed) {
         completeBtn.textContent = "Edit Completed Workout";
         completeBtn.classList.remove("btn-teal");
         completeBtn.classList.add("btn-danger-pill");
      } else {
        completeBtn.textContent = "Complete Workout";
        completeBtn.classList.remove("btn-danger-pill");
        completeBtn.classList.add("btn-teal");
      }
    }
  }

  const summaryVolumeEl = document.getElementById("summary-volume");
  const summaryRepsEl = document.getElementById("summary-reps");
  const summaryProgressEl = document.getElementById("summary-progress");

  // Set editor overlay
  const setEditOverlay = document.getElementById("set-edit-overlay");
  const setEditExercise = document.getElementById("set-edit-exercise");
  const setEditWeight = document.getElementById("set-edit-weight");
  const setEditReps = document.getElementById("set-edit-reps");
  const setEditCancel = document.getElementById("set-edit-cancel");
  const setEditSave = document.getElementById("set-edit-save");

  let currentEditWeightPill = null;
  let currentEditRepsPill = null;
  let currentEditContext = null;

  function openSetEditor(exerciseName, weightPill, repsPill, context) {
    if (isCurrentDayCompleted()) {
      alert("This workout is marked as completed. Tap 'Edit Completed Workout' to make changes.");
      return;
    }
    currentEditWeightPill = weightPill;
    currentEditRepsPill = repsPill;
    currentEditContext = context;

    setEditExercise.textContent = exerciseName;
    setEditWeight.value = weightPill.dataset.value || "";
    setEditReps.value = repsPill.dataset.value || "";

    setEditOverlay.classList.add("set-edit-overlay--active");
  }

  function closeSetEditor() {
    currentEditWeightPill = null;
    currentEditRepsPill = null;
    currentEditContext = null;
    setEditOverlay.classList.remove("set-edit-overlay--active");
  }

  setEditCancel?.addEventListener("click", closeSetEditor);
  setEditOverlay?.addEventListener("click", (e) => { if (e.target === setEditOverlay) closeSetEditor(); });

  // Info modal
  const infoOverlay = document.getElementById("exercise-info-overlay");
  const infoName = document.getElementById("exercise-info-name");
  const infoMuscles = document.getElementById("exercise-info-muscles");
  const infoDesc = document.getElementById("exercise-info-description");
  const infoClose = document.getElementById("exercise-info-close");

  function openExerciseInfo(exercise) {
    const info = exerciseDescriptions[exercise.name] || {};
    infoName.textContent = exercise.name;
    if (info.muscles) {
      infoMuscles.textContent = `Muscles: ${info.muscles}`;
      infoMuscles.style.display = "block";
    } else {
      infoMuscles.textContent = "";
      infoMuscles.style.display = "none";
    }
    const meta = exerciseLibrary[exercise.name] || {};
    const category = meta.category || findCategoryForExercise(exercise.name);
    const equip = meta.equipment ? `Equipment: ${meta.equipment}` : "";
    const catLine = category ? `Category: ${category}` : "";
    const fallbackLines = [catLine, equip].filter(Boolean).join(" • ");
    const fallback = fallbackLines ? `${fallbackLines}.` : "";
    infoDesc.textContent = info.description || exercise.notes || fallback || "No additional description is available yet.";
    infoOverlay.classList.add("set-edit-overlay--active");
  }
  function closeExerciseInfo() { infoOverlay.classList.remove("set-edit-overlay--active"); }
  infoClose?.addEventListener("click", closeExerciseInfo);
  infoOverlay?.addEventListener("click", (e) => { if (e.target === infoOverlay) closeExerciseInfo(); });

  // Exercise edit modal
  const editOverlay = document.getElementById("exercise-edit-overlay");
  const editCurrent = document.getElementById("exercise-edit-current");
  const editSuggested = document.getElementById("exercise-edit-suggested");
  const editCategoryRow = document.getElementById("exercise-edit-category-row");
  const editCategoryList = document.getElementById("exercise-edit-category-list");
  const editClose = document.getElementById("exercise-edit-close");

  let editContext = null; // { dayRef, exRef, titleEl }

  function closeExerciseEdit() {
    editContext = null;
    editOverlay.classList.remove("set-edit-overlay--active");
  }
  editClose?.addEventListener("click", closeExerciseEdit);
  editOverlay?.addEventListener("click", (e) => { if (e.target === editOverlay) closeExerciseEdit(); });

  function applyExerciseSwap(newName) {
    if (!editContext) return;
    editContext.exRef.name = newName;
    editContext.titleEl.textContent = newName;
    closeExerciseEdit();
    renderWorkoutDay(currentDayIndex);
  }

  function renderCategoryList(categoryName) {
    editCategoryList.innerHTML = "";
    const list = exerciseCategories[categoryName] || [];
    if (!list.length) {
      const p = document.createElement("p");
      p.className = "exercise-edit-empty";
      p.textContent = "No exercises defined for this category yet.";
      editCategoryList.appendChild(p);
      return;
    }
    list.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "exercise-edit-option";
      btn.textContent = name;
      btn.addEventListener("click", () => applyExerciseSwap(name));
      editCategoryList.appendChild(btn);
    });
  }
  function findCategoryForExercise(exerciseName) {
    const meta = exerciseLibrary[exerciseName];
    if (meta?.category) return meta.category;

    for (const [cat, list] of Object.entries(exerciseCategories)) {
      if (Array.isArray(list) && list.includes(exerciseName)) return cat;
    }
    return null;
  }

  function buildAutoAlternatives(exerciseName, categoryName, limit = 8) {
    const list = exerciseCategories[categoryName] || [];
    return list.filter((n) => n !== exerciseName).slice(0, limit);
  }


  function openExerciseEdit(dayRef, exRef, titleEl) {
    if (isCurrentDayCompleted()) {
      alert("This workout is marked as completed. Tap 'Edit Completed Workout' to make changes.");
      return;
    }
    editContext = { dayRef, exRef, titleEl };

    editCurrent.textContent = exRef.name;
    editSuggested.innerHTML = "";
    editCategoryRow.innerHTML = "";
    editCategoryList.innerHTML = "";

    const meta = exerciseLibrary[exRef.name];
    const categoryName = findCategoryForExercise(exRef.name);
    const curatedAlternatives = meta?.alternatives || [];
    const alternatives = curatedAlternatives.length ? curatedAlternatives : (categoryName ? buildAutoAlternatives(exRef.name, categoryName, 8) : []);
    if (alternatives.length) {
      alternatives.forEach((name) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "exercise-edit-option";
        btn.textContent = name;
        btn.addEventListener("click", () => applyExerciseSwap(name));
        editSuggested.appendChild(btn);
      });
    } else {
      const p = document.createElement("p");
      p.className = "exercise-edit-empty";
      p.textContent = "No curated alternatives yet. Browse by category below.";
      editSuggested.appendChild(p);
    }

    Object.keys(exerciseCategories).forEach((catName) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "exercise-edit-category-pill";
      pill.textContent = catName;
      pill.addEventListener("click", () => {
        editCategoryRow.querySelectorAll(".exercise-edit-category-pill").forEach((p) => p.classList.remove("exercise-edit-category-pill--active"));
        pill.classList.add("exercise-edit-category-pill--active");
        renderCategoryList(catName);
      });
      editCategoryRow.appendChild(pill);
    });

    if (categoryName) {
      const pills = editCategoryRow.querySelectorAll(".exercise-edit-category-pill");
      pills.forEach((p) => {
        if (p.textContent === categoryName) {
          p.classList.add("exercise-edit-category-pill--active");
          renderCategoryList(categoryName);
        }
      });
    }

    editOverlay.classList.add("set-edit-overlay--active");
  }

  // Compute expected total sets: 4 per exercise (matches UI)
  function expectedTotalSetsForDay(day) {
    return (day?.exercises?.length || 0) * 4;
  }

  function updateWorkoutSummary(day) {
    const state = getWorkoutState();
    const dayState = ensureDayState(state, currentWeek, currentDayIndex);

    let totalVolume = 0;
    let totalReps = 0;
    let completedSets = 0;

    const exEntries = dayState.exercises || {};
    Object.keys(exEntries).forEach((exKey) => {
      const sets = exEntries[exKey]?.sets || {};
      Object.keys(sets).forEach((sKey) => {
        const wVal = parseFloat(sets[sKey]?.w);
        const rVal = parseFloat(sets[sKey]?.r);
        if (Number.isFinite(wVal) && wVal >= 0 && Number.isFinite(rVal) && rVal > 0) {
          // Count as completed only if reps provided and weight provided (weight can be 0 for core)
          completedSets += 1;
          totalVolume += wVal * rVal;
          totalReps += rVal;
        }
      });
    });

    const expected = expectedTotalSetsForDay(day);
    summaryVolumeEl.textContent = totalVolume > 0 ? `${totalVolume.toFixed(0)} kg` : "0 kg";
    summaryRepsEl.textContent = totalReps > 0 ? String(totalReps) : "0";
    summaryProgressEl.textContent = `${completedSets}/${expected}`;
  }

  // Save set edits
  setEditSave?.addEventListener("click", () => {
    if (!currentEditContext) { closeSetEditor(); return; }

    const wRaw = (setEditWeight.value || "").trim();
    const rRaw = (setEditReps.value || "").trim();

    const wSuggestion = currentEditWeightPill?.dataset?.suggestion || "";
    const rSuggestion = currentEditRepsPill?.dataset?.suggestion || "";

    // If user leaves fields blank, commit suggested values for a faster workflow
    const w = wRaw || wSuggestion || "";
    const r = rRaw || rSuggestion || "";
    // Update pills text (NO parentheses)
    currentEditWeightPill.dataset.value = w;
    currentEditRepsPill.dataset.value = r;

    if (w) {
      currentEditWeightPill.textContent = `${w} kg`;
      currentEditWeightPill.classList.remove("input-pill--suggested");
    } else if (wSuggestion) {
      currentEditWeightPill.textContent = `${wSuggestion} kg`;
      currentEditWeightPill.classList.add("input-pill--suggested");
    } else {
      currentEditWeightPill.textContent = "kg";
      currentEditWeightPill.classList.remove("input-pill--suggested");
    }

    if (r) {
      currentEditRepsPill.textContent = `${r} reps`;
      currentEditRepsPill.classList.remove("input-pill--suggested");
    } else if (rSuggestion) {
      currentEditRepsPill.textContent = `${rSuggestion} reps`;
      currentEditRepsPill.classList.add("input-pill--suggested");
    } else {
      currentEditRepsPill.textContent = "reps";
      currentEditRepsPill.classList.remove("input-pill--suggested");
    }

    // Persist
    const state = getWorkoutState();
    const { week, dayIndex, exIndex, setIndex } = currentEditContext;
    const setState = getSetState(state, week, dayIndex, exIndex, setIndex);
    setState.w = w;
    setState.r = r;
    saveWorkoutState(state);

    closeSetEditor();

    const day = getProgramForWeek(currentWeek)[currentDayIndex];
    updateWorkoutSummary(day);
  });

  // Equipment select enabled + highlighted default
  function buildEquipmentRow(card, defaultEquip, onChange) {
    const equipmentRow = document.createElement("div");
    equipmentRow.className = "equipment-pill-row";
    const options = ["DB", "BB", "KB", "BW", "MC"];

    options.forEach((code) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "equipment-pill";
      pill.textContent = code;
      pill.dataset.equipmentCode = code;
      if (code === defaultEquip) {
        pill.classList.add("equipment-pill--active");
        card.dataset.equipment = code;
      }

      pill.addEventListener("click", () => {
        // Allow change
        equipmentRow.querySelectorAll(".equipment-pill").forEach((p) => p.classList.remove("equipment-pill--active"));
        pill.classList.add("equipment-pill--active");
        card.dataset.equipment = code;
        onChange?.(code);
      });

      equipmentRow.appendChild(pill);
    });

    return equipmentRow;
  }


  function refreshCardSuggestions(card, ex, exIndex, dayIndex, equipCode) {
    // Recompute suggestions for this exercise card when equipment changes.
    const profile = readJSON(STORAGE_KEYS.profile, null);
    const profileWeightKg = profile?.units === "imperial"
      ? (Number(profile.weight) * 0.453592)
      : Number(profile?.weight);

    const targetReps = getTargetRepsFromPrescription(ex.prescription) || 8;
    const oneRMBase = getOneRMBasedSuggestion(ex.name, targetReps, equipCode);
    const baseSuggestion = oneRMBase || profileFallbackSuggestionKg(ex.name, profileWeightKg, equipCode);

    const stPrev = getWorkoutState(); // for progression lookup
    const prevDayState = currentWeek > 1 ? ensureDayState(stPrev, currentWeek - 1, dayIndex) : null;

    const weightPills = card.querySelectorAll(".set-weight-pill");
    const repsPills = card.querySelectorAll(".set-reps-pill");

    for (let setIndex = 0; setIndex < 4; setIndex++) {
      const wPill = weightPills[setIndex];
      const rPill = repsPills[setIndex];
      if (!wPill || !rPill) continue;

      // Only update suggestions if user has not entered a value
      const hasUserW = (wPill.dataset.value || "") !== "";
      const hasUserR = (rPill.dataset.value || "") !== "";

      const suggestionR = String(targetReps);

      let suggestionW = "";
      if (isCoreOrBW(ex.name)) {
        suggestionW = "00";
      } else if (currentWeek > 1) {
        const prevSet = prevDayState?.exercises?.[String(exIndex)]?.sets?.[String(setIndex)];
        const prevW = prevSet?.w;
        const prevR = prevSet?.r;
        if (prevW && prevR && meetsTargetReps(prevR, targetReps)) {
          const inc = getIncrementForEquipment(equipCode);
          const wNum = parseFloat(prevW);
          if (Number.isFinite(wNum) && inc > 0) {
            const next = roundToIncrement(wNum + inc, inc);
            suggestionW = next ? String(next) : String(wNum);
          } else {
            suggestionW = String(prevW);
          }
        } else {
          suggestionW = baseSuggestion;
        }
      } else {
        suggestionW = baseSuggestion;
      }

      // Persist suggestions on the pill datasets
      wPill.dataset.suggestion = suggestionW;
      rPill.dataset.suggestion = suggestionR;

      if (!hasUserW) {
        if (suggestionW !== "") {
          wPill.textContent = `${suggestionW} kg`;
          wPill.classList.add("input-pill--suggested");
        } else {
          wPill.textContent = "kg";
          wPill.classList.remove("input-pill--suggested");
        }
      }

      if (!hasUserR) {
        rPill.textContent = `${suggestionR} reps`;
        rPill.classList.add("input-pill--suggested");
      }
    }
  }

  // Render workout day
  function renderWorkoutDay(dayIndex) {
    const program = getProgramForWeek(currentWeek);
    const day = program[dayIndex];
    if (!day) return;

    currentDayIndex = dayIndex;

    workoutThemeBadge.textContent = day.theme;
    workoutGoal.textContent = day.goal;

    // Ensure state structure exists
    const state = getWorkoutState();
    ensureDayState(state, currentWeek, dayIndex);
    saveWorkoutState(state);

    // Profile weight in kg
    const profile = readJSON(STORAGE_KEYS.profile, null);
    const profileWeightKg = profile?.units === "imperial"
      ? (Number(profile.weight) * 0.453592)
      : Number(profile?.weight);

    workoutExerciseList.innerHTML = "";

    day.exercises.forEach((ex, exIndex) => {
      const card = document.createElement("div");
      card.className = "exercise-card";

      // Header
      const header = document.createElement("div");
      header.className = "exercise-card-header";

      const topRow = document.createElement("div");
      topRow.className = "exercise-header-top-row";

      const meta = exerciseLibrary[ex.name];
      const defaultEquip = meta?.equipment || "MC";

      // Persisted equipment choice per week/day/exercise
      const exState = getExerciseState(state, currentWeek, dayIndex, exIndex);
      const selectedEquip = exState.equipment || defaultEquip;

      const title = document.createElement("p");
      title.className = "exercise-title";
      title.textContent = ex.name;

      const equipmentRow = buildEquipmentRow(card, selectedEquip, (code) => {
        // Save equipment choice and refresh suggestions in-place (do NOT re-render the whole day)
        exState.equipment = code;
        saveWorkoutState(state);
        refreshCardSuggestions(card, ex, exIndex, dayIndex, code);
      });

      const linksRow = document.createElement("div");
      linksRow.className = "exercise-header-links-row";

      const links = document.createElement("div");
      links.className = "exercise-header-links";

      const infoBtn = document.createElement("button");
      infoBtn.type = "button";
      infoBtn.textContent = "Info";
      infoBtn.addEventListener("click", () => openExerciseInfo(ex));

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openExerciseEdit(day, ex, title));

      links.appendChild(infoBtn);
      links.appendChild(editBtn);
      linksRow.appendChild(links);

      topRow.appendChild(equipmentRow);
      topRow.appendChild(linksRow);

      header.appendChild(topRow);
      header.appendChild(title);
      card.appendChild(header);

      if (ex.notes) {
        const note = document.createElement("p");
        note.className = "exercise-note";
        note.textContent = `Note: ${ex.notes}`;
        card.appendChild(note);
      }

      // Sets grid (4)
      const setsGrid = document.createElement("div");
      setsGrid.className = "sets-grid";

      const equipCode = card.dataset.equipment || defaultEquip;
      const targetReps = getTargetRepsFromPrescription(ex.prescription) || 8; // safe default

      // Base suggestion: 1RM if mapped, else profile fallback with caps
      const oneRMBase = getOneRMBasedSuggestion(ex.name, targetReps, equipCode);
      const baseSuggestion = oneRMBase || profileFallbackSuggestionKg(ex.name, profileWeightKg, equipCode);

      // Progressive overload: if week>1, use last week's logged weight when successful
      function progressedSuggestion(setIndex) {
        // Core/BW stays 00
        if (isCoreOrBW(ex.name)) return "00";

        const wNow = String(currentWeek);
        if (currentWeek <= 1) return baseSuggestion;

        const prevState = getWorkoutState();
        const prevDayState = ensureDayState(prevState, currentWeek - 1, dayIndex);
        const prevSet = prevDayState?.exercises?.[String(exIndex)]?.sets?.[String(setIndex)];

        const prevW = prevSet?.w;
        const prevR = prevSet?.r;

        if (prevW && prevR && meetsTargetReps(prevR, targetReps)) {
          const inc = getIncrementForEquipment(equipCode);
          const wNum = parseFloat(prevW);
          if (Number.isFinite(wNum) && inc > 0) {
            const next = roundToIncrement(wNum + inc, inc);
            return next ? String(next) : String(wNum);
          }
          return String(prevW);
        }

        // If no previous or didn't meet target, keep base suggestion
        return baseSuggestion;
      }

      for (let setIndex = 0; setIndex < 4; setIndex++) {
        const cell = document.createElement("div");
        cell.className = "set-cell";

        const label = document.createElement("div");
        label.className = "set-label";
        label.textContent = `Set ${setIndex + 1}:`;

        const fields = document.createElement("div");
        fields.className = "set-fields";

        const weightPill = document.createElement("button");
        weightPill.type = "button";
        weightPill.className = "input-pill input-pill--small set-weight-pill";

        const repsPill = document.createElement("button");
        repsPill.type = "button";
        repsPill.className = "input-pill input-pill--small set-reps-pill";

        // Load saved state
        const st = getWorkoutState();
        const saved = getSetState(st, currentWeek, dayIndex, exIndex, setIndex);

        const suggestionW = progressedSuggestion(setIndex) || (isCoreOrBW(ex.name) ? "00" : "");
        const suggestionR = String(targetReps);

        weightPill.dataset.suggestion = suggestionW;
        repsPill.dataset.suggestion = suggestionR;

        weightPill.dataset.value = saved.w || "";
        repsPill.dataset.value = saved.r || "";

        // Render weight pill (NO parentheses)
        if (saved.w !== "") {
          weightPill.textContent = `${saved.w} kg`;
          weightPill.classList.remove("input-pill--suggested");
        } else if (suggestionW !== "") {
          weightPill.textContent = `${suggestionW} kg`;
          weightPill.classList.add("input-pill--suggested");
        } else {
          weightPill.textContent = "kg";
          weightPill.classList.remove("input-pill--suggested");
        }

        // Render reps pill
        if (saved.r !== "") {
          repsPill.textContent = `${saved.r} reps`;
          repsPill.classList.remove("input-pill--suggested");
        } else if (suggestionR) {
          repsPill.textContent = `${suggestionR} reps`;
          repsPill.classList.add("input-pill--suggested");
        } else {
          repsPill.textContent = "reps";
          repsPill.classList.remove("input-pill--suggested");
        }

        const context = { week: currentWeek, dayIndex, exIndex, setIndex };

        weightPill.addEventListener("click", () => openSetEditor(ex.name, weightPill, repsPill, context));
        repsPill.addEventListener("click", () => openSetEditor(ex.name, weightPill, repsPill, context));

        fields.appendChild(weightPill);
        fields.appendChild(repsPill);

        cell.appendChild(label);
        cell.appendChild(fields);
        setsGrid.appendChild(cell);
      }

      card.appendChild(setsGrid);
      workoutExerciseList.appendChild(card);
    });

    updateWorkoutSummary(day);
    syncWorkoutCompletionUI();
  }

  window.renderWorkoutDay = renderWorkoutDay;

  
// Workout header action (top-right button): Reset current day (with confirmation)
const workoutHeaderActionBtn = document.querySelector(".workout-day-header .workout-reset-day");
if (workoutHeaderActionBtn) {
  workoutHeaderActionBtn.textContent = "Reset Day";
  workoutHeaderActionBtn.addEventListener("click", () => {
      const dayNumbers = [1, 2, 3, 5, 6];
      const dayNumber = getDisplayDayNumber(currentDayIndex);
      if (confirm(`Reset Week ${currentWeek}, Day ${dayNumber}? This will clear all logged sets for this day.`)) {
          resetDay(currentWeek, currentDayIndex);
          renderWorkoutDay(currentDayIndex);
      }
    });
}

workoutDaySelect?.addEventListener("change", () => {
    const idx = parseInt(workoutDaySelect.value, 10);
    if (!Number.isNaN(idx)) renderWorkoutDay(idx);
  });

  // 1RM inputs
  const oneRmCards = document.querySelectorAll(".one-rm-card");
  oneRmCards.forEach((card) => {
    const w = card.querySelector(".one-rm-weight");
    const r = card.querySelector(".one-rm-reps");
    const out = card.querySelector(".one-rm-result-value");
    function update() {
      const est = estimateOneRM(parseFloat(w.value), parseFloat(r.value));
      out.textContent = est ? est.toFixed(1) : "—";
    }
    w?.addEventListener("input", update);
    r?.addEventListener("input", update);
  });

  
  // 1RM equipment selector (persisted locally)
  const oneRMEquipMap = readJSON(STORAGE_KEYS.oneRMEquip, {});
  oneRmCards.forEach((card) => {
    const key = card.dataset.exercise;
    const row = card.querySelector(".one-rm-equip");
    if (!row) return;

    // Apply saved selection if present
    const saved = oneRMEquipMap[key];
    if (saved) {
      row.querySelectorAll(".equipment-pill").forEach((b) => b.classList.remove("equipment-pill--active"));
      const btn = row.querySelector(`.equipment-pill[data-equip="${saved}"]`);
      if (btn) btn.classList.add("equipment-pill--active");
    }

    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".equipment-pill");
      if (!btn) return;
      const code = btn.getAttribute("data-equip");
      if (!code) return;

      row.querySelectorAll(".equipment-pill").forEach((b) => b.classList.remove("equipment-pill--active"));
      btn.classList.add("equipment-pill--active");

      oneRMEquipMap[key] = code;
      writeJSON(STORAGE_KEYS.oneRMEquip, oneRMEquipMap);
    });
  });

// Save 1RMs
  document.getElementById("btn-1rm-save")?.addEventListener("click", () => {
    const data = {};
    let hasAny = false;

    oneRmCards.forEach((card) => {
      const key = card.dataset.exercise;
      const out = card.querySelector(".one-rm-result-value");
      const val = out && out.textContent !== "—" ? parseFloat(out.textContent) : null;
      data[key] = (val !== null && Number.isFinite(val)) ? val : null;
      if (data[key] !== null) hasAny = true;
    });

    writeJSON(STORAGE_KEYS.oneRM, data);

    if (!hasAny) {
      alert("Please enter at least one lift to save your 1 Rep Max values.");
      return;
    }
    closeWorkoutMenu();
    showScreen("screen-workout");
    renderWorkoutDay(0);
  });

  // Complete workout (toggle)
  // - If not completed: marks completed and applies grey overlay + "Completed" pill + button label change
  // - If already completed: unlocks editing for that day (sets completed=false)
  document.querySelector(".workout-complete")?.addEventListener("click", () => {
    const state = getWorkoutState();
    const dayState = ensureDayState(state, currentWeek, currentDayIndex);

    const dayNumber = getDisplayDayNumber(currentDayIndex);

    if (!dayState.completed) {
      dayState.completed = true;
      saveWorkoutState(state);
      alert(`Saved. Week ${currentWeek}, Day ${dayNumber} marked complete.`);
    } else {
      dayState.completed = false;
      saveWorkoutState(state);
      alert(`Editing enabled. Week ${currentWeek}, Day ${dayNumber} is now unlocked.`);
    }

    const day = getProgramForWeek(currentWeek)[currentDayIndex];
    updateWorkoutSummary(day);
    syncWorkoutCompletionUI();
  });

  // -------------------------
  // Hamburger menu
  // -------------------------
  const workoutMenu = document.getElementById("workout-menu");
  const menuButtons = document.querySelectorAll(".workout-menu-button");
  const menuClose = document.getElementById("workout-menu-close");
  const menuNav = workoutMenu?.querySelector(".workout-menu-nav");

  function openWorkoutMenu() { workoutMenu?.classList.add("workout-menu--open"); }
  function closeWorkoutMenu() { workoutMenu?.classList.remove("workout-menu--open"); }
  window.closeWorkoutMenu = closeWorkoutMenu;

  menuButtons.forEach((b) => b.addEventListener("click", openWorkoutMenu));
  menuClose?.addEventListener("click", closeWorkoutMenu);
  workoutMenu?.addEventListener("click", (e) => { if (e.target === workoutMenu) closeWorkoutMenu(); });

  // Ensure Settings is at bottom (if present). We do this by re-ordering nodes once.
  function moveSettingsToBottom() {
    if (!menuNav) return;
    const buttons = Array.from(menuNav.querySelectorAll(".workout-menu-link"));
    const settingsBtn = buttons.find((btn) => (btn.dataset.menuAction || "") === "settings");
    if (!settingsBtn) return;

    // Add divider if not present
    if (!menuNav.querySelector(".workout-menu-divider")) {
      const divider = document.createElement("div");
      divider.className = "workout-menu-divider";
      menuNav.appendChild(divider);
    } else {
      // Move existing divider to just before settings
      const divider = menuNav.querySelector(".workout-menu-divider");
      menuNav.appendChild(divider);
    }

    menuNav.appendChild(settingsBtn);
  }

  // Menu actions
  menuNav?.addEventListener("click", (e) => {
    const btn = e.target.closest(".workout-menu-link");
    if (!btn) return;
    const action = btn.dataset.menuAction;
    if (!action) return;

    if (action === "back-to-workout") {
      closeWorkoutMenu();
      showScreen("screen-workout");
    } else if (action === "profile") {
      closeWorkoutMenu();
      showScreen("screen-profile");
    } else if (action === "programs") {
      closeWorkoutMenu();
      showScreen("screen-programs");
    } else if (action === "settings") {
      closeWorkoutMenu();
      showScreen("screen-settings");
    } else if (action === "equipment-key") {
      closeWorkoutMenu();
      showScreen("screen-equipment-key");
    }
  });

  moveSettingsToBottom();


  // Settings screen actions
  document.querySelectorAll("[data-settings-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-settings-action");
      if (action === "edit-profile") {
        showScreen("screen-profile");
      } else if (action === "edit-program") {
        showScreen("screen-programs");
      } else if (action === "reset-week") {
        // Prefer dropdown selector if present; otherwise fall back to prompt
        const select = document.getElementById("settings-reset-week-select");
        let weekNum = select ? parseInt(select.value, 10) : NaN;
        if (!Number.isFinite(weekNum)) {
          const weekStr = prompt("Which week would you like to reset? Enter a number 1–6:", String(currentWeek));
          weekNum = parseInt(weekStr, 10);
        }
        if (!Number.isFinite(weekNum) || weekNum < 1 || weekNum > 6) return;

        if (confirm(`Reset Week ${weekNum}? This will clear logged sets and completion status for that week only.`)) {
          resetWeek(weekNum);
          showScreen("screen-workout");
          currentWeek = weekNum;
          setActiveWeekTab(weekNum);
          renderWorkoutDay(currentDayIndex);
        }
      } else if (action === "reset-all") {
        if (confirm("Reset all TrackMate data? This cannot be undone.")) {
          Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
          window.location.reload();
        }
      } else if (action === "units") {
        // Route to profile units for now
        showScreen("screen-profile");
      }
    });
  });

  // Initial render
  renderWorkoutDay(0);
});
