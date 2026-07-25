export const particleVertexShader = `
attribute float aScale;
attribute float aSeed;
attribute vec3 aColor;

uniform float uTime;
uniform float uEnergy;
uniform float uBurst;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Scale points by depth so the field keeps a soft sense of perspective.
  float depthScale = clamp(1.25 / max(0.35, -mvPosition.z), 0.0, 3.0);
  float flicker = 0.92 + sin(uTime * 0.7 + aSeed * 29.0) * 0.08;

  gl_PointSize = aScale * depthScale * (13.0 + uEnergy * 17.0 + uBurst * 18.0) * flicker;
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = clamp(0.42 + aScale * 0.48 + uEnergy * 0.18 + uBurst * 0.2, 0.32, 1.0);
  vColor = aColor;
}
`

export const particleFragmentShader = `
uniform float uGlow;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(centered);
  float core = smoothstep(0.5, 0.03, distanceToCenter);
  float halo = smoothstep(0.7, 0.12, distanceToCenter);
  float alpha = core * vAlpha + halo * uGlow * 0.18;

  if (alpha < 0.015) discard;

  vec3 color = vColor + vColor * halo * uGlow * 0.18;
  gl_FragColor = vec4(color, alpha);
}
`
