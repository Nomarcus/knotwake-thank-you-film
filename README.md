# Knotwake — Thank You for Connecting (HTML film)

A reinvented Matrix-style network film for the Knotwake secret ending credit song.

## Watch / listen

After GitHub Pages is enabled, open:

**https://nomarcus.github.io/knotwake-thank-you-film/**

Or open `index.html` locally (needs `thank-you-for-connecting.mp3` beside it).

## Controls

- **Start / Play film** — play audio + lyric-synced visuals
- **Fullscreen** — cinema mode
- **Record WebM** — export a video file from the browser

## Source track

Suno: https://suno.com/s/qdHfXgNMSpFGEa74  
(Thank You for Connecting — Portal Calm V5)

## Files

- `index.html` — shell UI
- `film.js` — canvas network/Matrix engine + lyric timing
- `thank-you-for-connecting.mp3` — audio

## Combined preview — The Line Still Holds

Review cut for Saturday 3 Oct 2026 (Europe/Stockholm), for a Monday 5 Oct public publish after Marcus looks at it. This is not the live ending. `index.html`, `film.js`, `thank-you-for-connecting.mp3`, and `day-20-v9` / `v10` / `v11` are unchanged.

**Local.** Open `combined-v1.html` in a browser. Keep `combined-v1-TEMP-audio.mp3` in the same folder. If the browser blocks audio from a file path, serve the folder:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765/combined-v1.html`.

**GitHub Pages.** When this preview is on the branch Pages serves, the path is:

https://nomarcus.github.io/knotwake-thank-you-film/combined-v1.html

Until then, Pages still serves `main`, which does not include this cut. Use the local file for Saturday review.

**Controls.** Start, Play / Pause, Restart, Fullscreen, Record WebM, and a scrub bar. Space plays and pauses. Arrow keys jump five seconds.

**Audio.** `combined-v1-TEMP-audio.mp3` is a temporary instrumental so the picture can be reviewed without another song's words underneath. It is not the Monday track. Grok will swap in a fresh Suno track before the Monday 5 Oct publish and retune the caption times in `combined-v1.js` (`beats`). Do not use the phrase YOU BUILT IT. This cut does not.
