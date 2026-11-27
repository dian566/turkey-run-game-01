// Turkey Run — main: the game loop and the screen state machine. Title, play,
// paused, caught / escaped, restart. Reads ?shot= for deterministic
// screenshots, and ?seed= to pick the farm. Nothing here touches the network.
import { CANVAS } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createWorld, EVENT_CORN, EVENT_ESCAPED, EVENT_HIT, EVENT_OVER, EVENT_POWERUP } from './world.js';
import { drawOver, drawPaused, drawPlay, drawTitle, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { shotName, shotSeed, stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

const params = new URLSearchParams(window.location.search);
const shotMode = params.has('shot');
const seed = shotSeed(window.location.search);
const world = createWorld(seed);
const input = createInput(canvas);
const audio = createAudio();

let screen = SCREEN_TITLE;
let best = Number(window.localStorage.getItem('turkey-run-best') ?? 0) || 0;
let lastTime = performance.now();
let paused = false;

function saveBest() {
  best = Math.max(best, world.state.score);
  try {
    window.localStorage.setItem('turkey-run-best', String(best));
  } catch {
    // Private mode: the score still shows, it just is not kept.
  }
}

function startRun() {
  world.reset();
  screen = SCREEN_PLAY;
  paused = false;
  audio.unlock();
  audio.startMusic();
}

function endRun() {
  saveBest();
  screen = SCREEN_OVER;
  audio.stopMusic();
  if (world.state.escaped) audio.escaped();
  else audio.caught();
}

function handleEvents(events) {
  if (events & EVENT_CORN) audio.corn();
  if (events & EVENT_HIT) audio.hit();
  if (events & EVENT_POWERUP) audio.powerup();
  if (events & EVENT_OVER) endRun();
}

if (shotMode) {
  // Screenshot mode: stage a fixed scene, draw it once, stop. The judge's
  // screenshots come from this exact code path.
  const staged = stageShot(shotName(window.location.search), world);
  screen = staged.screen;
  best = staged.best;
  if (screen === SCREEN_TITLE) drawTitle(ctx, world.state, best);
  else if (screen === SCREEN_OVER) drawOver(ctx, world.state, best);
  else drawPlay(ctx, world.state);
  document.title = `Turkey Run — ${screen}`;
} else {
  drawTitle(ctx, world.state, best);

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const pressed = input.consume();

    if (pressed.mute) {
      const muted = audio.toggleMute();
      void muted;
    }
    if (pressed.pause && screen === SCREEN_PLAY) {
      paused = !paused;
      screen = paused ? SCREEN_PAUSED : SCREEN_PLAY;
    }

    if (screen === SCREEN_TITLE) {
      if (pressed.jump || pressed.pointer || pressed.restart) startRun();
      drawTitle(ctx, world.state, best);
    } else if (screen === SCREEN_PLAY) {
      const events = world.step(dt, pressed.jump, pressed.slide);
      handleEvents(events);
      drawPlay(ctx, world.state);
    } else if (screen === SCREEN_PAUSED) {
      drawPaused(ctx, world.state);
    } else if (screen === SCREEN_OVER) {
      if (pressed.jump || pressed.pointer || pressed.restart) startRun();
      drawOver(ctx, world.state, best);
    }
    void EVENT_ESCAPED;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
