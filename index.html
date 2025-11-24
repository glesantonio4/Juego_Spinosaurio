<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no">
  <title>Juego Spinosaurio</title>

  <link rel="stylesheet" href="styles.css">

  <style>
    html, body { height: 100%; }
    body {
      margin:0;
      background: linear-gradient(180deg,#f5d3d8,#f7e1e6);
      overflow:hidden;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      overscroll-behavior: none;
    }

    .contenedor, .stage {
      width: 100vw !important;
      height: 100svh !important;
      max-width: 100vw !important;
      max-height: 100svh !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box;
    }

    .stage {
      border-radius: 18px;
      overflow: hidden;
      position: relative;
    }

    /* Logos HUD */
    .hud-logos {
      position: absolute;
      top: max(8px, env(safe-area-inset-top));
      left: max(8px, env(safe-area-inset-left));
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 5;
      pointer-events: none;
      opacity: .9;
    }
    .hud-logos img {
      height: clamp(26px, 10vh, 40px);
      width: auto;
      background: rgba(255,255,255,.65);
      border: 1px solid rgba(0,0,0,.06);
      border-radius: 12px;
      padding: 4px 8px;
      box-shadow: 0 6px 16px rgba(0,0,0,.18);
      filter: saturate(.95);
    }
    @media (max-height: 420px){
      .hud-logos img{ height: clamp(22px, 9vh, 32px); background: rgba(255,255,255,.55); }
    }

    /* Botón Retry */
    .retry-wrap {
      position: fixed; inset: 0; display: none; place-items: center;
      z-index: 9999;
      padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
    }
    .retry-wrap.show { display: grid; }
    .btn-retry {
      appearance:none;border:0;cursor:pointer;
      padding:14px 20px;border-radius:16px;font-weight:900;color:#fff;
      background: linear-gradient(135deg,#00c9b7,#9b5cf9);
      box-shadow: 0 10px 26px rgba(155,92,249,.35);
      font-size: clamp(14px, 2.8vw, 18px);
    }

    /* Overlay Girar Pantalla */
    .rotate-overlay {
      position: fixed; inset: 0; display: none; place-items: center;
      background: #111; color: #fff; z-index: 100000;
      text-align: center; padding: 24px;
    }
    .rotate-card {
      max-width: 520px; border-radius: 16px; padding: 22px 20px;
      background: #1f2937; box-shadow: 0 20px 60px rgba(0,0,0,.45);
    }
    .rotate-title { font-size: 22px; font-weight: 900; margin: 0 0 6px; }
    .rotate-sub { opacity:.85; margin: 0 0 10px; }
    .rotate-emoji { font-size: 48px; margin: 10px 0 2px; }

    /* Comportamiento Vertical/Horizontal */
    @media (orientation: portrait){
      body:not(.quiz-mode) .rotate-overlay{ display: grid; }
      #game, .retry-wrap{ display: none !important; }
    }
    @media (orientation: landscape){
      body.quiz-mode #quizOverlay{ display: none !important; }
      body.quiz-mode .rotate-overlay{ display: grid; }
    }

    /* Quiz Overlay */
    .quiz-overlay {
      position:fixed; inset:0; display:none; place-items:center;
      background:rgba(0,0,0,.45); z-index:10000;
      padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));
      backdrop-filter:blur(2px);
      overflow-y: auto !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      touch-action: auto;
    }
    .quiz-overlay.show { display:grid; }

    .quiz-card {
      width:min(720px,92vw);
      border-radius:18px;
      background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.86));
      border:1px solid rgba(0,0,0,.08);
      box-shadow:0 20px 60px rgba(0,0,0,.35);
      color:#111;
      padding:clamp(16px,4.5vw,28px);
      margin: 32px auto;
    }
    .quiz-title{font-size:clamp(18px,5vw,26px);font-weight:900;margin:0 0 8px;color:#2b2b2b;text-align:center}
    .quiz-sub{text-align:center;margin:0 0 16px;color:#475569;font-size:clamp(13px,3.3vw,16px)}
    .quiz-q{font-weight:800;font-size:clamp(15px,4vw,18px);margin:0 0 8px}
    .quiz-options{display:grid;gap:10px;margin:12px 0 8px}
    .quiz-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:#f3f4f6;border:1px solid #e5e7eb}
    .quiz-opt input{margin-top:4px}
    .quiz-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px}
    .btn-primary{appearance:none;border:0;cursor:pointer;padding:12px 16px;border-radius:12px;font-weight:900;color:#fff;background:linear-gradient(135deg,#00c9b7,#9b5cf9);box-shadow:0 10px 26px rgba(155,92,249,.35);min-width:180px;font-size:clamp(14px,3.6vw,16px)}
    .btn-secondary{appearance:none;border:0;cursor:pointer;padding:12px 16px;border-radius:12px;font-weight:800;color:#334155;background:#e5e7eb;min-width:140px;font-size:clamp(14px,3.4vw,16px)}
    .quiz-msg{text-align:center;margin-top:8px;font-weight:700}
    .quiz-msg.ok{color:#059669}.quiz-msg.err{color:#dc2626}
  </style>
</head>
<body>

  <div class="rotate-overlay" aria-hidden="true">
    <div class="rotate-card">
      <div class="rotate-emoji">📲↔️</div>
      <h3 class="rotate-title">Gira tu teléfono</h3>
      <p class="rotate-sub">Este juego está optimizado para <strong>orientación horizontal</strong>. Durante el <strong>desafío final</strong> se requiere <strong>vertical</strong>.</p>
    </div>
  </div>

  <div class="contenedor" id="game">
    <div class="stage">
      <div class="hud-logos" aria-hidden="true">
        <img src="Logo-Ag-14.png" alt="Agencia Digital Chiapas">
        <img src="logo-sata.png" alt="SATA">
        <img src="logo-much-nuevo1.png" alt="MUCH">
      </div>
      <div class="suelo"></div>
      <div class="dino dino-corriendo"></div>
      <div class="score">0</div>
      <div class="game-over">GAME OVER</div>
    </div>
  </div>

  <div class="retry-wrap" id="retryWrap">
    <button class="btn-retry" id="btnRetry">🔁 Intentar de nuevo</button>
  </div>

  <div id="quizOverlay" class="quiz-overlay" aria-hidden="true">
    <div class="quiz-card" role="dialog" aria-modal="true">
      <h3 id="quizTitle" class="quiz-title"></h3>
      <p id="quizSub" class="quiz-sub"></p>
      <p id="quizQuestion" class="quiz-q"></p>
      <div id="quizOptions" class="quiz-options"></div>
      <div class="quiz-actions">
        <button id="btnQuizOk" class="btn-primary">Confirmar</button>
        <button id="btnQuizCancel" class="btn-secondary">Cancelar</button>
      </div>
      <div id="quizMsg" class="quiz-msg" aria-live="polite"></div>
    </div>
  </div>

  <audio id="jumpSound" src="jump.mp3" preload="auto"></audio>

  <script type="module">
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

    const SUPABASE_URL = 'https://qwgaeorsymfispmtsbut.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z2Flb3JzeW1maXNwbXRzYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODcyODUsImV4cCI6MjA3Nzk2MzI4NX0.FThZIIpz3daC9u8QaKyRTpxUeW0v4QHs5sHX2s1U1eo';

    // Cliente global
    window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // ✅ ID EXACTO DE LA SALA "Juego Spinosaurio"
    window.SALA_ID = '0b4f04b0-5196-473d-8689-55df5315df55';
    
    console.log("Supabase listo. Sala ID:", window.SALA_ID);
  </script>

  <script src="game.js" defer></script>

  <script>
    document.addEventListener('dblclick', e => e.preventDefault(), {passive:false});
    let lastTouchEnd = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    }, {passive:false});
    document.addEventListener('gesturestart', e => e.preventDefault(), {passive:false});

    /* Lógica de registro cuando pierdes (Game Over) */
    window.addEventListener('load', () => {
      const scoreEl = document.querySelector('.score');
      const gameOverEl = document.querySelector('.game-over');
      let inicioPartida = new Date().toISOString();
      let ultimaPartidaGuardada = null; // Para no repetir guardado

      function estaVisible(el) {
        if (!el) return false;
        return getComputedStyle(el).display !== 'none';
      }

      setInterval(async () => {
        const esGameOver = estaVisible(gameOverEl);
        
        if (esGameOver) {
          // Si acaba de morir
          const puntosTexto = scoreEl.textContent || '0';
          const firma = puntosTexto + '-' + inicioPartida; // Identificador simple

          if (ultimaPartidaGuardada !== firma) {
            ultimaPartidaGuardada = firma;
            
            // REGISTRO EN SUPABASE
            if (window.supabase) {
              try {
                // Usamos el ID del Spinosaurio definido arriba
                const salaId = window.SALA_ID || '0b4f04b0-5196-473d-8689-55df5315df55';

                await window.supabase.from('quizzes').insert([{
                  sala_id: salaId,
                  participante_id: null,
                  started_at: inicioPartida,
                  finished_at: new Date().toISOString(),
                  puntaje_total: parseInt(puntosTexto) || 0,
                  num_correctas: 0
                }]);
                console.log("💀 Game Over. Puntaje guardado:", puntosTexto);
              } catch(e) { console.warn("Error guardando score", e); }
            }
          }
        } else {
            // Si está jugando de nuevo, reiniciamos el tiempo de inicio
            if (ultimaPartidaGuardada && !esGameOver) {
                inicioPartida = new Date().toISOString();
            }
        }
      }, 500);
    });
  </script>
</body>
</html>

