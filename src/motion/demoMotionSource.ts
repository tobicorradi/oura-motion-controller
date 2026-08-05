export const demoMotion = (x: number, y: number, pulse: number) => ({
  x: y * 0.72 + Math.sin(performance.now() / 190) * pulse,
  y: x * 0.72 + Math.cos(performance.now() / 230) * pulse,
  z: 1,
  timestamp: performance.now(),
});
