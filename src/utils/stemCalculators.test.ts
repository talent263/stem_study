import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOhmsLaw,
  compareAlgorithmComplexity,
  calculateDegreeClass,
  solveQuadraticEquation,
  calculateProjectileMotion,
} from './stemCalculators.ts';

test('Ohm law computes voltage, current, resistance, and power', () => {
  // Given V=12V, R=4 Ohms -> I=3A, P=36W
  const res1 = calculateOhmsLaw({ voltage: 12, resistance: 4 });
  assert.ok(res1);
  assert.equal(res1.current, 3);
  assert.equal(res1.power, 36);

  // Given I=2A, R=10 Ohms -> V=20V, P=40W
  const res2 = calculateOhmsLaw({ current: 2, resistance: 10 });
  assert.ok(res2);
  assert.equal(res2.voltage, 20);
  assert.equal(res2.power, 40);
});

test('Algorithm complexity comparator yields valid steps', () => {
  const steps = compareAlgorithmComplexity(16);
  assert.equal(steps.length, 5);
  const oLogN = steps.find((s) => s.notation === 'O(log n)');
  assert.ok(oLogN);
  assert.equal(oLogN.operations, 4); // log2(16) = 4
});

test('Degree classification calculates correct Zimbabwean university grading', () => {
  const grades = [
    { courseCode: 'SE201', credits: 4, mark: 80 },
    { courseCode: 'CS202', credits: 4, mark: 76 },
    { courseCode: 'MTH201', credits: 3, mark: 72 },
  ];
  const result = calculateDegreeClass(grades);
  assert.ok(result.averageMark >= 75);
  assert.equal(result.classification, 'First Class (1)');
});

test('Quadratic equation solver returns valid real roots for a standard case', () => {
  const result = solveQuadraticEquation(1, -3, 2);
  assert.equal(result.discriminant, 1);
  assert.deepEqual(result.roots, [1, 2]);
});

test('Projectile motion calculator returns expected flight metrics', () => {
  const result = calculateProjectileMotion(20, 45, 9.81);
  assert.ok(result.range > 0);
  assert.ok(result.maxHeight > 0);
  assert.ok(result.timeOfFlight > 0);
  assert.ok(Math.abs(result.horizontalVelocity - 14.142135623730951) < 0.0001);
});
