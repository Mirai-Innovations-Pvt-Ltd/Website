/* Live liquid-chrome loop for the hero's S5 screen. The shader is Mirai's round-3 molten loop (generative-16 shape,
   S5 material), spinning in real time with a transparent ground.
   Usage: Molten.mount(canvas, { still, fps }) -> { start(), stop(), set({ dim, skin, yaw, tiltAdd, sway, fps }) }
   still: draw one frame and hold it (reduced motion). set() eases to its targets: dim (1 = the kiosk's S5), skin (1 = the GO
   lime-negative), yaw/tiltAdd (radians), sway (0 = no idle sway). The canvas may be moved between parents; its context survives. */
window.Molten = (() => {
  const FS = "#version 300 es\nprecision highp float;\nout vec4 o;\nuniform vec2 uFull, uOff, uTile, uFrame;\nuniform int uMode, uSpp;\nuniform float uTime, uDim, uSkin, uYaw, uTiltAdd, uSway;\nuniform vec4 uA, uP;            // r(t) = 1 + sum a_k sin(k t + p_k), k = 1..4\nuniform float uR, uSx, uSy, uRot, uCx, uCy, uTilt, uWarp, uD;\nuniform float uW0, uW1, uWk, uTL, uW2, uTU, uWk2, uT0, uT1;   // width / thickness profile along t\nuniform float uPc, uPa, uPd;    // twist phi(t) = t + c + a sin(t + d)\nuniform vec3 uCeilC;\nuniform float uWashF, uWashS, uKeyW, uKeyL, uStripY, uStripH, uKeyX, uKeyY;\nuniform float uSt1, uSt2, uSs1, uSs2, uIri, uExp, uRim, uFloor, uSky, uBack, uKey, uStrip, uTeal, uBase, uCeil, uCeilY;\nconst float PI = 3.14159265;\n\nfloat rr(float t){ return uR*(1.+uA.x*sin(t+uP.x)+uA.y*sin(2.*t+uP.y)+uA.z*sin(3.*t+uP.z)+uA.w*sin(4.*t+uP.w)); }\nfloat rr1(float t){ return uR*(uA.x*cos(t+uP.x)+2.*uA.y*cos(2.*t+uP.y)+3.*uA.z*cos(3.*t+uP.z)+4.*uA.w*cos(4.*t+uP.w)); }\nfloat rr2(float t){ return -uR*(uA.x*sin(t+uP.x)+4.*uA.y*sin(2.*t+uP.y)+9.*uA.z*sin(3.*t+uP.z)+16.*uA.w*sin(4.*t+uP.w)); }\nmat2 rot2(float a){ float c=cos(a), s=sin(a); return mat2(c,s,-s,c); }\nvec2 cpos(float t){ float r=rr(t); return rot2(uRot)*vec2(uSx*r*cos(t), uSy*r*sin(t)); }\nvec2 cd1(float t){ float r=rr(t), r1=rr1(t), c=cos(t), s=sin(t); return rot2(uRot)*vec2(uSx*(r1*c-r*s), uSy*(r1*s+r*c)); }\nvec2 cd2(float t){ float r=rr(t), r1=rr1(t), r2=rr2(t), c=cos(t), s=sin(t); return rot2(uRot)*vec2(uSx*(r2*c-2.*r1*s-r*c), uSy*(r2*s+2.*r1*c-r*s)); }\nfloat bump(float t, float c, float k){ return exp(k*(cos(t-c)-1.)); }\nfloat Wof(float t){ return uW0 + uW1*bump(t,uTL,uWk) + uW2*bump(t,uTU,uWk2); }\nfloat Tof(float t){ return uT0 + uT1*bump(t,uTL,uWk); }\n\nvec3 toObj(vec3 p){ float a=uSway*.55*sin(uTime*.45)+uYaw; float ca=cos(a), sa=sin(a); p = vec3(ca*p.x+sa*p.z, p.y, -sa*p.x+ca*p.z);\n  float tl=uTilt+uTiltAdd+uSway*.12*sin(uTime*.6); float c=cos(tl), s=sin(tl); return vec3(p.x, p.y*c-p.z*s, p.y*s+p.z*c); }\nvec3 warp(vec3 p){\n  return uWarp*vec3(sin(.21*p.y+1.7)+.5*sin(.37*p.x+.4*p.y+2.3),\n                    sin(.19*p.x+.6)+.5*sin(.33*p.y-.2*p.x+.9),\n                    .7*sin(.17*p.x+.23*p.y+1.1)+.4*sin(.29*p.y+.4));\n}\nfloat smin(float a, float b, float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }\nfloat sdEll2(vec2 p, vec2 r){ float k0=length(p/r), k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-4); }\nfloat sdEll3(vec3 p, vec3 r){ float k0=length(p/r), k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-4); }\nfloat sdStad(vec2 p, vec2 r){ return length(vec2(max(abs(p.x)-(r.x-r.y),0.), p.y)) - r.y; }\n\nfloat closestT(vec2 q){\n  vec2 qq = rot2(-uRot)*q;\n  float t = atan(qq.y/uSy, qq.x/uSx);\n  for(int i=0;i<4;i++){\n    vec2 c=cpos(t), d1=cd1(t), d2=cd2(t), e=c-q;\n    float g=dot(e,d1), gp=dot(d1,d1)+dot(e,d2);\n    if(gp<.2*dot(d1,d1)) gp=dot(d1,d1);\n    t -= clamp(g/gp,-.25,.25);\n  }\n  return t;\n}\nfloat bandSD(vec3 q){\n  float t = closestT(q.xy);\n  vec2 c = cpos(t); vec2 T = normalize(cd1(t)); vec2 N = vec2(T.y,-T.x);\n  vec2 e = q.xy-c; float u = dot(e,N), v = q.z;\n  float Wd = Wof(t), Th = Tof(t);\n  float phi = t + uPc + uPa*sin(t+uPd);\n  float cp=cos(phi), sp=sin(phi);\n  vec2 ab = vec2(cp*u+sp*v, -sp*u+cp*v);\n  vec2 rad = vec2(Wd*.5, Th*.5);\n  return mix(sdEll2(ab,rad), sdStad(ab,rad), .45);\n}\nfloat blob(vec3 q, float t0, float sc){\n  vec2 c = cpos(t0); vec2 T = normalize(cd1(t0)); vec2 N = vec2(T.y,-T.x);\n  float Wd = Wof(t0), Th = Tof(t0);\n  vec2 e = q.xy-c;\n  vec3 l = vec3(dot(e,T), dot(e,N), q.z);\n  return sdEll3(l, vec3(4.6, Wd*.42, Th*.5*sc));\n}\nfloat map(vec3 p){\n  vec3 q = toObj(vec3(p.x-uCx, p.y-uCy, p.z)); q += warp(q);\n  float d = bandSD(q);\n  d = smin(d, blob(q, uSt1, uSs1), .8);\n  d = smin(d, blob(q, uSt2, uSs2), .8);\n  return d;\n}\nvec3 calcN(vec3 p){\n  const vec2 k = vec2(1,-1); float h = .002;\n  return normalize(k.xyy*map(p+k.xyy*h)+k.yyx*map(p+k.yyx*h)+k.yxy*map(p+k.yxy*h)+k.xxx*map(p+k.xxx*h));\n}\nvec3 lin(vec3 c){ return pow(c, vec3(2.2)); }\nfloat strip(float x, float w, float s){ return smoothstep(w+s, w-s, abs(x)); }\n// studio: near-black room, hard white key softbox (top-left diagonal), white vertical strip (right),\n// magenta rim (left), periwinkle rim (right), narrow plum floor bounce, indigo sky panel, teal kicker.\nvec3 env(vec3 r){\n  vec3 col = lin(vec3(5.,4.,7.)/255.)*uBase;\n  if(r.z > .05){\n    vec2 P = r.xy / r.z;\n    vec2 dg = normalize(vec2(1.,1.));\n    float across = dot(P - vec2(uKeyX,uKeyY), vec2(-dg.y,dg.x));\n    float along = dot(P - vec2(uKeyX,uKeyY), dg);\n    col += uKey*vec3(1.,.97,1.03)*strip(across,uKeyW,.02)*strip(along,uKeyL,.25);\n    col += uStrip*vec3(.98,.97,1.04)*strip(P.x-1.15,.09,.015)*strip(P.y-uStripY,uStripH,.2);\n  }\n  col += uRim*2.2*lin(vec3(208.,80.,158.)/255.)*smoothstep(.66,.71,-r.x)*smoothstep(.86,.80,-r.x)*smoothstep(-.45,-.30,r.z)*smoothstep(.75,.6,abs(r.y));\n  col += uRim*1.8*lin(vec3(185.,203.,250.)/255.)*smoothstep(.74,.79,r.x)*smoothstep(.88,.83,r.x)*smoothstep(-.45,-.30,r.z)*smoothstep(.75,.6,abs(r.y));\n  // floor bounce: a narrow low panel (not a broad satin wash)\n  col += uFloor*1.3*lin(vec3(138.,47.,124.)/255.)*smoothstep(-.50,-.56,r.y)*smoothstep(-.80,-.74,r.y)*smoothstep(.8,.65,abs(r.x));\n  col += uWashF*lin(vec3(138.,47.,124.)/255.)*smoothstep(-.2,-.7,r.y);\n  // sky panel overhead\n  col += uSky*1.4*lin(vec3(101.,119.,212.)/255.)*smoothstep(.52,.60,r.y)*smoothstep(.82,.74,r.y)*smoothstep(.8,.65,abs(r.x))*smoothstep(-.6,-.2,r.z);\n  col += uWashS*lin(vec3(101.,119.,212.)/255.)*smoothstep(.3,.9,r.y);\n  // dim graphite-violet ceiling with a crisp edge: flat faces get a liquid horizon line instead of dead black\n  col += uCeil*lin(vec3(uCeilC.x,uCeilC.y,uCeilC.z)/255.)*smoothstep(uCeilY,uCeilY+.03,r.y)*smoothstep(-.7,-.3,r.z+.0);\n  // back kicker (silhouette edges)\n  col += uBack*lin(vec3(101.,119.,212.)/255.)*smoothstep(-.6,-.9,r.z)*smoothstep(-.2,.3,r.y);\n  col += uBack*lin(vec3(208.,80.,158.)/255.)*smoothstep(-.6,-.9,r.z)*smoothstep(.3,-.2,r.y);\n  // teal kicker, lower right behind\n  col += uTeal*2.4*lin(vec3(79.,179.,176.)/255.)*smoothstep(.38,.46,r.x)*smoothstep(-.28,-.36,r.y)*smoothstep(.1,-.1,r.z);\n  return col;\n}\nfloat rgbHue(vec3 c){\n  vec4 K = vec4(0.,-1./3.,2./3.,-1.);\n  vec4 p = mix(vec4(c.bg,K.wz), vec4(c.gb,K.xy), step(c.b,c.g));\n  vec4 q = mix(vec4(p.xyw,c.r), vec4(c.r,p.yzx), step(p.x,c.r));\n  float d = q.x-min(q.w,q.y);\n  return abs(q.z+(q.w-q.y)/(6.*d+1e-10));\n}\nvec3 ramp(float h){\n  vec3 a=lin(vec3(208.,80.,158.)/255.), b=lin(vec3(101.,119.,212.)/255.), c=lin(vec3(185.,203.,250.)/255.), d=lin(vec3(138.,47.,124.)/255.), e=lin(vec3(79.,179.,176.)/255.);\n  h = fract(h)*5.;\n  if(h<1.) return mix(a,b,h);\n  if(h<2.) return mix(b,c,h-1.);\n  if(h<3.) return mix(c,d,h-2.);\n  if(h<4.6) return mix(d,a,(h-3.)/1.6);\n  if(h<4.8) return mix(a,e,(h-4.6)/.2);\n  return mix(e,a,(h-4.8)/.2);\n}\nvec3 film(float cv){\n  float d = mix(650.,300.,cv);\n  float st2 = (1.-cv*cv)/(1.4*1.4);\n  float ct = sqrt(max(1.-st2,0.));\n  float opd = 2.*1.4*d*ct;\n  vec3 I = .5+.5*cos(2.*PI*opd/vec3(650.,532.,450.));\n  vec3 m = ramp(rgbHue(I));\n  return m / max(dot(m,vec3(.2126,.7152,.0722)),.05) * .55;\n}\nvec3 metal(vec3 n, vec3 v, vec3 envc){\n  float cv = clamp(dot(n,v),0.,1.);\n  vec3 tint = mix(vec3(1.), film(cv), uIri);\n  float F = .92+.08*pow(1.-cv,5.);\n  return envc*F*tint;\n}\nbool march(vec3 ro, vec3 rd, float tmin, float tmax, int steps, out float th){\n  float t = tmin;\n  for(int i=0;i<300;i++){\n    if(i>=steps) break;\n    float d = map(ro+rd*t);\n    if(d < .002){ th=t; return true; }\n    t += d*.7;\n    if(t>tmax) break;\n  }\n  th = t; return false;\n}\nvec3 tonemap(vec3 c){\n  c *= uExp;\n  vec3 m = c/(1.+c*.18);\n  return pow(clamp(m,0.,1.), vec3(1./2.2));\n}\nvoid main(){\n  vec2 frag = gl_FragCoord.xy;\n  vec2 g0 = vec2(uOff.x + frag.x, uOff.y + (uTile.y - frag.y));\n  vec3 ro = vec3(0.,0.,uD);\n  vec3 acc = vec3(0.); float hits = 0.;\n  int side = (uSpp>=9) ? 3 : ((uSpp>=4) ? 2 : 1);\n  for(int sy=0; sy<3; sy++) for(int sx=0; sx<3; sx++){\n    if(sx>=side || sy>=side) continue;\n    vec2 jit = (vec2(float(sx),float(sy))+.5)/float(side) - .5;\n    vec2 g = g0 + jit;\n    vec2 cm = vec2((g.x/uFull.x-.5)*uFrame.x, (.5-g.y/uFull.y)*uFrame.y);\n    vec3 rd = normalize(vec3(cm,0.)-ro);\n    float t0 = (uD-24.)/(-rd.z), t1 = (uD+24.)/(-rd.z);\n    float th;\n    if(!march(ro, rd, t0, t1, 240, th)) continue;\n    hits += 1.;\n    if(uMode==1) continue;\n    vec3 p = ro+rd*th;\n    vec3 nrm = calcN(p);\n    vec3 v = -rd;\n    vec3 r = reflect(rd, nrm);\n    vec3 envc; float t2;\n    if(march(p+nrm*.03, r, 0., 40., 90, t2)){\n      vec3 p2 = p+nrm*.03+r*t2;\n      vec3 n2 = calcN(p2);\n      envc = metal(n2, -r, env(reflect(r, n2)));\n    } else envc = env(r);\n    acc += metal(nrm, v, envc);\n  }\n  float ns = float(side*side);\n  if(uMode==1){ o = vec4(vec3(hits/ns),1.); return; }\n  // un-premultiplied colour (alpha comes from the separate hit-mask pass)\n  vec3 cc = (hits>0.) ? tonemap(acc/hits) : vec3(0.); cc *= uDim; float lum = dot(cc, vec3(.2126,.7152,.0722)); cc = mix(cc, vec3(.616,1.,0.)*(1.-lum)*1.1, uSkin); o = vec4(cc, hits/ns);\n}";
  const PARAMS = {"a1": 0.026071258274227026, "a2": 0.12926102987314236, "a3": 0.06718718655786696, "a4": 0.043884729346493435, "p1": -23.985593185776786, "p2": -159.22333165995454, "p3": -136.15104228650475, "p4": -106.61621522961657, "R": 12.182526949037635, "sx": 0.98, "sy": 1.16, "rot": 0, "cx": -0.7812500000000003, "cy": 1.339583333333334, "tilt": 27, "warp": 0.35, "w0": 3.05, "w1": 3.6, "wk": 2.6, "tl": -60, "w2": 1.4, "tu": 130, "wk2": 2.2, "t0": 1.9, "t1": 0.7, "te1": 5, "te2": 190, "st1": -62, "st2": 140, "ss1": 1.2, "ss2": 1.15, "iri": 0.35, "exp": 1.1, "rim": 0.75, "floor": 0.75, "sky": 0.32, "back": 0.35, "key": 6.5, "strip": 4.0, "teal": 0.2, "base": 1, "ceil": 0.45, "ceily": 0.84, "cr": 120, "cg": 52, "cb": 118, "washf": 0.035, "washs": 0.04, "keyw": 0.2, "keyx": -0.98, "keyy": 1.02};
  function mount(cv, opts = {}) {
    const gl = cv.getContext('webgl2', { premultipliedAlpha: false, alpha: true, antialias: false });
    if (!gl) return null;
    try {
    const vsrc = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    // a cold compile of this shader can take seconds, so it is built in the background where the browser allows
    // (KHR_parallel_shader_compile) and nothing waits on it: the loop polls, and draws its first frame once it is ready
    const par = gl.getExtension('KHR_parallel_shader_compile');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    let ready = false, failed = false;
    function finish() {
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { failed = true; return; }
      gl.useProgram(pr);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ready = true;
    }
    const P = new Map(Object.entries(PARAMS));
    const num = (k, d) => P.has(k) ? +P.get(k) : d;
    let FW = 0, FH = 0, TW = 0, TH = 0, OX = 0, OY = 0;
    const locs = new Map();
    const U = (n) => { if (!locs.has(n)) locs.set(n, gl.getUniformLocation(pr, n)); return locs.get(n); };
    const deg = Math.PI / 180;
    const f1 = (n, v) => gl.uniform1f(U(n), v);
    function setup() {
      gl.uniform2f(U('uFull'), FW, FH); gl.uniform2f(U('uOff'), 0, 0); gl.uniform2f(U('uTile'), FW, FH);
      const deg = Math.PI/180;
const f1 = (n, v) => gl.uniform1f(U(n), v);
gl.uniform2f(U('uFull'), FW, FH); gl.uniform2f(U('uOff'), OX, OY); gl.uniform2f(U('uTile'), TW, TH);
gl.uniform2f(U('uFrame'), num('frw', 29.0), num('frh', 32.0));
gl.uniform1i(U('uMode'), num('mode', 0)); gl.uniform1i(U('uSpp'), num('spp', 1));
gl.uniform4f(U('uA'), num('a1',.06), num('a2',.12), num('a3',.07), num('a4',.02));
gl.uniform4f(U('uP'), num('p1',0)*deg, num('p2',0)*deg, num('p3',0)*deg, num('p4',0)*deg);
f1('uR', num('R', 12)); f1('uSx', num('sx', 1)); f1('uSy', num('sy', 1)); f1('uRot', num('rot', 0)*deg);
f1('uCx', num('cx', 0)); f1('uCy', num('cy', 0)); f1('uTilt', num('tilt', 27)*deg); f1('uWarp', num('warp', .2)); f1('uD', num('D', 110));
f1('uW0', num('w0', 3.4)); f1('uW1', num('w1', 3.4)); f1('uWk', num('wk', 2.2)); f1('uTL', num('tl', -50)*deg);
f1('uW2', num('w2', 0)); f1('uTU', num('tu', 150)*deg); f1('uWk2', num('wk2', 3));
f1('uT0', num('t0', 2.0)); f1('uT1', num('t1', .6));
// twist: phi(t) = t + c + a sin(t + d), solved so the band is edge-on at te1 and te2 (360 deg total)
{
  const e1 = num('te1', 15)*deg, e2 = num('te2', 160)*deg;
  let span = e2 - e1; while(span <= 0) span += 2*Math.PI;
  const mid = e1 + span/2;
  const need = Math.PI - span;                       // extra phase phi must gain between the two edges
  const d = -mid;                                    // cos(mid + d) = 1 maximises sin(e2+d) - sin(e1+d)
  const a = need / (2*Math.sin(span/2));
  const c = Math.PI/2 - e1 - a*Math.sin(e1 + d);
  f1('uPc', c + num('tws', 0)*Math.PI); f1('uPa', Math.max(-.9, Math.min(.9, a))); f1('uPd', d);
}
f1('uSt1', num('st1', -70)*deg); f1('uSt2', num('st2', 120)*deg); f1('uSs1', num('ss1', 1.2)); f1('uSs2', num('ss2', 1.15));
f1('uIri', num('iri', .35)); f1('uExp', num('exp', 1)); f1('uRim', num('rim', 1)); f1('uFloor', num('floor', .6));
f1('uSky', num('sky', .6)); f1('uBack', num('back', .35)); f1('uKey', num('key', 5)); f1('uStrip', num('strip', 3.4));
f1('uTeal', num('teal', .2)); f1('uBase', num('base', 1)); f1('uCeil', num('ceil', 0)); f1('uCeilY', num('ceily', .86));
f1("uKeyW", num("keyw", .15)); f1("uKeyL", num("keyl", 1.5)); f1("uKeyX", num("keyx", -.70)); f1("uKeyY", num("keyy", .74)); f1("uStripY", num("stripy", .05)); f1("uStripH", num("striph", 1.4)); f1('uWashF', num('washf', .06)); f1('uWashS', num('washs', .07));
gl.uniform3f(U("uCeilC"), num("cr",120), num("cg",110), num("cb",160));
      const k = 38.0; gl.uniform2f(U('uFrame'), FW >= FH ? k * FW / FH : k, FW >= FH ? k : k * FH / FW);   // the loop fits the shorter side
      gl.uniform1i(U('uMode'), 0); gl.uniform1i(U('uSpp'), 1);
    }
    // the living part: every look parameter eases toward its target, so a change of pose never pops
    // zoom: the frame's short side in world units (38 fits the whole loop; far less and only its bands cross the frame)
    const cur = { dim: 1, skin: 0, yaw: 0, tiltAdd: 0, sway: 1, zoom: opts.zoom || 38, dx: 0, dy: 0 }, tgt = { ...cur };
    let fps = opts.fps || 30, raf = 0, t0 = performance.now(), last = 0, dirty = true;
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!ready) {
        if (!failed && !(par && !gl.getProgramParameter(pr, par.COMPLETION_STATUS_KHR))) finish();
        if (failed) { cancelAnimationFrame(raf); raf = 0; }
        if (!ready) return;
      }
      if (now - last < 1000 / fps) return;
      const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
      const r = cv.getBoundingClientRect();
      if (cv.dataset.paused === '1' || r.width < 2 || r.bottom < 0 || r.top > innerHeight || document.hidden) return;   // off-screen or hidden: no work
      const dpr = Math.min(devicePixelRatio, 2);
      const w = Math.max(64, Math.min(opts.maxW || 640, Math.round(r.width * dpr * (opts.scale || 1)))), hh = Math.max(64, Math.round(w * r.height / Math.max(1, r.width)));
      // reallocate only on a real change (the hero push-in resizes it every frame)
      if (!FW || Math.abs(w - FW) / FW > .08 || Math.abs(hh - FH) / FH > .08) { cv.width = FW = TW = w; cv.height = FH = TH = hh; gl.viewport(0, 0, w, hh); setup(); dirty = true; }
      for (const k in tgt) { const d = tgt[k] - cur[k]; if (Math.abs(d) > 1e-4) { cur[k] += d * Math.min(1, dt * 4); dirty = true; } }
      f1('uTime', opts.still ? 2.4 : (now - t0) / 1000);
      f1('uDim', cur.dim); f1('uSkin', cur.skin); f1('uYaw', cur.yaw); f1('uTiltAdd', cur.tiltAdd); f1('uSway', cur.sway);
      gl.uniform2f(U('uFrame'), FW >= FH ? cur.zoom * FW / FH : cur.zoom, FW >= FH ? cur.zoom : cur.zoom * FH / FW);
      f1('uCx', num('cx', 0) + cur.dx); f1('uCy', num('cy', 0) + cur.dy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (opts.still && !dirty) { cancelAnimationFrame(raf); raf = 0; }
      dirty = false;
    }
    raf = requestAnimationFrame(draw);
    return {
      stop() { cancelAnimationFrame(raf); raf = 0; },
      start() { if (!raf && !failed) { last = 0; dirty = true; raf = requestAnimationFrame(draw); } },
      set(o) { Object.assign(tgt, o); if (o.fps) fps = o.fps; dirty = true; if (!raf && !failed) { last = 0; raf = requestAnimationFrame(draw); } },
    };
    } catch (err) { return null; }
  }
  return { mount };
})();
