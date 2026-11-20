/**
 * STEM scientific and engineering mathematical calculation logic.
 */

export interface OhmsLawResult {
  voltage: number; // Volts
  current: number; // Amperes
  resistance: number; // Ohms
  power: number; // Watts
}

export function calculateOhmsLaw(params: {
  voltage?: number;
  current?: number;
  resistance?: number;
}): OhmsLawResult | null {
  const { voltage: v, current: i, resistance: r } = params;

  // Case 1: V and I known
  if (v !== undefined && i !== undefined && i !== 0) {
    const res = v / i;
    return {
      voltage: v,
      current: i,
      resistance: res,
      power: v * i,
    };
  }

  // Case 2: V and R known
  if (v !== undefined && r !== undefined && r !== 0) {
    const cur = v / r;
    return {
      voltage: v,
      current: cur,
      resistance: r,
      power: (v * v) / r,
    };
  }

  // Case 3: I and R known
  if (i !== undefined && r !== undefined) {
    const volt = i * r;
    return {
      voltage: volt,
      current: i,
      resistance: r,
      power: i * i * r,
    };
  }

  return null;
}

export interface ComplexityStep {
  name: string;
  notation: string;
  operations: number;
}

export function compareAlgorithmComplexity(n: number): ComplexityStep[] {
  const safeN = Math.max(1, Math.min(n, 1000000));
  return [
    { name: 'Constant Time', notation: 'O(1)', operations: 1 },
    { name: 'Logarithmic Time', notation: 'O(log n)', operations: Math.round(Math.log2(safeN) * 100) / 100 },
    { name: 'Linear Time', notation: 'O(n)', operations: safeN },
    { name: 'Linearithmic Time', notation: 'O(n log n)', operations: Math.round(safeN * Math.log2(safeN)) },
    { name: 'Quadratic Time', notation: 'O(n²)', operations: safeN <= 1000 ? safeN * safeN : Infinity },
  ];
}

export interface QuadraticResult {
  discriminant: number;
  roots: [number | null, number | null];
}

export function solveQuadraticEquation(a: number, b: number, c: number): QuadraticResult {
  const discriminant = b * b - 4 * a * c;

  if (Math.abs(a) < Number.EPSILON) {
    return {
      discriminant,
      roots: [null, null],
    };
  }

  if (Math.abs(discriminant) < 1e-10) {
    const root = -b / (2 * a);
    return {
      discriminant,
      roots: [root, root],
    };
  }

  if (discriminant < 0) {
    return {
      discriminant,
      roots: [null, null],
    };
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const root1 = (-b + sqrtDiscriminant) / (2 * a);
  const root2 = (-b - sqrtDiscriminant) / (2 * a);

  return {
    discriminant,
    roots: [Math.min(root1, root2), Math.max(root1, root2)],
  };
}

export interface ProjectileMotionResult {
  timeOfFlight: number;
  maxHeight: number;
  range: number;
  horizontalVelocity: number;
  verticalVelocity: number;
}

export function calculateProjectileMotion(
  initialVelocity: number,
  angleDegrees: number,
  gravity = 9.81
): ProjectileMotionResult {
  const theta = (angleDegrees * Math.PI) / 180;
  const vx = initialVelocity * Math.cos(theta);
  const vy = initialVelocity * Math.sin(theta);
  const timeOfFlight = (2 * vy) / gravity;
  const maxHeight = (vy * vy) / (2 * gravity);
  const range = initialVelocity * Math.cos(theta) * timeOfFlight;

  return {
    timeOfFlight: Math.max(0, timeOfFlight),
    maxHeight: Math.max(0, maxHeight),
    range: Math.max(0, range),
    horizontalVelocity: vx,
    verticalVelocity: vy,
  };
}

export interface GradeItem {
  courseCode: string;
  credits: number;
  mark: number; // 0 - 100
}

export interface DegreeClassification {
  averageMark: number;
  totalCredits: number;
  classification: 'First Class (1)' | 'Upper Second Class (2.1)' | 'Lower Second Class (2.2)' | 'Pass (3)' | 'Fail';
}

export function calculateDegreeClass(grades: GradeItem[]): DegreeClassification {
  if (!grades || grades.length === 0) {
    return {
      averageMark: 0,
      totalCredits: 0,
      classification: 'Fail',
    };
  }

  let totalWeighted = 0;
  let totalCredits = 0;

  for (const item of grades) {
    const weight = item.credits > 0 ? item.credits : 1;
    totalWeighted += item.mark * weight;
    totalCredits += weight;
  }

  const average = totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 10) / 10 : 0;

  let classification: DegreeClassification['classification'] = 'Fail';
  if (average >= 75) {
    classification = 'First Class (1)';
  } else if (average >= 65) {
    classification = 'Upper Second Class (2.1)';
  } else if (average >= 60) {
    classification = 'Lower Second Class (2.2)';
  } else if (average >= 50) {
    classification = 'Pass (3)';
  }

  return {
    averageMark: average,
    totalCredits,
    classification,
  };
}
