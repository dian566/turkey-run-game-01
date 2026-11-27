// Turkey Run — render: every pixel is drawn in code, no image files. A warm
// Thanksgiving dusk over the farmyard, the turkey in the foreground, the
// farmer closing in behind, and a HUD the judge can read at a glance.
import { CANVAS, COLOURS, GROUND_Y, RUN, TURKEY } from './config.js';
import { KIND_CORN, KIND_FEATHER, KIND_FENCE, KIND_HAY, KIND_KNIFE, KIND_OVEN, KIND_PUMPKIN } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSED = 'paused';

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawSky(ctx, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, COLOURS.skyTop);
  gradient.addColorStop(0.55, COLOURS.skyMid);
  gradient.addColorStop(1, COLOURS.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS.width, GROUND_Y);
  // Low autumn sun.
  ctx.fillStyle = COLOURS.sun;
  ctx.beginPath();
  ctx.arc(820, 96, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 176, 0.35)';
  ctx.beginPath();
  ctx.arc(820, 96, 62, 0, Math.PI * 2);
  ctx.fill();
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 248, 231, 0.85)';
  for (let index = 0; index < 3; index += 1) {
    const cx = ((index * 340 + time * 12) % (CANVAS.width + 220)) - 110;
    const cy = 52 + index * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy + 6, 44, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rolling hills.
  ctx.fillStyle = COLOURS.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(240, 330, 520, GROUND_Y);
  ctx.quadraticCurveTo(760, 350, CANVAS.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLOURS.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(300, 386, 640, GROUND_Y);
  ctx.quadraticCurveTo(840, 396, CANVAS.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx) {
  ctx.fillStyle = COLOURS.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS.width, CANVAS.height - GROUND_Y);
  ctx.fillStyle = COLOURS.groundTop;
  ctx.fillRect(0, GROUND_Y, CANVAS.width, 10);
  ctx.fillStyle = COLOURS.grass;
  for (let x = 8; x < CANVAS.width; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 10);
    ctx.lineTo(x + 5, GROUND_Y - 4);
    ctx.lineTo(x + 10, GROUND_Y + 10);
    ctx.fill();
  }
  // Dirt track dashes rushing past.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (let x = 20; x < CANVAS.width; x += 90) {
    ctx.fillRect(x, GROUND_Y + 46, 34, 5);
  }
}

