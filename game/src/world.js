// Turkey Run — world: the whole simulation. A side-scrolling farmyard: the
// turkey runs right, the farmer chases from the left, ovens, carving knives,
// hay bales and fences block the way, corn feeds the score, and 1500 metres
// of running reaches the forest and freedom. Deterministic under a seed, so
// screenshots and replays agree.
import { CANVAS, GROUND_Y, OBSTACLES, POWERUPS, RUN, TURKEY } from './config.js';

export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_HAY = 'hay';
export const KIND_FENCE = 'fence';
export const KIND_CORN = 'corn';
export const KIND_FEATHER = 'feather';
export const KIND_PUMPKIN = 'pumpkin';
export const EVENT_HIT = 1;
export const EVENT_CORN = 2;
export const EVENT_POWERUP = 4;
export const EVENT_OVER = 8;
export const EVENT_ESCAPED = 16;

const OBSTACLE_KINDS = [KIND_OVEN, KIND_KNIFE, KIND_HAY, KIND_FENCE];

// Mulberry32: small seeded PRNG, same seed, same farm every time.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function obstacleSize(kind) {
  return OBSTACLES[kind];
}

function pickKind(random, distance) {
  // Knives only start flying once the run is underway; ovens get common late.
  const pool = [KIND_HAY, KIND_FENCE, KIND_OVEN];
  if (distance > 220) pool.push(KIND_KNIFE, KIND_KNIFE);
  if (distance > 700) pool.push(KIND_OVEN);
  return pool[Math.floor(random() * pool.length)];
}

function spawnObstacle(world, x) {
  const kind = pickKind(world.random, world.state.distance);
  const size = obstacleSize(kind);
  const obstacle = {
    kind,
    x,
    y: kind === KIND_KNIFE ? GROUND_Y - 92 : GROUND_Y - size.height,
    width: size.width,
    height: size.height,
    active: true,
    passed: false,
    wobble: world.random() * Math.PI * 2,
  };
  world.state.obstacles.push(obstacle);
  return obstacle;
}

function spawnCornRow(world, x) {
  const count = 3 + Math.floor(world.random() * 3);
  for (let index = 0; index < count; index += 1) {
    world.state.pickups.push({
      kind: KIND_CORN,
      x: x + index * 44,
      y: GROUND_Y - 40 - (index % 2) * 44,
      width: 26,
      height: 30,
      active: true,
      bob: world.random() * Math.PI * 2,
    });
  }
}

