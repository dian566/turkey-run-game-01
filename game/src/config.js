// Turkey Run — config: every tuning number for the escape lives here, so the
// world, the renderer and the screenshot autopilot all read the same truth.
export const CANVAS = { width: 960, height: 540 };
export const GROUND_Y = 452;
export const TURKEY = {
  x: 170,
  width: 62,
  height: 58,
  jumpVelocity: -1150,
  gravity: 2600,
  slideHeight: 30,
};
export const RUN = {
  startSpeed: 260,
  maxSpeed: 620,
  speedPerMetre: 0.16,
  escapeDistance: 1500,
  farmerStartGap: 210,
  farmerCatchGap: 0,
  farmerGainOnHit: 70,
  farmerDriftBack: 26,
  cornScore: 25,
  metreScore: 1,
};
export const OBSTACLES = {
  oven: { width: 74, height: 96, minGap: 340, maxGap: 560 },
  knife: { width: 88, height: 26, minGap: 380, maxGap: 620 },
  hay: { width: 66, height: 52, minGap: 300, maxGap: 520 },
  fence: { width: 58, height: 64, minGap: 320, maxGap: 540 },
};
export const POWERUPS = {
  featherSeconds: 3,
  shieldBlocks: 1,
};
export const COLOURS = {
  skyTop: '#ffd9a0',
  skyMid: '#ffb37a',
  skyBottom: '#ff9d6b',
  sun: '#fff3b0',
  hillFar: '#c98a4b',
  hillNear: '#a86a35',
  ground: '#7a4a21',
  groundTop: '#b5773a',
  grass: '#7fb069',
  turkeyBody: '#8d5a2b',
  turkeyBelly: '#e8c39e',
  turkeyWing: '#6b3f1d',
  turkeyHead: '#d97b4f',
  turkeyWattle: '#d62828',
  farmerShirt: '#3a6ea5',
  farmerHat: '#e9c46a',
  farmerSkin: '#f2c094',
  oven: '#5b5f66',
  ovenDoor: '#2b2e33',
  knifeBlade: '#dfe6ee',
  knifeHandle: '#5b3a1e',
  hay: '#e9c46a',
  fence: '#8d5a2b',
  corn: '#ffd23f',
  feather: '#f4f1de',
  pumpkin: '#e76f51',
  hudPanel: 'rgba(43, 24, 8, 0.72)',
  hudText: '#fff8e7',
  danger: '#d62828',
  safe: '#7fb069',
};
