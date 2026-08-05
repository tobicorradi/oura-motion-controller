import { useEffect, useRef } from "react";
import type { ProcessedMotion } from "../../motion/types";
import type { SynthPreset } from "./music";

type Props = { motion: ProcessedMotion; preset: SynthPreset; pulse: number };

const palettes = {
  ambient: {
    top: "#20d7e9",
    middle: "#4f8dff",
    bottom: "#9c57ff",
    glow: "#159fe8",
  },
  pulse: {
    top: "#32d7ff",
    middle: "#7c6cff",
    bottom: "#f454cf",
    glow: "#9055ff",
  },
  cosmic: {
    top: "#6bb4ff",
    middle: "#8062fa",
    bottom: "#ff4ea9",
    glow: "#d23de0",
  },
} as const;

function hexWithAlpha(hex: string, alpha: number) {
  return `${hex}${Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

export function MotionVisualizer({ motion, preset, pulse }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef(motion);
  const propsRef = useRef({ preset, pulse });
  motionRef.current = motion;
  propsRef.current = { preset, pulse };

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;
    let frame = 0;
    const resize = () => {
      const rect = element.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio, 2);
      element.width = Math.max(1, Math.round(rect.width * ratio));
      element.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);

    const render = (time: number) => {
      const { preset: activePreset, pulse: activePulse } = propsRef.current;
      const currentMotion = motionRef.current;
      const { top, middle, bottom, glow } = palettes[activePreset];
      const width = element.clientWidth;
      const height = element.clientHeight;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pulseEnergy = Math.max(0, 1 - (time - activePulse) / 900);
      const roll = currentMotion.normalizedRoll;
      const pitch = currentMotion.normalizedPitch;
      const energy = currentMotion.energy;
      const phase = reduced
        ? 0
        : time / (activePreset === "pulse" ? 580 : 1300);

      context.clearRect(0, 0, width, height);
      const atmosphere = context.createRadialGradient(
        width * 0.74,
        height * 0.2,
        0,
        width * 0.5,
        height * 0.55,
        width * 0.75,
      );
      atmosphere.addColorStop(0, hexWithAlpha(top, 0.28 + energy * 0.15));
      atmosphere.addColorStop(0.44, hexWithAlpha(middle, 0.15));
      atmosphere.addColorStop(1, "transparent");
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      const lines = 18;
      const startY = height * 0.17;
      const gap = height * 0.043;
      const focusX = width * (0.52 + roll * 0.22);
      const spread = width * (0.13 + energy * 0.08 + pulseEnergy * 0.09);
      const movement = Math.min(
        1,
        0.16 +
          Math.abs(roll) * 0.62 +
          Math.abs(pitch) * 0.5 +
          energy * 1.15 +
          pulseEnergy * 1.2,
      );
      const peakDirection = pitch || (roll >= 0 ? 1 : -1);
      for (let line = 0; line < lines; line++) {
        const linePosition = line / (lines - 1);
        const color =
          linePosition < 0.34 ? top : linePosition < 0.68 ? middle : bottom;
        const baseline = startY + gap * line;
        const drift = (line - lines / 2) * pitch * 2.8;
        context.beginPath();
        for (let step = 0; step <= 160; step++) {
          const x = (step / 160) * width;
          const normalizedDistance = (x - focusX) / spread;
          const crest =
            Math.exp(-normalizedDistance * normalizedDistance) *
            peakDirection *
            (34 + movement * 190);
          const shoulderDistance =
            (x - (focusX - width * 0.18)) / (spread * 1.7);
          const shoulder =
            Math.exp(-shoulderDistance * shoulderDistance) *
            -peakDirection *
            (12 + movement * 62);
          const ripple =
            Math.sin(
              (x / width) * Math.PI * (1.7 + Math.abs(roll) * 2.5) +
                phase +
                line * 0.22,
            ) *
            (5 + movement * 22);
          const lineLift = 0.56 + linePosition * 0.52;
          const y =
            baseline +
            drift +
            crest * lineLift +
            shoulder * (1 - linePosition * 0.3) +
            ripple;
          if (step) context.lineTo(x, y);
          else context.moveTo(x, y);
        }
        context.strokeStyle = hexWithAlpha(color, 0.52 + linePosition * 0.18);
        context.lineWidth = line % 4 === 0 ? 1.7 : 1.05;
        context.shadowColor = hexWithAlpha(glow, 0.55);
        context.shadowBlur = line % 4 === 0 ? 14 : 5;
        context.stroke();
      }
      context.shadowBlur = 0;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className="synth-canvas"
      aria-label="A luminous field of motion-reactive flowing waves."
      role="img"
    />
  );
}
