/* Layer Station in 3D: the Gen-2 kiosk (a thin-bezel portrait screen over a camera box, a shelf, two square legs,
   a base plate) in glossy black, lit by a dark studio environment and one top spotlight, with a blurred wet-floor
   reflection and a soft contact shadow. The screen's active area is left for live HTML: screenQuad() returns its
   projected corners so the page can pin the real kiosk UI onto the glass. Sizes are metres, from the PRD (75 cm
   housing on a 95 cm stand); the origin is the floor under the station's centre. */
import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const KIOSK = {
  base: { w: .46, h: .016, d: .34 },
  leg: { s: .036, x: .125, z: -.012 },
  shelf: { y: .95, w: .40, h: .018, d: .22, z: .014 },
  body: { w: .322, d: .095, cam: .15, gap: .0022 },
  bezel: { side: .0125, top: .014, bottom: .017 },
  active: { w: .2965, h: .527 },                 // a 23.8 in 9:16 panel
};
const K = KIOSK;
const SCREEN_H = K.active.h + K.bezel.top + K.bezel.bottom;
const BODY_Y0 = K.shelf.y + K.shelf.h;
export const TOP = BODY_Y0 + K.body.cam + K.body.gap + SCREEN_H;
// centre of the active area, in the station's own frame
export const ACTIVE_C = { y: BODY_Y0 + K.body.cam + K.body.gap + K.bezel.bottom + K.active.h / 2, z: K.body.d / 2 + .0009 };

// a dark hall, as the glossy surfaces should see it: a softbox overhead (the spotlight), two faint lilac rims, a dim floor
function studio(warm = 0) {
  const s = new THREE.Scene();
  const tint = (rgb) => rgb.map((c, i) => c * (1 - warm) + c * [1, .88, .72][i] * warm);
  const room = new THREE.Mesh(new THREE.BoxGeometry(40, 16, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(.012, .01, .016), side: THREE.BackSide }));
  room.position.y = 7; s.add(room);
  const panel = (w, h, rgb, k, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(...tint(rgb)).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); s.add(m); return m;
  };
  panel(3.4, 3.4, [1, .98, 1], 16, [0, 8.5, .6], [Math.PI / 2, 0, 0]);         // the spotlight, overhead
  panel(.9, 10, [.86, .8, 1], 5.5, [-5.5, 4.2, 3.2], [0, Math.PI / 2.6, 0]);  // a tall lilac-white rim, left: the edge highlight
  panel(.9, 10, [.86, .8, 1], 3.2, [5.5, 4.2, 2.6], [0, -Math.PI / 2.6, 0]);  // and right
  // two big soft panels behind, either side: what a turned side face reflects, so the turn reads
  panel(5, 7, [.82, .76, 1], 1.6, [7, 3.4, -6], [0, -Math.PI / 4, 0]);
  panel(5, 7, [.82, .76, 1], .9, [-7, 3.4, -6], [0, Math.PI / 4, 0]);
  // the hall behind the camera, as the glass and the glossy fronts see it: a soft band, brighter up high
  const band = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying vec2 v; void main(){ float k = smoothstep(.15, .95, v.y) * (1. - abs(v.x - .5) * 1.4); gl_FragColor = vec4(vec3(.8, .76, .96) * (.12 + k * 1.9), 1.); }' }));
  band.position.set(0, 3.2, 12); band.rotation.y = Math.PI; s.add(band);
  panel(10, 10, [.75, .7, .95], .18, [0, .02, 0], [-Math.PI / 2, 0, 0]);       // the lit floor under the spot
  return s;
}

// a material that fades with depth below the floor, for the mirrored copy
function reflectionOf(mat) {
  const m = mat.clone();
  m.transparent = true; m.depthWrite = true;
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWY;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor *= smoothstep(-.85, -.02, vWY);');
  };
  m.customProgramCacheKey = () => 'refl';
  return m;
}

