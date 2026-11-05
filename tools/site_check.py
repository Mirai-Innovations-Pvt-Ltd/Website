"""Full check of the Layer site at laptop, tablet and phone: JS errors, failed requests, section order, sideways
scroll, a scroll through every section, How it works playing, real mouse-wheel notches on the laptop, screenshots.
Usage: python tools/site_check.py URL OUT_DIR   (URL 'local' serves this repo's site/ on a free port)
Needs Microsoft Edge (or set EDGE to a Chromium-based browser) and `pip install websocket-client`."""
import base64, functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading, time, urllib.request, uuid
from pathlib import Path
import websocket

URL, OUT = sys.argv[1], Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
EDGE = os.environ.get('EDGE', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
SITE = str(Path(__file__).resolve().parents[1] / 'site')
if URL == 'local':
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.ThreadingTCPServer.daemon_threads = True
    socketserver.ThreadingTCPServer.request_queue_size = 128
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    URL = f'http://127.0.0.1:{srv.server_address[1]}/'
ok = True


def device(tag, w, h, mobile, cdp):
    global ok
    prof = Path(tempfile.gettempdir()) / f'site_check_{uuid.uuid4().hex[:6]}'
    proc = subprocess.Popen([EDGE, '--headless=new', f'--remote-debugging-port={cdp}', '--remote-allow-origins=*', '--hide-scrollbars',
                             '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required',
                             f'--window-size={w},{h}', f'--user-data-dir={prof}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    errs, fails = [], []
    try:
        for _ in range(60):
            try:
                page = next(t for t in json.loads(urllib.request.urlopen(f'http://127.0.0.1:{cdp}/json').read()) if t['type'] == 'page'); break
            except Exception:
                time.sleep(.3)
        ws = websocket.create_connection(page['webSocketDebuggerUrl'], timeout=120, suppress_origin=True)
        n = [0]

        def note(r):
            m, p = r.get('method'), r.get('params', {})
            if m == 'Runtime.exceptionThrown':
                errs.append('EXC ' + str(p['exceptionDetails'].get('exception', {}).get('description', p['exceptionDetails'].get('text')))[:200])
            elif m == 'Runtime.consoleAPICalled' and p['type'] == 'error':
                errs.append('console ' + ' '.join(str(a.get('value', a.get('description', ''))) for a in p['args'])[:200])
            elif m == 'Network.responseReceived' and p['response']['status'] >= 400:
                fails.append(f"{p['response']['status']} {p['response']['url'][:120]}")
            elif m == 'Network.loadingFailed' and not p.get('canceled'):
                fails.append(f"failed {p.get('errorText')} {p.get('type')}")

        def call(m, **p):
            n[0] += 1; ws.send(json.dumps({'id': n[0], 'method': m, 'params': p}))
            while True:
                r = json.loads(ws.recv())
                if r.get('id') == n[0]: return r.get('result', {})
                note(r)

        def pump(sec):
            ws.settimeout(.1); t0 = time.time()
            while time.time() - t0 < sec:
                try: note(json.loads(ws.recv()))
                except Exception: pass
            ws.settimeout(120)

        ev = lambda x: call('Runtime.evaluate', expression=x, returnByValue=True, awaitPromise=True).get('result', {}).get('value')
        shot = lambda name: (OUT / f'{tag}-{name}.jpg').write_bytes(base64.b64decode(call('Page.captureScreenshot', format='jpeg', quality=80)['data']))
        for d in ('Runtime', 'Network', 'Page'): call(f'{d}.enable')
        call('Emulation.setDeviceMetricsOverride', width=w, height=h, deviceScaleFactor=1, mobile=mobile)
        if mobile: call('Emulation.setTouchEmulationEnabled', enabled=True, maxTouchPoints=5)
        call('Page.navigate', url=URL + ('&' if '?' in URL else '?') + f'nc={uuid.uuid4().hex[:6]}'); pump(7)
        shot('01-hero')
        order = ev("[...document.querySelectorAll('main > section, main > div')].map(s => s.id).join(' > ')")
        pitch = ev("(document.querySelector('.hero__pitch')||{}).textContent")
        ver = ev("[...document.querySelectorAll('link[rel=stylesheet],script[src]')].map(e => (e.href||e.src).split('/').pop()).filter(s => /v=/.test(s)).join(' ')")
        # scroll through every section (the pager is bypassed so each section is reached exactly)
        ev('window.__nosnap = 1; document.documentElement.style.scrollBehavior = "auto"; 0')
        for sid in order.split(' > '):
            ev(f"scrollTo(0, document.getElementById('{sid}').getBoundingClientRect().top + scrollY); 0"); pump(1.2)
            if sid in ('how', 'pilot', 'drops'): shot(f'02-{sid}')
        wide = ev('document.documentElement.scrollWidth - innerWidth')
        ev("scrollTo(0, document.getElementById('how').getBoundingClientRect().top + scrollY); 0"); pump(1)
        a = ev("JSON.stringify([...document.querySelectorAll('.play__seg')].map(b => b.style.getPropertyValue('--k')))"); pump(3)
        b = ev("JSON.stringify([...document.querySelectorAll('.play__seg')].map(b => b.style.getPropertyValue('--k')))")
        how_ok = a != b
        notches = ''
        if not mobile:
            ev('window.__nosnap = 0; scrollTo(0, 0); 0'); pump(1.5)
            ys = []
            for _ in range(16):
                call('Input.dispatchMouseEvent', type='mouseWheel', x=w // 2, y=h // 2, deltaX=0, deltaY=100); pump(1.4)
                ys.append(ev('Math.round(scrollY)'))
            notches = f' | wheel notches: {ys[0]}..{ys[-1]} ({len(set(ys))} stops of 16)'
        verdict = 'OK' if not errs and not fails and wide <= 0 and how_ok else 'CHECK'
        ok = ok and verdict == 'OK'
        print(f'[{verdict}] {tag} {w}x{h}: versions {ver} | sideways overflow {wide}px | How playing: {how_ok}{notches}')
        print(f'   order: {order}')
        print(f'   hero line: {pitch!r}')
        if errs: print('   errors:', errs[:6])
        if fails: print('   failed requests:', sorted(set(fails))[:8])
    finally:
        proc.kill()


device('laptop', 1366, 768, False, 9471)
device('tablet', 820, 1180, True, 9472)
device('phone', 390, 844, True, 9473)
print('ALL OK' if ok else 'SOMETHING TO CHECK')
