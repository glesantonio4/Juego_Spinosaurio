/* Redirección a portada si no viene con ?start=1 */
(function () {
  var qp = new URLSearchParams(location.search);
  if (qp.get("start") !== "1") location.replace("portada.html");
})();

/* ===== Intento de forzar LANDSCAPE (cuando el navegador lo permite) ===== */
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
var sueloY = 24; // altura del "piso" para que se vean las patas
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

/* Reusamos este flag para permitir navegar tanto a registro como a portada sin que dispare el anti-cheat */
var navigatingToRegistro = false;

/* ===== START ===== */
function Start() {
  gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector(".contenedor");
  textoScore = document.querySelector(".score");
  dino = document.querySelector(".dino");
  jumpSound = document.getElementById("jumpSound");

  // Intento inicial de fijar landscape (algunos navegadores requieren gesto del usuario)
  tryLandscapeLock();

  document.addEventListener("keydown", HandleKeyDown, { passive: false });

  // Tap/click para saltar
  contenedor.addEventListener("click", function (e) {
    e.preventDefault();
    tryLandscapeLock();
    Saltar();
  }, { passive: false });

  contenedor.addEventListener("touchstart", function (e) {
    e.preventDefault();
    tryLandscapeLock();
    Saltar();
  }, { passive: false });

  window.addEventListener("pointerdown", GlobalTap, { passive: false });

  document.getElementById("btnRetry").addEventListener("click", function () {
    location.reload();
  });

  document.getElementById("btnQuizOk").addEventListener("click", validarQuiz);

  /* ===== CAMBIO #1: Cancelar = cerrar juego y volver a portada ===== */
  document.getElementById("btnQuizCancel").addEventListener("click", function () {
    navigatingToRegistro = true;            // evita anti-cheat
    quizVisible = false;
    try { document.getElementById("quizOverlay").classList.remove("show"); } catch(e){}
    document.body.classList.remove("quiz-mode");
    location.replace("portada.html");       // regresar a portada
  });

  cargarQuizJSON();

  // Anti-cheat básico (si se sale de la página durante el quiz)
  window.addEventListener("blur", antiCheatGuard, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) antiCheatGuard();
  });
  window.addEventListener("pagehide", antiCheatGuard, { passive: true });

  // Bloqueo de atajos cuando el quiz está abierto
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
    ev.preventDefault();
    tryLandscapeLock();
    Saltar();
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

/* ===== MOVIMIENTO ===== */
function Saltar() {
  if (dinoPosY === sueloY) {
    saltando = true;
    velY = impulso;
    dino.classList.remove("dino-corriendo");
    if (jumpSound) {
      jumpSound.currentTime = 0;
      jumpSound.play().catch(() => {});
    }
  }
}
function MoverDinosaurio() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < sueloY) TocarSuelo();
  dino.style.bottom = dinoPosY + "px";
}
function TocarSuelo() {
  dinoPosY = sueloY;
  velY = 0;
  if (saltando) dino.classList.add("dino-corriendo");
  saltando = false;
}
function MoverSuelo() {
  sueloX += velEscenario * deltaTime * gameVel;
  suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

/* ===== OBJETOS ===== */
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
  var o = document.createElement("div");
  contenedor.appendChild(o);
  o.classList.add("cactus");
  if (Math.random() > 0.5) o.classList.add("cactus2");
  o.posX = contenedor.clientWidth;
  o.style.left = o.posX + "px";
  obstaculos.push(o);
  tiempoHastaObstaculo =
    tiempoObstaculoMin + (Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}

function CrearNube() {
  var n = document.createElement("div");
  contenedor.appendChild(n);
  n.classList.add("nube");
  n.posX = contenedor.clientWidth;
  n.style.left = n.posX + "px";
  n.style.bottom = 100 + Math.random() * (270 - 100) + "px";
  nubes.push(n);
  tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1);
      GanarPuntos();
    } else {
      obstaculos[i].posX -= velEscenario * deltaTime * gameVel;
      obstaculos[i].style.left = obstaculos[i].posX + "px";
    }
  }
}
function MoverNubes() {
  for (var i = nubes.length - 1; i >= 0; i--) {
    if (nubes[i].posX < -nubes[i].clientWidth) {
      nubes[i].parentNode.removeChild(nubes[i]);
      nubes.splice(i, 1);
    } else {
      nubes[i].posX -= velEscenario * deltaTime * gameVel * velNube;
      nubes[i].style.left = nubes[i].posX + "px";
    }
  }
}

