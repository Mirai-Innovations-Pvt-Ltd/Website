/* Layer website prototype: the opening (layer is written on, the lockup flies to the band), the hero (the 3D station
   turns to face you, its glass showing the kiosk's own S5, the push into its screen, then a liquid-chrome try-on), How it
   works (the kiosk's real screens and its real beats between them, S5 and its ending recorded from the kiosk build), one
   living flow of liquid metal behind the translucent page, the stitched threads, the header, the pager that lands every
   scene, and the pilot sheet. three.js (bundled) for the station; nothing else. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inout = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pagerOn = matchMedia('(min-width: 861px) and (min-height: 700px) and (pointer: fine)');
  let autoScroll = false, gliding = false, glideId = 0, glideTarget = 0;   // set while the page glides itself
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  // every in-page move goes through one glide, so it lands exactly where the pager would
  function glideTo(target) {
    if (typeof stopAuto === 'function') stopAuto();
    const y0 = scrollY, d = target - y0;
    if (Math.abs(d) < 2) return;
    autoScroll = true; glideTarget = target;
    if (reduced) { scrollTo({ top: target, behavior: 'instant' }); return; }
    gliding = true;
    const id = ++glideId, root = document.documentElement, dur = Math.min(1150, 620 + Math.abs(d) * .26), t0 = performance.now();
    root.style.scrollBehavior = 'auto';
    const f = (now) => {
      if (id !== glideId) return;                               // stopped, or a newer glide took over
      const k = clamp((now - t0) / dur, 0, 1);
      scrollTo(0, y0 + d * inout(k));
      if (k < 1) requestAnimationFrame(f);
      else { gliding = false; root.style.scrollBehavior = ''; setTimeout(() => { autoScroll = false; }, 80); }
    };
    requestAnimationFrame(f);
  }
  function stopGlide() { if (!gliding) return; glideId++; gliding = false; autoScroll = false; document.documentElement.style.scrollBehavior = ''; }
  const go = (top) => (pagerOn.matches ? glideTo(top) : scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }));

  /* ───────────── OPENING: layer is written on, by Mirai arrives, and the lockup glides into its place on the band ───────────── */
  const splash = $('#splash'), brand = $('.band__brand');
  // the opening reports when it has landed. Everything heavy (the 3D station, the try-on, the close-up wall, the clip,
  // the scenes below, the metal's shader) is set up while the written lockup holds still, before it flies: a still frame
  // can't stutter, and nothing heavy is left for the landing or the first scroll. `setup` says when that may start,
  // `prepped` when it is done (the flight waits for it, 1.2 s at most). Until the flight the hero sits
  // under the opaque splash (veiled), so it isn't drawn
  let landed, playing = false, veiled = true, startSetup, setupDone;
  // a slow line (or Save-Data) never holds the lockup: there the setup runs after the landing, as its files arrive
  const conn = navigator.connection, slowLine = !!conn && (!!conn.saveData || /2g|3g/.test(conn.effectiveType || ''));
  const opened = new Promise((ok) => { landed = ok; });
  const setup = new Promise((ok) => { startSetup = ok; });
  const prepped = new Promise((ok) => { setupDone = ok; });
  (function opening() {
    if (!splash) { veiled = false; startSetup(); return landed(); }
    // every fresh visit gets it; coming back from the legal pages, or with reduced motion, goes straight in
    if (reduced || /\/(privacy|terms)(\.html)?$/.test(document.referrer ? new URL(document.referrer).pathname : '')) { splash.remove(); veiled = false; startSetup(); return landed(); }
    const root = document.documentElement, art = $('.splash__art', splash), mirai = $('.splash__mirai', splash);
    const pin = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? new URLSearchParams(location.search).get('splash') : null;   // ?splash=1.2 holds the opening at 1.2 s, for review (local only)
    if (pin !== null) {
      root.classList.add('splashing'); splash.classList.add('go');
      requestAnimationFrame(() => requestAnimationFrame(() => document.getAnimations().forEach((an) => { if (splash.contains(an.effect && an.effect.target)) { an.pause(); an.currentTime = +pin * 1000; } })));
      return;
    }
    // the script ran so late (a very slow line) that the dark screen has stepped aside by itself: no opening
    if (performance.now() > 5500) { splash.remove(); veiled = false; startSetup(); return landed(); }
    root.classList.add('splashing');
    let flown = false, t = 0;
    function fly(quick) {
      if (flown) return; flown = true; veiled = false; wake();
      if (quick) splash.classList.add('done');
      // the opening is the band's own lockup drawn large, so it lands by moving and scaling alone
      const A = art.getBoundingClientRect(), B = brand.getBoundingClientRect(), k = B.width / A.width;
      const D = [B.left - A.left, B.top + (B.height - A.height * k) / 2 - A.top];
      const dur = quick ? 520 : 800;
      art.animate([{ transform: 'none' }, { transform: `translate(${D[0]}px, ${D[1]}px) scale(${k})` }], { duration: dur, easing: 'cubic-bezier(.7, 0, .2, 1)', fill: 'forwards' });
      splash.animate([{ backgroundColor: 'rgba(8, 7, 10, 1)' }, { backgroundColor: 'rgba(8, 7, 10, 0)' }], { duration: dur * .7, delay: dur * .25, easing: 'ease-out', fill: 'forwards' });
      setTimeout(() => {
        root.classList.remove('splashing'); playing = false; startSetup(); landed();
        splash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).onfinish = () => splash.remove();
      }, dur);
    }
    // it starts as soon as BY's face and Mirai are in (half a second at most) and the browser's first heavy frames are
    // behind it (three smooth frames in a row, under a second at most), so nothing in it arrives late or stutters. The
    // lockup is fully written by 1.75 s; the setup runs from there while it holds still, and it flies once that is done
    const ready = Promise.all([document.fonts.load('600 20px "IBM Plex Mono"').catch(() => {}), mirai.decode().catch(() => {})]);
    const steady = () => new Promise((ok) => {
      const t0 = performance.now(); let last = 0, calm = 0;
      const f = (now) => { calm = last && now - last < 40 ? calm + 1 : 0; last = now; if (calm >= 3 || now - t0 > 900) ok(); else requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    Promise.race([ready, wait(500)]).then(steady).then(() => {
      if (flown) return;
      playing = true; splash.classList.add('go');
      // it holds only if everything the setup needs has downloaded by then: the hold waits on work, never on the network
      // (otherwise the setup runs once the opening has landed, as its files arrive)
      let hold = false;
      setTimeout(() => { hold = !slowLine && inputsIn(); if (hold) startSetup(); }, 1750);
      t = setTimeout(() => Promise.race([prepped, wait(hold ? 1200 : 0)]).then(() => fly(false)), 1950);
    });
    const skip = () => { clearTimeout(t); fly(true); };
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, skip, { once: true, passive: true }));
  })();

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
  let station = null, scrW = 0, scrH = 0, s5tex = null, s5at = -1, swayFrom = 0;
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
  // other). Read from the body: while the opening holds the page (overflow hidden) the root's clientWidth counts the
  // scrollbar's kept gutter as page, and a station built then is squeezed into a narrower canvas, its screen off its glass
  const pageW = () => document.body.clientWidth;
  let sizedW = 0;                                              // the width the station and its screen were last built for
  function sizeScreen() {                                        // the screen element is its own close-up size
    quadDirty = true;
    const vw = pageW(), vh = innerHeight, narrow = vw < 861, band = narrow ? 58 : 68, foot = narrow ? 76 : 0;
    const aspect = (SCREEN.w * 1536) / (SCREEN.h * 864);
    let h = (vh - band - foot) * .9, w = h * aspect;
    if (w > vw * .94) { w = vw * .94; h = w / aspect; }
    scrW = w; scrH = h; heroScreen.style.width = `${w}px`; heroScreen.style.height = `${h}px`; sizedW = vw;
  }
  // the page's fixed geometry, read once per resize: the scroll path then reads nothing from layout, so no frame of
  // the push ever waits on a forced style or layout pass
  const M = { vw: 0, vh: 0, heroTop: 0, heroH: 0, sw: 0, sh: 0, howTop: 0, howH: 0 };
  function measure() {
    M.vw = pageW(); M.vh = innerHeight;
    M.heroTop = hero.getBoundingClientRect().top + scrollY; M.heroH = hero.offsetHeight;
    M.sw = scene.offsetWidth; M.sh = scene.offsetHeight;
    const hr = $('#how').getBoundingClientRect(); M.howTop = hr.top + scrollY; M.howH = hr.height;
  }
  const cue = $('.hero__cue'), say = $('.hero__say'), stageEl = $('.hero__stage');
  let cueO = '', sayO = '', stageO = '', quadDirty = true;                             // the live screen needs placing (new station, new size)
  function layoutHero(now = performance.now()) {
    if (!M.vw) measure();
    const vw = M.vw, vh = M.vh;
    const p = clamp((scrollY - M.heroTop) / (M.heroH - vh), 0, 1);
    const a = clamp(p / .42, 0, 1);                            // act one: the turn and the push; act two (p > .42) is the try-on
    const sw = M.sw, sh = M.sh, narrow = vw < 861;
    const scx = (SCREEN.x + SCREEN.w / 2) * sw, scy = (SCREEN.y + SCREEN.h / 2) * sh;
    // CLOSE: the whole screen in view below the band (on a phone, above the quick-action bar too)
    const band = narrow ? 58 : 68, foot = narrow ? 76 : 0;
    const sC = scrH / (sh * SCREEN.h);
    // the camera pans onto the station first, then dollies in; reduced motion cuts between the two shots
    // untouched at the top, the camera leans in toward the station now and then (about 8%) and settles back: a preview
    // of what the scroll does. It stops for good at the first scroll
    const hk = !reduced && !lite && p < .001 && now > hintFrom ? Math.pow(Math.sin(Math.PI * Math.min(1, ((now - hintFrom) % 7000) / 1900)), 2) : 0;
    const pan = Math.max(reduced ? (a < .5 ? 0 : 1) : inout(clamp(a / .8, 0, 1)), hk * .22);
    const push = Math.max(reduced ? pan : inout(clamp((a - .08) / .92, 0, 1)), hk * Math.log(1.08) / Math.log(Math.max(1.1, sC)));
    const s = Math.pow(sC, push);                              // the wide shot is scale 1; zoom in log space, so it feels even
    const fx = lerp(narrow ? (RIG.x + RIG.w / 2) * sw : sw / 2, scx, pan), fy = lerp(sh / 2, scy, pan);
    let x = vw / 2 - fx * s, y = lerp(vh / 2, band + (vh - band - foot) / 2, pan) - fy * s;
    x = clamp(x, vw - sw * s, 0); y = clamp(y, vh - sh * s, 0); // never show past the hall's edges
    scene.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
    // close in, the wall behind the screen is the clean, soft rebuild of the plate (a real lens would lose it to focus too)
    const nearO = Math.max(nearFloor, clamp((s - 1.3) / 1.4, 0, 1)).toFixed(3);
    if (nearO !== heroNear.style.opacity) heroNear.style.opacity = nearO;
    // the turn, with a slow breath while it waits; it lands square before the push gets close
    const tA = reduced ? pan : clamp(a / .6, 0, 1);
    const sway = reduced || lite ? 0 : Math.sin((now - swayFrom) / 2400) * 1.6 * (1 - tA);
    const turn = TURN * (1 - inout(tA)) + sway;
    // and the eye steps up and across to the screen's centre as the push closes in, so the close-up is dead square on
    const eye = reduced ? pan : inout(clamp((a - .15) / .6, 0, 1));
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
    if (so !== sayO) { sayO = so; say.style.opacity = so; }
    // the end of the hero: the stage dissolves into the liquid metal behind it, so One pose rises out of the flow
    // instead of the hall sliding away as a hard-edged block
    const fo = reduced ? '1' : clamp((1 - p) / .1, 0, 1).toFixed(3);
    if (fo !== stageO) { stageO = fo; stageEl.style.opacity = fo; }
    heroP = p; heroA = a; heroScale = s;
  }
  function showFlat() { flatOn = true; kioskFlat.hidden = false; heroStill.hidden = true; }
  function flatStation(err) { console.warn('Layer Station: 3D unavailable, showing the still', err); window.__stationErr = String(err); showFlat(); c3d.remove(); hero.classList.remove('is-3d'); s5tex = null; }
  // one classic script (three.js bundled in), loaded from the page's own folder: no module loading for a host to break
  // the setup's files: the station's script and the try-on's four photos (inputsIn: all of them are in)
  let inputs = 0;
  const inputsIn = () => inputs >= 5;
  const loadStation = () => new Promise((ok, no) => {
    if (window.LayerStation) { inputs++; return ok(window.LayerStation); }
    const s = document.createElement('script'); s.src = 'assets/station/station.bundle.js?v=116'; s.async = true;
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
  // the setup's pictures download from the first paint on (quietly, after everything the page needs), so they are in by
  // the time the lockup is written; the setup itself only waits on work, never on the network
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
  // a link straight to a section (/#contact): the browser jumps before the page has its full height (the opening holds
  // the scroll), so it lands short; once the opening is done, land it on the section itself
  opened.then(() => {
    const t = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t && t.id !== 'hero') requestAnimationFrame(() => { const root = document.documentElement, b = root.style.scrollBehavior; root.style.scrollBehavior = 'auto'; scrollTo(0, t.getBoundingClientRect().top + scrollY); root.style.scrollBehavior = b; });
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
  // until the 3D station is up (or without WebGL) its still stands in. It is built the moment its script is in: on the
  // dark screen before the lockup is written (its one blocking step, the lighting, lands on a frame nobody watches), or,
  // if the writing has begun, in the hold after it. Its shaders then compile in the background, and its first draw
  // waits for the hold. On a slow line, whenever its script arrives
  const painted = new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  const stationReady = loadStation().then(async ({ createStation }) => {
    await painted;
    if (playing) await setup;
    try {
      const st = createStation(c3d, {});
      const w0 = pageW(), d0 = stationDpr();
      st.size(w0, innerHeight, d0);
      // the screen's own rect in the plate, square on, from the model
      st.setTurn(0); st.setView(1536, 864, 0, 0, 1536, 864);
      const q = st.screenQuad();
      const W = pageW(); SCREEN = { x: q[0][0] / W, y: q[0][1] / innerHeight, w: (q[1][0] - q[0][0]) / W, h: (q[3][1] - q[0][1]) / innerHeight };
      const tex = screenTexture(st); st.setScreen(tex);
      // its shaders build in the background where the browser can, then one hidden draw (in the hold), so its first
      // frame never stalls
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
  s5.style.transition = 'opacity .7s';
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
  let wipeT = START, wipeTo = START, t0 = performance.now(), looks = [], look = 1, raf = 0, dirty = true, ready = false;
  function size() {
    const k = Math.min(Math.min(devicePixelRatio, 2), 1200 / Math.max(1, canvas.offsetHeight));   // the screen is drawn at its close-up size
    const w = Math.max(2, Math.round(canvas.offsetWidth * k)), h = Math.max(2, Math.round(canvas.offsetHeight * k));
    // resize only on a real change (>8%), so the push-in does not reallocate every frame
    if (Math.abs(w - canvas.width) / canvas.width > .08 || Math.abs(h - canvas.height) / canvas.height > .08) { canvas.width = w; canvas.height = h; dirty = true; }
  }
  function draw(now) {
    size();
    const moving = Math.abs(wipeTo - wipeT) > .001 || (wipeT > -.15 && wipeT < 1.25);
    if (!moving && !dirty) return;
    wipeT += (wipeTo - wipeT) * (reduced ? 1 : .045);
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
    const want = ready && heroP >= .36 ? 'try' : 's5';
    if (want !== phase) {
      phase = want; s5.style.opacity = phase === 's5' ? '1' : '0'; screen.classList.toggle('is-try', phase === 'try');
      showKui(phase === 'try'); dirty = true; playS5();
    }
    if (phase !== 'try') return;
    wipeTo = pourAt(clamp((heroP - .5) / .4, 0, 1));
    const state = wipeT <= START + .01 && wipeTo <= START + .001 ? 'hold' : wipeT < 1.02 ? 'pour' : 'done';
    setText(kuiTitle, { hold: 'HOLD IT THERE.', pour: 'PUTTING IT ON…', done: 'THERE YOU ARE.' }[state]);
    setText(putWord, state === 'done' ? 'TRY ANOTHER' : 'TRY IT ON');
    putOn.classList.toggle('is-hidden', state === 'pour');
    kui.dataset.state = state;
  }
  function loop(now) {
    raf = 0;
    if (!heroOn) return;
    if (heroA < 1 && !reduced && !veiled) layoutHero(now);    // keeps the waiting station breathing (once it can be seen)
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
    // its shader compiles in the background from the first paint; the rest is set up in the hold, after the station
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
    if (!poseSeen) { poseSeen = true; spin(Math.PI); }
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

  /* ───────────── HOW IT WORKS: the kiosk's real screens, pinned on the station's glass, with the kiosk's own beats ───────────── */
  const how = $('#how'), howSteps = $$('.how__steps li'), device = $('#device'), howScreen = $('#howScreen');
  const hsA = $('#hsA'), hsB = $('#hsB'), hsScrim = $('#hsScrim'), hsSheet = $('#hsSheet'), howS5 = $('#howS5'), hsHold = $('#hsHold'), hsEnd = $('#hsEnd'), hsTap = $('#hsTap'), hsFlash = $('#hsFlash');
  // they download as How it works comes near (never with the first view, so a slow line spends itself on the hero).
  // The ending is scrubbed by the scroll, so it is held whole in memory: a blob seeks anywhere at once, on any host
  // (a server without range requests cannot seek a streamed clip)
  const howMedia = () => {
    hsHold.poster = hsHold.dataset.poster; hsHold.preload = 'auto';
    fetch(hsEnd.currentSrc || hsEnd.src).then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => { hsEnd.src = URL.createObjectURL(blob); hsEnd.preload = 'auto'; })
      .catch(() => { hsEnd.preload = 'auto'; });
  };
  opened.then(() => new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); howMedia(); } }, { rootMargin: '150% 0px' }).observe(how));
  const SCR = (n) => `assets/screens/layer/${n}.webp`;
  const SHOT = ['s0', 's2', 's4bottoms', 's5-hold', 's6'].map(SCR), TOPS = SCR('s4top');   // each step's resting screen
  // where the shopper presses, in the kiosk's own 540 x 960 frame
  const PRESS = { s0: [190, 830], women: [146, 785], bottom: [394, 798], tryon: [325, 881], putiton: [240, 887] };
  // the glass in device-frame.webp (900 x 1576), from the 3D model (tools/station_render.py)
  const GLASS = [[132.3, 40.4], [731.6, 28.1], [731.0, 1126.9], [132.9, 1119.3]];
  const placeHowScreen = () => { const k = device.offsetWidth / 900; howScreen.style.transform = homography(540, 960, GLASS.map(([x, y]) => [x * k, y * k])); };
  const SEQ = Array.from({ length: 15 }, (_, i) => SCR(`s0seq/${String(i).padStart(2, '0')}`));
  const held = [];                                              // keep the preloaded frames alive
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { [...SHOT, TOPS, ...SEQ, SCR('sheet-scrim'), SCR('sheet-panel')].forEach((src) => { const i = new Image(); i.src = src; i.decode().catch(() => {}); held.push(i); }); o.disconnect(); } }, { rootMargin: '100% 0px' }).observe(how);
  /* the journey is one film and the scroll is its timeline. Each step owns a stretch of the section, as long as what it
     shows (W): first the kiosk makes its move into it (the tap, the drop, the sheet, S5) at whatever speed you scroll,
     forwards or back, then it rests there. Layer's ending is too long to scrub, so the scroll only cues it: it plays in
     its own time (a little faster if you scroll on), and scrolling back above it fades back to S5. Leave it all alone
     and it plays itself at the kiosk's pace, carrying the scroll with it so the two never disagree */
  const N = howSteps.length;                                    // 5
  const W = [24, 44, 66, 66, 70];                               // each step's share of the scroll, vh (the section is 370vh)
  const MV = [0, .55, .6, .62, .22];                            // the part of it the move fills (the ending's: only its cue)
  const BEAT = [.5, .78, .8, .82, .5];                          // where it rests: what a beat, a click and the pager land on
  const TAIL = .8;                                              // the last fifth of the last step: the photo is wiped, S0 calls the next one
  const CUM = W.reduce((a, w) => [...a, a[a.length - 1] + w], [0]), WT = CUM[N];
  const DUR = [0, .75, 1.6, 2.05, 7.7];                         // each move at the kiosk's pace, s (the ending's is its clip)
  const REST = [3, 2.2, 2.6, 3.4];                              // how long a step rests before it plays on by itself, s
  const IDLE = 1200;                                            // ms without a touch before it plays by itself
  const dur = (i) => (i === N - 1 && hsEnd.duration > 1 ? hsEnd.duration : DUR[i]);
  const fAt = (p) => { const x = clamp(p, 0, 1) * WT; let i = 0; while (i < N - 1 && x >= CUM[i + 1]) i++; return i + clamp((x - CUM[i]) / W[i], 0, .9999); };
  const pAt = (f) => { const i = clamp(Math.floor(f), 0, N - 1); return (CUM[i] + (f - i) * W[i]) / WT; };
  const beat = (i) => i + BEAT[i];
  $$('.snap', how).forEach((el, i) => el.style.setProperty('--at', pAt(beat(i)).toFixed(4)));
  const eo = (t) => 1 - Math.pow(1 - t, 3), eq = (t) => 1 - Math.pow(1 - t, 4);
  const win = (tau, t0, d) => clamp((tau - t0) / d, 0, 1);
  let touchedAt = 0, auto = null, restAt = 0, restOn = -1, howRaf = 0, howNear = false, attractAt = 0;
  // the mouse wheel is the pager's (it decides what a notch does to a playing move); everything else stops the film
  const touched = () => { touchedAt = performance.now(); if (auto) stopAuto(); };
  ['touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach((ev) => addEventListener(ev, touched, { passive: true }));
  addEventListener('wheel', () => { if (!pagerOn.matches || window.__nosnap) touched(); }, { passive: true });
  // a phone settles a beat after the finger lifts, not a second later
  if (coarse) addEventListener('scrollend', () => { if (!auto && howNear) touchedAt = Math.min(touchedAt, performance.now() - IDLE + 300); });
  // pointing at the steps, or a step in focus, holds the film where it is
  let holdOn = false;
  const stepList = $('.how__steps');
  stepList.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') holdOn = true; });
  stepList.addEventListener('pointerleave', () => { holdOn = false; });
  stepList.addEventListener('focusin', () => { holdOn = true; });
  stepList.addEventListener('focusout', () => { holdOn = false; });
  let srcA = '', srcB = '';
  const setA = (s) => { if (s !== srcA) { srcA = s; hsA.src = s; } };
  const setB = (s) => { if (s !== srcB) { srcB = s; hsB.src = s; } };
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
  function attractFrame(now) {
    const t = (now - attractAt) % 5920;
    const k = t < 960 ? Math.floor(t / 64) : t < 3560 ? 14 : t < 4520 ? 14 - Math.floor((t - 3560) / 64) : 0;
    return SEQ[clamp(k, 0, 14)];
  }
  // the ending: a seek waits for the last one to land, so a fast scroll never queues them up
  let endWant = 0, endMode = 'off', endRate = 1;               // off · play (in its own time) · done (on its last frame)
  function seekEnd(t) { endWant = t; if (!hsEnd.seeking && Math.abs(hsEnd.currentTime - t) > .02) hsEnd.currentTime = t; }
  hsEnd.addEventListener('seeked', () => { if (hsEnd.paused && Math.abs(hsEnd.currentTime - endWant) > .02) hsEnd.currentTime = endWant; });
  hsEnd.addEventListener('ended', () => { if (endMode === 'play') endMode = 'done'; });
  function startEnd(from) {
    endMode = 'play'; seekEnd(from); endRate = 1; hsEnd.playbackRate = 1;
    hsEnd.play().catch(() => { endMode = 'done'; seekEnd(Math.max(0, dur(N - 1) - .05)); });
  }
  function stopEnd() { if (endMode === 'off') return; endMode = 'off'; hsEnd.pause(); }
  const sayPs = $$('.how__say p'), howCount = $('.how__count');
  function paint(f, now) {
    const i = clamp(Math.floor(f), 0, N - 1), l = f - i;
    const u = i === 0 || reduced ? 1 : clamp(l / MV[i], 0, 1), tau = u * dur(i);
    if (i !== howAt) {
      howAt = i;
      howSteps.forEach((s, k) => { s.classList.toggle('on', k === i); $('button', s).setAttribute('aria-current', String(k === i)); });
      sayPs.forEach((p, k) => p.classList.toggle('on', k === i));
      howCount.textContent = `0${i + 1} / 0${N}`;
    }
    let a = SHOT[i], b = '', bo = 0, bt = '', scrim = 0, sheet = 0, sheetY = 0, s5 = 0, hold = 'still', holdO = 1, end = false, flash = 0, tap = false;
    let fill = (i + u) / N, wipe = 0;
    if (i < N - 1) stopEnd();
    if (i === 0) a = reduced ? SHOT[0] : attractFrame(now);
    else if (i === N - 1) {                                     // THERE YOU ARE: Layer's ending, cued by the scroll, then in its own time
      wipe = reduced ? 0 : clamp((l - TAIL) / (1 - TAIL), 0, 1);
      if (reduced) a = SHOT[4];
      else {
        if (endMode === 'off') { if (howUp) { endMode = 'done'; seekEnd(Math.max(0, dur(i) - .05)); } else startEnd(0); }
        const ct = endMode === 'done' ? dur(i) : hsEnd.currentTime;
        const rate = l > BEAT[i] + .04 || wipe > 0 ? 2.5 : 1;   // scrolled on past it: it hurries
        if (endMode === 'play' && rate !== endRate) { endRate = rate; hsEnd.playbackRate = rate; }
        a = wipe > 0 ? attractFrame(now) : SHOT[3]; s5 = 1 - wipe; end = true; holdO = 1 - win(ct, 0, .3);
        fill = (i + clamp(ct / dur(i), 0, 1)) / N;
      }
    } else if (u < 1) {
      if (i === 1) {                                            // TOUCH TO START, then the capture
        tap = tapAt(tau, 0, PRESS.s0); flash = flashAt(tau, .3); a = tau < .39 ? SHOT[0] : SHOT[1];
      } else if (i === 2) {                                     // WOMEN: the tops drop in from above; BOTTOM: the rail swaps to bottoms
        if (tau < .9) { tap = tapAt(tau, 0, PRESS.women); a = SHOT[1]; b = TOPS; const e = eq(win(tau, .3, .55)); bo = e; bt = `translateY(${(-35 * (1 - e)).toFixed(1)}px)`; }
        else { tap = tapAt(tau, .9, PRESS.bottom); a = TOPS; b = SHOT[2]; bo = eo(win(tau, 1.2, .32)); }
      } else {                                                  // TRY IT ON: YOUR LOOK rises over S4; PUT IT ON ME: S5
        tap = tau < 1.41 ? tapAt(tau, 0, PRESS.tryon) : tapAt(tau, 1.41, PRESS.putiton);
        a = tau < 1.97 ? SHOT[2] : SHOT[3];
        scrim = tau < 1.97 ? eo(win(tau, .26, .2)) : 0;
        const e = eq(win(tau, .26, .3)); sheet = tau < 1.97 ? e : 0; sheetY = 130 * (1 - e);
        s5 = win(tau, 1.69, .28); hold = 'first';
      }
    } else if (i === 3) { s5 = 1; hold = reduced ? 'still' : 'play'; }
    if (!tap) hsTap.style.opacity = 0;
    hsFlash.style.opacity = flash;
    setA(a);
    if (b) setB(b);
    hsB.style.opacity = b ? bo : 0; hsB.style.transform = bt;
    hsScrim.style.opacity = scrim; hsSheet.style.opacity = sheet; hsSheet.style.transform = sheet ? `translateY(${sheetY.toFixed(1)}px)` : '';
    howS5.style.opacity = s5; howS5.style.visibility = s5 > 0 ? 'visible' : 'hidden';
    // the hold loops while S5 rests, waits on its first frame while S5 arrives, and fades as the ending begins
    hsHold.style.opacity = holdO;
    if (hold === 'play') { if (hsHold.paused && howNear) hsHold.play().catch(() => {}); }
    else {
      if (!hsHold.paused) hsHold.pause();
      if (hold === 'first' && hsHold.currentTime > .05 && !hsHold.seeking) hsHold.currentTime = 0;
    }
    hsEnd.style.opacity = end ? 1 : 0;
    if (!end && !hsEnd.paused) hsEnd.pause();
    howFill = fill;
  }
  // where each step's beat sits in the page, and the scroll that shows a point of the film
  const yAt = (f) => M.howTop + (M.howH - innerHeight) * pAt(f);
  function stopAuto() {
    if (!auto) return;
    auto = null; restOn = -1;
    document.documentElement.style.scrollBehavior = ''; document.documentElement.style.scrollSnapType = '';
  }
  function playOn(i, tau, now) {                                // it plays move i from tau, at the kiosk's pace
    auto = { i, tau, at: now, rate: 1 };
    document.documentElement.style.scrollBehavior = 'auto'; document.documentElement.style.scrollSnapType = 'none';
    if (i === N - 1 && endMode !== 'play') startEnd(tau);
  }
  // a second notch while a move plays: it finishes the move, quickly; a third: it is done, straight onto its beat
  function hurry() {
    if (!auto) return false;
    const now = performance.now();
    if (auto.rate > 1) {
      const i = auto.i; stopAuto();
      if (i === N - 1) { endMode = 'done'; hsEnd.pause(); seekEnd(Math.max(0, dur(i) - .05)); }
      glideTo(Math.round(yAt(beat(i)))); return true;
    }
    auto.tau = Math.min(dur(auto.i), auto.tau + (now - auto.at) / 1000 * auto.rate); auto.at = now; auto.rate = 3;
    if (auto.i === N - 1 && endMode === 'play') { endRate = 3; hsEnd.playbackRate = 3; }
    return true;
  }
  // a click on a step cuts to it, then plays its move: no racing through the steps between
  function cutTo(k) {
    stopGlide(); stopAuto(); stopEnd();
    const r = document.documentElement; r.style.scrollBehavior = 'auto';
    if (!reduced) howScreen.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    scrollTo(0, Math.round(yAt(k === 0 || reduced ? beat(k) : k)));
    r.style.scrollBehavior = '';
    if (k > 0 && !reduced) playOn(k, 0, performance.now());
  }
  // which way the reader last moved: up means they are going back, so idle never pushes them forward again
  let howY = scrollY, howUp = false, backTo = -1, howFill = 0;
  const howBar = $('.how__bar b'), howNext = $('.how__bar i');
  let hpWas = '', hnWas = '';
  function howTick(now) {
    howRaf = requestAnimationFrame(howTick);
    if (!auto) {
      const y = scrollY;
      if (Math.abs(y - howY) > 2) {
        howUp = y < howY;
        if (!gliding && backTo < 0) touchedAt = now;            // any scroll that isn't ours counts as a touch (a scrollbar drag, autoscroll)
      }
      howY = y;
    } else howY = scrollY;
    const top = M.howTop - scrollY, sp = M.howH - innerHeight;
    let f = fAt(-top / sp), next = 0;
    const pinned = top <= 1 && top + M.howH >= innerHeight - 1;
    if (auto) {
      if (!pinned || document.hidden) stopAuto();
      else {
        const i = auto.i, d = dur(i);
        const tau = i === N - 1 ? (endMode === 'done' || hsEnd.ended ? d : hsEnd.currentTime) : Math.min(d, auto.tau + (now - auto.at) / 1000 * auto.rate);
        const to = tau >= d - .01 ? beat(i) : i + MV[i] * (tau / d);   // the move, then the last step onto the beat itself
        if (to > f) { f = to; scrollTo(0, Math.round(yAt(f))); }  // never back: a reader ahead of the clip stays put
        if (tau >= d - .01) { auto = null; restOn = i; restAt = now; document.documentElement.style.scrollBehavior = ''; document.documentElement.style.scrollSnapType = ''; }
      }
    } else if (!reduced && pinned && !gliding && !holdOn && !document.hidden && now - touchedAt > IDLE) {
      const i = clamp(Math.floor(f), 0, N - 1), l = f - i, u = i === 0 ? 1 : clamp(l / MV[i], 0, 1);
      if (u < 1 && howUp) {                                     // left mid-move on the way up: settle back onto the step before
        const t = Math.round(yAt(beat(i - 1)));
        if (backTo !== t) { backTo = t; go(t); }
        if (Math.abs(scrollY - t) < 2) backTo = -1;
      } else if (u < 1) playOn(i, i === N - 1 ? hsEnd.currentTime : u * dur(i), now);   // left mid-move on the way down: it finishes the move
      else if (i < N - 1) {                                     // at rest on a step: a beat to read it (the thread counts it down), then on
        backTo = -1;
        if (restOn !== i) { restOn = i; restAt = Math.max(now, touchedAt + IDLE); }
        if (!howUp) {
          next = clamp((now - restAt) / (REST[i] * 1000), 0, 1);
          if (next >= 1) { scrollTo(0, Math.round(yAt(i + 1))); playOn(i + 1, 0, now); f = i + 1; next = 0; }
        }
      }
    } else if (now - touchedAt <= IDLE || gliding) restOn = -1;
    paint(f, now);
    const hp = howFill.toFixed(3), hn = (next ? howFill + next / N : 0).toFixed(3);
    if (hp !== hpWas) { hpWas = hp; howBar.style.transform = `scaleX(${hp})`; }
    if (hn !== hnWas) { hnWas = hn; howNext.style.transform = `scaleX(${hn})`; }
  }
  // the loop runs only while How it works is near the screen; out of sight, the clips rest
  new IntersectionObserver(([e]) => {
    howNear = e.isIntersecting;
    if (howNear && !howRaf) { attractAt = performance.now(); howRaf = requestAnimationFrame(howTick); }
    else if (!howNear && howRaf) { cancelAnimationFrame(howRaf); howRaf = 0; stopAuto(); hsHold.pause(); hsEnd.pause(); }
  }, { rootMargin: '50% 0px' }).observe(how);
  function howStep() { if (!howRaf) { if (!M.vw) measure(); paint(fAt((scrollY - M.howTop) / (M.howH - innerHeight)), performance.now()); } }
  // the pager's view of How it works: which beat a scroll position is, and a notch that lands on one
  const howBeatAt = (y) => { for (let k = 1; k < N; k++) if (Math.abs(y - yAt(beat(k))) < 3) return k; return -1; };
  howSteps.forEach((s, k) => $('button', s).addEventListener('click', () => cutTo(k)));

  /* ───────────── LIVING METAL: the liquid chrome the S5 ring is made of flows behind the translucent page, far bigger
     than any screen (the ring's own shader, zoomed in until only its bands cross the frame), turning as you scroll ───────────── */
  const streamCv = document.createElement('canvas');
  streamCv.className = 'stream'; streamCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(streamCv);
  // it waits out of sight behind the hero until the hero is nearly done. Its shader compiles in the background (seconds,
  // cold, on some GPUs); setting it up holds the page for a few frames, so it is mounted by the setup, while the written
  // lockup holds still. Its size follows the GPU (budget: ms per frame), so integrated graphics keep their frames
  let stream = null, streamAsked = false, movedAt = 0;   // movedAt: the last scroll or wheel (the metal warms only when nobody is scrolling)
  ['scroll', 'wheel', 'touchmove'].forEach((ev) => addEventListener(ev, () => { movedAt = performance.now(); }, { passive: true }));
  // its script loads only now (it is never needed before the end of the hero, so it never competes with the opening)
  function mountStream() {
    if (streamAsked) return; streamAsked = true;
    if (!('Molten' in window)) {
      const sc = document.createElement('script'); sc.src = 'assets/molten.js?v=116'; sc.async = true;
      sc.onload = () => { streamAsked = false; if (window.Molten) mountStream(); else streamCv.remove(); };
      sc.onerror = () => streamCv.remove(); document.head.appendChild(sc); return;
    }
    requestAnimationFrame(() => {
      try { stream = window.Molten ? Molten.mount(streamCv, { still: reduced, fps: 30, zoom: 11, maxW: 1100, scale: .6, budget: 7, quiet: () => performance.now() - movedAt > 700 }) : null; } catch (err) { stream = null; }
      if (!stream) streamCv.remove();
    });
  }
  let underWas = null, howGlow = 0;
  function metalFrame(now) {
    requestAnimationFrame(metalFrame);
    const vw = innerWidth, vh = innerHeight;
    if (!streamAsked && heroP > .4) mountStream();
    if (!lite && stream && stream.quality.fps <= 15) goLite();     // the metal at its lightest and still heavy: the GPU is weak
    // the flow sits out of sight behind the opaque hero, and turns and drifts with the page after it
    if (stream) {
      const under = heroOn && heroP < .9, hold = under || (lite && performance.now() - movedAt < 250);   // lite: still while scrolling
      if (hold !== underWas) { underWas = hold; streamCv.dataset.paused = hold ? '1' : ''; }
      streamCv.classList.toggle('away', under);
      const y = scrollY / vh, t = reduced ? 0 : now / 1000;
      // while a look renders in How it works, the flow swells and turns toward the screen: the one motion is the render's
      const glowTo = howNear && (howAt === 3 || (howAt === N - 1 && endMode === 'play')) ? 1 : 0;
      howGlow += (glowTo - howGlow) * (reduced ? 1 : .035);
      // the loop's radius is ~12 units, so a centre ~13 to the right brings its near side sweeping through the right half
      stream.set({ yaw: .35 + .25 * Math.sin(y * .5 + t * .03) + yawKick * .25, tiltAdd: .2 + .1 * Math.sin(y * .37) + melt * .3,
        dx: 13 + 2.5 * Math.sin(y * .31) - 3 * howGlow, dy: 2.5 * Math.cos(y * .43), dim: (vw < 861 ? .46 : .56) + .2 * howGlow, sway: .35 + .25 * howGlow, ...(window.__streamTune || {}) });
    }
  }
  const spin = (by) => { yawKick += by; };
  window.__metal = () => ({ howAt, phase, heroOn, lite, stationGpuMs: +gpuMs.toFixed(2), stream: !!stream, flow: stream && stream.quality, s5: { hero: s5vid.currentTime, hold: hsHold.currentTime, end: hsEnd.currentTime } });   // for review tools

  /* ───────────── THREADS: scroll speed melts the stitches into chrome and speeds every band; rest sets them back ───────────── */
  const threads = $$('.thread');
  let melt = 0, vel = 0, lastY = scrollY, lastT = performance.now(), flowRaf = 0, flowList = null, meltWas = '0', rateWas = 1;
  function flow(now) {
    flowRaf = 0;
    const dt = Math.max(1, now - lastT), y = scrollY;
    vel += (Math.abs(y - lastY) / dt - vel) * .2;               // px per ms, smoothed
    lastY = y; lastT = now;
    const target = clamp(vel / 2.2, 0, 1);
    melt += (target - melt) * (target > melt ? .25 : .06);
    // written only when they change by a visible step: every write restyles the threads, and every new playback rate
    // restarts the bands' animations on the compositor
    const m = melt.toFixed(2);
    if (m !== meltWas) { meltWas = m; threads.forEach((t) => t.style.setProperty('--melt', m)); }
    flowList ||= document.getAnimations().filter((an) => ['feed', 'sheen', 'tick', 'run'].includes(an.animationName));
    const rate = Math.round((1 + melt * 4) * 4) / 4;
    if (rate !== rateWas) { rateWas = rate; flowList.forEach((an) => { an.playbackRate = rate; }); }
    if (melt > .003 || vel > .01) flowRaf = requestAnimationFrame(flow);
    else { melt = 0; meltWas = '0'; rateWas = 1; threads.forEach((t) => t.style.setProperty('--melt', '0')); flowList.forEach((an) => { an.playbackRate = 1; }); document.documentElement.classList.remove('moving'); }
  }
  const kick = () => { if (!flowRaf && !reduced) { document.documentElement.classList.add('moving'); lastT = performance.now() - 16; flowRaf = requestAnimationFrame(flow); } };

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
  let pastWas = null;
  function header() {
    const y = scrollY;
    if (y < 90) showBand(true);
    else if (performance.now() - intentAt > 900) {             // no wheel or touch just now (a scrollbar drag): read the scroll itself
      if (y < prevY - 2) showBand(true); else if (y > prevY + 6) showBand(false);
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

  /* ───────────── PAGER: on a desktop, every mouse-wheel flick or arrow key lands the next scene, or the next beat of a pinned
     stage, in either direction. A trackpad keeps the browser's own scrolling (its momentum, smooth both ways) ───────────── */
  function snapPoints() {
    const y = scrollY;
    const ps = [...$$('.snap'), ...$$('.win')].map((el) => Math.round(el.getBoundingClientRect().top + y));
    ps.push(document.documentElement.scrollHeight - innerHeight);
    return [...new Set(ps)].sort((a, b) => a - b);
  }
  function step(dir) {
    const y = gliding ? glideTarget : scrollY, ps = snapPoints();
    const t = dir > 0 ? ps.find((c) => c > y + 4) : [...ps].reverse().find((c) => c < y - 4);
    if (t === undefined) return;
    // a notch onto the next beat of How it works plays that move at the kiosk's own pace (carrying the page with it), so
    // a render or the ending is watched, not skimmed in a fifth of a second
    const k = dir > 0 && !reduced && !gliding ? howBeatAt(t) : -1;
    if (k < 1) { glideTo(t); return; }
    stopAuto();
    const fy = fAt((y - M.howTop) / (M.howH - innerHeight));
    playOn(k, fy > k ? clamp((fy - k) / MV[k], 0, 1) * dur(k) : 0, performance.now());
    if (fy < k) scrollTo(0, Math.round(yAt(k)));
  }
  // each gesture's first event says what made it: a trackpad sends fine, often fractional pixel deltas (and a little
  // sideways drift); a mouse wheel sends whole notches. A pause ends a gesture
  let quietAt = 0, used = false, acc = 0, pad = false, padAt = 0;
  addEventListener('wheel', (e) => {
    if (!pagerOn.matches || e.ctrlKey || window.__nosnap || document.documentElement.classList.contains('splashing')) return;
    const now = performance.now(), fresh = now - quietAt > 180;
    quietAt = now;
    if (fresh) { used = false; acc = 0; pad = e.deltaMode === 0 && (Math.abs(e.deltaY) < 50 || !Number.isInteger(e.deltaY) || e.deltaX !== 0); }
    if (pad) { padAt = now; stopGlide(); touched(); return; }  // the trackpad scrolls the page itself
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;       // sideways: the pose strip
    e.preventDefault();
    if (used) return;
    acc += e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    if (Math.abs(acc) >= 28) {
      used = true; touchedAt = now;
      if (acc > 0 && hurry()) return;                           // a move is playing: this notch finishes it, quickly
      stopAuto(); step(Math.sign(acc));                         // during a glide, a new flick goes one further
    }
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (!pagerOn.matches || e.altKey || e.ctrlKey || e.metaKey || window.__nosnap) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const space = e.key === ' ' && !(e.target.closest && e.target.closest('button, a, summary'));
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (space && !e.shiftKey);
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (space && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    if (!gliding) step(down ? 1 : -1);
  });
  // a scrollbar drag lands on the nearest beat; anchors glide to their scene
  addEventListener('scrollend', () => {
    if (!pagerOn.matches || gliding || window.__nosnap || auto || performance.now() - padAt < 1500) return;
    if (autoScroll) { autoScroll = false; return; }
    const y = scrollY, ps = snapPoints(), t = ps.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
    if (Math.abs(t - y) > 6) glideTo(t);
  });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
    if (!el || !pagerOn.matches) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + scrollY, ps = snapPoints();
    glideTo(ps.find((c) => c >= top - 2) ?? top);
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }));

  // one scroll handler for the whole page, once per frame
  let ticking = false;
  function onScroll() {
    kick();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; if (heroOn) layoutHero(); howStep(); wake(); header(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  const resized = () => { measure(); if (station) station.size(pageW(), innerHeight, stationDpr()); sizeScreen(); layoutHero(); placeHowScreen(); howStep(); dirty = true; wake(); };
  addEventListener('resize', resized);
  // anything that moves the page's geometry without a resize re-measures (fonts arriving, a phone's sections settling);
  // a change of width (a scrollbar coming or going) resizes everything, the 3D frame included
  new ResizeObserver(() => { const w = pageW(); if (w !== M.vw || w !== sizedW) resized(); else { measure(); if (heroOn) layoutHero(); } }).observe(document.body);
  placeHowScreen(); howStep(); header();
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
  // the setup, in turn, while the written lockup holds still: the station, then the try-on, then every scene's layout
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

  /* ───────────── FAQ: the metal turns with each answer ───────────── */
  $$('.faq details').forEach((d) => d.addEventListener('toggle', () => spin(d.open ? Math.PI / 2 : -Math.PI / 2)));

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
