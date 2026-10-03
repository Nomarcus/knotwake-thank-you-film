(() => {
  // REVIEW CUT — "The Line Still Holds"
  // Caption times match combined-v1-TEMP-audio.mp3 (196s temporary score).
  // Replace that file with the Monday Suno track and retune `beats`.
  // Do not use the phrase "YOU BUILT IT".
  const TEMP_DURATION = 196;
  const AUDIO_FILE = "combined-v1-TEMP-audio.mp3";
  const LINE_N = 12;

  const EMBED = new URLSearchParams(location.search).get("embed") === "1";
  if (EMBED) document.body.classList.add("embed");

  const beats = [
    { t: 0.0, label: "", text: "", mood: "void" },
    { t: 5.5, label: "SIGNAL", text: "This season started with a signal.", mood: "cold" },
    { t: 11.5, label: "SIGNAL", text: "Just a small one.", mood: "cold" },
    { t: 16.5, label: "SIGNAL", text: "You could have looked away.", mood: "cold" },
    { t: 22.0, label: "SIGNAL", text: "You didn't.", mood: "rise" },
    { t: 27.5, label: "WAIT", text: "Some nights it was only waiting.", mood: "rise" },
    { t: 34.0, label: "WAIT", text: "You stayed anyway.", mood: "rise" },
    { t: 40.0, label: "NODE", text: "You became a node.", mood: "bloom" },
    { t: 46.0, label: "NODE", text: "A person the message could land on.", mood: "bloom" },
    { t: 53.0, label: "PASSING", text: "Then you passed it on.", mood: "bloom" },
    { t: 59.0, label: "PASSING", text: "Not to a system.\nTo someone.", mood: "bloom" },
    { t: 66.0, label: "NIGHT", text: "They passed it on too.", mood: "warm" },
    { t: 72.5, label: "NIGHT", text: "Strangers, mostly.\nAwake at odd hours.", mood: "warm" },
    { t: 80.5, label: "NIGHT", text: "Still willing.", mood: "warm" },
    { t: 86.0, label: "TRUTH", text: "There was no hidden machine under any of this.", mood: "mystery" },
    { t: 94.0, label: "TRUTH", text: "There was you,\nand the next person,\nand the next.", mood: "mystery" },
    { t: 103.0, label: "ALMOST", text: "The experiment is almost finished.", mood: "warm" },
    { t: 109.5, label: "ALMOST", text: "The season is almost done.", mood: "warm" },
    { t: 116.0, label: "ALMOST", text: "Nothing dramatic has to happen now.", mood: "aside" },
    { t: 123.0, label: "ROOM", text: "What you did was pay attention,", mood: "drift" },
    { t: 129.0, label: "ROOM", text: "and then let the message go.", mood: "drift" },
    { t: 136.0, label: "STILL", text: "If you are watching this,\nyou are still on the line.", mood: "warm" },
    { t: 144.0, label: "STILL", text: "That is enough.", mood: "warm" },
    { t: 150.0, label: "AFTER", text: "Leave the light on\nfor whoever comes after you.", mood: "thin" },
    { t: 159.0, label: "THANKS", text: "Thank you for the signal.", mood: "bloom" },
    { t: 165.5, label: "THANKS", text: "Thank you for staying.", mood: "bloom" },
    { t: 172.0, label: "THANKS", text: "Thank you for passing it on.", mood: "bloom" },
    { t: 180.0, label: "CLOSE", text: "The line holds.", mood: "signal" },
    { t: 188.0, label: "SYSTEM", text: "We will keep the light on.", mood: "warm" }
  ];

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const audio = document.getElementById("audio");
  const lyricLineEl = document.getElementById("lyricLine");
  const lyricLabelEl = document.getElementById("lyricLabel");
  const clockEl = document.getElementById("clock");
  const statusEl = document.getElementById("status");
  const boot = document.getElementById("boot");
  const bootErr = document.getElementById("bootErr");
  const btnStart = document.getElementById("btnStart");
  const btnPlay = document.getElementById("btnPlay");
  const btnRestart = document.getElementById("btnRestart");
  const btnFs = document.getElementById("btnFs");
  const btnRec = document.getElementById("btnRec");
  const stage = document.getElementById("stage");
  const scrub = document.getElementById("scrub");
  const scrubNow = document.getElementById("scrubNow");
  const scrubDur = document.getElementById("scrubDur");

  btnStart.disabled = false;

  let W = 0, H = 0, dpr = 1;
  let columns = [];
  let nodes = [];
  let pulses = [];
  let sparks = [];
  let rings = [];
  let motifFlash = 0;
  let lastBeatIdx = -1;
  let lastFrontier = -1;
  let mood = "void";
  let started = false;
  let dragging = false;
  let recorder = null;
  let recordedChunks = [];
  let lastTs = performance.now();
  let pendingStart = null;
  let seekPending = false;
  let desiredTime = null;

  const glyphs = "01アイウエオカキクケコサシスセソタチツテトABCDEFGHKLMNPRSTVWXYZ░▒▓¤※◆◇∙".split("");

  const moodPalette = {
    void: { dens: 0.25, warmth: 0.05, link: 0.002, rain: 0.55, hue: 140 },
    cold: { dens: 0.4, warmth: 0.12, link: 0.006, rain: 0.75, hue: 145 },
    rise: { dens: 0.55, warmth: 0.28, link: 0.012, rain: 0.9, hue: 150 },
    bloom: { dens: 0.85, warmth: 0.7, link: 0.03, rain: 1.15, hue: 155 },
    drift: { dens: 0.45, warmth: 0.35, link: 0.01, rain: 0.7, hue: 148 },
    mystery: { dens: 0.5, warmth: 0.22, link: 0.01, rain: 0.8, hue: 160 },
    glitch: { dens: 0.7, warmth: 0.4, link: 0.02, rain: 1.05, hue: 130 },
    aside: { dens: 0.35, warmth: 0.45, link: 0.008, rain: 0.5, hue: 152 },
    warm: { dens: 0.75, warmth: 0.85, link: 0.025, rain: 1.0, hue: 158 },
    thin: { dens: 0.3, warmth: 0.5, link: 0.005, rain: 0.4, hue: 150 },
    signal: { dens: 0.2, warmth: 0.55, link: 0.004, rain: 0.28, hue: 145 }
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colW = 16;
    const n = Math.ceil(W / colW) + 2;
    columns = Array.from({ length: n }, (_, i) => ({
      x: i * colW + (Math.random() * 4 - 2),
      y: Math.random() * H,
      speed: 35 + Math.random() * 110,
      len: 6 + Math.floor(Math.random() * 22),
      chars: Array.from({ length: 28 }, () => glyphs[(Math.random() * glyphs.length) | 0]),
      bright: Math.random()
    }));
    if (!nodes.length) {
      nodes = Array.from({ length: 42 }, (_, i) => ({
        fx: Math.random(),
        fy: 0.08 + Math.random() * 0.84,
        r: 1.2 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
        wakeAt: i < 3 ? Math.random() * 0.04 : 0.05 + Math.random() * 0.9
      }));
    }
  }

  function fmt(time) {
    const safe = Number.isFinite(time) && time > 0 ? time : 0;
    const m = Math.floor(safe / 60);
    const s = Math.floor(safe % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function duration() {
    if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
      return audio.duration;
    }
    return TEMP_DURATION;
  }

  function beatIndexAt(time) {
    let idx = 0;
    for (let i = 0; i < beats.length; i++) {
      if (beats[i].t <= time) idx = i;
      else break;
    }
    return idx;
  }

  function lineProgress(p) {
    if (p < 0.028) return 0;
    if (p < 0.20) return ((p - 0.028) / 0.172) * 0.08;
    if (p < 0.44) return 0.08 + ((p - 0.20) / 0.24) * 0.76;
    if (p < 0.77) return 0.84 + ((p - 0.44) / 0.33) * 0.08;
    if (p < 0.92) return 0.92 + ((p - 0.77) / 0.15) * 0.08;
    return 1;
  }

  function linePoint(i, time) {
    const u = 0.08 + (i / (LINE_N - 1)) * 0.84;
    const yBase = Math.min(H * 0.64, H - 160);
    const y = yBase + Math.sin(i * 0.85) * Math.min(14, H * 0.012) + Math.sin(time * 0.5 + i) * 2.5;
    return { x: u * W, y };
  }

  function frontierAt(time) {
    const p = duration() ? time / duration() : 0;
    const exact = lineProgress(p) * (LINE_N - 1);
    return Math.max(0, Math.min(LINE_N - 1, Math.floor(exact + 0.001)));
  }

  function spawnPulse(from, to) {
    pulses.push({
      x: from.x, y: from.y, tx: to.x, ty: to.y,
      life: 0, max: 0.7 + Math.random() * 0.8
    });
  }

  function burst(x, y, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      sparks.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: 0.4 + Math.random() * 0.7
      });
    }
  }

  function addRing(x, y) {
    rings.push({ x, y, r: 4, life: 0, max: 1.1 });
  }

  function draw(dt, uiDt, time) {
    const pal = moodPalette[mood] || moodPalette.void;
    const dur = duration();
    const progress = dur ? Math.min(1, Math.max(0, time / dur)) : 0;
    const lp = lineProgress(progress);

    const trail = mood === "bloom" || mood === "warm" ? 0.22 : mood === "aside" || mood === "thin" ? 0.14 : 0.18;
    ctx.fillStyle = `rgba(2,8,5,${trail})`;
    ctx.fillRect(0, 0, W, H);

    const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.48, Math.max(W, H) * 0.7);
    g.addColorStop(0, `rgba(${20 + pal.warmth * 60},${40 + pal.warmth * 90},${30 + pal.warmth * 40},${0.08 + pal.warmth * 0.12})`);
    g.addColorStop(1, "rgba(2,8,5,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.font = "13px monospace";
    for (const col of columns) {
      col.y += col.speed * dt * pal.rain;
      if (col.y - col.len * 15 > H) {
        col.y = -Math.random() * H * 0.35;
        col.speed = 35 + Math.random() * 110;
        col.bright = Math.random();
      }
      for (let i = 0; i < col.len; i++) {
        const yy = col.y - i * 15;
        if (yy < -20 || yy > H + 20) continue;
        if (Math.random() < 0.025) col.chars[i % col.chars.length] = glyphs[(Math.random() * glyphs.length) | 0];
        const head = i === 0;
        const a = (head ? 0.95 : 0.12 + (1 - i / col.len) * 0.5) * (0.55 + col.bright * 0.45);
        const warm = pal.warmth;
        ctx.fillStyle = head
          ? `rgba(210,255,220,${a})`
          : `rgba(${25 + warm * 50},${110 + warm * 90},${65 + warm * 50},${a * pal.dens})`;
        ctx.fillText(col.chars[i % col.chars.length], col.x, yy);
      }
    }

    for (const n of nodes) {
      n.phase += dt * (0.6 + pal.dens);
      const x = n.fx * W + Math.sin(n.phase * 0.7) * 10;
      const y = n.fy * H + Math.cos(n.phase * 0.55) * 8;
      n.x = x;
      n.y = y;
      const awake = progress >= n.wakeAt;
      const glow = awake ? 0.45 + 0.4 * Math.sin(n.phase * 1.4) : 0.06;
      ctx.beginPath();
      ctx.arc(x, y, n.r + (awake ? 1.4 : 0), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57,255,136,${Math.max(0.04, glow)})`;
      ctx.fill();
      if (awake && Math.random() < pal.link) {
        const other = nodes[(Math.random() * nodes.length) | 0];
        if (progress >= other.wakeAt) spawnPulse(n, other);
      }
    }

    pulses = pulses.filter((p) => {
      p.life += uiDt;
      const k = p.life / p.max;
      if (k >= 1) return false;
      const x = p.x + (p.tx - p.x) * k;
      const y = p.y + (p.ty - p.y) * k;
      ctx.strokeStyle = `rgba(200,250,204,${(1 - k) * 0.9})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,255,230,${1 - k})`;
      ctx.fill();
      return true;
    });

    sparks = sparks.filter((s) => {
      s.life += uiDt;
      const k = s.life / s.max;
      if (k >= 1) return false;
      s.x += s.vx * uiDt;
      s.y += s.vy * uiDt;
      s.vy += 30 * uiDt;
      ctx.fillStyle = `rgba(200,255,210,${1 - k})`;
      ctx.fillRect(s.x, s.y, 2, 2);
      return true;
    });

    rings = rings.filter((r) => {
      r.life += uiDt;
      const k = r.life / r.max;
      if (k >= 1) return false;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r + k * 90, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(57,255,136,${(1 - k) * 0.45})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return true;
    });

    const exact = lp * (LINE_N - 1);
    const frontier = Math.max(0, Math.min(LINE_N - 1, Math.floor(exact + 0.001)));
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(2,8,5,0.72)";
    ctx.beginPath();
    for (let i = 0; i < LINE_N - 1; i++) {
      const a = linePoint(i, time);
      const b = linePoint(i + 1, time);
      if (i === 0) ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    for (let i = 0; i < LINE_N - 1; i++) {
      const a = linePoint(i, time);
      const b = linePoint(i + 1, time);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = i < frontier ? 2 : 1.4;
      ctx.strokeStyle = i < frontier ? "rgba(210,255,224,0.92)" : "rgba(57,255,136,0.42)";
      ctx.stroke();
    }
    for (let i = 0; i < LINE_N; i++) {
      const p = linePoint(i, time);
      const on = i <= frontier && lp > 0;
      const head = i === frontier && lp > 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, head ? 11 : 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(2,8,5,0.72)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, head ? 6.2 : on ? 4.2 : 3.3, 0, Math.PI * 2);
      ctx.fillStyle = head
        ? "rgba(236,255,244,0.98)"
        : on
          ? "rgba(57,255,136,0.96)"
          : "rgba(57,255,136,0.62)";
      ctx.fill();
      if (head) {
        const halo = 14 + Math.sin(time * 2.2) * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, halo, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(200,255,220,0.55)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
    if (lp > 0 && lp < 0.999 && frontier < LINE_N - 1) {
      const a = linePoint(frontier, time);
      const b = linePoint(frontier + 1, time);
      const frac = Math.min(1, Math.max(0, exact - frontier));
      const x = a.x + (b.x - a.x) * frac;
      const y = a.y + (b.y - a.y) * frac;
      ctx.beginPath();
      ctx.arc(x, y, 3.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(236,255,242,0.98)";
      ctx.fill();
    }

    if (motifFlash > 0) motifFlash = Math.max(0, motifFlash - uiDt);
    if (motifFlash > 0 || mood === "signal") {
      const cx = W / 2;
      const cy = H * 0.16;
      for (let i = 0; i < 4; i++) {
        const x = cx + (i - 1.5) * 52;
        const on = mood === "signal" || motifFlash > (3 - i) * 0.09;
        ctx.beginPath();
        ctx.arc(x, cy, on ? 7 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = on ? "rgba(210,255,220,0.98)" : "rgba(57,255,136,0.22)";
        ctx.fill();
        if (on) {
          ctx.beginPath();
          ctx.arc(x, cy, 14, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(200,255,210,0.25)";
          ctx.stroke();
        }
      }
    }

    if (pal.warmth > 0.55) {
      ctx.save();
      ctx.globalAlpha = 0.06 + (pal.warmth - 0.55) * 0.14;
      ctx.strokeStyle = "#39ff88";
      ctx.lineWidth = 1;
      const cx = W / 2;
      const cy = H * 0.4;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + time * 0.12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * 140, cy + Math.sin(ang) * 80);
        ctx.stroke();
      }
      ctx.restore();
    }

    return frontier;
  }

  function showBeat(beat, accent) {
    mood = beat.mood || "void";
    lyricLabelEl.textContent = beat.label || "";
    lyricLineEl.textContent = beat.text || "";
    lyricLineEl.classList.toggle("dim", !beat.text);
    if (beat.text && accent) {
      lyricLineEl.classList.remove("pop");
      void lyricLineEl.offsetWidth;
      lyricLineEl.classList.add("pop");
    }
    if (!accent || !beat.label) return;

    const time = audio.currentTime || 0;
    const p = linePoint(frontierAt(time), time);
    const label = beat.label;
    if (label === "SIGNAL") {
      motifFlash = beat.text === "You didn't." ? 0.95 : 0.4;
      burst(p.x, p.y, beat.text === "You didn't." ? 16 : 8);
    } else if (label === "NODE" || label === "PASSING" || label === "THANKS") {
      motifFlash = 0.6;
      burst(p.x, p.y, 18);
      addRing(p.x, p.y);
      const idx = frontierAt(time);
      if (idx > 0) spawnPulse(linePoint(idx - 1, time), linePoint(idx, time));
    } else if (label === "NIGHT" || label === "ALMOST") {
      addRing(p.x, p.y);
      burst(p.x, p.y, 10);
    } else if (label === "AFTER") {
      const end = linePoint(LINE_N - 1, time);
      addRing(end.x, end.y);
      motifFlash = 0.4;
    } else if (label === "CLOSE") {
      motifFlash = 1.6;
      for (let i = 0; i < LINE_N; i += 3) addRing(linePoint(i, time).x, linePoint(i, time).y);
    } else if (label === "SYSTEM") {
      motifFlash = 0.85;
      addRing(W / 2, Math.min(H * 0.64, H - 160));
    }
  }

  function syncTransport(time) {
    const dur = duration();
    clockEl.textContent = fmt(time);
    scrubNow.textContent = fmt(time);
    scrubDur.textContent = fmt(dur);
    if (!dragging && !seekPending) {
      scrub.max = String(dur);
      scrub.value = String(Math.min(dur, Math.max(0, time)));
    }
    if (!started) statusEl.textContent = "STANDBY";
    else if (audio.ended) statusEl.textContent = "THE LINE HOLDS";
    else if (audio.paused) statusEl.textContent = "PAUSED";
    else statusEl.textContent = "PLAYING";
    btnPlay.textContent = !started || audio.paused || audio.ended ? "Play" : "Pause";
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    const time = audio.currentTime || 0;
    const playing = started && !audio.paused && !audio.ended;
    const wallDt = dt;
    const frontier = draw(playing ? wallDt : 0, wallDt, time);

    if (playing && frontier === lastFrontier + 1) {
      const p = linePoint(frontier, time);
      addRing(p.x, p.y);
    }
    lastFrontier = frontier;

    const idx = beatIndexAt(time);
    if (idx !== lastBeatIdx) {
      const forward = lastBeatIdx >= 0 && idx === lastBeatIdx + 1;
      lastBeatIdx = idx;
      showBeat(beats[idx], forward && playing && !dragging);
    }

    syncTransport(time);
    requestAnimationFrame(frame);
  }

  function showAudioError(message) {
    boot.classList.remove("hidden");
    bootErr.hidden = false;
    bootErr.textContent = message;
  }

  function resetPlayhead() {
    lastBeatIdx = -1;
    lastFrontier = -1;
    mood = "void";
    pulses = [];
    sparks = [];
    rings = [];
    motifFlash = 0;
    seekTo(0);
  }

  function actuallyStart(fromStart) {
    if (fromStart) resetPlayhead();
    if (EMBED && window.parent !== window) {
      window.parent.postMessage({ type: "knotwake-film-started" }, "*");
    }
    audio.play().catch(() => {
      showAudioError("Browser blocked audio. Press Start again.");
    });
  }

  function beginPlayback(fromStart) {
    started = true;
    boot.classList.add("hidden");
    if (!audio.src) {
      pendingStart = fromStart;
      return;
    }
    actuallyStart(fromStart);
  }

  function togglePlay() {
    if (!started || audio.ended) {
      beginPlayback(true);
      return;
    }
    if (audio.paused) audio.play().catch(() => showAudioError("Browser blocked audio. Press Start again."));
    else audio.pause();
  }

  function applySeek() {
    if (!seekPending || desiredTime == null || !audio.src) return;
    try { audio.currentTime = desiredTime; } catch (e) { return; }
    if (Math.abs((audio.currentTime || 0) - desiredTime) < 0.45) seekPending = false;
  }

  function seekTo(next) {
    const dur = duration();
    const time = Math.max(0, Math.min(dur, next));
    if (!started) {
      started = true;
      boot.classList.add("hidden");
    }
    desiredTime = time;
    seekPending = true;
    applySeek();
  }

  btnStart.addEventListener("click", () => beginPlayback(true));
  btnPlay.addEventListener("click", togglePlay);
  btnRestart.addEventListener("click", () => beginPlayback(true));
  btnFs.addEventListener("click", () => {
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  scrub.addEventListener("pointerdown", () => { dragging = true; });
  scrub.addEventListener("pointerup", () => { dragging = false; });
  scrub.addEventListener("pointercancel", () => { dragging = false; });
  scrub.addEventListener("input", () => {
    dragging = true;
    const time = Number(scrub.value);
    if (Number.isFinite(time)) seekTo(time);
  });
  scrub.addEventListener("change", () => {
    dragging = false;
    const time = Number(scrub.value);
    if (Number.isFinite(time)) seekTo(time);
  });

  window.addEventListener("keydown", (e) => {
    const tag = e.target && e.target.tagName;
    if (e.code === "Space") {
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
      if (tag === "INPUT") return;
      e.preventDefault();
      seekTo((audio.currentTime || 0) + (e.code === "ArrowRight" ? 5 : -5));
    }
  });

  btnRec.addEventListener("click", () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      btnRec.textContent = "Record WebM";
      return;
    }
    if (!window.MediaRecorder) {
      showAudioError("This browser cannot record WebM.");
      return;
    }
    if (!started || audio.ended) beginPlayback(true);
    else if (audio.paused) audio.play().catch(() => {});

    const stream = canvas.captureStream(30);
    let mixed = stream;
    if (typeof audio.captureStream === "function") {
      const audioStream = audio.captureStream();
      mixed = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);
    }
    recordedChunks = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    recorder = new MediaRecorder(mixed, { mimeType: mime });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) recordedChunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "knotwake-the-line-still-holds-preview.webm";
      a.click();
      btnRec.textContent = "Record WebM";
    };
    recorder.start();
    btnRec.textContent = "Stop & save";
  });

  function syncDuration() {
    if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
      scrub.max = String(audio.duration);
      scrubDur.textContent = fmt(audio.duration);
    }
  }

  audio.addEventListener("loadedmetadata", () => {
    syncDuration();
    applySeek();
  });
  audio.addEventListener("durationchange", syncDuration);
  audio.addEventListener("canplay", applySeek);
  audio.addEventListener("seeked", () => {
    if (desiredTime == null || Math.abs((audio.currentTime || 0) - desiredTime) < 0.5) {
      seekPending = false;
    } else {
      applySeek();
    }
  });
  audio.addEventListener("error", () => {
    if (!audio.src) return;
    showAudioError("Missing combined-v1-TEMP-audio.mp3 next to this file.");
  });

  // Blob URL so scrub works even when the static server has no byte ranges.
  // file:// falls back to the mp3 path, which local players can seek.
  function prepareAudio() {
    fetch(AUDIO_FILE).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.blob();
    }).then((blob) => {
      audio.src = URL.createObjectURL(blob);
      if (pendingStart !== null) {
        const reset = pendingStart;
        pendingStart = null;
        actuallyStart(reset);
      } else {
        applySeek();
      }
    }).catch(() => {
      audio.src = AUDIO_FILE;
      if (pendingStart !== null) {
        const reset = pendingStart;
        pendingStart = null;
        actuallyStart(reset);
      }
    });
  }
  prepareAudio();
  audio.addEventListener("ended", () => {
    statusEl.textContent = "THE LINE HOLDS";
    btnPlay.textContent = "Play";
    if (EMBED && window.parent !== window) {
      window.parent.postMessage({ type: "knotwake-film-ended" }, "*");
    }
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
