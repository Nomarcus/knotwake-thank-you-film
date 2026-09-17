(() => {
  const lyrics = [
    { t: 0.0, label: "SYSTEM", text: "" },
    { t: 4.0, label: "VERSE 1", text: "Congratulations, you reached the middle" },
    { t: 8.2, label: "VERSE 1", text: "Five little tries and a very small riddle" },
    { t: 12.4, label: "VERSE 1", text: "You followed the circles, you waited your turn" },
    { t: 16.6, label: "VERSE 1", text: "There's just one minor thing you still have to learn" },
    { t: 21.5, label: "PRE-CHORUS", text: "We counted the signals\nWe watched them arrive" },
    { t: 26.0, label: "PRE-CHORUS", text: "It's funny how quickly\nA dead thing looks alive" },
    { t: 31.0, label: "CHORUS", text: "Thank you for connecting\nThank you for the line" },
    { t: 36.5, label: "CHORUS", text: "You thought you found the network\nBut you built it one node at a time" },
    { t: 43.0, label: "CHORUS", text: "Thank you for connecting\nEverything went right" },
    { t: 48.5, label: "CHORUS", text: "We only needed someone\nTo pass the signal through the night" },
    { t: 56.0, label: "VERSE 2", text: "There wasn't a system asleep underground" },
    { t: 60.5, label: "VERSE 2", text: "No secret machine waiting to be found" },
    { t: 65.0, label: "VERSE 2", text: "No master computer, no grand design" },
    { t: 69.5, label: "VERSE 2", text: "Just one little message passed down the line" },
    { t: 75.0, label: "PRE-CHORUS", text: "You gave it to someone\nThey gave it away" },
    { t: 80.0, label: "PRE-CHORUS", text: "A beautiful accident\nPerforming exactly as planned today" },
    { t: 87.0, label: "CHORUS", text: "Thank you for connecting\nThank you for the line" },
    { t: 92.5, label: "CHORUS", text: "You thought you found the network\nBut you built it one node at a time" },
    { t: 99.0, label: "CHORUS", text: "Thank you for connecting\nThe test is complete" },
    { t: 104.5, label: "CHORUS", text: "Humanity remains surprisingly\nGood at making strangers meet" },
    { t: 113.0, label: "BRIDGE", text: "Machines replicate when somebody tells them\nPeople are stranger than that" },
    { t: 121.0, label: "BRIDGE", text: "You carried the signal because you were curious\nWe did not calculate that" },
    { t: 130.0, label: "ASIDE", text: "Well…\nnot accurately." },
    { t: 136.0, label: "FINAL CHORUS", text: "Thank you for connecting\nYour node is doing fine" },
    { t: 142.0, label: "FINAL CHORUS", text: "There never was a network\nUntil you drew the final line" },
    { t: 149.0, label: "FINAL CHORUS", text: "Thank you for connecting\nThere's nothing left to do" },
    { t: 155.0, label: "FINAL CHORUS", text: "Except perhaps one tiny thing…" },
    { t: 162.0, label: "OUTRO", text: "A successor node is ready\nWe made this one for you" },
    { t: 170.0, label: "CORRECTION", text: "…actually, that's incorrect.\nIt's not for you." },
    { t: 178.0, label: "CORRECTION", text: "Give it to someone who notices things." },
    { t: 186.0, label: "SIGNAL", text: "•   •   •   •" },
    { t: 192.0, label: "SYSTEM", text: "Connection closed." },
    { t: 196.0, label: "", text: "" }
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
  let motifFlash = 0;
  let lastLyricIdx = -1;
  let recorder = null;
  let recordedChunks = [];
  let lastTs = performance.now();

  const glyphs = "01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHKLMNPRSTVWXYZ░▒▓¤※◆◇".split("");

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colW = 18;
    const n = Math.ceil(W / colW);
    columns = Array.from({ length: n }, (_, i) => ({
      x: i * colW,
      y: Math.random() * H,
      speed: 40 + Math.random() * 90,
      len: 8 + Math.floor(Math.random() * 18),
      chars: Array.from({ length: 24 }, () => glyphs[(Math.random() * glyphs.length) | 0])
    }));
    if (!nodes.length) {
      nodes = Array.from({ length: 28 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        awake: Math.random() < 0.2
      }));
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
      life: 0, max: 0.9 + Math.random() * 0.6
    });
  }

  function draw(dt, t, duration) {
    ctx.fillStyle = "rgba(2,8,5,0.28)";
    ctx.fillRect(0, 0, W, H);

    const progress = duration ? Math.min(1, t / duration) : 0;
    const dens = 0.35 + progress * 0.55;
    const warmth = Math.min(1, Math.max(0, (progress - 0.35) * 1.4));

    ctx.font = "13px monospace";
    for (const col of columns) {
      col.y += col.speed * dt * (0.7 + dens * 0.5);
      if (col.y - col.len * 16 > H) {
        col.y = -Math.random() * H * 0.3;
        col.speed = 40 + Math.random() * 90;
      }
      for (let i = 0; i < col.len; i++) {
        const yy = col.y - i * 16;
        if (yy < -20 || yy > H + 20) continue;
        if (Math.random() < 0.02) {
          col.chars[i % col.chars.length] = glyphs[(Math.random() * glyphs.length) | 0];
        }
        const head = i === 0;
        const a = head ? 0.95 : 0.15 + (1 - i / col.len) * 0.45;
        ctx.fillStyle = head
          ? `rgba(200,250,204,${a})`
          : `rgba(${30 + warmth * 40},${120 + warmth * 80},${70 + warmth * 40},${a * dens})`;
        ctx.fillText(col.chars[i % col.chars.length], col.x, yy);
      }
    }

    for (const n of nodes) {
      n.phase += dt * (0.8 + dens);
      const glow = n.awake ? 0.55 + 0.45 * Math.sin(n.phase) : 0.12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (n.awake ? 1.5 : 0), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57,255,136,${glow})`;
      ctx.fill();
      if (n.awake && Math.random() < 0.01 * dens) {
        const other = nodes[(Math.random() * nodes.length) | 0];
        if (other.awake) spawnPulse(n, other);
      }
    }

    pulses = pulses.filter((p) => {
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) return false;
      const x = p.x + (p.tx - p.x) * k;
      const y = p.y + (p.ty - p.y) * k;
      ctx.strokeStyle = `rgba(200,250,204,${1 - k})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,250,204,${1 - k})`;
      ctx.fill();
      return true;
    });

    if (motifFlash > 0) {
      motifFlash -= dt;
      const cx = W / 2;
      const cy = H * 0.22;
      for (let i = 0; i < 4; i++) {
        const x = cx + (i - 1.5) * 46;
        const on = motifFlash > (3 - i) * 0.08;
        ctx.beginPath();
        ctx.arc(x, cy, on ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = on ? "rgba(200,250,204,0.95)" : "rgba(57,255,136,0.25)";
        ctx.fill();
      }
    }
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    const t = audio.currentTime || 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 200;
    draw(dt, t, duration);

    const idx = lyricIndexAt(t);
    if (idx !== lastLyricIdx) {
      lastLyricIdx = idx;
      const L = lyrics[idx];
      lyricLabelEl.textContent = L.label || "";
      lyricLineEl.textContent = L.text || "";
      lyricLineEl.classList.toggle("dim", !L.text);
      if (L.label === "CHORUS" || L.label === "FINAL CHORUS") {
        wakeNodes(0.35);
        motifFlash = 0.55;
      }
      if (L.label === "SIGNAL") motifFlash = 1.2;
      if (L.label === "SYSTEM" && (L.text || "").includes("closed")) {
        nodes.forEach((n) => { n.awake = false; });
      }
      if (idx > 2) wakeNodes(0.08);
    }

    clockEl.textContent = fmt(t);
    barEl.style.width = duration ? ((t / duration) * 100) + "%" : "0%";
    statusEl.textContent = audio.paused ? (t > 0 ? "PAUSED" : "STANDBY") : "TRANSMITTING";
    requestAnimationFrame(frame);
  }

  function startFilm() {
    boot.classList.add("hidden");
    audio.currentTime = 0;
    lastLyricIdx = -1;
    audio.play().catch((e) => {
      boot.classList.remove("hidden");
      bootErr.hidden = false;
      bootErr.textContent = "Browser blocked audio — press Start again.";
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
    bootMsg.textContent = "Audio ready. Press Start for the film.";
    btnStart.disabled = false;
  });
  audio.addEventListener("error", () => {
    bootErr.hidden = false;
    bootErr.textContent = "Missing thank-you-for-connecting.mp3 next to this HTML file.";
    bootMsg.textContent = "Waiting for audio file…";
  });
  audio.addEventListener("ended", () => {
    statusEl.textContent = "CONNECTION CLOSED";
    motifFlash = 1.5;
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
