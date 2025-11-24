/* Redirección a portada si no viene con ?start=1 */
(function () {
  var qp = new URLSearchParams(location.search);
  if (qp.get("start") !== "1") location.replace("portada.html");
})();

/* ===== Intento de forzar LANDSCAPE ===== */
async function requestFull() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      //await el.requestFullscreen();
    }
  } catch (e) {}
}
async function lockLandscape() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (e) {}
}
function tryLandscapeLock() {
  requestFull().then(lockLandscape).catch(() => {});
}

/* ====== LOOP BASE ====== */
var time = new Date(), deltaTime = 0;
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(Init, 1);
} else {
  document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
  time = new Date();
  Start();
  Loop();
}
function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();
  Update();
  requestAnimationFrame(Loop);
}

/* ===== GAME STATE ===== */
var sueloY = 24;
var velY = 0, impulso = 900, gravedad = 2500;
var dinoPosX = 42, dinoPosY = sueloY;
var sueloX = 0, velEscenario = 1280 / 3, gameVel = 1, score = 0;
var parado = false, saltando = false;
var tiempoHastaObstaculo = 2, tiempoObstaculoMin = 0.7, tiempoObstaculoMax = 1.8, obstaculoPosY = 16, obstaculos = [];
var tiempoHastaNube = 0.5, tiempoNubeMin = 0.7, tiempoNubeMax = 2.7, maxNubeY = 270, minNubeY = 100, nubes = [], velNube = 0.5;

var contenedor, dino, textoScore, suelo, gameOver;
var WIN_SCORE = 10;

var jumpSound;
var quizData = null;
var quizAnswerIndex = null;
var quizVisible = false;
var navigatingToRegistro = false;

/* ===== START ===== */
function Start() {
  gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector(".contenedor");
  textoScore = document.querySelector(".score");
  dino = document.querySelector(".dino");
  jumpSound = document.getElementById("jumpSound");

  tryLandscapeLock();

  document.addEventListener("keydown", HandleKeyDown, { passive: false });
  contenedor.addEventListener("click", function (e) { e.preventDefault(); tryLandscapeLock(); Saltar(); }, { passive: false });
  contenedor.addEventListener("touchstart", function (e) { e.preventDefault(); tryLandscapeLock(); Saltar(); }, { passive: false });
  window.addEventListener("pointerdown", GlobalTap, { passive: false });

  document.getElementById("btnRetry").addEventListener("click", function () { location.reload(); });
  document.getElementById("btnQuizOk").addEventListener("click", validarQuiz);

  document.getElementById("btnQuizCancel").addEventListener("click", function () {
    navigatingToRegistro = true;
    quizVisible = false;
    try { document.getElementById("quizOverlay").classList.remove("show"); } catch(e){}
    document.body.classList.remove("quiz-mode");
    location.replace("portada.html");
  });

  cargarQuizJSON();

  window.addEventListener("blur", antiCheatGuard, { passive: true });
  document.addEventListener("visibilitychange", function () { if (document.hidden) antiCheatGuard(); });
  window.addEventListener("pagehide", antiCheatGuard, { passive: true });

  document.addEventListener("keydown", blockShortcutsDuringQuiz, { capture: true });
  document.addEventListener("contextmenu", function (e) { if (quizVisible) e.preventDefault(); });
}

/* ===== QUIZ JSON ===== */
async function cargarQuizJSON() {
  try {
    const res = await fetch("quiz.json?cb=" + Date.now());
    const data = await res.json();
    const list = Array.isArray(data.questions) ? data.questions : [];
    quizData = list.length ? list[Math.floor(Math.random() * list.length)] : null;
  } catch (e) {
    quizData = null;
  }
}

/* ===== CONTROLES ===== */
function GlobalTap(e) {
  if (parado || quizVisible) return;
  var target = e.target;
  if (target.closest("#retryWrap") || target.closest("#quizOverlay")) return;
  var tag = (target.tagName || "").toLowerCase();
  if (tag === "button" || tag === "a") return;
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  tryLandscapeLock();
  Saltar();
}

