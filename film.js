(() => {
  // Timings aligned to Whisper transcription of thank-you-for-connecting.mp3 (~212s)
  // Official lyric wording kept; times from speech alignment.
  const lyrics = [
    { t: 0.0, label: "BOOT", text: "", mood: "void" },
    { t: 5.0, label: "BOOT", text: "establishing link…", mood: "void" },
    { t: 9.3, label: "VERSE 1", text: "Congratulations, you reached the middle", mood: "cold" },
    { t: 13.2, label: "VERSE 1", text: "Five little tries and a very small riddle", mood: "cold" },
    { t: 17.6, label: "VERSE 1", text: "You followed the circles, you waited your turn", mood: "cold" },
    { t: 23.2, label: "VERSE 1", text: "There's just one minor thing you still have to learn", mood: "cold" },
    { t: 26.6, label: "PRE-CHORUS", text: "We counted the signals\nWe watched them arrive", mood: "rise" },
    { t: 34.0, label: "PRE-CHORUS", text: "It's funny how quickly\nA dead thing looks alive", mood: "rise" },
    { t: 42.9, label: "CHORUS", text: "Thank you for connecting\nThank you for the line", mood: "bloom" },
    { t: 46.9, label: "CHORUS", text: "You thought you found the network\nBut you built it one node at a time", mood: "bloom" },
    { t: 51.5, label: "CHORUS", text: "Thank you for connecting\nEverything went right", mood: "bloom" },
    { t: 55.4, label: "CHORUS", text: "We only needed someone\nTo pass the signal through the night", mood: "bloom" },
    { t: 62.0, label: "INTERLUDE", text: "", mood: "drift" },
    { t: 69.5, label: "VERSE 2", text: "There wasn't a system asleep underground", mood: "mystery" },
    { t: 74.0, label: "VERSE 2", text: "No secret machine waiting to be found", mood: "mystery" },
    { t: 78.2, label: "VERSE 2", text: "No master computer, no grand design", mood: "mystery" },
    { t: 83.0, label: "VERSE 2", text: "Just one little message passed down the line", mood: "mystery" },
    { t: 88.5, label: "PRE-CHORUS", text: "You gave it to someone\nThey gave it away", mood: "rise" },
    { t: 95.0, label: "PRE-CHORUS", text: "A beautiful accident\nPerforming exactly as planned today", mood: "rise" },
    { t: 103.6, label: "CHORUS", text: "Thank you for connecting\nThank you for the line", mood: "bloom" },
    { t: 108.0, label: "CHORUS", text: "You thought you found the network\nBut you built it one node at a time", mood: "bloom" },
    { t: 113.0, label: "CHORUS", text: "Thank you for connecting\nThe test is complete", mood: "bloom" },
    { t: 117.1, label: "CHORUS", text: "Humanity remains surprisingly\nGood at making strangers meet", mood: "bloom" },
    { t: 123.6, label: "BRIDGE", text: "Machines replicate when somebody tells them\nPeople are stranger than that", mood: "glitch" },
    { t: 131.8, label: "BRIDGE", text: "You carried the signal because you were curious\nWe did not calculate that", mood: "glitch" },
    { t: 139.8, label: "ASIDE", text: "Well…\nnot accurately.", mood: "aside" },
    { t: 143.3, label: "FINAL", text: "Thank you for connecting\nYour node is doing fine", mood: "warm" },
    { t: 148.0, label: "FINAL", text: "There never was a network\nUntil you drew the final line", mood: "warm" },
    { t: 152.3, label: "FINAL", text: "Thank you for connecting\nThere's nothing left to do", mood: "warm" },
    { t: 156.4, label: "FINAL", text: "Except perhaps one tiny thing…", mood: "warm" },
    { t: 162.1, label: "OUTRO", text: "A successor node is ready", mood: "thin" },
    { t: 167.3, label: "OUTRO", text: "We made this one for you", mood: "thin" },
    { t: 170.6, label: "CORRECTION", text: "Actually, that's incorrect.\nIt's not for you.", mood: "aside" },
    { t: 178.2, label: "CORRECTION", text: "Give it to someone who notices things.", mood: "aside" },
    { t: 187.9, label: "SIGNAL", text: "•    •    •    •", mood: "signal" },
    { t: 197.4, label: "SYSTEM", text: "thank you, we take it from here!", mood: "void" },
    { t: 203.5, label: "", text: "", mood: "void" }
  ];

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const audio = document.getElementById("audio");
  const lyricLineEl = document.getElementById("lyricLine");
  const lyricLabelEl = document.getElementById("lyricLabel");
  const clockEl = document.getElementById("clock");
  const statusEl = document.getElementById("status");
  const barEl = document.getElementById("bar");
  const boot = document.getElementById("boot");
  const bootMsg = document.getElementById("bootMsg");
  const bootErr = document.getElementById("bootErr");
  const btnStart = document.getElementById("btnStart");
  const btnPlay = document.getElementById("btnPlay");
  const btnFs = document.getElementById("btnFs");
  const btnRec = document.getElementById("btnRec");
  const stage = document.getElementById("stage");

  let W = 0, H = 0, dpr = 1;
  let columns = [];
  let nodes = [];
  let pulses = [];
  let sparks = [];
  let rings = [];
  let motifFlash = 0;
  let lastLyricIdx = -1;
  let lyricAnim = 0;
  let mood = "void";
  let recorder = null;
  let recordedChunks = [];
  let lastTs = performance.now();
  let shake = 0;

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
    signal: { dens: 0.2, warmth: 0.3, link: 0.002, rain: 0.25, hue: 145 }
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
      nodes = Array.from({ length: 42 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.2 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
        awake: Math.random() < 0.12,
        orbit: 20 + Math.random() * 80,
        ox: 0,
        oy: 0
      }));
      nodes.forEach((n) => { n.ox = n.x; n.oy = n.y; });
    }
  }

  function fmt(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function lyricIndexAt(t) {
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].t <= t) idx = i;
      else break;
    }
    return idx;
  }

  function wakeNodes(amount) {
    nodes.forEach((n) => {
      if (Math.random() < amount) n.awake = true;
    });
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

  function draw(dt, t, duration) {
    const pal = moodPalette[mood] || moodPalette.void;
    const progress = duration ? Math.min(1, t / duration) : 0;

    // soft clear with trail — longer trails in void/thin, shorter in bloom
    const trail = mood === "bloom" || mood === "warm" ? 0.22 : mood === "glitch" ? 0.35 : 0.18;
    ctx.fillStyle = `rgba(2,8,5,${trail})`;
    ctx.fillRect(0, 0, W, H);

    const doShake = shake > 0;
    if (doShake) {
      shake = Math.max(0, shake - dt);
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    // background nebula wash
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    g.addColorStop(0, `rgba(${20 + pal.warmth * 60},${40 + pal.warmth * 90},${30 + pal.warmth * 40},${0.08 + pal.warmth * 0.12})`);
    g.addColorStop(1, "rgba(2,8,5,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // rain
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
        if (mood === "glitch" && Math.random() < 0.01) {
          ctx.fillStyle = `rgba(180,255,120,${a})`;
          ctx.fillText(col.chars[i % col.chars.length], col.x + (Math.random() * 6 - 3), yy);
        } else {
          ctx.fillText(col.chars[i % col.chars.length], col.x, yy);
        }
      }
    }

    // nodes drift gently
    for (const n of nodes) {
      n.phase += dt * (0.6 + pal.dens);
      n.x = n.ox + Math.sin(n.phase * 0.7) * 12;
      n.y = n.oy + Math.cos(n.phase * 0.55) * 10;
      const glow = n.awake ? 0.5 + 0.5 * Math.sin(n.phase * 1.4) : 0.08 + progress * 0.05;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (n.awake ? 1.8 : 0), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57,255,136,${glow})`;
      ctx.fill();
      if (n.awake) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6 + Math.sin(n.phase) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(57,255,136,${0.15 + 0.1 * Math.sin(n.phase)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (n.awake && Math.random() < pal.link) {
        const other = nodes[(Math.random() * nodes.length) | 0];
        if (other.awake) spawnPulse(n, other);
      }
    }

    // pulses
    pulses = pulses.filter((p) => {
      p.life += dt;
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

    // sparks
    sparks = sparks.filter((s) => {
      s.life += dt;
      const k = s.life / s.max;
      if (k >= 1) return false;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 30 * dt;
      ctx.fillStyle = `rgba(200,255,210,${1 - k})`;
      ctx.fillRect(s.x, s.y, 2, 2);
      return true;
    });

    // rings
    rings = rings.filter((r) => {
      r.life += dt;
      const k = r.life / r.max;
      if (k >= 1) return false;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r + k * 90, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(57,255,136,${(1 - k) * 0.45})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return true;
    });

    // four-note motif
    if (motifFlash > 0) {
      motifFlash -= dt;
      const cx = W / 2;
      const cy = H * 0.18;
      for (let i = 0; i < 4; i++) {
        const x = cx + (i - 1.5) * 52;
        const on = motifFlash > (3 - i) * 0.09;
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

    // center glyph lattice during bloom
    if (pal.warmth > 0.55) {
      ctx.save();
      ctx.globalAlpha = 0.08 + (pal.warmth - 0.55) * 0.2;
      ctx.strokeStyle = "#39ff88";
      ctx.lineWidth = 1;
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + t * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * 160, cy + Math.sin(ang) * 100);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (doShake) ctx.restore();
  }

  function applyLyric(L) {
    mood = L.mood || "cold";
    lyricLabelEl.textContent = L.label || "";
    lyricLineEl.textContent = L.text || "";
    lyricLineEl.classList.toggle("dim", !L.text);
    lyricLineEl.classList.remove("pop");
    void lyricLineEl.offsetWidth;
    if (L.text) lyricLineEl.classList.add("pop");

    if (mood === "bloom" || mood === "warm") {
      wakeNodes(0.45);
      motifFlash = 0.65;
      burst(W / 2, H * 0.42, 26);
      addRing(W / 2, H * 0.42);
    } else if (mood === "rise") {
      wakeNodes(0.22);
      motifFlash = 0.35;
    } else if (mood === "glitch") {
      wakeNodes(0.3);
      shake = 0.25;
      burst(W * 0.5, H * 0.5, 14);
    } else if (mood === "signal") {
      motifFlash = 1.4;
      nodes.forEach((n, i) => { n.awake = i % 7 === 0; });
    } else if (mood === "void" && (L.text || "").includes("take it from here")) {
      nodes.forEach((n) => { n.awake = false; });
      motifFlash = 0.8;
    } else if (mood === "aside") {
      wakeNodes(0.1);
    } else if (mood === "cold" || mood === "mystery") {
      wakeNodes(0.08);
    }
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    const t = audio.currentTime || 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 212;
    draw(dt, t, duration);

    const idx = lyricIndexAt(t);
    if (idx !== lastLyricIdx) {
      lastLyricIdx = idx;
      applyLyric(lyrics[idx]);
    }

    clockEl.textContent = fmt(t);
    barEl.style.width = duration ? ((t / duration) * 100) + "%" : "0%";
    statusEl.textContent = audio.paused ? (t > 0 ? "PAUSED" : "STANDBY") : mood.toUpperCase();
    requestAnimationFrame(frame);
  }

  function startFilm() {
    boot.classList.add("hidden");
    audio.currentTime = 0;
    lastLyricIdx = -1;
    mood = "void";
    nodes.forEach((n) => { n.awake = Math.random() < 0.1; });
    audio.play().catch((e) => {
      boot.classList.remove("hidden");
      bootErr.hidden = false;
      bootErr.textContent = "Browser blocked audio — press Connect the nodes again.";
      console.error(e);
    });
    btnPlay.textContent = "Restart";
  }

  btnStart.addEventListener("click", startFilm);
  btnPlay.addEventListener("click", startFilm);
  btnFs.addEventListener("click", () => {
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  btnRec.addEventListener("click", () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      btnRec.textContent = "Record WebM";
      return;
    }
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
      if (e.data.size) recordedChunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "knotwake-thank-you-for-connecting.webm";
      a.click();
    };
    if (audio.paused) startFilm();
    recorder.start();
    btnRec.textContent = "Stop & save";
  });

  audio.addEventListener("canplaythrough", () => {
    bootMsg.textContent = "";
    btnStart.disabled = false;
  });
  audio.addEventListener("error", () => {
    bootErr.hidden = false;
    bootErr.textContent = "Missing thank-you-for-connecting.mp3 next to this HTML file.";
    bootMsg.textContent = "";
  });
  audio.addEventListener("ended", () => {
    statusEl.textContent = "WE TAKE IT FROM HERE";
    motifFlash = 1.6;
    mood = "void";
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