export function createStation(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: !!opts.preserve, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.05;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(opts.warm || 0), .025).texture;
  pmrem.dispose();

  // ── materials ──
  const gloss = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .035, envMapIntensity: 1.25 });
  const satin = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: .5, metalness: .25, clearcoat: .35, clearcoatRoughness: .3, envMapIntensity: .9 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x010102, roughness: .03, metalness: 0, clearcoat: 1, clearcoatRoughness: .01, envMapIntensity: 1.3 });
  const seam = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const lensRim = new THREE.MeshPhysicalMaterial({ color: 0x1a1b20, roughness: .22, metalness: .9, envMapIntensity: 1.4 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x050812, roughness: .02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.6 });
  const activeMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });

  // ── the station ──
  const station = new THREE.Group();
  const add = (geo, mat, x, y, z, parent = station) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  add(new RoundedBoxGeometry(K.base.w, K.base.h, K.base.d, 3, .006), satin, 0, K.base.h / 2, 0);
  const legH = K.shelf.y - K.base.h;
  for (const sx of [-1, 1]) add(new RoundedBoxGeometry(K.leg.s, legH, K.leg.s, 3, .005), satin, sx * K.leg.x, K.base.h + legH / 2, K.leg.z);
  add(new RoundedBoxGeometry(K.shelf.w, K.shelf.h, K.shelf.d, 3, .005), satin, 0, K.shelf.y + K.shelf.h / 2, K.shelf.z);
  // the camera box and the screen head, two glossy shells with a hairline seam between them
  add(new RoundedBoxGeometry(K.body.w, K.body.cam, K.body.d, 4, .009), gloss, 0, BODY_Y0 + K.body.cam / 2, 0);
  add(new THREE.BoxGeometry(K.body.w - .006, K.body.gap + .001, K.body.d - .006), seam, 0, BODY_Y0 + K.body.cam + K.body.gap / 2, 0);
  const headY = BODY_Y0 + K.body.cam + K.body.gap + SCREEN_H / 2;
  add(new RoundedBoxGeometry(K.body.w, SCREEN_H, K.body.d, 4, .009), gloss, 0, headY, 0);
  // the cover glass runs edge to edge over the head; the active area sits just under it
  add(new THREE.PlaneGeometry(K.body.w - .008, SCREEN_H - .008), glass, 0, headY, K.body.d / 2 + .0005);
  const active = add(new THREE.PlaneGeometry(K.active.w, K.active.h), activeMat, 0, ACTIVE_C.y, ACTIVE_C.z);
  // the camera: a dark metal rim and its lens, centred on the box
  const lens = new THREE.Group(); lens.position.set(0, BODY_Y0 + K.body.cam * .5, K.body.d / 2); lens.rotation.x = Math.PI / 2; station.add(lens);
  add(new THREE.CylinderGeometry(.021, .021, .006, 48), lensRim, 0, .003, 0, lens);
  add(new THREE.CylinderGeometry(.0135, .0135, .0072, 48), lensGlass, 0, .0036, 0, lens);
  scene.add(station);

  // ── the wet floor: a mirrored, fading, blurred copy, and a contact shadow ──
  const mirror = station.clone(true);
  mirror.scale.y = -1;
  mirror.traverse((o) => { if (o.isMesh) { o.material = o.material === activeMat ? activeMat : reflectionOf(o.material); o.layers.set(1); } });
  scene.add(mirror);
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,.85)'); r.addColorStop(.35, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .78), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .0008; scene.add(shadow);

  // ── light ──
  const spot = new THREE.SpotLight(opts.warm ? 0xffe6c4 : 0xf4f0ff, opts.spot ?? 55, 0, .42, .85, 1.6);
  spot.position.set(.1, 6, .9); spot.target.position.set(0, 1, 0); scene.add(spot, spot.target);
  scene.add(new THREE.HemisphereLight(0x8a78c0, 0x060508, .12));
  // the lit screen spills a little bone light onto the shelf and the floor in front of it
  const spill = new THREE.PointLight(0xefe9dd, opts.spill ?? .5, 1.6, 2);
  spill.position.set(0, ACTIVE_C.y - .05, .35); station.add(spill);

  // ── camera: level, matched to the hall plate; zoom and pan are a crop of the full frame (setViewOffset) ──
  const cam = new THREE.PerspectiveCamera(opts.fov ?? 35, opts.aspect ?? 1536 / 864, .05, 200);
  cam.position.set(0, opts.eye ?? 1.03, 0);
  const at = opts.at ?? { x: .577, z: -3.82 };
  station.position.set(at.x, 0, at.z); mirror.position.copy(station.position); shadow.position.x = at.x; shadow.position.z = at.z;
  // the eye can step, level, from the plate's camera to square in front of the glass (setEye). The crop steps with it,
  // so the glass stays where it was in the frame (the glass is parallel to the lens, so its size holds too) and only the
  // angle on the station changes: its sides and underside fold away and the screen faces you
  const eye0 = { x: cam.position.x, y: cam.position.y };
  let view = null, lift = 0;
  function applyView() {
    if (!view) return;
    const [fullW, fullH, x, y, w, h] = view;
    const f = fullH / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const Z = cam.position.z - (station.position.z + ACTIVE_C.z);
    cam.position.set(eye0.x + (station.position.x - eye0.x) * lift, eye0.y + (ACTIVE_C.y - eye0.y) * lift, cam.position.z);
    const ox = -f * (cam.position.x - eye0.x) / Z, oy = f * (cam.position.y - eye0.y) / Z;
    cam.setViewOffset(fullW, fullH, x + ox, y + oy, w, h); cam.updateProjectionMatrix(); dirty = true;
  }

  // ── reflection pass: render the mirror alone at half size, blur it (streaky, like wet concrete), lay it under ──
  const rtA = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType }), rtB = rtA.clone();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } },
    vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform sampler2D tex; uniform vec2 dir; varying vec2 v;
      void main(){ vec4 c = vec4(0.); float w[5]; w[0]=.227; w[1]=.195; w[2]=.122; w[3]=.054; w[4]=.016;
        c += texture2D(tex, v) * w[0];
        for (int i = 1; i < 5; i++) { c += texture2D(tex, v + dir * float(i)) * w[i]; c += texture2D(tex, v - dir * float(i)) * w[i]; }
        gl_FragColor = c; }`,
    depthTest: false, depthWrite: false,
  });
  const showMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, k: { value: opts.reflect ?? .42 } },
    vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: 'uniform sampler2D tex; uniform float k; varying vec2 v; void main(){ gl_FragColor = texture2D(tex, v) * k; }',
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
  const quadScene = new THREE.Scene(); quadScene.add(quad);

  let W = 2, H = 2, dirty = true;
  function size(w, h, dpr = Math.min(devicePixelRatio || 1, 2)) {
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); W = w; H = h;
    const rw = Math.max(2, Math.round(w * dpr / 2)), rh = Math.max(2, Math.round(h * dpr / 2));
    rtA.setSize(rw, rh); rtB.setSize(rw, rh); dirty = true;
  }
  function render() {
    // the mirror first, into a target, blurred: mostly vertical streaks, a little sideways
    cam.layers.set(1);
    renderer.setRenderTarget(rtA); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    const px = 1 / rtA.width, py = 1 / rtA.height;
    quad.material = blurMat;
    blurMat.uniforms.tex.value = rtA.texture; blurMat.uniforms.dir.value.set(px * 1.2, 0); renderer.setRenderTarget(rtB); renderer.clear(); renderer.render(quadScene, quadCam);
    blurMat.uniforms.tex.value = rtB.texture; blurMat.uniforms.dir.value.set(0, py * 3.2); renderer.setRenderTarget(rtA); renderer.clear(); renderer.render(quadScene, quadCam);
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 0); renderer.clear();
    quad.material = showMat; showMat.uniforms.tex.value = rtA.texture;
    renderer.autoClear = false;
    renderer.render(quadScene, quadCam);
    cam.layers.set(0);
    renderer.render(scene, cam);
    renderer.autoClear = true;
    dirty = false;
  }
  const v3 = new THREE.Vector3();
  // the active area's corners on the canvas (CSS px): top-left, top-right, bottom-right, bottom-left
  function screenQuad() {
    station.updateMatrixWorld(); cam.updateMatrixWorld();
    const hw = K.active.w / 2, hh = K.active.h / 2;
    return [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].map(([x, y]) => {
      v3.set(x, ACTIVE_C.y + y, ACTIVE_C.z).applyMatrix4(station.matrixWorld).project(cam);
      return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H];
    });
  }
  // any point on the station (its own frame, metres) on the canvas, in CSS px
  function project(x, y, z) {
    station.updateMatrixWorld(); cam.updateMatrixWorld();
    v3.set(x, y, z).applyMatrix4(station.matrixWorld).project(cam);
    return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H];
  }
  return {
    THREE, renderer, scene, station, camera: cam, active, size, render, screenQuad, project,
    get dirty() { return dirty; },
    setTurn(rad) { if (station.rotation.y !== rad) { station.rotation.y = rad; mirror.rotation.y = rad; dirty = true; } },
    // crop of the full frame, in the plate's own pixels (1536 x 864 for the hall)
    setView(fullW, fullH, x, y, w, h) { view = [fullW, fullH, x, y, w, h]; applyView(); },
    // 0: the plate's eye (level, 1.03 m, left of the station); 1: square on to the glass, at its centre
    setEye(t) { if (lift !== t) { lift = t; applyView(); } },
    // a free camera (for stills composited into other photos): position, target, vertical fov, aspect
    aim(pos, target, fov = cam.fov, aspect = cam.aspect) {
      view = null; cam.clearViewOffset(); cam.position.set(...pos); cam.fov = fov; cam.aspect = aspect; cam.updateProjectionMatrix(); cam.lookAt(...target); dirty = true;
    },
    floor(on) { mirror.visible = on; shadow.visible = on; dirty = true; },
    setScreen(texture) { activeMat.map = texture; activeMat.color.set(texture ? 0xffffff : 0x000000); activeMat.needsUpdate = true; dirty = true; },
    place(x, z, rotY = station.rotation.y) { station.position.set(x, 0, z); mirror.position.copy(station.position); shadow.position.set(x, .0008, z); station.rotation.y = mirror.rotation.y = rotY; dirty = true; },
    reflect(k) { showMat.uniforms.k.value = k; dirty = true; },
  };
}
