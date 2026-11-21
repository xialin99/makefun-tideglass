import { deck } from './levels.js';

export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const point = ([x, y]) => ({ x, y });

export function free(x, y, radius, cover) {
  if (x < deck.x + radius || y < deck.y + radius ||
      x > deck.x + deck.w - radius || y > deck.y + deck.h - radius) return false;
  return cover.every(b => x <= b.x - radius || x >= b.x + b.w + radius ||
    y <= b.y - radius || y >= b.y + b.h + radius);
}

export function advance(actor, dx, dy, cover) {
  if (free(actor.x + dx, actor.y, actor.radius, cover)) actor.x += dx;
  if (free(actor.x, actor.y + dy, actor.radius, cover)) actor.y += dy;
}

export function movePlayer(player, keys, dt, cover) {
  const dx = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  const dy = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
  player.low = keys.has('ShiftLeft') || keys.has('ShiftRight');
  if (!dx && !dy) return 0;
  player.angle = Math.atan2(dy, dx);
  const before = { ...player };
  const step = (player.low ? 101 : 189) * dt / Math.hypot(dx, dy);
  advance(player, dx * step, dy * step, cover);
  return distance(before, player);
}
