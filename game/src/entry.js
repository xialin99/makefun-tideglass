import { missions } from './levels.js';
import { clamp, distance, free, movePlayer, point } from './movement.js';
import { clear, createGuards, hear, updateGuard } from './guard-senses.js';
import { cue, toggleSound, unlock } from './sound.js';
import { createRenderer } from './rendering.js';
import { outage, watchRange } from './relay.js';

const { t } = window;
const find = selector => document.querySelector(selector);
const canvas = find('canvas');
let mission = 0;
let map = missions[mission];
let view = createRenderer(canvas, map);
const keys = new Set();
let state;
let unlocked = loadProgress();

function loadProgress() {
  try { return Number(localStorage.getItem('tideglass-cleared')) || 0; }
  catch { return 0; }
}

function missionButtons() {
  const observatory = find('#mission-one');
  observatory.setAttribute('aria-current', mission === 0 ? 'step' : 'false');
  observatory.textContent = unlocked > 0 ? t('1 · Observatory ✓') : t('1 · Observatory');
  const hall = find('#mission-two');
  hall.setAttribute('aria-current', mission === 1 ? 'step' : 'false');
  hall.disabled = unlocked < 1;
  hall.textContent = unlocked < 1 ? t('2 · Hall locked') : unlocked > 1 ? t('2 · Hall ✓') : t('2 · Turbine hall');
}

function selectMission(index) {
  if (index > unlocked || mission === index && !state.result) return;
  mission = index;
  map = missions[index];
  view = createRenderer(canvas, map);
  reset();
}

function updateLocation() { find('#location').textContent = `0${mission + 1} / ${t(map.name)}`; }

function reset() {
  keys.clear();
  state = {
    player: { ...point(map.start), angle: -Math.PI / 2, radius: 9, low: false },
    guards: createGuards(map.patrols), tapes: new Set(), rings: [], stride: 0,
    time: 0, cooldown: 0, aim: null, result: '', notice: '', noticeUntil: 0,
    relayUntil: 0, relayUsed: false,
  };
  if (map.relay) state.guards.forEach(guard => {
    const target = guard.patrol[1];
    guard.angle = Math.atan2(target.y - guard.y, target.x - guard.x);
  });
  updateLocation();
  missionButtons();
  find('#ending').hidden = true;
}

function notice(message) {
  state.notice = message;
  state.noticeUntil = state.time + 2.4;
}

function soundAt(origin, radius, name, attracts) {
  state.rings.push({ x: origin.x, y: origin.y, radius, birth: state.time, name });
  const d = distance(state.player, origin);
  cue(name, clamp((origin.x - state.player.x) / 250, -1, 1),
    Math.max(.04, 1 - d / 520) * (clear(state.player, origin, map.cover) ? 1 : .48));
  if (attracts) state.guards.forEach(g => hear(g, { x: origin.x, y: origin.y, radius }, map.cover));
}

function toss(target) {
  if (state.cooldown > 0 || state.result) return;
  if (!target.valid) {
    notice('Aim at clear floor within the dashed line.');
    return;
  }
  state.cooldown = 2.6;
  state.flight = { from: { ...state.player }, target, time: state.time };
}

function aimAt(target) {
  return { ...target, valid: distance(state.player, target) <= 255 &&
    free(target.x, target.y, 11, map.cover) };
}

function finish(result) {
  state.result = result;
  const won = result === 'clear';
  if (won) {
    unlocked = Math.max(unlocked, mission + 1);
    try { localStorage.setItem('tideglass-cleared', String(unlocked)); } catch {}
    missionButtons();
  }
  cue(won ? 'exit' : 'alarm');
  renderEnding(won);
}

function renderEnding(won) {
  const ending = find('#ending');
  ending.querySelector('h2').textContent = won ? (map.relay ? t('The gate stays shut') : t('Signal ashore')) : t('Gate sealed');
  ending.querySelector('div').textContent = won
    ? map.relay
      ? t('The relay readout names the override crew. The harbor pilot has the evidence and has ordered the gate closed before the morning tide.')
      : t('Both recordings are ashore. They prove the floodgate was opened deliberately. The harbor pilot wants the relay readout before the next tide.')
    : t('The watch saw you and dropped the flood barrier. Break line of sight behind masonry when the beam turns pink.');
  find('#next').hidden = !won || mission !== 0;
  ending.hidden = false;
}

function interact() {
  if (state.result) return;
  if (map.relay && distance(map.relay, state.player) < 40) {
    if (state.relayUsed) { notice('The relay has already tripped.'); return; }
    state.relayUsed = true;
    state.relayUntil = state.time + map.relay.seconds;
    soundAt(map.relay, 260, 'relay', true);
    return;
  }
  const tape = map.tapes.find(t => !state.tapes.has(t.id) && distance(t, state.player) < 39);
  if (tape) {
    state.tapes.add(tape.id);
    cue('tape');
    notice(map.relay ? 'Readout secured. Head to the escape ladder.' :
      state.tapes.size === 2 ? 'Both logs secured. Head to the tide gate.' : `Recording ${tape.id} secured.`);
  } else if (distance(point(map.exit), state.player) < 55) {
    if (state.tapes.size === map.tapes.length) finish('clear');
    else notice(map.relay ? 'Recover the relay readout first.' : 'The skiff is waiting for both recordings.');
  }
}