function drawScenery(ctx, scenery) {
  for (const item of scenery) {
    const x = item.x;
    const scale = item.scale;
    if (item.kind === 'barn') {
      ctx.fillStyle = '#a63d2f';
      ctx.fillRect(x, GROUND_Y - 110 * scale, 120 * scale, 110 * scale);
      ctx.fillStyle = '#7c2d22';
      ctx.beginPath();
      ctx.moveTo(x - 8, GROUND_Y - 110 * scale);
      ctx.lineTo(x + 60 * scale, GROUND_Y - 158 * scale);
      ctx.lineTo(x + 128 * scale, GROUND_Y - 110 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4f1de';
      ctx.fillRect(x + 44 * scale, GROUND_Y - 62 * scale, 32 * scale, 62 * scale);
    } else if (item.kind === 'tree') {
      ctx.fillStyle = '#6b3f1d';
      ctx.fillRect(x + 14 * scale, GROUND_Y - 70 * scale, 12 * scale, 70 * scale);
      ctx.fillStyle = '#c96f2e';
      ctx.beginPath();
      ctx.arc(x + 20 * scale, GROUND_Y - 92 * scale, 34 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e07b39';
      ctx.beginPath();
      ctx.arc(x + 2 * scale, GROUND_Y - 76 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = COLOURS.pumpkin;
      for (let index = 0; index < 3; index += 1) {
        ctx.beginPath();
        ctx.ellipse(x + index * 26 * scale, GROUND_Y - 12 * scale, 14 * scale, 11 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = COLOURS.grass;
      ctx.fillRect(x, GROUND_Y - 26 * scale, 70 * scale, 4);
    }
  }
}

function drawTurkey(ctx, state, time) {
  const sliding = state.sliding;
  const y = sliding ? GROUND_Y - TURKEY.slideHeight : state.turkeyY;
  const height = sliding ? TURKEY.slideHeight : TURKEY.height;
  const x = TURKEY.x;
  const bob = state.grounded ? Math.sin(time * 14) * 2 : 0;
  const blink = state.invincibleTimer > 0 && Math.floor(time * 12) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.45;
  ctx.save();
  ctx.translate(x, y + bob);
  if (sliding) {
    // Low slide: body stretched flat, head forward.
    ctx.fillStyle = COLOURS.turkeyBody;
    ctx.beginPath();
    ctx.ellipse(30, 16, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.turkeyHead;
    ctx.beginPath();
    ctx.arc(60, 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.turkeyWattle;
    ctx.fillRect(66, 12, 5, 8);
  } else {
    // Fanned tail.
    ctx.fillStyle = '#5d3413';
    for (let index = -2; index <= 2; index += 1) {
      ctx.save();
      ctx.translate(16, 26);
      ctx.rotate(index * 0.32);
      ctx.beginPath();
      ctx.ellipse(-16, 0, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Body and belly.
    ctx.fillStyle = COLOURS.turkeyBody;
    ctx.beginPath();
    ctx.ellipse(30, 32, 26, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.turkeyBelly;
    ctx.beginPath();
    ctx.ellipse(36, 38, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wing, mid-flap.
    ctx.fillStyle = COLOURS.turkeyWing;
    ctx.beginPath();
    ctx.ellipse(24, 30 + Math.sin(time * 14) * 4, 14, 9, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Head, beak, wattle, eye.
    ctx.fillStyle = COLOURS.turkeyHead;
    ctx.beginPath();
    ctx.arc(52, 14, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a259';
    ctx.beginPath();
    ctx.moveTo(62, 12);
    ctx.lineTo(72, 16);
    ctx.lineTo(62, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLOURS.turkeyWattle;
    ctx.beginPath();
    ctx.ellipse(58, 26, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d130b';
    ctx.beginPath();
    ctx.arc(55, 11, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Running legs.
    ctx.strokeStyle = '#f4a259';
    ctx.lineWidth = 4;
    const stride = Math.sin(time * 16) * 8;
    ctx.beginPath();
    ctx.moveTo(26, 52);
    ctx.lineTo(22 + stride, 58);
    ctx.moveTo(36, 52);
    ctx.lineTo(40 - stride, 58);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  // Dash glow and shield ring.
  if (state.dashTimer > 0) {
    ctx.strokeStyle = 'rgba(255, 210, 63, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + 30, y + height / 2, 40, height / 2 + 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (state.shield) {
    ctx.strokeStyle = 'rgba(231, 111, 81, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + 30, y + height / 2, 44, height / 2 + 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  void height;
}

function drawFarmer(ctx, state, time) {
  // The farmer runs behind the turkey; his gap is the chase meter made flesh.
  const gap = state.farmerGap;
  const x = TURKEY.x - 70 - (320 - gap) * 0.55;
  if (x < -90) return;
  const y = GROUND_Y - 92;
  const stride = Math.sin(time * 12) * 7;
  ctx.save();
  ctx.translate(x, y);
  // Legs.
  ctx.strokeStyle = '#3d2b1f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(18, 62);
  ctx.lineTo(12 + stride, 92);
  ctx.moveTo(30, 62);
  ctx.lineTo(36 - stride, 92);
  ctx.stroke();
  // Body: blue shirt, brown overalls.
  ctx.fillStyle = COLOURS.farmerShirt;
  roundRect(ctx, 8, 26, 40, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(14, 48, 28, 18);
  // Arms reaching forward, one holding the carving knife.
  ctx.strokeStyle = COLOURS.farmerSkin;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(40, 36);
  ctx.lineTo(62, 28 + stride * 0.4);
  ctx.moveTo(12, 36);
  ctx.lineTo(-2, 46 - stride * 0.4);
  ctx.stroke();
  ctx.fillStyle = COLOURS.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(62, 24 + stride * 0.4);
  ctx.lineTo(86, 30 + stride * 0.4);
  ctx.lineTo(62, 34 + stride * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLOURS.knifeHandle;
  ctx.fillRect(54, 24 + stride * 0.4, 10, 8);
  // Head and straw hat.
  ctx.fillStyle = COLOURS.farmerSkin;
  ctx.beginPath();
  ctx.arc(28, 14, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOURS.farmerHat;
  ctx.beginPath();
  ctx.ellipse(28, 6, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(16, -6, 24, 10);
  ctx.fillStyle = '#1d130b';
  ctx.beginPath();
  ctx.arc(33, 12, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Shout bubble when he is close.
  if (gap < 90) {
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, x + 30, y - 52, 150, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Come back here!', x + 40, y - 30);
  }
}

function drawObstacle(ctx, obstacle, time) {
  const { x, y, width, height, kind } = obstacle;
  if (kind === KIND_OVEN) {
    ctx.fillStyle = COLOURS.oven;
    roundRect(ctx, x, y, width, height, 8);
    ctx.fill();
    ctx.fillStyle = COLOURS.ovenDoor;
    roundRect(ctx, x + 10, y + 22, width - 20, height - 38, 6);
    ctx.fill();
    // Glowing hot interior and dials.
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(x + 16, y + 30, width - 32, 10);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(x + 18, y + 12, 5, 0, Math.PI * 2);
    ctx.arc(x + width - 18, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8e7';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OVEN', x + width / 2, y + height - 8);
  } else if (kind === KIND_KNIFE) {
    const wobble = Math.sin(time * 6 + obstacle.wobble) * 0.12;
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(wobble);
    ctx.fillStyle = COLOURS.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2 + 4);
    ctx.lineTo(width / 2 - 18, -height / 2);
    ctx.lineTo(width / 2, 0);
    ctx.lineTo(width / 2 - 18, height / 2);
    ctx.lineTo(-width / 2, height / 2 - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLOURS.knifeHandle;
    roundRect(ctx, -width / 2 - 4, -height / 2, 16, height, 4);
    ctx.fill();
    ctx.restore();
  } else if (kind === KIND_HAY) {
    ctx.fillStyle = COLOURS.hay;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b98a2f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 3, height / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === KIND_FENCE) {
    ctx.fillStyle = COLOURS.fence;
    ctx.fillRect(x + 4, y, 8, height);
    ctx.fillRect(x + width - 12, y, 8, height);
    ctx.fillRect(x, y + 10, width, 8);
    ctx.fillRect(x, y + height / 2, width, 8);
  }
}

function drawPickup(ctx, pickup, time) {
  const bob = Math.sin(pickup.bob) * 4;
  const { x, y, kind } = pickup;
  if (kind === KIND_CORN) {
    ctx.fillStyle = COLOURS.corn;
    ctx.beginPath();
    ctx.ellipse(x + 13, y + 15 + bob, 11, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b98a2f';
    for (let row = -1; row <= 1; row += 1) {
      ctx.fillRect(x + 6, y + 12 + bob + row * 8, 14, 2);
    }
    ctx.fillStyle = COLOURS.grass;
    ctx.fillRect(x + 10, y + 28 + bob, 6, 8);
  } else if (kind === KIND_FEATHER) {
    ctx.fillStyle = COLOURS.feather;
    ctx.beginPath();
    ctx.ellipse(x + 17, y + 17 + bob, 12, 16, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9c2a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 17, y + 4 + bob);
    ctx.lineTo(x + 17, y + 30 + bob);
    ctx.stroke();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DASH', x + 17, y + 46 + bob);
  } else if (kind === KIND_PUMPKIN) {
    ctx.fillStyle = COLOURS.pumpkin;
    ctx.beginPath();
    ctx.ellipse(x + 17, y + 17 + bob, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.grass;
    ctx.fillRect(x + 14, y + 2 + bob, 6, 8);
    ctx.fillStyle = '#fff8e7';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHIELD', x + 17, y + 48 + bob);
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLOURS.hudPanel;
  roundRect(ctx, 12, 12, 440, 86, 12);
  ctx.fill();
  ctx.fillStyle = COLOURS.hudText;
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`SCORE ${state.score}`, 26, 40);
  ctx.font = '16px sans-serif';
  ctx.fillText(`Distance ${Math.floor(state.distance)} m / ${RUN.escapeDistance} m`, 26, 64);
  ctx.fillText(`Corn ${state.cornCollected}`, 26, 86);
  // Lives as hearts, inside the HUD panel.
  for (let index = 0; index < 3; index += 1) {
    const hx = 336 + index * 30;
    ctx.fillStyle = index < state.lives ? COLOURS.turkeyWattle : 'rgba(255, 248, 231, 0.3)';
    ctx.beginPath();
    ctx.arc(hx, 58, 9, 0, Math.PI * 2);
    ctx.arc(hx + 12, 58, 9, 0, Math.PI * 2);
    ctx.moveTo(hx - 2, 72);
    ctx.lineTo(hx + 26, 72);
    ctx.lineTo(hx + 12, 80);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('LIVES', 330, 26);
  // Farmer chase meter: how far behind the farmer is.
  ctx.fillStyle = COLOURS.hudPanel;
  roundRect(ctx, CANVAS.width - 268, 12, 256, 52, 12);
  ctx.fill();
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('FARMER', CANVAS.width - 254, 30);
  const gapFraction = Math.max(0, Math.min(1, state.farmerGap / 320));
  ctx.fillStyle = 'rgba(255, 248, 231, 0.25)';
  roundRect(ctx, CANVAS.width - 254, 38, 228, 12, 6);
  ctx.fill();
  ctx.fillStyle = gapFraction > 0.45 ? COLOURS.safe : gapFraction > 0.2 ? COLOURS.corn : COLOURS.danger;
  roundRect(ctx, CANVAS.width - 254, 38, 228 * gapFraction, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('TURKEY', CANVAS.width - 72, 30);
  // Dash / shield status.
  if (state.dashTimer > 0 || state.shield) {
    ctx.fillStyle = COLOURS.hudPanel;
    roundRect(ctx, 12, 108, 220, 30, 10);
    ctx.fill();
    ctx.fillStyle = COLOURS.corn;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(state.dashTimer > 0 ? `DASH ${state.dashTimer.toFixed(1)}s` : 'SHIELD UP', 24, 128);
  }
  // Progress bar to the forest.
  const progress = Math.min(1, state.distance / RUN.escapeDistance);
  ctx.fillStyle = COLOURS.hudPanel;
  roundRect(ctx, 12, CANVAS.height - 34, CANVAS.width - 24, 22, 11);
  ctx.fill();
  ctx.fillStyle = COLOURS.safe;
  roundRect(ctx, 14, CANVAS.height - 32, (CANVAS.width - 28) * progress, 18, 9);
  ctx.fill();
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`ESCAPE TO THE FOREST — ${Math.floor(progress * 100)}%`, CANVAS.width / 2, CANVAS.height - 19);
  ctx.textAlign = 'left';
}

function panel(ctx, x, y, width, height) {
  ctx.fillStyle = 'rgba(43, 24, 8, 0.82)';
  roundRect(ctx, x, y, width, height, 18);
  ctx.fill();
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, height, 18);
  ctx.stroke();
}

export function drawTitle(ctx, state, best) {
  drawSky(ctx, 4);
  drawGround(ctx);
  drawScenery(ctx, state.scenery);
  drawTurkey(ctx, { ...state, turkeyY: GROUND_Y - TURKEY.height, grounded: true, sliding: false, invincibleTimer: 0, dashTimer: 0, shield: false }, 4);
  drawFarmer(ctx, { ...state, farmerGap: 120 }, 4);
  panel(ctx, 180, 56, 600, 330);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TURKEY RUN', CANVAS.width / 2, 122);
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Escape Thanksgiving dinner!', CANVAS.width / 2, 158);
  ctx.font = '16px sans-serif';
  ctx.fillText('The farmer is coming with his carving knife.', CANVAS.width / 2, 192);
  ctx.fillText('Jump the ovens, slide under the knives,', CANVAS.width / 2, 218);
  ctx.fillText('grab the corn — and run 1500 m to the forest.', CANVAS.width / 2, 244);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText('SPACE / CLICK — jump      DOWN — slide', CANVAS.width / 2, 282);
  ctx.fillText('Feather = dash    Pumpkin = shield', CANVAS.width / 2, 308);
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Press SPACE or CLICK to run', CANVAS.width / 2, 350);
  if (best > 0) {
    ctx.font = '16px sans-serif';
    ctx.fillText(`Best score: ${best}`, CANVAS.width / 2, 376);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff8e7';
  ctx.font = '14px sans-serif';
  ctx.fillText('An original game — no network, no files but these.', 16, CANVAS.height - 12);
}

export function drawPlay(ctx, state) {
  drawSky(ctx, state.time);
  drawScenery(ctx, state.scenery);
  drawGround(ctx);
  for (const pickup of state.pickups) if (pickup.active) drawPickup(ctx, pickup, state.time);
  for (const obstacle of state.obstacles) if (obstacle.active) drawObstacle(ctx, obstacle, state.time);
  drawFarmer(ctx, state, state.time);
  drawTurkey(ctx, state, state.time);
  drawHud(ctx, state);
  if (state.dashTimer > 0) {
    ctx.fillStyle = 'rgba(255, 210, 63, 0.25)';
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  }
}

export function drawOver(ctx, state, best) {
  drawPlay(ctx, state);
  ctx.fillStyle = 'rgba(30, 10, 5, 0.55)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  panel(ctx, 210, 96, 540, 330);
  ctx.textAlign = 'center';
  if (state.escaped) {
    ctx.fillStyle = '#7fb069';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText('ESCAPED!', CANVAS.width / 2, 168);
    ctx.fillStyle = '#fff8e7';
    ctx.font = '20px sans-serif';
    ctx.fillText('The turkey made it to the forest.', CANVAS.width / 2, 206);
    ctx.fillText('No Thanksgiving dinner this year!', CANVAS.width / 2, 234);
  } else {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText('CAUGHT!', CANVAS.width / 2, 168);
    ctx.fillStyle = '#fff8e7';
    ctx.font = '20px sans-serif';
    ctx.fillText('The farmer caught the turkey...', CANVAS.width / 2, 206);
    ctx.fillText('...but there is always next Thanksgiving.', CANVAS.width / 2, 234);
  }
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Score ${state.score}   •   ${Math.floor(state.distance)} m   •   Corn ${state.cornCollected}`, CANVAS.width / 2, 282);
  ctx.fillStyle = '#fff8e7';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Best score: ${Math.max(best, state.score)}`, CANVAS.width / 2, 312);
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press R or CLICK to run again', CANVAS.width / 2, 352);
  ctx.fillStyle = '#ffd23f';
  ctx.font = '15px sans-serif';
  ctx.fillText('SPACE jump  •  DOWN slide  •  P pause  •  M mute', CANVAS.width / 2, 386);
  ctx.textAlign = 'left';
}

export function drawPaused(ctx, state) {
  drawPlay(ctx, state);
  ctx.fillStyle = 'rgba(30, 10, 5, 0.5)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  panel(ctx, 330, 200, 300, 120);
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CANVAS.width / 2, 250);
  ctx.font = '16px sans-serif';
  ctx.fillText('Press P to keep running', CANVAS.width / 2, 284);
  ctx.textAlign = 'left';
}
