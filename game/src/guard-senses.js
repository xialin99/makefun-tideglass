import { deck } from './levels.js';
import { advance, clamp, distance, free, point } from './movement.js';

export const halfAngle = .53;
export const reach = 169;
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

function hit(x, y, dx, dy, box, padding) {
  let enter = 0;
  let leave = Infinity;
  for (const [at, delta, lo, hi] of [
    [x, dx, box.x - padding, box.x + box.w + padding],
    [y, dy, box.y - padding, box.y + box.h + padding],
  ]) {
    if (Math.abs(delta) < 1e-8) {
      if (at <= lo || at >= hi) return Infinity;
      continue;
    }
    const a = (lo - at) / delta;
    const b = (hi - at) / delta;
    enter = Math.max(enter, Math.min(a, b));
    leave = Math.min(leave, Math.max(a, b));
    if (enter >= leave) return Infinity;
  }
  return enter;
}

export function clear(a, b, cover, padding = 0) {
  return cover.every(box => hit(a.x, a.y, b.x - a.x, b.y - a.y, box, padding) >= 1);
}

export function beam(guard, cover) {
  const angles = Array.from({ length: 43 }, (_, i) => -halfAngle + 2 * halfAngle * i / 42);
  for (const b of [...cover, deck]) {
    for (const x of [b.x, b.x + b.w]) for (const y of [b.y, b.y + b.h]) {
      const a = wrap(Math.atan2(y - guard.y, x - guard.x) - guard.angle);
      if (Math.abs(a) < halfAngle - .001) angles.push(a - .001, a, a + .001);
    }
  }
  return angles.sort((a, b) => a - b).map(offset => {
    const a = guard.angle + offset;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const edgeX = Math.abs(dx) < 1e-8 ? Infinity :
      ((dx > 0 ? deck.x + deck.w : deck.x) - guard.x) / dx;
    const edgeY = Math.abs(dy) < 1e-8 ? Infinity :
      ((dy > 0 ? deck.y + deck.h : deck.y) - guard.y) / dy;
    const edge = Math.min(edgeX, edgeY);
    const ray = Math.min(guard.range ?? reach, edge, ...cover.map(b => hit(guard.x, guard.y, dx, dy, b, 0)));
    return [guard.x + dx * ray, guard.y + dy * ray];
  });
}

function route(from, target, cover) {
  if (clear(from, target, cover, 9)) return [target];
  const nodes = [from, target];
  for (const b of cover) {
    for (const x of [b.x - 12, b.x + b.w + 12]) for (const y of [b.y - 12, b.y + b.h + 12]) {
      if (free(x, y, 10, cover)) nodes.push({ x, y });
    }
  }
  const costs = nodes.map(() => Infinity);
  const previous = [];
  const visited = new Set();
  costs[0] = 0;
  for (;;) {
    const i = costs.reduce((best, cost, index) =>
      !visited.has(index) && cost < (costs[best] ?? Infinity) ? index : best, -1);
    if (i < 0) return [];
    if (i === 1) break;
    visited.add(i);
    nodes.forEach((node, j) => {
      const cost = costs[i] + distance(nodes[i], node);
      if (!visited.has(j) && cost < costs[j] && clear(nodes[i], node, cover, 9)) {
        costs[j] = cost;
        previous[j] = i;
      }
    });
  }
  const path = [];
  for (let i = 1; i !== 0; i = previous[i]) path.unshift(nodes[i]);
  return path;
}

export function createGuards(patrols) {
  return patrols.map((patrol, i) => ({
    ...point(patrol[0]), patrol: patrol.map(point), leg: 1, radius: 8,
    angle: [-Math.PI / 2, Math.PI / 2, 0][i], wait: .65 + i * .45,
    mode: 'patrol', suspicion: 0, stride: 0, path: [], search: 0,
  }));
}

export function hear(guard, sound, cover) {
  const radius = sound.radius * (clear(guard, sound, cover) ? 1 : .55);
  if (distance(guard, sound) >= radius || guard.mode === 'tracking') return;
  guard.mode = 'investigating';
  guard.path = route(guard, sound, cover);
  guard.search = 1.45;
  guard.suspicion = Math.max(.22, guard.suspicion);
}

export function updateGuard(g, player, cover, dt) {
  const range = distance(g, player);
  const bearing = Math.atan2(player.y - g.y, player.x - g.x);
  const seen = (range < 22 || (range < (g.range ?? reach) && Math.abs(wrap(bearing - g.angle)) < halfAngle))
    && clear(g, player, cover);
  if (seen) {
    g.suspicion = clamp(g.suspicion + dt * (player.low ? .52 : .98) * (1.28 - range / 390), 0, 1);
    g.mode = 'tracking';
    g.last = { x: player.x, y: player.y };
    g.angle += wrap(bearing - g.angle) * Math.min(1, dt * 4);
    return 0;
  }
  if (g.mode === 'tracking') {
    g.mode = 'investigating';
    g.path = route(g, g.last, cover);
    g.search = 1.25;
  }
  g.suspicion = Math.max(0, g.suspicion - dt * .43);
  if (g.mode === 'investigating' && !g.path.length) {
    g.angle += dt * .9;
    g.search -= dt;
    if (g.search > 0) return 0;
    g.mode = 'returning';
    g.path = route(g, g.patrol[g.leg], cover);
  }
  if (g.mode === 'returning' && !g.path.length) g.mode = 'patrol';
  const target = g.mode === 'patrol' ? g.patrol[g.leg] : g.path[0];
  const left = distance(g, target);
  const face = Math.atan2(target.y - g.y, target.x - g.x);
  g.angle += clamp(wrap(face - g.angle), -dt * 4, dt * 4);
  if (g.mode === 'patrol' && g.wait > 0) {
    g.wait -= dt;
    return 0;
  }
  if (left < 2) {
    if (g.mode === 'patrol') {
      g.leg = (g.leg + 1) % g.patrol.length;
      g.wait = .85;
    } else g.path.shift();
    return 0;
  }
  const step = Math.min(left, dt * (g.mode === 'investigating' ? 81 : 53));
  advance(g, Math.cos(face) * step, Math.sin(face) * step, cover);
  return step;
}
