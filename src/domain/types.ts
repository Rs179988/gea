export interface JumpKinematicsInput {
  jumpHeightPixels: number; // h (max jump height in pixels)
  timeToApexSeconds: number; // t_apex (time to reach peak of jump)
  horizontalSpeedPixelsPerSec?: number; // max run speed
  timeToMaxSpeedSeconds?: number; // acceleration duration
  timeToStopSeconds?: number; // deceleration duration
  coyoteTimeSeconds?: number;
  jumpBufferSeconds?: number;
}

export interface DerivedPhysicsConstants {
  gravity: number; // pixels / sec^2 (2 * h / t^2)
  initialJumpVelocity: number; // pixels / sec (2 * h / t)
  fallMultiplier: number; // extra gravity multiplier when falling
  lowJumpMultiplier: number; // extra gravity when jump button released early
  maxHorizontalSpeed: number;
  acceleration: number; // speed / time_to_max
  friction: number; // speed / time_to_stop
  coyoteTimeMs: number;
  jumpBufferMs: number;
}
