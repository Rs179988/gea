import test from 'node:test';
import assert from 'node:assert';
import { derivePhysicsConstants } from '../domain/physicsExtractor.js';

test('derivePhysicsConstants computes exact kinematics', () => {
  // Height = 100, t_apex = 0.5
  // g = 2 * 100 / 0.25 = 800
  // v_0 = 2 * 100 / 0.5 = 400
  const p = derivePhysicsConstants({
    jumpHeightPixels: 100,
    timeToApexSeconds: 0.5,
  });

  assert.strictEqual(p.gravity, 800);
  assert.strictEqual(p.initialJumpVelocity, 400);
  assert.strictEqual(p.maxHorizontalSpeed, 300);
});

test('derivePhysicsConstants rejects non-positive values', () => {
  assert.throws(() => {
    derivePhysicsConstants({ jumpHeightPixels: 0, timeToApexSeconds: 0.5 });
  });
  assert.throws(() => {
    derivePhysicsConstants({ jumpHeightPixels: 100, timeToApexSeconds: -1 });
  });
});
