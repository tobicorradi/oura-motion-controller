import { motion as motionUi } from "framer-motion";
import type { CSSProperties } from "react";
import { particleCountForQuality } from "./particleMath";
import type { FieldQuality } from "./types";

type MovementProps = {
  horizontal: number;
  vertical: number;
  energy: number;
  stateLabel: string;
};

const directionFor = (horizontal: number, vertical: number) => {
  const x =
    Math.abs(horizontal) < 0.12 ? "" : horizontal > 0 ? "RIGHT" : "LEFT";
  const y = Math.abs(vertical) < 0.12 ? "" : vertical > 0 ? "UP" : "DOWN";
  return [y, x].filter(Boolean).join(" ") || "NEUTRAL";
};

export function MovementPanel({
  horizontal,
  vertical,
  energy,
  stateLabel,
}: MovementProps) {
  const direction = directionFor(horizontal, vertical);
  const angle = (Math.atan2(-vertical, horizontal) * 180) / Math.PI + 90;
  const intensity = Math.round(energy * 100);
  return (
    <motionUi.aside
      className="kinetic-side-card movement-card"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38 }}
    >
      <h2>Movement</h2>
      <div className="movement-summary">
        <span
          className="movement-icon"
          style={{
            transform: `rotate(${angle}deg)`,
            opacity: Math.max(0.36, energy),
          }}
        >
          ↑
        </span>
        <strong>{direction}</strong>
      </div>
      <div className="intensity-readout">
        <span>Intensity</span>
        <b>{intensity}%</b>
        <div className="energy-bar">
          <i style={{ width: `${Math.max(3, intensity)}%` }} />
        </div>
      </div>
      <MetricBar label="Horizontal" value={horizontal} color="blue" />
      <MetricBar label="Vertical" value={vertical} color="violet" />
      <p className="movement-state">{stateLabel}</p>
    </motionUi.aside>
  );
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const normalized = Math.abs(value);
  return (
    <div className={`axis-readout ${color}`}>
      <span>{label}</span>
      <div>
        <i style={{ width: `${Math.max(2, normalized * 100)}%` }} />
        <b>{value.toFixed(2)}</b>
      </div>
    </div>
  );
}

export function ParticleMetricsPanel({
  quality,
  energy,
}: {
  quality: FieldQuality;
  energy: number;
}) {
  const count = particleCountForQuality(quality);
  const speed = (1 + energy * 0.8).toFixed(1);
  return (
    <aside className="kinetic-side-card particle-metrics">
      <h2>Particles</h2>
      <dl>
        <div>
          <dt>Count</dt>
          <dd>{count.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Speed</dt>
          <dd>{speed}×</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{(2 + energy * 0.7).toFixed(1)}</dd>
        </div>
        <div>
          <dt>Responsiveness</dt>
          <dd>High</dd>
        </div>
      </dl>
    </aside>
  );
}

export function KineticTips() {
  return (
    <aside className="kinetic-side-card kinetic-tips">
      <h2>Tips</h2>
      <p>
        <i>ϟ</i>Move faster for more energy
      </p>
      <p>
        <i>◎</i>Find the sweet spot
      </p>
      <p>
        <i>✦</i>Try different modes
      </p>
    </aside>
  );
}

export function DirectionArrow({
  horizontal,
  vertical,
  energy,
}: Omit<MovementProps, "stateLabel">) {
  const active = Math.max(Math.abs(horizontal), Math.abs(vertical), energy);
  const angle = (Math.atan2(-vertical, horizontal) * 180) / Math.PI + 90;
  const length = 64 + active * 112;
  return (
    <div
      className="direction-arrow"
      style={
        {
          "--arrow-angle": `${angle}deg`,
          "--arrow-length": `${length}px`,
          "--arrow-opacity": `${Math.min(1, 0.3 + active * 0.9)}`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="direction-beam" />
      <span className="direction-line" />
      <span className="direction-head">▲</span>
      <span className="direction-pulse" />
      <span className="direction-center" />
    </div>
  );
}
