import { reach } from './guard-senses.js';

export function outage(state) {
  return Math.max(0, state.relayUntil - state.time);
}

export function watchRange(guard, relay, state) {
  if (!relay || !outage(state)) return reach;
  const z = relay.zone;
  const inside = guard.x >= z.x && guard.x <= z.x + z.w &&
    guard.y >= z.y && guard.y <= z.y + z.h;
  return inside ? 68 : reach;
}
