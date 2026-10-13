import { DerivedPhysicsConstants, JumpKinematicsInput } from './types.js';

export function derivePhysicsConstants(input: JumpKinematicsInput): DerivedPhysicsConstants {
  const h = input.jumpHeightPixels;
  const t = input.timeToApexSeconds;

  if (t <= 0 || h <= 0) {
    throw new Error('jumpHeightPixels and timeToApexSeconds must be greater than zero.');
  }

  // Exact kinematics:
  // h = 0.5 * g * t^2 => g = 2 * h / (t^2)
  // v_0 = g * t = 2 * h / t
  const gravity = (2 * h) / (t * t);
  const initialJumpVelocity = (2 * h) / t;

  const speed = input.horizontalSpeedPixelsPerSec || 300;
  const tAccel = input.timeToMaxSpeedSeconds || 0.1;
  const tDecel = input.timeToStopSeconds || 0.08;

  const acceleration = speed / tAccel;
  const friction = speed / tDecel;

  return {
    gravity: Math.round(gravity * 100) / 100,
    initialJumpVelocity: Math.round(initialJumpVelocity * 100) / 100,
    fallMultiplier: 1.5,
    lowJumpMultiplier: 2.0,
    maxHorizontalSpeed: speed,
    acceleration: Math.round(acceleration * 100) / 100,
    friction: Math.round(friction * 100) / 100,
    coyoteTimeMs: Math.round((input.coyoteTimeSeconds || 0.15) * 1000),
    jumpBufferMs: Math.round((input.jumpBufferSeconds || 0.12) * 1000),
  };
}