function HandleKeyDown(ev) {
  if (quizVisible) return;
  if (ev.code === "Space" || ev.keyCode === 32 || ev.code === "ArrowUp" || ev.keyCode === 38) {
    ev.preventDefault(); tryLandscapeLock(); Saltar();
  }
}

/* ===== UPDATE ===== */
function Update() {
  if (parado) return;
  MoverDinosaurio();
  MoverSuelo();
  DecidirCrearObstaculos();
  DecidirCrearNubes();
  MoverObstaculos();
  MoverNubes();
  DetectarColision();
  velY -= gravedad * deltaTime;
}

function Saltar() {
  if (dinoPosY === sueloY) {
    saltando = true; velY = impulso; dino.classList.remove("dino-corriendo");
    if (jumpSound) { jumpSound.currentTime = 0; jumpSound.play().catch(() => {}); }
  }
}
function MoverDinosaurio() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < sueloY) TocarSuelo();
  dino.style.bottom = dinoPosY + "px";
}
function TocarSuelo() {
  dinoPosY = sueloY; velY = 0;
  if (saltando) dino.classList.add("dino-corriendo");
  saltando = false;
}
function MoverSuelo() {
  sueloX += velEscenario * deltaTime * gameVel;
  suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}
function Estrellarse() {
  dino.classList.remove("dino-corriendo");
  dino.classList.add("dino-estrellado");
  parado = true;
}
function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if (tiempoHastaObstaculo <= 0) CrearObstaculo();
}
function DecidirCrearNubes() {
  tiempoHastaNube -= deltaTime;
  if (tiempoHastaNube <= 0) CrearNube();
}
function CrearObstaculo() {
  var o = document.createElement("div"); contenedor.appendChild(o);
  o.classList.add("cactus"); if (Math.random() > 0.5) o.classList.add("cactus2");
  o.posX = contenedor.clientWidth; o.style.left = o.posX + "px"; obstaculos.push(o);
  tiempoHastaObstaculo = tiempoObstaculoMin + (Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}
function CrearNube() {
  var n = document.createElement("div"); contenedor.appendChild(n);
  n.classList.add("nube"); n.posX = contenedor.clientWidth; n.style.left = n.posX + "px";
  n.style.bottom = 100 + Math.random() * (270 - 100) + "px"; nubes.push(n);
  tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}
function MoverObstaculos() {
  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1); GanarPuntos();
    } else {
      obstaculos[i].posX -= velEscenario * deltaTime * gameVel;
      obstaculos[i].style.left = obstaculos[i].posX + "px";
    }
  }
}
function MoverNubes() {
  for (var i = nubes.length - 1; i >= 0; i--) {
    if (nubes[i].posX < -nubes[i].clientWidth) {
      nubes[i].parentNode.removeChild(nubes[i]); nubes.splice(i, 1);
    } else {
      nubes[i].posX -= velEscenario * deltaTime * gameVel * velNube;
      nubes[i].style.left = nubes[i].posX + "px";
    }
  }
}

/* ===== SCORE / QUIZ ===== */
function GanarPuntos() {
  score++; textoScore.innerText = score;
  if (score == 5) { gameVel = 1.5; contenedor.classList.add("mediodia"); }
  else if (score == 15) { gameVel = 2; contenedor.classList.add("tarde"); }
  else if (score == WIN_SCORE) {
    gameVel = 3; contenedor.classList.add("noche"); parado = true;
    dino.classList.remove("dino-corriendo"); mostrarQuiz(); return;
  }
  suelo.style.animationDuration = 3 / gameVel + "s";
}

function GameOver() {
  Estrellarse(); gameOver.style.display = "grid";
  var wrap = document.getElementById("retryWrap"); if (wrap) wrap.classList.add("show");
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
}