let muted = false;
function renderMute() { find('#mute').textContent = muted ? t('M · Sound off') : t('M · Sound on'); }
function mute() {
  muted = toggleSound();
  renderMute();
}

addEventListener('keydown', event => {
  if (event.target instanceof HTMLSelectElement) return;
  if (event.code.startsWith('Arrow') || event.code === 'Space') event.preventDefault();
  unlock();
  keys.add(event.code);
  if (event.repeat) return;
  if (event.code === 'KeyR') reset();
  if (event.code === 'KeyM') mute();
  if (event.code === 'KeyE') interact();
  if (event.code === 'Digit1') selectMission(0);
  if (event.code === 'Digit2') selectMission(1);
  if (event.code === 'KeyQ') {
    const p = state.player;
    for (const length of [174, 122, 74]) {
      const aim = aimAt({ x: p.x + length * Math.cos(p.angle), y: p.y + length * Math.sin(p.angle) });
      if (!aim.valid) continue;
      toss(aim);
      break;
    }
  }
});
addEventListener('keyup', event => keys.delete(event.code));
addEventListener('blur', () => keys.clear());
canvas.addEventListener('pointermove', event => { state.aim = view.pointer(event); });
canvas.addEventListener('pointerleave', () => { state.aim = null; });
canvas.addEventListener('pointerdown', event => {
  unlock();
  if (event.button === 0) toss(aimAt(view.pointer(event)));
});
find('#mute').onclick = () => { unlock(); mute(); };
find('#reset').onclick = reset;
find('#retry').onclick = reset;
find('#next').onclick = () => selectMission(1);
find('#mission-one').onclick = () => selectMission(0);
find('#mission-two').onclick = () => selectMission(1);

function tick(dt) {
  if (state.result) return;
  state.time += dt;
  state.cooldown = Math.max(0, state.cooldown - dt);
  state.stride += movePlayer(state.player, keys, dt, map.cover);
  if (state.stride > (state.player.low ? 32 : 40)) {
    state.stride = 0;
    if (!state.player.low) soundAt(state.player, 92, 'step', true);
  }
  if (state.flight && state.time - state.flight.time >= .32) {
    soundAt(state.flight.target, 205, 'toss', true);
    state.flight = null;
  }
  state.rings = state.rings.filter(r => state.time - r.birth < .78);
  for (const guard of state.guards) {
    guard.range = watchRange(guard, map.relay, state);
    guard.stride += updateGuard(guard, state.player, map.cover, dt);
    if (guard.stride > 31) {
      guard.stride = 0;
      soundAt(guard, 30, 'step', false);
    }
    if (guard.suspicion >= 1) { finish('caught'); break; }
  }
  for (const guard of state.guards) guard.range = watchRange(guard, map.relay, state);
}

function translateNotice(message) {
  const recording = /^Recording (.+) secured\.$/.exec(message);
  return window.uiLanguage === 'zh' && recording ? '已取得录音 ' + recording[1] + '。' : t(message);
}
addEventListener('ui-language-change', () => {
  view = createRenderer(canvas, map);
  updateLocation();
  missionButtons();
  renderMute();
  if (state.result) renderEnding(state.result === 'clear');
  hud();
});

function hud() {
  const suspicion = Math.max(...state.guards.map(g => g.suspicion));
  const signal = state.guards.some(g => g.mode === 'tracking') ? t('IN SIGHT') :
    state.guards.some(g => g.mode === 'investigating') ? t('SEARCHING') : t('UNSEEN');
  find('#manifest').textContent = map.relay
    ? `${t('READOUT')} ${state.tapes.size} / 1${outage(state) ? `  ·  ${t('DIM')} ${Math.ceil(outage(state))}${window.uiLanguage === 'zh' ? ' 秒' : 's'}` : ''}`
    : `${t('RECORDINGS')} ${state.tapes.size} / 2`;
  find('#objective').textContent = state.time < state.noticeUntil ? translateNotice(state.notice) : map.relay
    ? state.tapes.size ? t('Reach the escape ladder.') : outage(state)
      ? t('Dim zone limits guard sight. The relay drew attention.')
      : t('Copy the gate readout. Use the relay or take the bypass.')
    : state.tapes.size === 2 ? t('Both logs secured · reach the tide gate.') : t('Recover both logs. Extract at the tide gate.');
  find('#signal').textContent = state.result === 'caught' ? t('ALARM') : state.result === 'clear' ? t('EXTRACTED') : signal;
  find('#signal').dataset.alert = String(suspicion > .18);
  find('progress').value = suspicion;
}

reset();
let previous = performance.now();
function frame(now) {
  tick(clamp((now - previous) / 1000, 0, .032));
  previous = now;
  view.draw(state, state.aim && aimAt(state.aim));
  hud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
