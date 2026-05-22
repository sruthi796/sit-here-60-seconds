/* ── CONFIG ── */
const TOTAL = 60;
const RARE_CHANCE = 0.01;

const CAT_IMAGES = [
  "https://cataas.com/cat?width=200&height=200&t=0",
  "https://cataas.com/cat?width=200&height=200&t=1",
  "https://cataas.com/cat?width=200&height=200&t=2",
  "https://cataas.com/cat?width=200&height=200&t=3",
  "https://cataas.com/cat?width=200&height=200&t=4",
  "https://cataas.com/cat?width=200&height=200&t=5",
  "https://cataas.com/cat?width=200&height=200&t=6",
  "https://cataas.com/cat?width=200&height=200&t=7",
  "https://cataas.com/cat?width=200&height=200&t=8",
  "https://cataas.com/cat?width=200&height=200&t=9",
  "https://cataas.com/cat/says/meow?width=200&height=200",
  "https://cataas.com/cat/gif?width=200&height=200",
  "https://cataas.com/cat?color=orange&width=200&height=200",
  "https://cataas.com/cat?color=white&width=200&height=200",
  "https://cataas.com/cat?width=200&height=200&t=13",
  "https://cataas.com/cat?width=200&height=200&t=14",
  "https://cataas.com/cat?width=200&height=200&t=15",
];

const CAPTIONS = [
  "bro actually stayed",
  "important event approaching",
  "me watching u wait",
  "why are we still here",
  "patience +5",
  "academic comeback tomorrow",
  "engineer detected",
  "bro committed",
  "u could've opened reels",
  "legend behavior",
  "cat believes in u",
  "history is being made",
  "wifi stronger than mental stability",
  "this could've been an email",
  "loading personality update",
  "u waiting like website owes money",
  "the algorithm fears u",
  "sitting is a personality trait",
  "ur focus is illegal",
  "60 seconds of pure character",
  "doing nothing at elite level",
  "npc behavior unlocked",
  "cat is taking notes",
  "dedication arc begins",
  "u might be built different",
  "timer has no idea who it's dealing with",
];

const MILESTONES = [
  { at: 45, text: "you're doing great", dramatic: false },
  { at: 30, text: "most people quit", dramatic: false },
  { at: 15, text: "final reward preparing", dramatic: false },
  { at: 5,  text: "history is being made", dramatic: true },
];

/* ── STATE ── */
let timeLeft = TOTAL;
let timerInterval = null;
let catInterval = null;
let activeCats = [];
let captionPool = shuffle([...CAPTIONS]);
let captionIndex = 0;
let isRare = Math.random() < RARE_CHANCE;
let milestonesFired = new Set();
let shownMilestone = false;
const circumference = 2 * Math.PI * 54;

/* ── ELEMENTS ── */
const timerEl    = document.getElementById("timer");
const ringEl     = document.getElementById("ring-progress");
const milestoneEl= document.getElementById("milestone-msg");
const catLayer   = document.getElementById("cat-layer");
const tabMsg     = document.getElementById("tab-msg");
const endingScreen = document.getElementById("ending-screen");
const endingCat  = document.getElementById("ending-cat");
const endingHL   = document.getElementById("ending-headline");
const endingSub  = document.getElementById("ending-sub");
const flashEl    = document.getElementById("flash-overlay");
const confCanvas = document.getElementById("confetti-canvas");

/* ── UTILITIES ── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function nextCaption() {
  if (captionIndex >= captionPool.length) {
    captionPool = shuffle([...CAPTIONS]);
    captionIndex = 0;
  }
  return captionPool[captionIndex++];
}

function randCatUrl() {
  const pool = shuffle([...CAT_IMAGES]);
  return pool[0];
}

/* ── RING ── */
function updateRing(secondsLeft) {
  const ratio = secondsLeft / TOTAL;
  const offset = circumference * (1 - ratio);
  ringEl.style.strokeDasharray = circumference;
  ringEl.style.strokeDashoffset = offset;
  if (secondsLeft <= 10) {
    ringEl.classList.add("urgent-ring");
    timerEl.classList.add("urgent");
  }
}

/* ── CATS ── */
function spawnCat() {
  const el = document.createElement("div");
  el.className = "cat-card";

  const img = document.createElement("img");
  img.className = "cat-img";
  img.src = randCatUrl();
  img.alt = "meme cat";
  img.loading = "lazy";

  const cap = document.createElement("span");
  cap.className = "cat-caption";
  cap.textContent = nextCaption();

  el.appendChild(img);
  el.appendChild(cap);

  // Position avoiding center
  const margin = 90;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x, y;

  // keep cats away from center zone
  do {
    x = rand(margin, vw - margin - 90);
    y = rand(margin, vh - margin - 90);
  } while (
    x > vw / 2 - 140 && x < vw / 2 + 50 &&
    y > vh / 2 - 140 && y < vh / 2 + 60
  );

  el.style.left = x + "px";
  el.style.top  = y + "px";

  // random float delay so they don't all bounce in sync
  el.style.animationDelay = rand(0, 1.5) + "s";
  el.style.animationDuration = rand(2.5, 4.5) + "s";

  catLayer.appendChild(el);
  activeCats.push(el);

  // pop in
  img.style.animation = "catPopIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add("visible");
    });
  });

  // remove oldest if too many
  if (activeCats.length > 5) {
    const old = activeCats.shift();
    old.classList.add("fading");
    old.classList.remove("visible");
    setTimeout(() => old.remove(), 600);
  }
}

