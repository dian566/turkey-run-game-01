# Turkey Run — Escape Thanksgiving Dinner

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/dian566/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/dian566/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A turkey escape game for the [make.fun bounty](https://make.fun/bounty/turkey-run-game-01):
you are the turkey, Thanksgiving is coming, and the farmer is right behind you with his
carving knife. Run 1500 metres through the farmyard to the forest and freedom.

## How to play

- **SPACE / CLICK** — jump (over ovens, hay bales and fences)
- **DOWN** — slide under the flying carving knives
- **P** — pause, **M** — mute, **R** — restart

Every hit costs a life and lets the farmer catch up; lose all three lives, or let him
reach you, and you are Thanksgiving dinner. Corn feeds your score, a golden feather
gives you a dash, a pumpkin gives you a shield.

## The game

- Title screen, live run with a HUD (score, distance, corn, lives, farmer chase
  meter, escape progress), and a CAUGHT / ESCAPED end screen with restart.
- Side-scrolling farmyard at Thanksgiving dusk: barns, autumn trees, pumpkin
  patches, ovens, carving knives, hay bales and fences.
- All art is drawn in code and all sound is synthesised with WebAudio — no image
  or sound files, no network requests, no build step.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshots are staged deterministically: `?shot=start|play|end&seed=1` plays the
real rules forward with an autopilot, so every screenshot is a genuine render of
the game.

## Entry

- `main.ts` (Node 22) hands the game in: it copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with `vendor/makefun-game.ts`.
- `game/` — the playable game as static files (`index.html` + ES modules).
- `screenshots/` — 4 real renders of the game's own code.

## License

MIT — see [LICENSE](LICENSE).
