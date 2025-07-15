export function calculatePace(distance, time) {
  if (distance <= 0 || time <= 0) return null;
  return time / distance;
}
