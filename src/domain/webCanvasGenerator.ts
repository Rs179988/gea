import { DerivedPhysicsConstants } from './types.js';

export function generatePlayableHtmlCanvas(physics: DerivedPhysicsConstants): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GEA Playable Mechanics Prototype</title>
  <style>
    body {
      margin: 0;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    canvas {
      background: #1e293b;
      border: 2px solid #38bdf8;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .hud {
      margin-top: 15px;
      font-size: 14px;
      display: flex;
      gap: 20px;
    }
    .key {
      background: #334155;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>🕹️ GEA Playable Mechanics Sandbox</h2>
  <canvas id="gameCanvas" width="800" height="450"></canvas>
  <div class="hud">
    <div>Controls: <span class="key">A</span> / <span class="key">D</span> or <span class="key">Arrows</span> Move</div>
    <div>Jump: <span class="key">Space</span> / <span class="key">W</span> / <span class="key">Up</span></div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const GRAVITY = ${physics.gravity};
    const JUMP_VELOCITY = ${physics.initialJumpVelocity};
    const MAX_SPEED = ${physics.maxHorizontalSpeed};
    const ACCEL = ${physics.acceleration};
    const FRICTION = ${physics.friction};
    const FALL_MULT = ${physics.fallMultiplier};
    const LOW_JUMP_MULT = ${physics.lowJumpMultiplier};

    const player = {
      x: 100,
      y: 300,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      grounded: false,
      coyoteTimer: 0,
      jumpBuffer: 0
    };

    const platforms = [
      { x: 0, y: 400, w: 800, h: 50 },
      { x: 150, y: 310, w: 140, h: 20 },
      { x: 380, y: 240, w: 140, h: 20 },
      { x: 580, y: 170, w: 140, h: 20 }
    ];

    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) {
        player.jumpBuffer = 0.15;
      }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Input
      let moveDir = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) moveDir -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveDir += 1;

      // Horizontal Accel / Friction
      if (moveDir !== 0) {
        player.vx = Math.min(Math.max(player.vx + moveDir * ACCEL * dt, -MAX_SPEED), MAX_SPEED);
      } else {
        if (player.vx > 0) player.vx = Math.max(0, player.vx - FRICTION * dt);
        else if (player.vx < 0) player.vx = Math.min(0, player.vx + FRICTION * dt);
      }

      // Vertical Gravity & Multipliers
      if (!player.grounded) {
        let g = GRAVITY;
        if (player.vy > 0) g *= FALL_MULT;
        else if (player.vy < 0 && !(keys['Space'] || keys['KeyW'] || keys['ArrowUp'])) g *= LOW_JUMP_MULT;
        player.vy += g * dt;
        player.coyoteTimer -= dt;
      } else {
        player.coyoteTimer = 0.15;
      }

      player.jumpBuffer -= dt;

      // Jump
      if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
        player.vy = -JUMP_VELOCITY;
        player.jumpBuffer = 0;
        player.coyoteTimer = 0;
        player.grounded = false;
      }

      // Apply
      player.x += player.vx * dt;
      player.y += player.vy * dt;

      // Collision
      player.grounded = false;
      for (const p of platforms) {
        if (player.x + player.width > p.x && player.x < p.x + p.w) {
          if (player.y + player.height >= p.y && player.y + player.height - player.vy * dt <= p.y + 10) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
          }
        }
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Platforms
      ctx.fillStyle = '#475569';
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }

      // Player
      ctx.fillStyle = player.grounded ? '#38bdf8' : '#f43f5e';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  </script>
</body>
</html>
`;
}
