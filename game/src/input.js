// Turkey Run — input: keyboard and mouse, one small state object the world
// reads each frame. Space / ArrowUp / W jump, ArrowDown / S slide, click and
// tap do the same, R restarts an ended run, P pauses, M mutes.
export function createInput(canvas) {
  const input = {
    jumpPressed: false,
    jumpHeld: false,
    slideHeld: false,
    restartPressed: false,
    pausePressed: false,
    mutePressed: false,
    pointerX: 0,
    pointerY: 0,
    pointerPressed: false,
  };

  function pressJump() {
    if (!input.jumpHeld) input.jumpPressed = true;
    input.jumpHeld = true;
  }

  function keyDown(event) {
    if (event.repeat) return;
    const key = event.key;
    if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
      event.preventDefault();
      pressJump();
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      event.preventDefault();
      input.slideHeld = true;
    } else if (key === 'r' || key === 'R') {
      input.restartPressed = true;
    } else if (key === 'p' || key === 'P' || key === 'Escape') {
      input.pausePressed = true;
    } else if (key === 'm' || key === 'M') {
      input.mutePressed = true;
    } else if (key === 'Enter') {
      pressJump();
    }
  }

  function keyUp(event) {
    const key = event.key;
    if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') input.jumpHeld = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') input.slideHeld = false;
  }

  function pointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    input.pointerX = event.clientX - rect.left;
    input.pointerY = event.clientY - rect.top;
    input.pointerPressed = true;
    pressJump();
  }

  function pointerUp() {
    input.jumpHeld = false;
  }

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', pointerDown);
  window.addEventListener('pointerup', pointerUp);

  // Edge-triggered flags are consumed once per frame by the game loop.
  input.consume = function consume() {
    const snapshot = {
      jump: input.jumpPressed,
      restart: input.restartPressed,
      pause: input.pausePressed,
      mute: input.mutePressed,
      pointer: input.pointerPressed,
      pointerX: input.pointerX,
      pointerY: input.pointerY,
      slide: input.slideHeld,
      jumpHeld: input.jumpHeld,
    };
    input.jumpPressed = false;
    input.restartPressed = false;
    input.pausePressed = false;
    input.mutePressed = false;
    input.pointerPressed = false;
    return snapshot;
  };

  return input;
}