/* ===== SCORE / QUIZ ===== */
function GanarPuntos() {
  score++;
  textoScore.innerText = score;
  if (score == 5) {
    gameVel = 1.5;
    contenedor.classList.add("mediodia");
  } else if (score == 15) {
    gameVel = 2;
    contenedor.classList.add("tarde");
  } else if (score == WIN_SCORE) {
    gameVel = 3;
    contenedor.classList.add("noche");
    parado = true;
    dino.classList.remove("dino-corriendo");
    mostrarQuiz();
    return;
  }
  suelo.style.animationDuration = 3 / gameVel + "s";
}

function GameOver() {
  Estrellarse();
  gameOver.style.display = "grid";
  var wrap = document.getElementById("retryWrap");
  if (wrap) wrap.classList.add("show");
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
  return !(A.top + A.height - pb < B.top ||
           A.top + pt > B.top + B.height ||
           A.left + A.width - pr < B.left ||
           A.left + pl > B.left + B.width);
}

/* ===== CAMBIO #2: Quiz solo en vertical ===== */
function mostrarQuiz() {
  // Flag para estilos (oculta juego en portrait y controla overlay en landscape)
  document.body.classList.add("quiz-mode");

  // Intento forzar desbloqueo y fijar a vertical (si el navegador lo permite)
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
  setTimeout(() => {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("portrait-primary"); } catch(e){}
  }, 50);

  if (!quizData) {
    quizData = {
      title: "¡Muy bien! Antes de reclamar tu premio…",
      subtitle: "Responde esta pregunta sobre el museo para continuar:",
      question:
        "¿En qué espacio de un museo de ciencia puedes observar el cielo y aprender sobre constelaciones?",
      options: ["Pinacoteca", "Auditorio", "Cafetería", "Planetario"],
      answerIndex: 3,
    };
  }

  document.getElementById("quizTitle").textContent = quizData.title || "Pregunta final";
  document.getElementById("quizSub").textContent   = quizData.subtitle || "";
  document.getElementById("quizQuestion").textContent = quizData.question || "";

  var box = document.getElementById("quizOptions");
  box.innerHTML = "";
  quizAnswerIndex = Number(quizData.answerIndex) || 0;

  (quizData.options || []).forEach(function (txt, i) {
    var id = "q1_" + i;
    var label = document.createElement("label");
    label.className = "quiz-opt";
    label.innerHTML =
      '<input type="radio" name="q1" value="' + i + '" id="' + id + '"> <span>' + txt + "</span>";
    box.appendChild(label);
  });

  var o = document.getElementById("quizOverlay");
  var msg = document.getElementById("quizMsg");
  msg.textContent = "";
  msg.className = "quiz-msg";
  o.classList.add("show");
  quizVisible = true;

  // Si está en landscape, el CSS ocultará el quiz y mostrará el overlay de "gira tu teléfono".
  setTimeout(function () { 
    try { document.getElementById("btnQuizOk").focus(); } catch(_) {}
  }, 20);

  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
}

function cerrarQuiz() {
  document.getElementById("quizOverlay").classList.remove("show");
  document.body.classList.remove("quiz-mode");
  quizVisible = false;
  parado = false;
  dino.classList.add("dino-corriendo");
  time = new Date();
  // ↓ vuelve a bloquear horizontal para seguir jugando
  try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape"); } catch(e){}
}

