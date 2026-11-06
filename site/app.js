/* Layer website prototype: the hero (the 3D station turns to face you, its glass showing the kiosk's own S5, the push
   into its screen, then a liquid-chrome try-on), How it works (the kiosk's real screens and its real beats between them,
   playing themselves on their own clock; a click jumps a step), one living flow of liquid metal behind the translucent
   page, the stitched threads, the header, the pager that lands every scene, and the pilot sheet. No opening: the page is
   in at once. three.js (bundled) for the station; nothing else. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // linear with short eased ends (12% each): the hero's camera follows the scroll at one even rate, with no in-out of
  // its own stacked on the page's motion (peak slope 1.14, where the in-out cubic it replaces peaked at 3)
  const lin = (t) => { t = clamp(t, 0, 1); const e = .12, k = 2 * e * (1 - e); return t < e ? t * t / k : t > 1 - e ? 1 - (1 - t) * (1 - t) / k : (t - e / 2) / (1 - e); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the pager: on a desktop with a mouse, each wheel notch or paging key lands the next beat, at any window height (a
  // scene taller than the window gets a second stop at its bottom). Trackpads, touch screens and phones scroll natively
  const pagerOn = matchMedia('(min-width: 861px) and (pointer: fine)');
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  /* ONE SCROLL WRITER: every scroll the page makes itself goes through setY, instantly, and says why. A move the reader
     asked for (a notch, a key, a link, a landing) is theirs ('glide'); a history or resize jump ('hash') is not: the band
     and the threads read only the reader's own scrolling (`userDy`) */
  let progSum = 0;
  const setY = (y, why = 'glide') => {
    const y0 = scrollY;
    window.__layerWhy = why;                                     // (read by the review tools; a string, nothing more)
    scrollTo({ top: y, behavior: 'instant' });
    window.__layerWhy = '';
    if (why !== 'glide') progSum += scrollY - y0;
  };
  const mover = () => ({ y: scrollY, p: progSum });
  const userDy = (r) => { const d = scrollY - r.y - (progSum - r.p); r.y = scrollY; r.p = progSum; return d; };
  /* ONE FOLLOWER: every move the page makes (a notch, a key, a link, a landing) aims at a target and one critically
     damped spring follows it. It moves on the next frame, keeps its speed through every new target (another notch bends
     the motion, never brakes it), turns back at once, and lets go the moment anything else moves the page (the
     scrollbar, find, a touch, a trackpad). `lim` caps its speed by where the page is (the hero's push) */
  // (pend: notches waiting their turn past the two-beat cap; ps: the beats they step through)
  const FW = { on: false, py: 0, pv: 0, tgt: 0, w: 13, at: 0, wrote: 0, why: 'glide', lim: null, raf: 0, first: false, anchor: false, adopt: 0, pend: 0, ps: null, firstDt: 1 / 60 };
  const maxY = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  function aim(y, o = {}) {
    y = clamp(Math.round(y), 0, maxY());
    // a turn (the new target behind the way it is going) starts back at once: its speed the old way is dropped, and it
    // sets off the new way on the next frame (a new target the same way keeps its speed: it bends, never brakes)
    let kick = false;
    let turn = false;
    if (FW.on && FW.pv && Math.sign(y - FW.py) !== Math.sign(FW.pv)) { FW.pv = .25 * (o.w || 13) * (y - FW.py); FW.first = true; kick = true; turn = true; }
    FW.why = o.why || 'glide'; FW.lim = o.lim || null; FW.w = o.w || 13; FW.anchor = !!o.anchor; FW.tgt = y;
    FW.adopt = o.anchor ? performance.now() + 600 : 0;
    if (reduced) { stopFollow(); if (Math.abs(scrollY - y) > .5) setY(y, FW.why); return; }
    if (!FW.on) {
      if (Math.abs(scrollY - y) < .5) return;
      FW.on = true; FW.py = scrollY; FW.pv = 0; FW.wrote = scrollY; FW.first = true; FW.raf = requestAnimationFrame(follow); kick = true;
    }
    // a move the reader asked for (a notch, a key, a turn) takes its first step in this very event, a frame sooner than
    // the next frame's callback would (the page's own moves start from a frame callback anyway)
    // (a turn's first step is a token 3 ms of the move: it turns the page now, at speed, and the next frame carries on
    // from it, so a frame never holds two full steps of a fast turn: no zoom spike in the hero's push, however the frames
    // happen to fall. A start from rest takes a whole frame's step: it is slow, so it can't double up)
    if (kick && FW.why === 'glide') { cancelAnimationFrame(FW.raf); FW.firstDt = turn ? .003 : 1 / 60; follow(performance.now()); }
  }
  function stopFollow() { FW.pend = 0; if (!FW.on) return; FW.on = false; FW.pv = 0; FW.anchor = false; cancelAnimationFrame(FW.raf); }
  const nearest = (ps, y) => { let k = 0; for (let j = 1; j < ps.length; j++) if (Math.abs(ps[j] - y) < Math.abs(ps[k] - y)) k = j; return k; };
  function follow(now) {
    if (!FW.on) return;
    if (Math.abs(scrollY - FW.wrote) > 2) {
      // something else moved the page: it is theirs now. Only a link's move, in its first 600 ms, carries on from where the
      // page went (a trackpad's momentum or a smooth wheel step still running from before the click)
      if (now > FW.adopt) { stopFollow(); return; }
      FW.py = scrollY;
    }
    const dt = Math.min(.05, FW.first ? FW.firstDt : Math.max(.001, (now - FW.at) / 1000));   // capped: a tab coming back never jumps
    FW.firstDt = 1 / 60;
    FW.first = false; FW.at = now;
    const w = FW.w, x = FW.py - FW.tgt, e = Math.exp(-w * dt), j = (FW.pv + w * x) * dt;
    let py = FW.tgt + (x + j) * e, pv = (FW.pv - w * j) * e;
    // (read where it is and where this step would take it: a fast move never crosses into a speed-limited stretch at speed)
    const lim = FW.lim ? Math.min(FW.lim(FW.py, FW.tgt), FW.lim(py, FW.tgt)) : Infinity;
    if (Math.abs(pv) > lim) { pv = Math.sign(pv) * lim; py = FW.py + pv * dt; if ((FW.tgt - py) * (FW.tgt - FW.py) < 0) py = FW.tgt; }
    let done = Math.abs(py - FW.tgt) < .5 && Math.abs(pv) < 8;
    FW.py = py; FW.pv = pv;
    // a queued notch takes its turn once the page is within two beats of where it would go: the target moves on, the
    // speed carries (no stop at the beat in between)
    if (FW.pend && FW.ps) {
      const d = Math.sign(FW.pend), ps = FW.ps, ti = nearest(ps, FW.tgt);
      if ((ti - nearest(ps, py)) * d < 2 && ps[ti + d] !== undefined) { FW.pend -= d; FW.tgt = ps[ti + d]; done = false; }
      else if (ps[ti + d] === undefined) FW.pend = 0;
    }
    setY(done ? FW.tgt : py, FW.why); FW.wrote = scrollY;
    if (done) { FW.on = false; FW.anchor = false; }
    if (FW.on) FW.raf = requestAnimationFrame(follow);
    // what the scroll drives is drawn from this write, in this frame (the loops that ran earlier in the frame skip it while
    // the follower moves), so the camera never trails the page by a frame
    if (heroOn) layoutHero(now);
  }
  const go = (top) => aim(top, { lim: (y) => heroLim(y) });

  /* ───────────── START: no opening. The page is in at once, the band's lockup in its place, the hero showing the
     station's still until the live one is up. Everything heavy (the 3D station, the try-on, the close-up wall, the clip,
     the scenes below, the metal's shader) is set up from the first frames on: `setup` says it may start, `prepped` that
     it is done ───────────── */
  let startSetup, setupDone;
  const veiled = false;
  const opened = Promise.resolve();
  const setup = new Promise((ok) => { startSetup = ok; });
  const prepped = new Promise((ok) => { setupDone = ok; });
  startSetup();

  // shared state (the hero, how it works and the metal all read it)
  let heroP = 0, heroA = 0, heroOn = true, heroScale = 1, phase = '', howAt = -1, yawKick = 0;
  // lite: set when a frame of the 3D station is heavy for this GPU (integrated graphics, a laptop on battery). The station
  // then draws at 1x and holds still while it waits, and the metal holds still while the page scrolls
  let lite = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('lite');   // ?lite forces it, for review (local only)
  // phones and tablets: 1.5x at most (their screens are dense, their GPUs small, and the station is never still long
  // enough for the difference to show)
  const coarse = matchMedia('(pointer: coarse)').matches;
  const stationDpr = () => (lite ? 1 : Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  function goLite() {
    if (lite) return;
    lite = true; document.documentElement.classList.add('lite');
    if (station) { station.size(pageW(), innerHeight, 1); quadDirty = true; }
  }
  if (lite) document.documentElement.classList.add('lite');

  /* ───────────── HERO: the station alone in the hall, turned away; scroll turns it to you and pushes in, square on to its screen ───────────── */
  const hero = $('#hero'), scene = $('#scene'), c3d = $('#station3d'), heroScreen = $('#screen'), s5vid = $('#s5vid');
  const RIG = { x: .5777, y: .228, w: .1194, h: .7191 };       // the fallback still of the 3D station in hero-plate.jpg
  let SCREEN = { x: .6014, y: .2333, w: .0701, h: .2216 };     // its screen in the plate (the live model measures its own)
  const TURN = -28;                                             // degrees the station starts turned away
  let station = null, scrW = 0, scrH = 0, s5tex = null, s5at = -1, swayFrom = 0, swayOn = true;
  // until the live station is up, its still stands in: the same model at the same opening pose (hero-station.webp), so
  // the whole kiosk is in the hall from the first frame. flatOn: the square-on still has taken over instead (no WebGL,
  // or the push began before the live station was up)
  const heroStill = $('#heroStill'), kioskFlat = $('#kioskFlat');
  let flatOn = false;
  // the station's glass shows the kiosk's S5 (s5-loop.mp4) as a texture on the model: true perspective, mipmapped like the
  // rest of the model at any distance, and in the wet floor's reflection. Its poster stands in until the clip has a frame
  function screenTexture(st) {
    const t = st.screenTexture();
    const still = new Image();
    still.onload = () => { if (!t.image) { t.image = still; t.needsUpdate = true; if (station) station.render(); } };
    still.src = s5vid.poster;
    return t;
  }
  function feedScreen() {                                        // a new frame goes up only when the clip has moved on
    if (!s5tex || s5vid.readyState < 2 || s5vid.currentTime === s5at) return false;
    s5at = s5vid.currentTime; s5tex.image = s5vid; s5tex.needsUpdate = true;
    return true;
  }
  // a DOM box onto any four corners (top-left, top-right, bottom-right, bottom-left): a 2D homography as matrix3d
  function homography(w, h, q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
    const g = (dx3 * dy2 - dx2 * dy3) / den, k = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
    // flat on to the camera there is no perspective left: a 2D matrix keeps the text crisp
    if (Math.abs(g * w) < 1e-5 && Math.abs(k * h) < 1e-5) return `matrix(${a / w},${d / w},${b / h},${e / h},${x0},${y0})`;
    return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${k / h},0,0,1,0,${x0},${y0},0,1)`;
  }
  // the stage's own width: the page without its scrollbar (innerWidth counts the bar, and the 3D frame would then sit a
  // few px off the canvas it is shown in, which on a square-on screen shows as a thick bezel on one side, none on the
  // other). Read from the body: the root's clientWidth can count the scrollbar's kept gutter as page, and a station built
  // then is squeezed into a narrower canvas, its screen off its glass
  const pageW = () => document.body.clientWidth;
  let sizedW = 0;                                              // the width the station and its screen were last built for
  function sizeScreen() {                                        // the screen element is its own close-up size
    quadDirty = true;
    if (!M.vw) measure();
    const vw = pageW(), vh = M.heroStage || innerHeight, narrow = vw < 861, band = narrow ? 58 : 68, foot = narrow ? 76 : 0;
    const aspect = (SCREEN.w * 1536) / (SCREEN.h * 864);
    let h = (vh - band - foot) * .9, w = h * aspect;
    if (w > vw * .94) { w = vw * .94; h = w / aspect; }
    scrW = w; scrH = h; heroScreen.style.width = `${w}px`; heroScreen.style.height = `${h}px`; sizedW = vw;
  }
  // the page's fixed geometry, read once per resize: the scroll path then reads nothing from layout, so no frame of
  // the push ever waits on a forced style or layout pass
  // (the pinned stages are 100svh: a phone's toolbar coming or going changes innerHeight but not them, so the hero and How
  // are measured against their stages, and a toolbar never moves the camera or the film)
  const M = { vw: 0, vh: 0, heroTop: 0, heroH: 0, sw: 0, sh: 0, howTop: 0, howH: 0, heroStage: 0, howStage: 0 };
  // act one's share of the hero's scroll (the turn and the push). A phone's hero is longer (360vh, style.css) and its act
  // one a larger share of it, so one ordinary swipe covers a third to a half of the push rather than all of it; the
  // camera stays a pure function of the scroll. The try-on's beats (act two) follow it
  const phoneHero = matchMedia('(max-width: 860px)');          // (the same test as style.css's 360vh hero)
  const act = () => (phoneHero.matches ? .6 : .42);
  function measure() {
    M.vw = pageW(); M.vh = innerHeight;
    M.heroStage = $('.hero__stage').offsetHeight || innerHeight;
    M.heroTop = hero.getBoundingClientRect().top + scrollY; M.heroH = hero.offsetHeight;
    M.sw = scene.offsetWidth; M.sh = scene.offsetHeight;
    heroMid.style.setProperty('--at', act());                  // (the hero's middle mark: where act one ends)
  }
  const cue = $('.hero__cue'), say = $('.hero__say'), stageEl = $('.hero__stage'), heroMid = $$('.snap', hero)[1];
  let cueO = '', sayO = '', sayGone = null, stageO = '', quadDirty = true;                             // the live screen needs placing (new station, new size)
  function layoutHero(now = performance.now()) {
    if (!M.vw) measure();
    const vw = M.vw, vh = M.heroStage;
    const p = clamp((scrollY - M.heroTop) / (M.heroH - vh), 0, 1);
    const a = clamp(p / act(), 0, 1);                          // act one: the turn and the push; act two (p > ACT) is the try-on
    const sw = M.sw, sh = M.sh, narrow = vw < 861;
    const scx = (SCREEN.x + SCREEN.w / 2) * sw, scy = (SCREEN.y + SCREEN.h / 2) * sh;
    // CLOSE: the whole screen in view below the band (on a phone, above the quick-action bar too)
    const band = narrow ? 58 : 68, foot = narrow ? 76 : 0;
    const sC = scrH / (sh * SCREEN.h);
    // the camera pans onto the station first, then dollies in; reduced motion cuts between the two shots
    // untouched at the top, the camera leans in toward the station now and then (about 8%) and settles back: a preview
    // of what the scroll does. It stops for good at the first scroll
    const hk = !reduced && !lite && p < .001 && now > hintFrom ? Math.pow(Math.sin(Math.PI * Math.min(1, ((now - hintFrom) % 7000) / 1900)), 2) : 0;
    // one ease only (lin): the page's own motion is the curve, so a notch's push is one steady move, never a lurch
    const pan = Math.max(reduced ? (a < .5 ? 0 : 1) : lin(a / .8), hk * .22);
    const push = Math.max(reduced ? pan : lin((a - .08) / .92), hk * Math.log(1.08) / Math.log(Math.max(1.1, sC)));
    const s = Math.pow(sC, push);                              // the wide shot is scale 1; zoom in log space, so it feels even
    const fx = lerp(narrow ? (RIG.x + RIG.w / 2) * sw : sw / 2, scx, pan), fy = lerp(sh / 2, scy, pan);
    let x = vw / 2 - fx * s, y = lerp(vh / 2, band + (vh - band - foot) / 2, pan) - fy * s;
    x = clamp(x, vw - sw * s, 0); y = clamp(y, vh - sh * s, 0); // never show past the hall's edges
    scene.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
    // close in, the wall behind the screen is the clean, soft rebuild of the plate (a real lens would lose it to focus too)
    const nearO = Math.max(nearFloor, clamp((s - 1.3) / 1.4, 0, 1)).toFixed(3);
    if (nearO !== heroNear.style.opacity) heroNear.style.opacity = nearO;
    // the turn, with a slow breath while it waits for the first scroll (it fades within the first bit of scroll and never
    // comes back: once the reader drives, nothing turns by itself); it lands square before the push gets close
    const tA = reduced ? pan : clamp(a / .6, 0, 1);
    if (a > .02) swayOn = false;
    const sway = reduced || lite || !swayOn ? 0 : Math.sin((now - swayFrom) / 2400) * 1.6 * (1 - clamp(a / .02, 0, 1));
    const turn = TURN * (1 - lin(tA)) + sway;
    // and the eye steps up and across to the screen's centre as the push closes in, so the close-up is dead square on
    const eye = reduced ? pan : lin((a - .15) / .6);
    if (station) {
      const k = (sw / 1536) * s;                               // CSS px per plate px: the 3D camera crops the same frame
      station.setView(1536, 864, -x / k, -y / k, vw / k, vh / k);
      station.setTurn(turn * Math.PI / 180);
      station.setEye(eye);
      // a frame is drawn only when something in it moved: the turn, the camera, or a new frame of the clip
      if (feedScreen() || station.dirty || quadDirty) { station.render(); heroScreen.style.transform = homography(scrW, scrH, station.screenQuad()); quadDirty = false; }
    } else {
      const X = x + SCREEN.x * sw * s, Y = y + SCREEN.y * sh * s, W = SCREEN.w * sw * s, H = SCREEN.h * sh * s;
      heroScreen.style.transform = homography(scrW, scrH, [[X, Y], [X + W, Y], [X + W, Y + H], [X, Y + H]]);
    }
    if (!station && !flatOn && a > .02) showFlat();
    if (station || flatOn) heroScreen.classList.add('on');
    // the scroll cue fades out with the first bit of scroll (set on the cue alone, so nothing else restyles)
    const co = clamp(1 - p * 14, 0, 1).toFixed(2);
    if (cue && co !== cueO) { cueO = co; cue.style.opacity = co; }
    // what Layer is, in words, until the camera starts to move in
    const so = clamp(1 - p * 7, 0, 1).toFixed(2);
    if (so !== sayO) {
      sayO = so; say.style.opacity = so;
      // the hero's Let's pilot key is the one in view until its words fade; then the band's own key takes over (v121)
      const gone = so <= .25;
      if (gone !== sayGone) { sayGone = gone; document.documentElement.classList.toggle('say-gone', gone); }
    }
    // the end of the hero: the stage dissolves into the liquid metal behind it, so One pose rises out of the flow
    // instead of the hall sliding away as a hard-edged block
    const fo = reduced ? '1' : clamp((1 - p) / .1, 0, 1).toFixed(3);
    if (fo !== stageO) { stageO = fo; stageEl.style.opacity = fo; }
    heroP = p; heroA = a; heroScale = s;
  }
  // the follower's speed cap through the hero's push: the camera zooms at most ~5.3% per 60 Hz frame (ln zoom per px of
  // scroll is ln(sC) x 1.14 / (.92 x the push's scroll)), so a notch's push is one even move, never a lurch
  function heroLim(y) {
    if (!M.heroH || y < M.heroTop - 2 || y > M.heroTop + (act() + .01) * (M.heroH - M.heroStage)) return Infinity;
    const sC = scrH / Math.max(1, M.sh * SCREEN.h);
    return 2.6 * act() * (M.heroH - M.heroStage) / Math.log(Math.max(1.5, sC));
  }
  const capped = (lim) => (y, t) => Math.min(heroLim(y), lim ? lim(y, t) : Infinity);
  function showFlat() { flatOn = true; kioskFlat.hidden = false; heroStill.hidden = true; }
  function flatStation(err) { console.warn('Layer Station: 3D unavailable, showing the still', err); window.__stationErr = String(err); showFlat(); c3d.remove(); hero.classList.remove('is-3d'); s5tex = null; }
  // one classic script (three.js bundled in), loaded from the page's own folder: no module loading for a host to break
  // the setup's files: the station's script and the try-on's four photos
  let inputs = 0;
  const loadStation = () => new Promise((ok, no) => {
    if (window.LayerStation) { inputs++; return ok(window.LayerStation); }
    const s = document.createElement('script'); s.src = 'assets/station/station.bundle.js?v=118'; s.async = true;
    s.onload = () => { inputs++; return window.LayerStation ? ok(window.LayerStation) : no(new Error('station script loaded empty')); };
    s.onerror = () => no(new Error('station script failed to load')); document.head.appendChild(s);
  });
  const heroNear = $('#heroNear');
  // decoded ahead, off the main thread, so its first appearance in the push costs nothing
  let hintFrom = Infinity;                                     // when the camera may start leaning in (see layoutHero)
  // the second test, for every device (phones and Safari can't time GPU work): the frames themselves, for a second and
  // a half after the landing. If they can't keep a steady pace (median over 24 ms: a weak GPU, or a browser holding
  // the page to 30 fps to save the battery), the page goes lite
  opened.then(() => wait(400)).then(() => {
    const t = []; const f = (now) => { t.push(now); if (now - t[0] < 1500) requestAnimationFrame(f); else {
      const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b);
      if (d.length > 8 && d[d.length >> 1] > 24) goLite();
    } };
    requestAnimationFrame(f);
  });
  opened.then(() => stationReady).then(() => { if (scrollY < 2) { hintFrom = performance.now() + 2500; addEventListener('scroll', () => { hintFrom = Infinity; }, { once: true, passive: true }); } });
  let clipOK = false, nearFloor = 0;                           // the hero clip may load (its poster stands in until then)
  // the close-up wall: decoded during the setup, then drawn at an invisible .2% while the camera is out wide, so its
  // first real appearance in the push needs no rasterising (a first draw of a picture this size is a visible hitch on a
  // laptop's graphics)
  setup.then(() => { heroNear.src = heroNear.dataset.src; return heroNear.decode().then(() => { nearFloor = .002; }, () => {}); });
  // the setup's pictures download from the first paint on (quietly, after everything the page needs); the setup itself
  // only waits on work, never on the network
  requestAnimationFrame(() => setTimeout(() => {
    const i = new Image(); i.fetchPriority = 'low'; i.src = heroNear.dataset.src;
    ['00', '01', '02', '03'].forEach((n) => { const p = new Image(); p.fetchPriority = 'low'; p.onload = p.onerror = () => { inputs++; }; p.src = `assets/img/pose-${n}.webp`; });
  }, 0));
  // the hero clip: on a quick line it loads during the setup, so its first frames are decoded before the first scroll;
  // on a slow one (or with Save-Data) it waits for the first scroll, as it always did
  prepped.then(() => new Promise((ok) => {
    if (navigator.connection && navigator.connection.saveData) return ok();
    const clip = () => { removeEventListener('scroll', clip); if (clipOK) return; clipOK = true; s5vid.preload = 'auto'; playS5(); };
    const type = navigator.connection && navigator.connection.effectiveType;
    if (!type || type === '4g') { s5vid.addEventListener('canplay', ok, { once: true }); setTimeout(ok, 1500); clip(); }
    else { opened.then(() => { addEventListener('scroll', clip, { passive: true }); setTimeout(clip, 3000); }); ok(); }
  }));
  // a link straight to a section (/#contact): the browser jumps before the page has its full height, so it lands short;
  // land it on the section itself
  opened.then(() => {
    const t = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t && t.id !== 'hero') requestAnimationFrame(() => setY(t.getBoundingClientRect().top + scrollY, 'hash'));
  });
  sizeScreen(); layoutHero();
  // the GPU time of a frame of the station, where the browser can time GPU work (0 where it can't): the fastest of n,
  // as other work on the GPU in the same moment (the page loading around it) can only add to it
  let gpuMs = 0;
  async function gpuFrameMs(st, n) {
    const gl = st.renderer.getContext(), ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (!ext) return 0;
    const qs = [];
    for (let i = 0; i < n; i++) { const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); st.render(); gl.endQuery(ext.TIME_ELAPSED_EXT); qs.push(q); await new Promise((ok) => requestAnimationFrame(ok)); }
    const ms = [];
    for (let k = 0; k < 40 && ms.length < qs.length; k++) {
      await new Promise((ok) => requestAnimationFrame(ok));
      for (const q of qs) if (!q.done && gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) { q.done = true; if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) ms.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6); }
    }
    qs.forEach((q) => gl.deleteQuery(q));
    return ms.length ? Math.min(...ms) : 0;
  }
  // until the 3D station is up (or without WebGL) its still stands in. It is built the moment its script is in, after
  // the first paint; its shaders then compile in the background. On a slow line, whenever its script arrives
  const painted = new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  const stationReady = loadStation().then(async ({ createStation }) => {
    await painted;
    try {
      const st = createStation(c3d, {});
      const w0 = pageW(), d0 = stationDpr();
      st.size(w0, innerHeight, d0);
      // the screen's own rect in the plate, square on, from the model
      st.setTurn(0); st.setView(1536, 864, 0, 0, 1536, 864);
      const q = st.screenQuad();
      const W = pageW(); SCREEN = { x: q[0][0] / W, y: q[0][1] / innerHeight, w: (q[1][0] - q[0][0]) / W, h: (q[3][1] - q[0][1]) / innerHeight };
      const tex = screenTexture(st); st.setScreen(tex);
      // its shaders build in the background where the browser can, then one hidden draw, so its first frame never stalls
      await st.prepare(() => setup);
      // the page may have changed width, or gone lite, while it was built
      if (pageW() !== w0 || stationDpr() !== d0) st.size(pageW(), innerHeight, stationDpr());
      station = st; s5tex = tex; hero.classList.add('is-3d'); swayFrom = performance.now();
      sizeScreen(); layoutHero();
      // over its own still it takes the place on the same frame (the two are one picture); over the flat still, it fades in
      if (!flatOn) { c3d.style.transition = 'none'; c3d.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => { heroStill.hidden = true; c3d.style.transition = ''; })); }
      else { c3d.classList.add('on'); setTimeout(() => { kioskFlat.hidden = true; }, 850); }
      // how heavy is one of its frames on this GPU? Over 1.7 ms (about twice a laptop's integrated graphics on mains
      // power, ~.85 ms: the same laptop on battery, or a weaker GPU), the page goes lite. Timed alongside the flight
      gpuFrameMs(st, 6).then((ms) => { gpuMs = ms; if (ms > 1.7) goLite(); });
    } catch (err) { station = null; flatStation(err); layoutHero(); }
  }).catch((err) => { flatStation(err); layoutHero(); });

  /* ───────────── HERO SCREEN: S5 at rest → the shopper → chrome pours down → the look ───────────── */
  const screen = heroScreen, canvas = $('#wipe'), s5 = $('#s5scr');
  s5.style.transition = 'opacity .25s';
  const kui = $('.kui', screen), kuiTitle = $('#kuiTitle'), kuiTag = $('#kuiTag'), putOn = $('#putOn'), putWord = $('#putOn b');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true });
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; v.y = 1. - v.y; gl_Position = vec4(p, 0., 1.); }`;
  const FS = `precision highp float; varying vec2 v;
  uniform sampler2D uA, uB; uniform float uT, uTime, uAsp, uImg; uniform vec3 uBg;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }
  vec2 cover(vec2 uv){ float k = uAsp / uImg; return k < 1. ? vec2(.5 + (uv.x - .5) * k, uv.y) : vec2(uv.x, uv.y / k); }
  vec3 env(vec3 r){
    // the S5 metal: deep plum-indigo body, lilac mids, bone highlights, a little teal and magenta in the turns
    float b = .5 + .5 * sin(r.y * 3.2 + r.x * 1.1 + uTime * .35);
    float c = smoothstep(.82, .98, .5 + .5 * sin(r.y * 4.2 - r.x * 1.4 + 1.7));
    vec3 deep = vec3(.09, .06, .16), lil = vec3(.62, .55, .86), bone = vec3(.97, .95, .91);
    vec3 col = mix(deep, lil, smoothstep(.25, .85, b));
    col = mix(col, bone, c);
    float t = .5 + .5 * sin(r.x * 3.1 + r.y * 1.7 + 2.);
    col += mix(vec3(.04, .2, .24), vec3(.28, .06, .22), t) * (1. - c) * smoothstep(.1, .5, b) * .9;
    return col;
  }
  void main(){
    vec2 uv = v; vec2 iv = cover(uv);
    vec3 A = texture2D(uA, iv).rgb, B = texture2D(uB, iv).rgb;
    float body = smoothstep(.07, .2, max(distance(A, uBg), distance(B, uBg)));
    float edge = uT + .045 * sin(uv.x * 9. + uTime * 1.3) + .06 * (fbm(vec2(uv.x * 5., uTime * .25)) - .5);
    float drip = body * .22 * pow(fbm(vec2(uv.x * 6., 3.1)), 2.) * smoothstep(0., .25, uT);
    float band = mix(.045, .17, body);
    float d = (uv.y - edge - drip) / band;
    vec3 col = d < -1. ? B : A;
    if (abs(d) < 1.) {
      float prof = cos(d * 1.5708);
      vec2 q = uv * vec2(2.2, 1.6) + vec2(0., uTime * .1);
      vec2 g = vec2(fbm(q) - fbm(q + vec2(.04, 0.)), fbm(q) - fbm(q + vec2(0., .04)));
      vec3 nrm = normalize(vec3(g * 5. + vec2(0., -sin(d * 1.5708) * 1.1), max(prof, .22)));
      vec3 r = reflect(vec3(0., 0., -1.), nrm);
      vec3 metal = env(r) * (.55 + .6 * prof);
      float rim = smoothstep(.8, 1., abs(d));
      col = mix(metal, d < 0. ? B : A, rim * .6);
    }
    gl_FragColor = vec4(col, 1.);
  }`;
  let prog, uni = {}, texA, texB, bg = [.17, .17, .18], imgAsp = .562;
  // the shader builds in the background where the browser allows (KHR_parallel_shader_compile): asking for its link
  // status straight away would hold the page until the GPU had compiled it
  async function glInit() {
    if (!gl) return false;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    const par = gl.getExtension('KHR_parallel_shader_compile');
    if (par) while (!gl.getProgramParameter(prog, par.COMPLETION_STATUS_KHR)) await new Promise((ok) => requestAnimationFrame(ok));
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uA', 'uB', 'uT', 'uTime', 'uAsp', 'uImg', 'uBg'].forEach((k) => { uni[k] = gl.getUniformLocation(prog, k); });
    return true;
  }
  function tex(img, unit) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => i.decode().then(() => ok(i), () => ok(i)); i.onerror = no; i.src = src; });

  // the pour: the edge runs fast past the head and shoulders, then follows the scroll down the body
  const START = -0.2, CLEAR = .27, END = 1.35;
  const pourAt = (k) => (k < .06 ? START + (CLEAR - START) * (k / .06) : CLEAR + (END - CLEAR) * ((k - .06) / .94));
  let wipeT = START, wipeTo = START, wipeAt = 0, t0 = performance.now(), looks = [], look = 1, raf = 0, dirty = true, ready = false;
  function size() {
    const k = Math.min(Math.min(devicePixelRatio, 2), 1200 / Math.max(1, canvas.offsetHeight));   // the screen is drawn at its close-up size
    const w = Math.max(2, Math.round(canvas.offsetWidth * k)), h = Math.max(2, Math.round(canvas.offsetHeight * k));
    // resize only on a real change (>8%), so the push-in does not reallocate every frame
    if (Math.abs(w - canvas.width) / canvas.width > .08 || Math.abs(h - canvas.height) / canvas.height > .08) { canvas.width = w; canvas.height = h; dirty = true; }
  }
  function draw(now) {
    size();
    const moving = Math.abs(wipeTo - wipeT) > .001 || (wipeT > -.15 && wipeT < 1.25);
    if (!moving && !dirty) { wipeAt = 0; return; }
    // the pour follows the scroll with an 80 ms lag at any frame rate (it used to move 4.5% a frame: a second behind at
    // 60 fps, two at 30), and arrives
    const dt = wipeAt ? Math.min(100, now - wipeAt) : 16; wipeAt = now;
    wipeT += (wipeTo - wipeT) * (reduced ? 1 : 1 - Math.exp(-dt / 80));
    if (Math.abs(wipeTo - wipeT) < .01) wipeT = wipeTo;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uni.uT, wipeT); gl.uniform1f(uni.uTime, reduced ? 2.4 : (now - t0) / 1000);
    gl.uniform1f(uni.uAsp, canvas.width / canvas.height); gl.uniform1f(uni.uImg, imgAsp);
    gl.uniform3f(uni.uBg, bg[0], bg[1], bg[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    dirty = false;
  }
  const setText = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  function showKui(on) {
    kui.inert = !on; kui.setAttribute('aria-hidden', String(!on));
    kui.classList.toggle('on', on); canvas.style.opacity = on ? '1' : '0';
  }
  // the S5 clip runs only while it can be seen
  function playS5() {
    const on = clipOK && heroOn && phase !== 'try' && !reduced;
    if (on && s5vid.paused) s5vid.play().catch(() => {});
    else if (!on && !s5vid.paused) s5vid.pause();
  }
  // scroll is the director: S5 at rest while it turns and pushes in, then the try-on
  function direct() {
    const A1 = act(), want = ready && heroP >= A1 - .06 ? 'try' : 's5';
    if (want !== phase) {
      phase = want; s5.style.opacity = phase === 's5' ? '1' : '0'; screen.classList.toggle('is-try', phase === 'try');
      showKui(phase === 'try'); dirty = true; playS5();
    }
    if (phase !== 'try') return;
    wipeTo = pourAt(clamp((heroP - (A1 + .08)) / (.82 - A1), 0, 1));   // (desktop: .5 to .9)
    const state = wipeT <= START + .01 && wipeTo <= START + .001 ? 'hold' : wipeT < 1.02 ? 'pour' : 'done';
    setText(kuiTitle, { hold: 'HOLD IT THERE.', pour: 'PUTTING IT ON…', done: 'THERE YOU ARE.' }[state]);
    setText(putWord, state === 'done' ? 'TRY ANOTHER' : 'TRY IT ON');
    putOn.classList.toggle('is-hidden', state === 'pour');
    kui.dataset.state = state;
  }
  function loop(now) {
    raf = 0;
    if (!heroOn) return;
    if (heroA < 1 && !reduced && !veiled && !FW.on) layoutHero(now);    // keeps the waiting station breathing (once it can be seen)
    direct();
    if (texA && phase === 'try') draw(now);
    raf = requestAnimationFrame(loop);
  }
  const wake = () => { if (!raf && heroOn) raf = requestAnimationFrame(loop); };
  function pick(n) {
    look = n;
    $$('#kuiPicks button').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.look === n)));
    setText(kuiTag, `LOOK 0${n}`);
    if (!texB) return;
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, looks[n - 1]);
    wipeT = START; dirty = true; wake();                       // pour again from the top
  }
  async function director() {
    showKui(false); s5.style.opacity = '1';
    // its shader compiles in the background from the first paint; the rest is set up after the station
    const shader = painted.then(glInit);
    // (after the station when it is there; on a slow line the station's script may still be on its way, and the try-on
    // never waits more than a moment for it)
    await setup; await Promise.race([stationReady, wait(1500)]);
    if (!(await shader)) return;                               // no WebGL: the S5 screen stays, the try-on never shows
    let a, ls;
    try { [a, ...ls] = await Promise.all(['00', '01', '02', '03'].map((n) => load(`assets/img/pose-${n}.webp`))); } catch (err) { return; }
    looks = ls; imgAsp = a.width / a.height;
    // background colour of the studio seamless (top-left corner patch), read from a CPU canvas: a GPU one would make the
    // page wait on a readback
    const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(a, 0, 0, 40, 40, 0, 0, 8, 8);
    const px = x.getImageData(0, 0, 8, 8).data; let rr = 0, gg = 0, bb = 0; for (let i = 0; i < px.length; i += 4) { rr += px[i]; gg += px[i + 1]; bb += px[i + 2]; }
    const nn = px.length / 4; bg = [rr / nn / 255, gg / nn / 255, bb / nn / 255];
    texA = tex(a, 0); texB = tex(looks[0], 1); gl.uniform1i(uni.uA, 0); gl.uniform1i(uni.uB, 1);
    ready = true;
    // one hidden draw now: the shader links and the photos reach the GPU here, not on the frame the try-on first shows
    dirty = true; draw(performance.now()); dirty = true;
    $$('#kuiPicks button').forEach((btn) => btn.addEventListener('click', () => pick(+btn.dataset.look)));
    putOn.addEventListener('click', () => {
      if (kui.dataset.state === 'pour') return;
      if (kui.dataset.state === 'done') pick(look % 3 + 1);
      else go(hero.offsetTop + (hero.offsetHeight - innerHeight));
    });
    wake();
  }
  const tryReady = director();
  new IntersectionObserver(([e]) => {                          // everything in the hero rests once it is gone
    heroOn = e.isIntersecting;
    if (heroOn) layoutHero();
    playS5(); wake();
  }).observe(hero);

  /* ───────────── ONE POSE: one shopper, one capture; the looks go on over her, one after another ───────────── */
  const pose = $('.pose'), poseLooks = $$('.pose__look'), poseTag = $('.pose__tag');
  const POSE_TAGS = ['POSE', 'LOOK 01', 'LOOK 02', 'LOOK 03'];
  let poseAt = 0, poseTimer = 0, poseSeen = false;
  async function poseNext() {
    const prev = poseLooks[poseAt], j2 = (poseAt + 1) % poseLooks.length, el = poseLooks[j2], img = $('img', el);
    await img.decode().catch(() => {});                         // never fade in a photo that isn't drawn yet
    poseAt = j2;
    poseLooks.forEach((l) => { l.style.zIndex = l === el ? 3 : l === prev ? 2 : 1; });
    poseTag.textContent = POSE_TAGS[j2];
    // the new clothes fade in over her; the old ones go once they are covered (she is the same in both, so nothing of
    // her ever dims)
    el.classList.add('on');
    setTimeout(() => { if (poseLooks[poseAt] === el) poseLooks.forEach((l) => { if (l !== el) l.classList.remove('on'); }); }, reduced ? 0 : 280);
  }
  // it plays while the card can be seen, a look every couple of seconds, from the pose round to the pose again
  // (the first look goes on as the scene lands, not a whole beat later)
  let poseKick = 0;
  new IntersectionObserver(([e]) => {
    clearInterval(poseTimer); clearTimeout(poseKick); poseTimer = 0;
    if (!e.isIntersecting) return;
    poseSeen = true;
    const next = () => { if (!document.hidden) poseNext(); };
    poseKick = setTimeout(() => { next(); poseTimer = setInterval(next, reduced ? 3600 : 2600); }, reduced ? 900 : 600);
  }, { threshold: .45 }).observe($('.pose__card'));

  /* ───────────── loops: the drop ticker and the programmes band run seamlessly, and never stop ───────────── */
  $$('.tick__track').forEach((t) => {
    const unit = t.dataset.tick.split(' + ').filter(Boolean).map((w) => `<span${/[஀-௿]/.test(w) ? ' class="ta" lang="ta"' : ''}>${w}</span><span>+</span>`).join('');
    t.innerHTML = unit.repeat(8);
  });
  const backers = $('.backers__track'), run = $('.backers__run');
  if (backers && !reduced) {
    const lane = document.createElement('div'); lane.className = 'backers__lane';
    run.appendChild(lane); lane.appendChild(backers);
    const chips = [...backers.children];
    for (let i = 0; i < 4 && backers.scrollWidth < run.clientWidth + 40; i++) chips.forEach((c) => { const d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); $$('img', d).forEach((x) => { x.alt = ''; }); backers.appendChild(d); });
    const copy = backers.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true'); copy.classList.add('is-copy');
    $$('img', copy).forEach((x) => { x.alt = ''; });
    lane.appendChild(copy);
  }

  /* ───────────── HOW IT WORKS: the kiosk's real screens, on the station's glass, playing themselves; a click jumps ahead ───────────── */
  const how = $('#how'), howSteps = $$('.how__steps li'), device = $('#device'), howScreen = $('#howScreen');
  const hsA = $('#hsA'), hsB = $('#hsB'), hsScrim = $('#hsScrim'), hsSheet = $('#hsSheet'), howS5 = $('#howS5'), howS5in = $('#howS5in'), hsHold = $('#hsHold'), hsHer = $('#hsHer'), hsTap = $('#hsTap'), hsFlash = $('#hsFlash');
  const SCR = (n) => `assets/screens/layer/${n}.webp`;
  const SHOT = ['s0', 's2', 's4bottoms', 's5-hold', 's6'].map(SCR), TOPS = SCR('s4top'), HER = SCR('s5-her');   // each step's resting screen
  // where the shopper presses, in the kiosk's own 540 x 960 frame
  const PRESS = { s0: [190, 830], women: [146, 785], bottom: [394, 798], tryon: [325, 881], putiton: [240, 887] };
  const RISE_FROM = 960;                                         // S5 rises from the screen's bottom edge, up past PUT IT ON ME
  // her photo in S6's card: the full-bleed still (s5-her.webp) scaled about its top-left corner and moved, and the card's
  // edges in the photo's own pixels (tools/make_s5_her.py: S .905, (26.48, 67.36), a median 1 grey level off S6's own
  // photo; the card is x 27-514.5, y 68-718.5 in s6.webp)
  const CARD = { s: .905, x: 26.48, y: 67.36, clip: [.71, .75, 240.5, .57] };
  // the S5 ring's hole, in the same frame: the largest circle inside it (centre and radius, steady to a pixel across the
  // hold loop's rock), and the radius that covers the whole screen from there
  const HOLE = { x: 266, y: 472, r: 90, max: 566 };
  // the glass in device-frame.webp (900 x 1576), from the 3D model (tools/station_render.py)
  const GLASS = [[132.3, 40.4], [731.6, 28.1], [731.0, 1126.9], [132.9, 1119.3]];
  const placeHowScreen = () => { const k = device.offsetWidth / 900; howScreen.style.transform = homography(540, 960, GLASS.map(([x, y]) => [x * k, y * k])); };
  const SEQ = Array.from({ length: 15 }, (_, i) => SCR(`s0seq/${String(i).padStart(2, '0')}`));
  // every picture How shows is decoded before it is shown: a swap waits for its picture (the last one stays up meanwhile),
  // so a slow line never paints a blank or half-drawn frame. They download, with the S5 loop, once How is two windows away
  // (never with the first view, so a slow line spends itself on the hero first)
  const decoded = new Set(), held = [];
  const preload = (src) => { const i = new Image(); i.src = src; held.push(i); return i.decode().then(() => { decoded.add(src); }, () => {}); };
  // the payoff's two stills (her photo and S6, 38 KB together) come a moment after the landing, so even a reader who
  // flings straight through How on a slow line ends on her
  opened.then(() => wait(1500)).then(() => { [HER, SHOT[4]].forEach(preload); });
  opened.then(() => new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    // the story's stills first, the ending's two (her photo, S6) among them, then the attract frames; the S5 loop (the
    // heaviest file) once the stills are in, so on a slow line the payoff never waits behind it
    const key = [SHOT[0], SHOT[1], TOPS, SHOT[2], SHOT[3], HER, SHOT[4]];
    const stills = Promise.all(key.map(preload)); SEQ.forEach(preload);
    hsHer.src = HER;
    Promise.race([stills, wait(4000)]).then(() => { hsHold.poster = hsHold.dataset.poster; hsHold.preload = 'auto'; });
  }, { rootMargin: '200% 0px' }).observe(how));
  /* the journey plays itself, one step after another, on its own clock while How it works is in view: each step's move
     at the kiosk's own pace (the tap, the capture, the drop, the sheet, S5 rising from the key, her coming through the
     ring into S6's card), then a rest to read it. After the last step it starts again from the top (the kiosk wipes the
     session). The bar under the steps is that clock, one segment per step, filling as it plays; nothing in How follows
     the scroll. A click on the screen or the forward key jumps to the next step at once, a step's name or its segment
     jumps to that step, and the pause key holds it all */
  const N = howSteps.length;                                    // 5
  const DUR = [0, .75, 1.6, 2.05, 2.3];                         // each step's move at the kiosk's pace, s
  const REST = [3.4, 2.6, 3, 3.6, 4.4];                         // then its rest, s (the first: S0's attract loop)
  const span = (i) => DUR[i] + REST[i];
  const eo = (t) => 1 - Math.pow(1 - t, 3), eq = (t) => 1 - Math.pow(1 - t, 4), eio = (t) => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const win = (tau, t0, d) => clamp((tau - t0) / d, 0, 1);
  // ci: the step in play; ct: how far into it, s; filmT: the film's own clock, ms (it stands still whenever the film does)
  let ci = 0, ct = 0, filmT = 0, tickAt = 0, howRaf = 0, howNear = false, howIn = false, howPaused = false;
  const running = () => !reduced && howIn && !howPaused && !document.hidden;
  const rendering = () => (ci === 3 && ct >= DUR[3]) || (ci === 4 && ct < DUR[4]);   // S5 at rest, and her coming through it
  let srcA = '', srcB = '';
  const setA = (s) => { if (s !== srcA && decoded.has(s)) { srcA = s; hsA.src = s; } };
  const setB = (s) => { if (s !== srcB && decoded.has(s)) { srcB = s; hsB.src = s; } };
  // a press: where the shopper's finger lands (the kiosk's tap ring), drawn at any moment of the move
  function tapAt(tau, t0, [x, y]) {
    const t = (tau - t0) / .55;
    if (t <= 0 || t >= 1) return false;
    hsTap.style.setProperty('--x', x / 540); hsTap.style.setProperty('--y', y / 960);
    hsTap.style.opacity = t < .4 ? 1 : 1 - eo((t - .4) / .6);
    hsTap.style.scale = t < .4 ? .35 + .45 * eo(t / .4) : .8 + .55 * eo((t - .4) / .6);
    return true;
  }
  const flashAt = (tau, t0) => { const t = (tau - t0) / .6; return t <= 0 || t >= 1 ? 0 : t < .12 ? .95 * t / .12 : .95 * (1 - eo((t - .12) / .88)); };
  // S0's attract loop: the bone plate melts into the figure and back, in its own time
  function attractFrame(ft) {
    const t = ft % 5920;
    const k = t < 960 ? Math.floor(t / 64) : t < 3560 ? 14 : t < 4520 ? 14 - Math.floor((t - 3560) / 64) : 0;
    return SEQ[clamp(k, 0, 14)];
  }
  const sayPs = $$('.how__say p');
  let holdAsk = false;
  // the screen at any moment of step i's move (u: 0 to 1; 1 is the step at rest). ft: the film's clock, ms (S0's loop)
  function paint(i, u, ft) {
    const tau = u * DUR[i];
    if (i !== howAt) {
      howAt = i;
      howSteps.forEach((s, k) => { s.classList.toggle('on', k === i); $('button', s).setAttribute('aria-current', String(k === i)); });
      sayPs.forEach((p, k) => p.classList.toggle('on', k === i));
    }
    let a = SHOT[i], aO = 1, b = '', bo = 0, bt = '', scrim = 0, sheet = 0, sheetY = 0, flash = 0, tap = false;
    let s5 = 0, rise = 0, s5k = 0, hold = 'still', her = 0, herS = 1, herX = 0, herY = 0, herC = 0, iris = -1;
    if (i === 0) a = reduced ? SHOT[0] : attractFrame(ft);
    else if (i === N - 1) {                                     // THERE YOU ARE
      a = SHOT[4];
      if (!reduced && u < 1) {
        // she comes through the ring: her photo opens out of the ring's hole (first filling the hole, then an iris that
        // grows over the ring and the page) while the ring swells toward you. Every pixel is S5 or her, never a blend of
        // the two. Then her photo settles into S6's card while S6's frame, THERE YOU ARE and its keys come up around it;
        // S6's own photo takes over under hers in the last tenth
        const e1 = eo(clamp(u / .5, 0, 1)), e2 = eio(clamp((u - .55) / .45, 0, 1));
        aO = u < .55 ? 0 : eo(clamp((u - .55) / .35, 0, 1));
        rise = 1; s5k = .25 * e1;
        // (S5 goes once the iris has covered all but the screen's far corners)
        s5 = u < .42 ? 1 : 1 - clamp((u - .42) / .08, 0, 1);
        her = u < .9 ? 1 : 1 - (u - .9) / .1;
        if (u < .5) {
          iris = u < .1 ? HOLE.r * eo(u / .1) : lerp(HOLE.r, HOLE.max, eio((u - .1) / .4));
          herS = 1.04 - .04 * e1; herX = -HOLE.x * (herS - 1); herY = -HOLE.y * (herS - 1);
        } else if (u >= .55) { herS = 1 - (1 - CARD.s) * e2; herX = CARD.x * e2; herY = CARD.y * e2; herC = e2; }
      }
      // a slow line, S6 not decoded yet: her photo holds its place in the card (on black) until S6 can take over
      if (!reduced && u > .55 && !decoded.has(SHOT[4]) && hsHer.complete && hsHer.naturalWidth) {
        const e2 = eio(clamp((u - .55) / .45, 0, 1));
        her = 1; aO = 0; herS = 1 - (1 - CARD.s) * e2; herX = CARD.x * e2; herY = CARD.y * e2; herC = e2;
      }
    } else if (u < 1) {
      if (i === 1) {                                            // TOUCH TO START, then the capture
        tap = tapAt(tau, 0, PRESS.s0); flash = flashAt(tau, .3); a = tau < .39 ? SHOT[0] : SHOT[1];
      } else if (i === 2) {                                     // WOMEN: the tops drop in from above; BOTTOM: the rail swaps to bottoms
        if (tau < .9) { tap = tapAt(tau, 0, PRESS.women); a = SHOT[1]; b = TOPS; const e = eq(win(tau, .3, .55)); bo = e; bt = `translateY(${(-35 * (1 - e)).toFixed(1)}px)`; }
        else { tap = tapAt(tau, .9, PRESS.bottom); a = TOPS; b = SHOT[2]; bo = eo(win(tau, 1.2, .32)); }
      } else {                                                  // TRY IT ON: YOUR LOOK rises over S4; PUT IT ON ME: S5 rises from the key
        tap = tau < 1.41 ? tapAt(tau, 0, PRESS.tryon) : tapAt(tau, 1.41, PRESS.putiton);
        rise = eo(win(tau, 1.55, .35));
        a = rise < 1 ? SHOT[2] : SHOT[3];
        scrim = rise < 1 ? eo(win(tau, .26, .2)) : 0;
        const e = eq(win(tau, .26, .3)); sheet = rise < 1 ? e : 0; sheetY = 130 * (1 - e);
        s5 = rise > 0 ? 1 : 0; hold = 'first';
      }
    } else if (i === 3) { s5 = 1; rise = 1; hold = reduced ? 'still' : 'play'; }
    if (!tap) hsTap.style.opacity = 0;
    hsFlash.style.opacity = flash;
    // a hand-over from the overlay to the base layer waits for the base's picture to be decoded: until it is, the overlay
    // goes on showing that picture (it never drops a frame early and lets the old base picture flash through)
    if (a !== srcA && !decoded.has(a) && srcB === a) { b = a; bo = 1; bt = ''; }
    setA(a);
    hsA.style.opacity = aO === 1 ? '' : aO.toFixed(3);
    if (b) setB(b);
    hsB.style.opacity = b ? bo : 0; hsB.style.transform = bt;
    hsScrim.style.opacity = scrim; hsSheet.style.opacity = sheet; hsSheet.style.transform = sheet ? `translateY(${sheetY.toFixed(1)}px)` : '';
    // S5 is revealed by an edge rising from the key (the frame moves up, its content counter-moves): every pixel is either
    // the sheet or S5, never a blend of the two
    const drop = (RISE_FROM * (1 - rise)).toFixed(1);
    howS5.style.opacity = s5 > 0 && s5 < 1 ? s5.toFixed(3) : s5 > 0 ? '1' : '0';
    howS5.style.visibility = s5 > 0 && rise > 0 ? 'visible' : 'hidden';
    howS5.style.transform = rise < 1 ? `translateY(${drop}px)` : '';
    howS5in.style.transform = rise < 1 ? `translateY(-${drop}px)` : s5k ? `scale(${(1 + s5k).toFixed(4)})` : '';
    hsHer.style.opacity = her ? her.toFixed(3) : '0';
    hsHer.style.visibility = her ? 'visible' : 'hidden';
    hsHer.style.transform = her ? `translate(${herX.toFixed(2)}px, ${herY.toFixed(2)}px) scale(${herS.toFixed(4)})` : '';
    hsHer.style.clipPath = iris >= 0 ? `circle(${iris.toFixed(1)}px at ${HOLE.x}px ${HOLE.y}px)` : herC ? `inset(${CARD.clip.map((c) => (c * herC).toFixed(2) + 'px').join(' ')})` : '';
    // the loop plays while S5 rests (and the film plays); it waits where it is otherwise, and goes back to its first frame
    // only while S5 is out of sight (so the reveal always starts on frame 0 and the ring never snaps)
    if (hold === 'play' && running()) {
      if (hsHold.paused && !holdAsk) { holdAsk = true; hsHold.play().catch(() => {}).finally(() => { holdAsk = false; }); }
    } else {
      if (!hsHold.paused) hsHold.pause();
      if (hold === 'first' && rise === 0 && hsHold.currentTime > .05 && !hsHold.seeking) hsHold.currentTime = 0;
    }
  }
  /* THE BAR: one segment per step. The steps before are full, the one in play fills with its clock (its move and its
     rest), the next one's track is lighter than the rest (where a click goes); the forward key at its end jumps there
     now, and on the last step it reads as a replay. Written on change only */
  const playEl = $('#howPlay'), segs = $$('.play__seg', playEl), nextKey = $('.play__next', playEl), pauseKey = $('.play__pause', playEl);
  let segAt = -1, kWas = '';
  function publish() {
    if (ci !== segAt) {
      segAt = ci;
      segs.forEach((b, k) => {
        b.classList.toggle('is-past', k < ci); b.classList.toggle('is-on', k === ci); b.classList.toggle('is-next', k === (ci + 1) % N);
        if (k !== ci) b.style.setProperty('--k', k < ci ? 1 : 0);
      });
      const end = ci === N - 1;
      nextKey.classList.toggle('is-end', end); nextKey.setAttribute('aria-label', end ? 'Start again' : 'Next step');
    }
    const k = (reduced ? 1 : clamp(ct / span(ci), 0, 1)).toFixed(4);
    if (k !== kWas) { kWas = k; segs[ci].style.setProperty('--k', k); }
  }
  const howDraw = () => { paint(ci, DUR[ci] ? clamp(ct / DUR[ci], 0, 1) : 1, filmT); publish(); };
  // to step k: its move plays from the start (paused, or with reduced motion, it shows the step at rest: nothing would
  // play the move). Anything but the step after a finished move is a cut, so the screen dips for a moment and it reads
  // as a jump, not as a beat of the kiosk's own
  function jump(k) {
    const was = ci, mid = ct < DUR[ci];
    ci = ((k % N) + N) % N;
    ct = reduced || howPaused ? DUR[ci] : 0;
    if (ci === 0) filmT = 0;                                    // (S0's loop from its start)
    if (!reduced && (ci !== was + 1 || mid)) howScreen.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    if (!howRaf) howDraw();
  }
  function howTick(now) {
    howRaf = requestAnimationFrame(howTick);
    const dt = Math.min(100, now - tickAt); tickAt = now;         // (capped: a long frame or a tab coming back never skips a step)
    if (running()) { filmT += dt; ct += dt / 1000; if (ct >= span(ci)) jump(ci + 1); }
    howDraw();
  }
  // the loop runs while How it works is near the screen; its clock moves only while it is well in view
  new IntersectionObserver(([e]) => {
    howNear = e.isIntersecting;
    if (howNear && !howRaf) { tickAt = performance.now(); howRaf = requestAnimationFrame(howTick); }
    else if (!howNear && howRaf) { cancelAnimationFrame(howRaf); howRaf = 0; hsHold.pause(); }
  }, { rootMargin: '50% 0px' }).observe(how);
  new IntersectionObserver(([e]) => {
    howIn = e.intersectionRatio >= .55;
    document.body.classList.toggle('in-how', howIn);            // (a phone's quick-action bar steps aside)
  }, { threshold: [0, .3, .55, .8, 1] }).observe(how);
  device.addEventListener('click', () => jump(ci + 1));
  nextKey.addEventListener('click', () => jump(ci + 1));
  segs.forEach((b, k) => b.addEventListener('click', () => jump(k)));
  howSteps.forEach((s, k) => $('button', s).addEventListener('click', () => jump(k)));
  pauseKey.addEventListener('click', () => {
    howPaused = !howPaused;
    pauseKey.setAttribute('aria-pressed', String(howPaused));
    pauseKey.setAttribute('aria-label', howPaused ? 'Play the walkthrough' : 'Pause the walkthrough');
    playEl.classList.toggle('is-paused', howPaused);
  });

  /* ───────────── LIVING METAL: the liquid chrome the S5 ring is made of flows behind the translucent page, far bigger
     than any screen (the ring's own shader, zoomed in until only its bands cross the frame), turning as you scroll ───────────── */
  const streamCv = document.createElement('canvas');
  streamCv.className = 'stream'; streamCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(streamCv);
  // it waits out of sight behind the hero until the hero is nearly done. Its shader compiles in the background (seconds,
  // cold, on some GPUs); setting it up holds the page for a few frames, so it is mounted by the setup, before anyone has
  // scrolled far. Its size follows the GPU (budget: ms per frame), so integrated graphics keep their frames
  let stream = null, streamAsked = false, movedAt = 0;   // movedAt: the last scroll or wheel (the metal warms only when nobody is scrolling)
  ['scroll', 'wheel', 'touchmove'].forEach((ev) => addEventListener(ev, () => { movedAt = performance.now(); }, { passive: true }));
  // its script loads only now (it is never needed before the end of the hero, so it never competes with the hero's own)
  function mountStream() {
    if (streamAsked) return; streamAsked = true;
    if (!('Molten' in window)) {
      const sc = document.createElement('script'); sc.src = 'assets/molten.js?v=118'; sc.async = true;
      sc.onload = () => { streamAsked = false; if (window.Molten) mountStream(); else streamCv.remove(); };
      sc.onerror = () => streamCv.remove(); document.head.appendChild(sc); return;
    }
    requestAnimationFrame(() => {
      try { stream = window.Molten ? Molten.mount(streamCv, { still: reduced, fps: 30, zoom: 11, maxW: 1100, scale: .6, budget: 7, quiet: () => performance.now() - movedAt > 700 }) : null; } catch (err) { stream = null; }
      if (!stream) streamCv.remove();
    });
  }
  let underWas = null, howGlow = 0, flowAt = 0, flowY = null;
  function metalFrame(now) {
    requestAnimationFrame(metalFrame);
    const vw = innerWidth, vh = innerHeight;
    if (!streamAsked && heroP > .4) mountStream();
    if (!lite && stream && stream.quality.fps <= 15) goLite();     // the metal at its lightest and still heavy: the GPU is weak
    // the flow sits out of sight behind the opaque hero, and drifts with the page after it: never with the scroll's
    // speed, only a little with its position, and slowly (eased over ~1.2 s), so it never swings or catches up
    if (stream) {
      const under = heroOn && heroP < .9, hold = under || (lite && performance.now() - movedAt < 250);   // lite: still while scrolling
      if (hold !== underWas) { underWas = hold; streamCv.dataset.paused = hold ? '1' : ''; }
      streamCv.classList.toggle('away', under);
      const dt = flowAt ? Math.min(100, now - flowAt) : 16; flowAt = now;
      const yNow = scrollY / vh;
      flowY = flowY === null || reduced ? yNow : flowY + (yNow - flowY) * (1 - Math.exp(-dt / 1200));
      // lite: the flow doesn't follow the page at all (it holds while the page scrolls, and has nothing to catch up after)
      const y = flowY, t = reduced ? 0 : now / 1000, k = lite ? 0 : 1;
      // while a look renders in How it works (step 4's rest and step 5's move), the flow swells and turns toward the screen
      const glowTo = howNear && rendering() ? 1 : 0;
      howGlow += (glowTo - howGlow) * (reduced ? 1 : 1 - Math.exp(-dt / 450));
      // the loop's radius is ~12 units, so a centre ~13 to the right brings its near side sweeping through the right half
      stream.set({ yaw: .35 + .125 * Math.sin(k * y * .5 + t * .03) + yawKick * .25, tiltAdd: .2 + k * .05 * Math.sin(y * .37),
        dx: 13 + k * 1.25 * Math.sin(y * .31) - 3 * howGlow, dy: k * 1.25 * Math.cos(y * .43), dim: (vw < 861 ? .46 : .56) + .2 * howGlow, sway: .35 + .25 * howGlow, ...(window.__streamTune || {}) });
    }
  }
  const spin = (by) => { yawKick += by; };
  window.__metal = () => ({ howAt, phase, heroOn, lite, stationGpuMs: +gpuMs.toFixed(2), stream: !!stream, flow: stream && stream.quality, s5: { hero: s5vid.currentTime, hold: hsHold.currentTime, end: null } });   // for review tools

  /* ───────────── THREADS: the stitches feed while the reader moves the page and rest when it rests. Nothing speeds up or
     melts with scroll speed (v117): every band keeps its one pace, and the page's own moves don't set them going ───────────── */
  const flowR = mover();
  let flowRaf = 0, stillAt = 0;
  function flow(now) {
    flowRaf = 0;
    if (Math.abs(userDy(flowR)) > .5) stillAt = now;
    if (now - stillAt < 140) flowRaf = requestAnimationFrame(flow);
    else document.documentElement.classList.remove('moving');
  }
  const kick = () => { if (!flowRaf && !reduced) { document.documentElement.classList.add('moving'); stillAt = performance.now(); userDy(flowR); flowRaf = requestAnimationFrame(flow); } };

  /* ───────────── BAND: hides as you read down; the slightest scroll up brings it back ───────────── */
  const band = $('#band'), menu = $('.band__menu'), nav = $('#bandNav'), contact = $('#contact');
  const navLinks = $$('a', nav), navSecs = navLinks.map((a) => $(a.getAttribute('href')));
  navLinks.forEach((a) => { const t = a.textContent; a.setAttribute('aria-label', t); a.innerHTML = `<span data-t="${t}">${t}</span>`; });
  let intentAt = 0, prevY = scrollY, touchY = 0;
  function showBand(on) {
    const keep = on || scrollY < 90 || nav.classList.contains('open') || band.contains(document.activeElement);
    band.classList.toggle('is-hidden', !keep);
  }
  addEventListener('wheel', (e) => { intentAt = performance.now(); if (e.deltaY < -1) showBand(true); else if (e.deltaY > 1) showBand(false); }, { passive: true });
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { const d = e.touches[0].clientY - touchY; intentAt = performance.now(); if (d > 6) showBand(true); else if (d < -6) showBand(false); }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) { intentAt = performance.now(); showBand(true); }
    else if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) { intentAt = performance.now(); showBand(false); }
  });
  band.addEventListener('focusin', () => showBand(true));
  let pastWas = null, upRun = 0;
  const headR = mover();
  function header() {
    const y = scrollY, d = userDy(headR);                       // the reader's own scroll: the page's moves don't count
    if (y < 90) showBand(true);
    else if (performance.now() - intentAt > 900) {             // no wheel or touch just now (a scrollbar drag): read the scroll itself
      if (d < 0) { upRun -= d; if (upRun > 40) showBand(true); } else if (d > 6) { upRun = 0; showBand(false); }
    }
    prevY = y;
    const past = y > M.heroH - innerHeight * .6;
    if (past !== pastWas) { pastWas = past; document.body.classList.toggle('past-hero', past); }
  }
  // where the reader is, from observers rather than from layout reads on every frame: the contact sheet in the lower
  // 70% of the window, and the section crossing the line 45% down it (its link in the band lights up)
  new IntersectionObserver(([e]) => document.body.classList.toggle('at-contact', e.isIntersecting), { rootMargin: '0px 0px -30% 0px' }).observe(contact);
  const navOn = new Set();
  const navIO = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? navOn.add(e.target) : navOn.delete(e.target)));
    navLinks.forEach((a, k) => a.classList.toggle('on', navOn.has(navSecs[k])));
  }, { rootMargin: '-45% 0px -54% 0px' });
  navSecs.forEach((s) => s && navIO.observe(s));

  /* ───────────── PAGER: on a desktop with a mouse, every wheel notch or paging key lands the next scene, or the next beat
     of a pinned stage: one beat per notch, either way, with a turn honoured at once. A trackpad keeps the browser's own
     scrolling (its momentum, smooth both ways) ───────────── */
  // the beats: every scene's top and the pinned stages' marks, the page's end, and the bottom of any scene taller than the
  // window (so a short window reaches all of it)
  function beats() {
    const y = scrollY, ps = [...$$('.snap'), ...$$('.win')].map((el) => Math.round(el.getBoundingClientRect().top + y));
    // (only where there is something to reach: a scene a few px taller than the window would make a beat that barely moves)
    $$('.win').forEach((el) => { const r = el.getBoundingClientRect(); if (r.height > innerHeight * 1.12) ps.push(Math.round(r.top + y + r.height - innerHeight)); });
    ps.push(Math.round(maxY()));
    return [...new Set(ps)].sort((a, b) => a - b);
  }
  let stepAt = -1e9;
  function stepBeat(dir) {
    const now = performance.now(), gap = now - stepAt; stepAt = now;
    if (FW.pend && Math.sign(FW.pend) !== dir) FW.pend = 0;   // a turn drops what was queued the other way
    const ps = beats(), y = scrollY;
    const going = FW.on ? Math.sign(FW.tgt - FW.py) : 0;
    // autoplay or a settle-back under way: the reader takes it over, speed and all, and the notch counts from where the
    // page is (the next beat that way; from a beat it is on or within 8 px of, the one after it)
    const own = FW.on && FW.why === 'glide';
    if (FW.on && !own) FW.why = 'glide';
    let t;
    if (own && going === dir) t = dir > 0 ? ps.find((c) => c > FW.tgt + 1) : [...ps].reverse().find((c) => c < FW.tgt - 1);   // on the way: one further
    else if (own && going === -dir) t = dir > 0 ? ps.find((c) => c >= y - .5) : [...ps].reverse().find((c) => c <= y + .5);   // a turn: back to the beat behind
    else {
      const base = ps.find((c) => Math.abs(c - y) <= 8) ?? y;   // at rest on (or within 8 px of) a beat: from that beat
      t = dir > 0 ? ps.find((c) => c > base + 1) : [...ps].reverse().find((c) => c < base - 1);
    }
    if (t === undefined) return;
    // never more than two beats ahead of the beat nearest the page (a free-spinning wheel would run away with it)
    // (a deliberate notch, 90 ms or more after the last, isn't lost there: it waits its turn, six at most, and the move
    // speeds up for it; a free-spin's notches, closer than that, are)
    const at = nearest(ps, y), ti = ps.indexOf(t);
    if ((ti - at) * dir > 2) {
      t = ps[clamp(at + 2 * dir, 0, ps.length - 1)];
      if (FW.on && gap >= 90 && Math.abs(FW.pend) < 6) { FW.pend += dir; FW.ps = ps; }
    }
    aim(t, { lim: capped(null) });
  }
  // a wheel stream (events under 240 ms apart) is judged as a whole: it starts as a mouse's when its first event is a
  // whole step (28 px or more, nothing sideways), and turns into a trackpad's (native, let go at once) the moment an event
  // isn't a whole multiple of that step or moves sideways. Lines and pages are counted as 33 px and a window
  const WS = { at: -1e9, kind: '', unit: 100, prev: 0, start: 0, hold: false, last: [0, 0, 0], y0: 0, dir: 0, same: 0, rep: 0, sum: 0 };
  let acc = 0, padAt = -1e9;
  // (?debug, or a local server: the last 240 wheel events as the page got them, so a real touchpad's deltas can be read
  // off with __layerDebug.wheels() before its stream is ever classed)
  const wheelLog = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || /[?&]debug\b/.test(location.search) ? [] : null;
  addEventListener('wheel', (e) => {
    if (wheelLog) { wheelLog.push([Math.round(e.timeStamp), e.deltaY, e.deltaX, e.deltaMode, WS.kind]); if (wheelLog.length > 240) wheelLog.shift(); }
    if (!pagerOn.matches || e.ctrlKey || window.__nosnap) return;
    const now = performance.now();
    const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1);
    const fresh = now - WS.at > 240;
    WS.at = now;
    if (fresh) { WS.kind = Math.abs(dy) >= 28 && e.deltaX === 0 ? 'notch' : 'pad'; WS.unit = Math.abs(dy); WS.start = now; WS.prev = 0; WS.hold = false; WS.last = [0, 0, Math.abs(dy)]; WS.y0 = scrollY; WS.dir = Math.sign(dy); WS.same = e.deltaX === 0 ? 1 : 0; WS.rep = WS.same; WS.sum = 0; acc = 0; }
    else {
      if (Math.sign(dy) !== WS.dir) WS.dir = 0;
      if (WS.kind === 'notch') {
        const k = Math.abs(dy) / WS.unit, r = Math.round(k);
        // (a mouse repeats its step exactly, or whole multiples of it when events coalesce; a trackpad's deltas drift)
        if (e.deltaX !== 0 || r < 1 || Math.abs(k - r) > .002 * r) { WS.kind = 'pad'; if (FW.on && FW.why === 'glide') stopFollow(); }
      } else {
        // (the browser may merge two of its steps into one event: a whole multiple counts as that many)
        const q = Math.abs(dy) / WS.unit, qr = Math.round(q);
        WS.same = WS.same && e.deltaX === 0 && qr >= 1 && Math.abs(q - qr) <= .002 * qr ? WS.same + qr : 0;
        // (and how many of its events so far are that very step, one after another from the first)
        WS.rep = WS.rep && WS.rep === WS.same - qr && qr === 1 ? WS.rep + 1 : 0;
        // a high-resolution wheel: one small step of 4 px or more, repeated exactly, three events in a row from the first,
        // inside its first 80 ms, nothing sideways. A trackpad never does that: its deltas ramp up as a swipe starts (1, 2,
        // 3 px ... from a touchpad that reports whole pixels; .8, 1.6, 2.4 at 125%), and they are only ever a whole
        // multiple of the first, never the same one three times. From here it pages like a mouse: 100 px a notch,
        // counted from its first step
        if (WS.kind === 'pad' && WS.rep >= 3 && WS.unit >= 4 && now - WS.start < 80 && !WS.hold) { WS.kind = 'fine'; acc = WS.sum; }
        else if (WS.kind === 'fine' && !WS.same) { WS.kind = 'pad'; if (FW.on && FW.why === 'glide') stopFollow(); }
      }
    }
    WS.sum += dy;
    if (WS.kind === 'pad') {
      // a link's glide is not stopped by the trackpad's momentum still coming in (the same way, smaller and smaller); a new
      // swipe (a bigger delta, or the other way) is the reader's, and stops it
      // (momentum wobbles a little from one event to the next: it is judged against the last few)
      const was = Math.max(...WS.last);
      WS.last = [WS.last[1], WS.last[2], Math.abs(dy)];
      if (WS.hold && Math.sign(dy) === Math.sign(WS.prev) && Math.abs(dy) <= was * 1.25 + .5) { WS.prev = dy; e.preventDefault(); return; }
      // the trackpad scrolls the page itself, and is never landed: not when its deltas drift, and not when they happen to
      // be whole multiples of its first (a touchpad that reports whole device pixels). Only a stream classed 'fine' above
      // is a wheel
      WS.hold = false; WS.prev = dy;
      padAt = now;
      if (FW.on && FW.anchor) stopFollow();                      // (a new swipe during a link's move: the reader's)
      return;
    }
    WS.prev = dy;
    e.preventDefault();
    const unit = WS.kind === 'fine' ? 100 : WS.unit;
    if (Math.sign(dy) !== Math.sign(acc)) acc = 0;
    acc += dy;
    while (Math.abs(acc) >= unit * .98) { const d = Math.sign(acc); acc -= d * unit; stepBeat(d); }
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (!pagerOn.matches || e.altKey || e.ctrlKey || e.metaKey || window.__nosnap) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const space = e.key === ' ' && !(e.target.closest && e.target.closest('button, a, summary'));
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (space && !e.shiftKey);
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (space && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    stepBeat(down ? 1 : -1);                                   // key repeat pages on smoothly: no key is dropped mid-move
  });
  // anything else that leaves the page between beats (the scrollbar, Home and End, find, a touch screen) lands on the nearest
  // (never while a wheel stream is still coming in: it lands once the stream has ended)
  let landT = 0;
  function landing() {
    if (!pagerOn.matches || FW.on || window.__nosnap) return;
    const now = performance.now();
    if (now - padAt < 1500) return;
    if (now - WS.at < 240) { clearTimeout(landT); landT = setTimeout(landing, 260 - (now - WS.at)); return; }
    const y = scrollY, ps = beats();
    let t = ps.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
    // a high-resolution mouse wheel (classed 'fine': one small step repeated exactly) is still a wheel: it lands the next
    // beat the way it turned, as a notch would, not the nearest one (which is often back where it started). A trackpad's
    // stream never gets here (padAt), whatever its deltas look like
    const d = WS.dir;
    if (WS.kind === 'fine' && d && now - WS.at < 1500 && Math.abs(y - WS.y0) > 2) {
      const ahead = ps.filter((c) => (c - WS.y0) * d > 1);
      if (ahead.length) t = ahead.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
    }
    if (Math.abs(t - y) > 6) aim(t, { lim: capped(null) });
  }
  addEventListener('scrollend', landing);
  // a link: the follower carries the page to its scene (free of How's pace: a link is a jump, not a film)
  const linkTarget = (el) => { const top = el.getBoundingClientRect().top + scrollY; return pagerOn.matches ? beats().find((c) => c >= top - 2) ?? top : top; };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
    if (!el || !pagerOn.matches) return;
    e.preventDefault();
    WS.hold = performance.now() - WS.at < 240 && WS.kind === 'pad';   // the trackpad's momentum still coming in
    aim(linkTarget(el), { anchor: true, lim: capped(null) });
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }));
  // back and forward: the page restores nothing by itself (the scenes below it weren't laid out when it saved a place);
  // it renders every scene, then lands on the section: a jump when it is far, the follower when it is near
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let navAt = -1e9;
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a[href^="#"]')) navAt = performance.now(); }, true);
  function toHash(ev) {
    if (ev.type === 'hashchange' && performance.now() - navAt < 150 && !pagerOn.matches) return;   // a link the browser itself is scrolling to
    const el = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el) return;
    warmAll();
    requestAnimationFrame(() => {
      const t = linkTarget(el);
      if (Math.abs(t - scrollY) > 1.5 * innerHeight) { stopFollow(); setY(t, 'hash'); } else aim(t, { anchor: true, lim: capped(null) });
    });
  }
  addEventListener('popstate', toHash);
  addEventListener('hashchange', toHash);

  // one scroll handler for the whole page, once per frame
  let ticking = false;
  const scrollR = mover();
  function onScroll() {
    if (Math.abs(userDy(scrollR)) > .5) kick();                 // the threads feed only while the reader moves the page
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; if (heroOn && !FW.on) layoutHero(); wake(); header(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  // a resize keeps the reader's place in the pinned stages (their film position, not their pixel), so a rotation or a
  // window drag never moves the How step or the hero's camera under them. A change of height alone (a browser toolbar)
  // lays out again without rebuilding the 3D frame; anything else lays out at once and rebuilds it 150 ms after the last
  let stationT = 0;
  function resized() {
    const w0 = M.vw, h0 = M.vh, y = scrollY;
    const inHero = M.heroH && y > M.heroTop + 1 && y <= M.heroTop + M.heroH - M.heroStage, pHero = inHero ? (y - M.heroTop) / (M.heroH - M.heroStage) : 0;
    measure();
    const toolbar = w0 === M.vw && h0 && Math.abs(M.vh - h0) < .25 * h0;
    sizeScreen();
    if (!toolbar) { clearTimeout(stationT); stationT = setTimeout(() => { if (station) { station.size(pageW(), innerHeight, stationDpr()); quadDirty = true; layoutHero(); } }, 150); }
    const keep = inHero ? M.heroTop + pHero * (M.heroH - M.heroStage) : y;
    if (w0 && Math.abs(keep - scrollY) > 1) { stopFollow(); setY(Math.round(keep), 'hash'); }
    layoutHero(); placeHowScreen(); dirty = true; wake();
  }
  addEventListener('resize', resized);
  // anything that moves the page's geometry without a resize re-measures (fonts arriving, a phone's sections settling);
  // a change of width (a scrollbar coming or going) resizes everything, the 3D frame included
  new ResizeObserver(() => { const w = pageW(); if (w !== M.vw || w !== sizedW) resized(); else { measure(); if (heroOn) layoutHero(); } }).observe(document.body);
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || /[?&]debug\b/.test(location.search)) {
    window.__layerDebug = { state: () => ({ follow: { on: FW.on, py: FW.py, pv: FW.pv, tgt: FW.tgt, w: FW.w, why: FW.why, anchor: FW.anchor }, how: { i: ci, t: ct, paused: howPaused, in: howIn }, heroP, heroA, wipeT, wipeTo, howGlow, lite, M: { ...M } }), beats, wheels: () => (wheelLog || []).slice(),
      // (review: holds the film at step i, t s into it)
      howAt: (i, t) => { ci = i; ct = t; howPaused = true; playEl.classList.add('is-paused'); howDraw(); } };
  }
  placeHowScreen(); howDraw(); header();
  requestAnimationFrame(metalFrame);

  // CSS-drawn pictures (the print loupes) download only as their scene comes near
  // a desktop scene skips its layout while it is far away (content-visibility in style.css); two windows out it renders
  // for good, so its pictures load and decode before it scrolls in
  const scenes = $$('main > .win, main > * > .win, .foot');
  const warmIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('warm'); warmIO.unobserve(e.target); } }), { rootMargin: '200% 0px' });
  scenes.forEach((s) => warmIO.observe(s));
  // a jump to a section (any #link) renders the whole page first, so every scene above the target has its real height
  // and the jump lands exactly on it
  const warmAll = () => { scenes.forEach((s) => { s.classList.add('warm'); warmIO.unobserve(s); }); measure(); };
  // the setup, in turn, from the first frames: the station, then the try-on, then every scene's layout
  // and the metal's shader (which goes on compiling in the background); the close-up wall and the clip load alongside
  setup.then(async () => {
    await Promise.race([Promise.all([stationReady, tryReady]), wait(2500)]);   // a slow line doesn't hold the rest
    warmAll();
    mountStream();
    setupDone();                                               // the close-up wall and the clip carry on loading on their own
  });
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a[href^="#"]')) warmAll(); }, true);
  if (location.hash.length > 1) warmAll();
  // (each scene is watched, not the picture itself: a scene out of view skips its layout, so a picture inside it has no
  // box to watch until the scene is already close)
  const nearIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { $$('.zoom', e.target).forEach((z) => z.classList.add('near')); nearIO.unobserve(e.target); } }), { rootMargin: '100% 0px' });
  [...new Set($$('.zoom').map((z) => z.closest('section') || z.parentElement))].forEach((s) => nearIO.observe(s));

  /* ───────────── YOUR PILOT sheet: a good send posts to /api/contact (the site's Worker, which files it in the
     enquiries sheet and mails hello@) and the metal turns once. Where there is no form handler (a local server,
     offline) it writes the message for WhatsApp or mail instead, so nothing typed is lost ───────────── */
  const form = $('#pilotForm');
  let sending = false;
  form.addEventListener('input', () => { $('#fDone').hidden = true; $('#fSent').hidden = true; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    $('#fDone').hidden = true; $('#fSent').hidden = true;
    const v = (id) => $(id).value.trim();
    const mailOk = !v('#fEmail') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#fEmail'));
    const ok = v('#fName') && (v('#fPhone') || v('#fEmail')) && mailOk;
    $('#fErr').hidden = !!ok;
    $('#fName').setAttribute('aria-invalid', String(!v('#fName')));
    ['#fPhone', '#fEmail'].forEach((id) => $(id).setAttribute('aria-invalid', String(!(v('#fPhone') || v('#fEmail')) || (id === '#fEmail' && !mailOk))));
    if (!ok) { (!v('#fName') ? $('#fName') : !mailOk ? $('#fEmail') : $('#fPhone')).focus(); return; }
    const role = $('input[name="role"]:checked', form).value;
    const lines = [`Let's pilot Layer.`, `${v('#fName')} · ${role}${v('#fCompany') ? ` · ${v('#fCompany')}` : ''}${v('#fCity') ? ` · ${v('#fCity')}` : ''}`,
      [v('#fPhone'), v('#fEmail')].filter(Boolean).join(' · '), v('#fWhen') && `When: ${v('#fWhen')}`].filter(Boolean);
    const text = lines.join('\n').slice(0, 1500);              // mail apps and wa.me drop very long links
    $('#fMsg').value = text;
    $('#fWa').href = `https://wa.me/916383410936?text=${encodeURIComponent(text)}`;
    $('#fMail').href = `mailto:hello@miraiinnovations.tech?subject=${encodeURIComponent("Let's pilot Layer")}&body=${encodeURIComponent(text)}`;
    sending = true; $('#fGo').disabled = true; $('#fGo').setAttribute('aria-busy', 'true');
    let sent = false;
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      sent = res.ok;
    } catch (err) { sent = false; }
    sending = false; $('#fGo').disabled = false; $('#fGo').removeAttribute('aria-busy');
    if (sent) { form.reset(); $('#fSent').hidden = false; } else $('#fDone').hidden = false;
    spin(Math.PI * 2);
  });

  // phones: the band's menu
  const setMenu = (open) => { nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); if (open) showBand(true); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  navLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  let menuY = 0;
  menu.addEventListener('click', () => { menuY = scrollY; });
  addEventListener('scroll', () => { if (nav.classList.contains('open') && Math.abs(scrollY - menuY) > 40) setMenu(false); }, { passive: true });
  // phones: the quick-action bar steps aside while a field is being typed in
  form.addEventListener('focusin', () => document.body.classList.add('typing'));
  form.addEventListener('focusout', () => document.body.classList.remove('typing'));
  addEventListener('click', (e) => { if (!e.target.closest('.band')) setMenu(false); });
})();
