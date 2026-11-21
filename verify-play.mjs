import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';
import { turbineHall } from './game/src/levels.js';
import { beam, clear, createGuards, reach, updateGuard } from './game/src/guard-senses.js';
import { watchRange } from './game/src/relay.js';

const { cover, relay, patrols } = turbineHall;
const [outside, middle] = createGuards(patrols);
const active = { time: 2, relayUntil: 15 };
assert.equal(watchRange(outside, relay, active), reach);
assert.equal(watchRange(middle, relay, active), 68);
assert.equal(watchRange(middle, relay, { time: 16, relayUntil: 15 }), reach);
const watch = { ...middle, x: 710, y: 351, angle: 0, range: 68 };
const target = { x: 790, y: 351, low: true };
assert.ok(clear(watch, target, cover));
assert.equal(beam(watch, cover).find(([, y]) => y === 351)?.[0], 778);
updateGuard(watch, target, cover, .02);
assert.equal(watch.suspicion, 0);
watch.range = reach;
updateGuard(watch, target, cover, .02);
assert.ok(watch.suspicion > 0);
assert.equal(beam({ ...watch, x: 554, y: 351, angle: -Math.PI / 2 }, cover)
  .find(([x]) => x === 554)?.[1], 304);

const profile = new URL('./.chrome-play/', import.meta.url);
const origin = 'http://127.0.0.1:18157';
const chromePath = process.env.TIDEGLASS_CHROME ?? 'D:/rj/Google/Chrome/Application/chrome.exe';
await mkdir(profile);
const server = spawn(process.execPath, ['serve.ts', '--port', '18157'], { windowsHide: true });
let chrome, ws, closeBrowser;