function spawnPowerup(world, x) {
  const kind = world.random() < 0.5 ? KIND_FEATHER : KIND_PUMPKIN;
  world.state.pickups.push({
    kind,
    x,
    y: GROUND_Y - 110,
    width: 34,
    height: 34,
    active: true,
    bob: 0,
  });
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function createWorld(seed = 1) {
  const world = {
    random: makeRandom(seed),
    state: null,
    seed,
  };
  world.reset = function reset() {
    world.random = makeRandom(world.seed);
    world.state = {
      distance: 0,
      score: 0,
      lives: 3,
      speed: RUN.startSpeed,
      farmerGap: RUN.farmerStartGap,
      turkeyY: GROUND_Y - TURKEY.height,
      turkeyVelocityY: 0,
      grounded: true,
      sliding: false,
      slideTimer: 0,
      dashTimer: 0,
      shield: false,
      invincibleTimer: 0,
      cornCollected: 0,
      obstaclesHit: 0,
      obstacles: [],
      pickups: [],
      scenery: [],
      over: false,
      escaped: false,
      time: 0,
      nextSpawnX: CANVAS.width + 260,
      nextCornX: CANVAS.width + 700,
      nextPowerupX: CANVAS.width + 2400,
      best: 0,
    };
    for (let index = 0; index < 14; index += 1) {
      world.state.scenery.push({
        x: index * 90,
        kind: index % 3 === 0 ? 'barn' : index % 3 === 1 ? 'tree' : 'pumpkin-patch',
        scale: 0.7 + world.random() * 0.6,
      });
    }
    spawnObstacle(world, CANVAS.width + 420);
  };

  // Advance the world by dt seconds. `move` is -1/0/1 from the autopilot or
  // unused here (the runner moves on its own); `jump` and `slide` are the
  // player's intents. Returns a bitmask of EVENT_* flags.
  world.step = function step(dt, jump, slide) {
    const s = world.state;
    if (s.over) return EVENT_OVER;
    let events = 0;
    s.time += dt;
    const speed = Math.min(RUN.maxSpeed, RUN.startSpeed + s.distance * RUN.speedPerMetre);
    s.speed = speed;
    const advance = speed * dt;
    s.distance += advance * 0.06;
    s.score = Math.floor(s.distance) * RUN.metreScore + s.cornCollected * RUN.cornScore;

    // Turkey vertical motion: jump, gravity, landing, slide.
    if (jump && s.grounded && !s.sliding) {
      s.turkeyVelocityY = TURKEY.jumpVelocity;
      s.grounded = false;
    }
    s.sliding = slide && s.grounded;
    if (s.sliding) s.slideTimer = Math.max(s.slideTimer, 0.45);
    if (!s.grounded) {
      s.turkeyVelocityY += TURKEY.gravity * dt;
      s.turkeyY += s.turkeyVelocityY * dt;
      if (s.turkeyY >= GROUND_Y - TURKEY.height) {
        s.turkeyY = GROUND_Y - TURKEY.height;
        s.turkeyVelocityY = 0;
        s.grounded = true;
      }
    }
    if (s.slideTimer > 0) s.slideTimer -= dt;
    if (s.dashTimer > 0) s.dashTimer -= dt;
    if (s.invincibleTimer > 0) s.invincibleTimer -= dt;

    // The farmer gains when the turkey stumbles, drifts back when it runs clean.
    s.farmerGap = Math.min(320, s.farmerGap + RUN.farmerDriftBack * dt * 0.4);
    if (s.farmerGap <= RUN.farmerCatchGap) {
      s.over = true;
      s.escaped = false;
      return events | EVENT_OVER;
    }
    if (s.distance >= RUN.escapeDistance) {
      s.over = true;
      s.escaped = true;
      return events | EVENT_OVER | EVENT_ESCAPED;
    }

    // Spawn ahead, recycle behind. The spawn markers scroll left with the
    // world, so new obstacles keep arriving for the whole run.
    world.state.nextSpawnX -= advance;
    world.state.nextCornX -= advance;
    world.state.nextPowerupX -= advance;
    while (world.state.nextSpawnX < CANVAS.width + 900) {
      const obstacle = spawnObstacle(world, world.state.nextSpawnX);
      const size = obstacleSize(obstacle.kind);
      world.state.nextSpawnX += world.random() * (size.maxGap - size.minGap) + size.minGap;
    }
    if (world.state.nextCornX < CANVAS.width + 500) {
      spawnCornRow(world, world.state.nextCornX);
      world.state.nextCornX += 620 + world.random() * 700;
    }
    if (world.state.nextPowerupX < CANVAS.width + 500) {
      spawnPowerup(world, world.state.nextPowerupX);
      world.state.nextPowerupX += 2600 + world.random() * 1800;
    }

    const turkeyBox = {
      x: TURKEY.x,
      y: s.sliding ? GROUND_Y - TURKEY.slideHeight : s.turkeyY,
      width: TURKEY.width,
      height: s.sliding ? TURKEY.slideHeight : TURKEY.height,
    };

    for (const obstacle of s.obstacles) {
      obstacle.x -= advance;
      if (obstacle.kind === KIND_KNIFE) {
        obstacle.y = GROUND_Y - 92 + Math.sin(s.time * 5 + obstacle.wobble) * 26;
      }
      if (!obstacle.passed && obstacle.x + obstacle.width < TURKEY.x) {
        obstacle.passed = true;
        s.farmerGap = Math.min(320, s.farmerGap + 8);
      }
      if (!obstacle.active) continue;
      // Sliding ducks under a flying knife; jumping clears ground obstacles.
      const hitBox = { ...obstacle };
      if (obstacle.kind === KIND_KNIFE && s.sliding) continue;
      if (overlaps(turkeyBox, hitBox)) {
        obstacle.active = false;
        if (s.dashTimer > 0 || s.invincibleTimer > 0) {
          events |= EVENT_POWERUP;
          continue;
        }
        if (s.shield) {
          s.shield = false;
          s.invincibleTimer = 1.2;
          events |= EVENT_HIT;
          continue;
        }
        s.lives -= 1;
        s.obstaclesHit += 1;
        s.farmerGap = Math.max(0, s.farmerGap - RUN.farmerGainOnHit);
        s.invincibleTimer = 1.5;
        events |= EVENT_HIT;
        if (s.lives <= 0 || s.farmerGap <= 0) {
          s.over = true;
          s.escaped = false;
          return events | EVENT_OVER;
        }
      }
    }
    s.obstacles = s.obstacles.filter((o) => o.x + o.width > -120);

    for (const pickup of s.pickups) {
      pickup.x -= advance;
      pickup.bob += dt * 4;
      if (!pickup.active) continue;
      if (overlaps(turkeyBox, pickup)) {
        pickup.active = false;
        if (pickup.kind === KIND_CORN) {
          s.cornCollected += 1;
          events |= EVENT_CORN;
        } else if (pickup.kind === KIND_FEATHER) {
          s.dashTimer = POWERUPS.featherSeconds;
          events |= EVENT_POWERUP;
        } else if (pickup.kind === KIND_PUMPKIN) {
          s.shield = true;
          events |= EVENT_POWERUP;
        }
      }
    }
    s.pickups = s.pickups.filter((p) => p.x + p.width > -80 && p.active !== false);

    for (const item of s.scenery) {
      item.x -= advance * 0.45;
      if (item.x < -160) {
        item.x = CANVAS.width + 60 + world.random() * 120;
        item.kind = world.random() < 0.4 ? 'barn' : world.random() < 0.5 ? 'tree' : 'pumpkin-patch';
      }
    }
    return events;
  };

  world.reset();
  return world;
}