function startCatSpawner() {
  const scheduleNext = () => {
    const delay = randInt(4000, 7000);
    catInterval = setTimeout(() => {
      spawnCat();
      scheduleNext();
    }, delay);
  };
  // first cat after 2 seconds
  catInterval = setTimeout(() => {
    spawnCat();
    scheduleNext();
  }, 2000);
}

function clearAllCats() {
  clearTimeout(catInterval);
  activeCats.forEach(c => {
    c.classList.add("fading");
    setTimeout(() => c.remove(), 600);
  });
  activeCats = [];
}

/* ── MILESTONES ── */
function checkMilestones(t) {
  for (const m of MILESTONES) {
    if (t === m.at && !milestonesFired.has(m.at)) {
      milestonesFired.add(m.at);
      milestoneEl.classList.remove("dramatic");
      milestoneEl.textContent = "";

      requestAnimationFrame(() => {
        milestoneEl.textContent = m.text;
        if (m.dramatic) milestoneEl.classList.add("dramatic");
      });
    }
  }
}

/* ── CONFETTI ── */
const pieces = [];

function launchConfetti() {
  const ctx = confCanvas.getContext("2d");
  confCanvas.width  = window.innerWidth;
  confCanvas.height = window.innerHeight;

  const colors = ["#e8e030", "#ff4d6d", "#ffffff", "#00e5cc", "#ff9f1c", "#b8ff3f"];
  for (let i = 0; i < 130; i++) {
    pieces.push({
      x: rand(0, confCanvas.width),
      y: rand(-100, 0),
      r: rand(5, 11),
      color: colors[randInt(0, colors.length - 1)],
      vx: rand(-2, 2),
      vy: rand(3, 7),
      spin: rand(-0.15, 0.15),
      angle: rand(0, Math.PI * 2),
      shape: Math.random() > 0.5 ? "rect" : "circle",
      w: rand(6, 14),
      h: rand(4, 9),
    });
  }

  let start = null;
  function draw(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    if (elapsed > 5000) {
      ctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
      return;
    }
    ctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
    for (const p of pieces) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - elapsed / 5000);
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.vy += 0.07;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ── ENDING ── */
function triggerEnding() {
  clearInterval(timerInterval);
  clearAllCats();

  // Flash
  endingScreen.classList.remove("hidden");
  requestAnimationFrame(() => {
    flashEl.classList.add("flash");
    setTimeout(() => {
      flashEl.classList.remove("flash");
      endingScreen.classList.add("visible");
      launchConfetti();
      showEndingContent();
    }, 180);
  });
}

function showEndingContent() {
  // Pick random ending cat
  const catUrl = randCatUrl();
  endingCat.src = catUrl;

  if (isRare) {
    endingHL.classList.add("rare");
    endingHL.textContent = "legendary patience unlocked";
    endingSub.textContent = "you are built different. the internet salutes u.";
  } else {
    endingHL.textContent = "thank you for your patience";
    endingSub.textContent = "u waited 60 seconds for this";
  }

  setTimeout(() => {
    endingHL.classList.add("show");
    endingSub.classList.add("show");
  }, 600);

  // After 5 seconds, fade to outro
  setTimeout(() => {
    showOutro();
  }, 5500);
}

function showOutro() {
  const outro = document.createElement("div");
  outro.id = "outro";
  const p = document.createElement("p");
  p.textContent = "okay leave now";
  outro.appendChild(p);
  document.body.appendChild(outro);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      outro.classList.add("show");
    });
  });
}

/* ── TIMER ── */
function startTimer() {
  updateRing(TOTAL);
  timerEl.textContent = TOTAL;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    updateRing(timeLeft);
    checkMilestones(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      triggerEnding();
    }
  }, 1000);
}

/* ── TAB VISIBILITY ── */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && timeLeft > 0 && timeLeft < TOTAL) {
    tabMsg.classList.remove("hidden");
    tabMsg.classList.add("show");
  } else {
    tabMsg.classList.remove("show");
    setTimeout(() => tabMsg.classList.add("hidden"), 400);
  }
});

/* ── REFRESH MESSAGE ── */
if (sessionStorage.getItem("started")) {
  const refreshBanner = document.createElement("div");
  refreshBanner.style.cssText = `
    position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
    font-family: var(--font-body); font-size: 13px; color: #888;
    letter-spacing: 0.1em; z-index: 50; opacity: 1;
    transition: opacity 0.5s ease; pointer-events: none;
  `;
  refreshBanner.textContent = "starting over";
  document.body.appendChild(refreshBanner);
  setTimeout(() => { refreshBanner.style.opacity = "0"; }, 1800);
  setTimeout(() => { refreshBanner.remove(); }, 2400);
}
sessionStorage.setItem("started", "1");

/* ── BOOT ── */
(function init() {
  // init ring
  ringEl.style.strokeDasharray = circumference;
  ringEl.style.strokeDashoffset = 0;
  startTimer();
  startCatSpawner();
})();
