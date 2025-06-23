import { Size, Vector } from "../types";

const TAU = 2 * Math.PI;

// Takes an angle and normalizes it from zero to two PI
export function normalizeAngle(angle: number): number {
  "worklet";
  return (angle + TAU) % TAU;
}

export const quadraticBezier = (
  p0: Vector<number>,
  cp: Vector<number>,
  p1: Vector<number>,
  t: number,
): Vector<number> => {
  "worklet";

  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * cp.x + t ** 2 * p1.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * cp.y + t ** 2 * p1.y;
  return { x, y };
};

export const getAngleBetweenVectors = (
  u: Vector<number>,
  v: Vector<number>,
): number => {
  "worklet";

  const dot = u.x * v.x + u.y * v.y;
  const uMagnitude = Math.hypot(u.x, u.y);
  const vMagnitude = Math.hypot(v.x, v.y);

  return Math.acos(dot / (uMagnitude * vMagnitude));
};

// Find the first devirate of a quadratic bezier curve, then turn it into an angle
export const quadraticBezierTangentAsAngle = (
  p0: Vector<number>, // start
  p1: Vector<number>, // control
  p2: Vector<number>, // end
): number => {
  "worklet";

  const t = 0;
  const n = 2;
  const derivate: Vector<number> = { x: 0, y: 0 };
  derivate.x += (p1.x - p0.x) * n * Math.pow(1 - t, n - 1 - 0) * Math.pow(t, 0);
  derivate.y += (p1.y - p0.y) * n * Math.pow(1 - t, n - 1 - 0) * Math.pow(t, 0);
  derivate.x += (p2.x - p1.x) * n * Math.pow(1 - t, n - 1 - 1) * Math.pow(t, 1);
  derivate.y += (p2.y - p1.y) * n * Math.pow(1 - t, n - 1 - 1) * Math.pow(t, 1);

  return Math.atan2(derivate.y, derivate.x);
};

export function dotProduct(u: Vector<number>, v: Vector<number>): number {
  "worklet";

  return u.x * v.x + u.y * v.y;
}

export function normalizeVector(vector: Vector<number>): Vector<number> {
  "worklet";

  const length = Math.hypot(vector.x, vector.y);
  return { x: vector.x / length, y: vector.y / length };
}

export function rotate2D(
  vector: Vector<number>,
  angle: number,
): Vector<number> {
  "worklet";

  return {
    x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
    y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
  };
}

export const fitContainer = (
  aspectRatio: number,
  container: Size<number>,
): Size<number> => {
  "worklet";

  let width = container.width;
  let height = container.width / aspectRatio;

  if (height > container.height) {
    width = container.height * aspectRatio;
    height = container.height;
  }

  return { width, height };
};