function DetectarColision() {
  for (var i = 0; i < obstaculos.length; i++) {
    if (obstaculos[i].posX > dinoPosX + dino.clientWidth) break;
    if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) GameOver();
  }
}
function IsCollision(a, b, pt, pr, pb, pl) {
  var A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
  return !(A.top + A.height - pb < B.top || A.top + pt > B.top + B.height ||
           A.left + A.width - pr < B.left || A.left + pl > B.left + B.width);
}

/* ===== QUIZ UI ===== */
function mostrarQuiz() {
  document.body.classList.add("quiz-mode");
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
  setTimeout(() => {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("portrait-primary"); } catch(e){}
  }, 50);

  if (!quizData) {
    quizData = {
      title: "¡Muy bien!", subtitle: "Responde para continuar:",
      question: "¿Pregunta por defecto?", options: ["A", "B", "C", "D"], answerIndex: 3
    };
  }

  document.getElementById("quizTitle").textContent = quizData.title || "Pregunta final";
  document.getElementById("quizSub").textContent = quizData.subtitle || "";
  document.getElementById("quizQuestion").textContent = quizData.question || "";

  var box = document.getElementById("quizOptions"); box.innerHTML = "";
  quizAnswerIndex = Number(quizData.answerIndex) || 0;

  (quizData.options || []).forEach(function (txt, i) {
    var label = document.createElement("label"); label.className = "quiz-opt";
    label.innerHTML = '<input type="radio" name="q1" value="' + i + '"> <span>' + txt + "</span>";
    box.appendChild(label);
  });

  var o = document.getElementById("quizOverlay");
  var msg = document.getElementById("quizMsg"); msg.textContent = ""; msg.className = "quiz-msg";
  o.classList.add("show"); quizVisible = true;
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
}

async function validarQuiz() {
  var msg = document.getElementById("quizMsg");
  var sel = document.querySelector('input[name="q1"]:checked');
  
  if (!sel) {
    msg.textContent = "Selecciona una opción 😉"; msg.className = "quiz-msg err"; return;
  }

  if (Number(sel.value) === quizAnswerIndex) {
    msg.textContent = "¡Correcto! Registrando..."; msg.className = "quiz-msg ok";
    
    navigatingToRegistro = true; quizVisible = false;
    document.getElementById("quizOverlay").classList.remove("show");

    // REGISTRO DEL QUIZ GANADO
    await registrarQuizEnSupabase(score);

    setTimeout(function () { window.location.href = "registro.html"; }, 400);
  } else {
    msg.textContent = "Incorrecto. Intenta de nuevo."; msg.className = "quiz-msg err";
  }
}

function antiCheatGuard() {
  if (navigatingToRegistro || !quizVisible) return;
  try { document.getElementById("quizOverlay").classList.remove("show"); } catch (e) {}
  location.replace("portada.html");
}
function blockShortcutsDuringQuiz(e) {
  if (!quizVisible) return;
  const k = (e.key || "").toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ["l","t","n","w","k","p","r"].includes(k)) {
    e.preventDefault(); e.stopPropagation(); return false;
  }
}

/* ===== SUPABASE LOGIC ===== */
async function registrarQuizEnSupabase(puntaje) {
  // Usamos la conexión global creada en index.html
  if (!window.supabase) {
    console.warn("Supabase no está cargado.");
    return;
  }

  try {
    const ahora = new Date().toISOString();
    // ✅ USA EL ID CORRECTO DEL SPINOSAURIO
    const salaId = window.SALA_ID || '0b4f04b0-5196-473d-8689-55df5315df55'; 

    const { data, error } = await window.supabase
      .from("quizzes")
      .insert({
        sala_id: salaId,
        puntaje_total: puntaje,  // Guarda el puntaje real del juego
        num_correctas: 1,        // Ganó el quiz
        started_at: ahora,
        finished_at: ahora
      })
      .select("id")
      .single();

    if (error) console.warn("Error insert Supabase:", error.message);
    else {
      console.log("¡Quiz guardado en sala Spinosaurio!");
      try { localStorage.setItem("much_quiz_last_quiz_id", String(data.id)); } catch(_) {}
    }
  } catch(e) {
    console.warn("Fallo conexión Supabase:", e);
  }
}