try {
  await once(server.stdout, 'data');
  chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0',
    '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
    '--disable-sync', '--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
    '--user-data-dir=' + decodeURIComponent(profile.pathname.replace(/^\/(?=[A-Za-z]:)/, '')), 'about:blank'],
  { windowsHide: true, stdio: 'ignore' });
  let port;
  for (let i = 0; !port && i < 100; i++) {
    try { port = (await readFile(new URL('DevToolsActivePort', profile), 'utf8')).split('\n')[0]; }
    catch { await wait(100); }
  }
  const [page] = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await once(ws, 'open');
  let id = 0;
  const waiting = new Map(), errors = [], requests = new Set();
  ws.addEventListener('message', ({ data }) => {
    const reply = JSON.parse(data);
    if (reply.id) {
      const { resolve, reject } = waiting.get(reply.id);
      waiting.delete(reply.id);
      if (reply.error) reject(new Error(JSON.stringify(reply.error)));
      else resolve(reply.result);
    }
    if (reply.method === 'Runtime.exceptionThrown') errors.push(reply.params.exceptionDetails);
    if (reply.method === 'Log.entryAdded' && reply.params.entry.level === 'error') errors.push(reply.params.entry.text);
    if (reply.method === 'Network.requestWillBeSent') requests.add(reply.params.request.url);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    waiting.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  closeBrowser = () => send('Browser.close');
  const read = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value;
  for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await send(domain + '.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1152, height: 720, deviceScaleFactor: 1, mobile: false });
  // Observe ordinary canvas draw calls so the test can steer through normal inputs.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text,x,y,...rest) {
      if (text === 'YOU' || text === 'LOW') {
        const t = this.getTransform();
        window.playerDraw = {x, y:y-27, low:text==='LOW', scale:t.d, offset:t.f};
      }
      return fill.call(this,text,x,y,...rest);
    };` });
  await send('Page.navigate', { url: origin });
  async function until(expression, timeout = 4500) {
    for (let i = 0; i < timeout / 35; i++) {
      const value = await read(expression);
      if (value) return value;
      await wait(35);
    }
    throw new Error(expression + ': ' + JSON.stringify(await read('window.playerDraw')) +
      ' ' + await read('document.querySelector("#signal")?.textContent') +
      ' ' + JSON.stringify({ errors, requests: [...requests] }));
  }
  async function shot(name) {
    for (const quality of [88, 80, 72, 60]) {
      const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality, captureBeyondViewport: false });
      const jpeg = Buffer.from(data, 'base64');
      if (jpeg.length > 262144) continue;
      await writeFile('screenshots/' + name + '.jpg', jpeg);
      console.log(name, jpeg.length);
      return;
    }
    throw new Error('JPEG exceeds cap: ' + name);
  }
  const key = (code, down) => send('Input.dispatchKeyEvent', { type: down ? 'rawKeyDown' : 'keyUp', code, key: code.replace('Key', '') });
  async function tap(code) { await key(code, true); await key(code, false); }
  async function go(code, condition, expectSafe = true) {
    await key(code, true);
    try { await until('window.playerDraw.' + condition + ' || !document.querySelector("#ending").hidden', 12500); }
    finally { await key(code, false); }
    if (expectSafe) {
      assert.equal(await read('document.querySelector("#ending").hidden'), true,
        'caught during ' + condition + ' at ' + JSON.stringify(await read('window.playerDraw')));
    }
  }
  const status = value => 'document.querySelector("#signal").textContent === ' + JSON.stringify(value);
  const tapes = count => 'document.querySelector("#manifest").textContent === "RECORDINGS ' + count + ' / 2"';
  await until('window.playerDraw');
  await tap('Digit2');
  assert.equal(await read('document.querySelector("#mission-two").disabled'), true);
  await tap('KeyM');
  await until('document.querySelector("#mute").textContent.includes("off")');
  await tap('KeyM');
  await until('document.querySelector("#mute").textContent.includes("on")');
  await tap('KeyR');
  await key('ShiftLeft', true);
  await go('KeyW', 'y <= 207');
  await go('KeyD', 'x >= 153');
  await tap('KeyE');
  await until(tapes(1));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 350, y: 182 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 350, y: 182, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 350, y: 182, button: 'left', clickCount: 1 });
  await until(status('SEARCHING'));
  await wait(120);
  await shot('2-observatory-investigation');
  await until(status('UNSEEN'));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 30, y: 688 });
  await go('KeyW', 'y <= 128');
  await key('ShiftLeft', false);
  await go('KeyD', 'x >= 980');
  await key('ShiftLeft', true);
  await go('KeyS', 'y >= 176');
  await tap('KeyE');
  await until(tapes(2));
  await go('KeyW', 'y <= 128');
  await key('ShiftLeft', false);
  await go('KeyA', 'x <= 116');
  await go('KeyS', 'y >= 596');
  await go('KeyD', 'x >= 1016');
  await go('KeyW', 'y <= 578');
  await tap('KeyE');
  await until('document.querySelector("h2").textContent === "Signal ashore" && !document.querySelector("#ending").hidden');
  await tap('KeyR');
  await until(tapes(0));
  await go('KeyD', 'x >= 376');
  await go('KeyW', 'y <= 351', false);
  await until(status('ALARM'), 8000);
  await tap('KeyR');
  await until(status('UNSEEN'));
  await tap('KeyQ');
  await wait(400);
  await tap('Digit2');
  await until('document.querySelector("#location").textContent.includes("TURBINE")');
  await shot('1-turbine-hall');
  await key('ShiftLeft', true);
  await go('KeyD', 'x >= 352');
  await go('KeyW', 'y <= 477');
  await tap('KeyE');
  await until('document.querySelector("#manifest").textContent.includes("DIM")');
  await until(status('SEARCHING'));
  await wait(190);
  await shot('3-section-dimmed');
  await go('KeyS', 'y >= 523');
  await go('KeyD', 'x >= 713');
  await go('KeyW', 'y <= 290');
  await go('KeyD', 'x >= 747');
  await tap('KeyE');
  await until('document.querySelector("#manifest").textContent.includes("READOUT 1 / 1")');
  await go('KeyW', 'y <= 170');
  await go('KeyD', 'x >= 1018');
  await tap('KeyE');
  await until('document.querySelector("h2").textContent === "The gate stays shut" && !document.querySelector("#ending").hidden');
  await shot('4-gate-secured');
  await tap('KeyR');
  await until('document.querySelector("#manifest").textContent === "READOUT 0 / 1"');
  await send('Page.reload');
  await until('document.querySelector("#mission-two")?.textContent.includes("✓")');
  await tap('Digit2');
  await until('document.querySelector("#location").textContent.includes("TURBINE")');
  // A second clear uses the lit bypass with the light relay untouched.
  await key('ShiftLeft', true);
  await go('KeyS', 'y >= 590');
  await key('ShiftLeft', false);
  await go('KeyD', 'x >= 885');
  await key('ShiftLeft', true);
  await go('KeyD', 'x >= 903');
  await go('KeyW', 'y <= 177');
  await go('KeyA', 'x <= 770');
  await go('KeyS', 'y >= 263');
  await tap('KeyE');
  await until('document.querySelector("#manifest").textContent === "READOUT 1 / 1"');
  await go('KeyW', 'y <= 174');
  await go('KeyD', 'x >= 1001');
  await tap('KeyE');
  await until(status('EXTRACTED'));
  await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 480, deviceScaleFactor: 1, mobile: false });
  await until('innerWidth === 768 && innerHeight === 480 && playerDraw.scale < .8');
  await until('playerDraw.scale * 650 + playerDraw.offset < document.querySelector("footer").getBoundingClientRect().top');
  assert.deepEqual(errors, []);
  assert.ok(requests.size >= 7 && [...requests].every(url => url.startsWith(origin + '/') || url.startsWith('data:')));
  console.log('Passed both missions, lock/unlock, persisted progress, relay, mouse investigation, recovery, detection, restart, mute and local requests.');
} finally {
  if (ws?.readyState === WebSocket.OPEN && closeBrowser) {
    await Promise.race([closeBrowser().catch(() => {}), wait(1000)]);
  }
  ws?.close();
  for (const child of [chrome, server]) {
    if (!child || child.exitCode !== null) continue;
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 });
}
