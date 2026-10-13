#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import { derivePhysicsConstants } from './domain/physicsExtractor.js';
import { generateGodot4CharacterBody2D } from './domain/godotGenerator.js';
import { generatePlayableHtmlCanvas } from './domain/webCanvasGenerator.js';
import { runMcpServer } from './mcp/server.js';

const program = new Command();

program
  .name('gea')
  .description('Game Engine & Mechanics Anything: Extract mechanics & synthesize Godot/Web engines.')
  .version('1.0.0');

program
  .command('fit')
  .description('Derive physics invariants from jump height and time to apex')
  .requiredOption('-h, --height <pixels>', 'Jump height in pixels', parseFloat)
  .requiredOption('-t, --time-to-apex <seconds>', 'Time to reach apex in seconds', parseFloat)
  .option('-s, --speed <speed>', 'Max horizontal speed in pixels/sec', parseFloat, 300)
  .action((opts) => {
    const res = derivePhysicsConstants({
      jumpHeightPixels: opts.height,
      timeToApexSeconds: opts.timeToApex,
      horizontalSpeedPixelsPerSec: opts.speed,
    });

    console.log(`\n🕹️ GEA Kinematics Invariant Solver`);
    console.log(`===============================================`);
    console.log(`Gravity (g):              ${res.gravity} px/s²`);
    console.log(`Initial Jump Velocity:    ${res.initialJumpVelocity} px/s`);
    console.log(`Max Run Speed:            ${res.maxHorizontalSpeed} px/s`);
    console.log(`Acceleration:             ${res.acceleration} px/s²`);
    console.log(`Friction:                 ${res.friction} px/s²`);
    console.log(`Coyote Window:            ${res.coyoteTimeMs} ms`);
    console.log(`Jump Buffer Window:       ${res.jumpBufferMs} ms\n`);
  });

program
  .command('godot')
  .description('Generate Godot 4 CharacterBody2D controller script')
  .requiredOption('-h, --height <pixels>', 'Jump height in pixels', parseFloat)
  .requiredOption('-t, --time-to-apex <seconds>', 'Time to reach apex in seconds', parseFloat)
  .option('-s, --speed <speed>', 'Max horizontal speed', parseFloat, 300)
  .option('-o, --output <path>', 'Output script file', 'CharacterBody2D.gd')
  .action((opts) => {
    const res = derivePhysicsConstants({
      jumpHeightPixels: opts.height,
      timeToApexSeconds: opts.timeToApex,
      horizontalSpeedPixelsPerSec: opts.speed,
    });
    const code = generateGodot4CharacterBody2D(res);
    fs.writeFileSync(opts.output, code, 'utf8');
    console.log(`✅ Godot 4 CharacterBody2D script generated at: ${opts.output}`);
  });

program
  .command('web')
  .description('Generate standalone playable HTML5 Canvas sandbox')
  .requiredOption('-h, --height <pixels>', 'Jump height in pixels', parseFloat)
  .requiredOption('-t, --time-to-apex <seconds>', 'Time to reach apex in seconds', parseFloat)
  .option('-s, --speed <speed>', 'Max horizontal speed', parseFloat, 300)
  .option('-o, --output <path>', 'Output HTML file', 'playable.html')
  .action((opts) => {
    const res = derivePhysicsConstants({
      jumpHeightPixels: opts.height,
      timeToApexSeconds: opts.timeToApex,
      horizontalSpeedPixelsPerSec: opts.speed,
    });
    const html = generatePlayableHtmlCanvas(res);
    fs.writeFileSync(opts.output, html, 'utf8');
    console.log(`✅ Playable HTML5 Sandbox generated at: ${opts.output}`);
  });

program
  .command('mcp')
  .description('Start GEA Model Context Protocol (MCP) server over stdio')
  .action(() => {
    runMcpServer();
  });

program.parse(process.argv);
