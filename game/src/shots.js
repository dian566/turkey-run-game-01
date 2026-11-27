// Turkey Run — shots: deterministic screenshot scenes behind ?shot=start|play|end.
// Each one plays the real rules forward from a fresh world for a fixed number
// of steps, steered by a simple autopilot (jump when an obstacle is close,
// slide under a flying knife), so the frame is what a real run looks like and
// the same seed always gives the same frame.
import { CANVAS, GROUND_Y, TURKEY } from './config.js';
import { EVENT_OVER, KIND_KNIFE, KIND_OVEN } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 24;
const END_LIMIT_SECONDS = 300;
const SAMPLE = 1 / 30;

/** Should the turkey jump now, given the nearest obstacle ahead? */
function autopilot(world) {
  const s = world.state;
  // A flying knife anywhere near the turkey beats every other move: slide
  // under it first, never jump into it.
  for (const obstacle of s.obstacles) {
    if (!obstacle.active || obstacle.kind !== KIND_KNIFE) continue;
    const gap = obstacle.x - (TURKEY.x + TURKEY.width);
    if (gap < 260 && gap > -100) return { jump: false, slide: true };
  }
  let nearest = null;
  for (const obstacle of s.obstacles) {
    if (!obstacle.active || obstacle.kind === KIND_KNIFE) continue;
    const ahead = obstacle.x + obstacle.width - TURKEY.x;
    if (ahead < -20) continue;
    if (nearest === null || obstacle.x < nearest.x) nearest = obstacle;
  }
  if (nearest === null) return { jump: false, slide: false };
  const gap = nearest.x - (TURKEY.x + TURKEY.width);
  if (nearest.kind === KIND_OVEN) return { jump: s.grounded && gap < 80, slide: false };
  return { jump: s.grounded && gap < 70, slide: false };
}

/** The play scene stops once an obstacle is in frame, so the cover shot shows the danger. */
function obstacleOnScreen(world) {
  for (const obstacle of world.state.obstacles) {
    if (obstacle.active && obstacle.x > 300 && obstacle.x < 820) return true;
  }
  return false;
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / SAMPLE; index += 1) world.step(SAMPLE, false, false);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const steps = Math.floor(limit / SAMPLE);
  for (let index = 0; index < steps; index += 1) {
    let move = autopilot(world);
    if (name === 'end') {
      // The end scene's pilot never reacts at all, so the turkey runs into
      // the obstacles for real — a genuine CAUGHT screen.
      move = { jump: false, slide: false };
    }
    if (world.step(SAMPLE, move.jump, move.slide) & EVENT_OVER) break;
    if (name === 'play' && index > 8 / SAMPLE && obstacleOnScreen(world)) break;
  }
  const over = world.state.over;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}

export function shotSeed(search) {
  const params = new URLSearchParams(search);
  const seed = Number(params.get('seed'));
  return Number.isFinite(seed) && seed > 0 ? Math.floor(seed) : 1;
}

export function shotName(search) {
  const params = new URLSearchParams(search);
  return params.get('shot') ?? 'start';
}

void CANVAS;
void GROUND_Y;