/* ===== AQUÍ SÍ CAMBIO: validarQuiz ahora es async y registra en Supabase ===== */
async function validarQuiz() {
  var msg = document.getElementById("quizMsg");
  var sel = document.querySelector('input[name="q1"]:checked');
  if (!sel) {
    msg.textContent = "Selecciona una opción 😉";
    msg.className = "quiz-msg err";
    return;
  }
  if (Number(sel.value) === quizAnswerIndex) {
    msg.textContent = "¡Correcto! Vamos a registrar tu premio.";
    msg.className = "quiz-msg ok";

    // Cerrar el quiz y permitir la navegación sin que el anti-cheat actúe
    navigatingToRegistro = true;
    quizVisible = false;
    document.getElementById("quizOverlay").classList.remove("show");

    // === Nuevo: registrar la partida en Supabase ===
    try {
      await registrarQuizEnSupabase(score);
    } catch(e) {
      console.warn("No se pudo registrar el quiz en Supabase:", e);
    }

    setTimeout(function () { window.location.href = "registro.html"; }, 400);
  } else {
    msg.textContent = "Respuesta incorrecta. Intenta de nuevo.";
    msg.className = "quiz-msg err";
  }
}

/* ===== ANTI-CHEAT ===== */
function antiCheatGuard() {
  if (navigatingToRegistro) return;
  if (!quizVisible) return;
  try { document.getElementById("quizOverlay").classList.remove("show"); } catch (e) {}
  location.replace("portada.html");
}
function blockShortcutsDuringQuiz(e) {
  if (!quizVisible) return;
  const k = (e.key || "").toLowerCase();
  const isMod = e.ctrlKey || e.metaKey;
  if ((isMod && ["l","t","n","w","k","p","r"].includes(k)) || k === "f1") {
    e.preventDefault(); e.stopPropagation(); return false;
  }
}

/* ===== SUPABASE – REGISTRO DE QUIZ ===== */
/* Estas funciones son nuevas; no modifican el resto del juego. */

const SUPABASE_URL = 'https://qwgaeorsymfispmtsbut.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z2Flb3JzeW1maXNwbXRzYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODcyODUsImV4cCI6MjA3Nzk2MzI4NX0.FThZIIpz3daC9u8QaKyRTpxUeW0v4QHs5sHX2s1U1eo';           // <-- Y ESTO

let muchSupabaseReadyPromise = null;

// Carga la librería de Supabase si hace falta y crea el cliente
function loadSupabaseClient() {
  if (muchSupabaseReadyPromise) return muchSupabaseReadyPromise;

  muchSupabaseReadyPromise = new Promise(function(resolve, reject){
    function createClient() {
      try {
        if (!window.supabase) {
          reject(new Error("Supabase JS no está disponible"));
          return;
        }
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve(client);
      } catch(e) {
        reject(e);
      }
    }

    if (window.supabase) {
      // ya cargado (por otro script)
      createClient();
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.async = true;
    s.onload = createClient;
    s.onerror = function(){ reject(new Error("No se pudo cargar Supabase JS")); };
    document.head.appendChild(s);
  });

  return muchSupabaseReadyPromise;
}

// Inserta el registro en la tabla quizzes
async function registrarQuizEnSupabase(puntaje) {
  try {
    const supabaseClient = await loadSupabaseClient();

    // Tomar la sala desde el query string (?sala=spinosaurio) o usar 'spinosaurio' por defecto
    const qp = new URLSearchParams(location.search);
    const salaSlug = qp.get("sala") || "spinosaurio";

    const ahora = new Date().toISOString();

    const payload = {
      sala_slug: salaSlug,          // asegúrate de tener esta columna en quizzes
      puntaje_total: puntaje * 10,  // ej. 10 puntos por obstáculo
      num_correctas: puntaje,
      started_at:  ahora,
      finished_at: ahora
    };

    const { data, error } = await supabaseClient
      .from("quizzes")   // nombre de tu tabla
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.warn("Error Supabase insert quizzes:", error);
      return null;
    }

    // Guardamos el id por si luego quieres usarlo (boleto, etc.)
    try {
      localStorage.setItem("much_quiz_last_quiz_id", String(data.id));
    } catch(_) {}

    return data.id;
  } catch(e) {
    console.warn("Fallo al conectar con Supabase:", e);
    return null;
  }
}

