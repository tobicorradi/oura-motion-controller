import { motion as motionUi } from "framer-motion";
import { formationLabels, modeLabels } from "./constants";
import type { FieldFormation, FieldMode } from "./types";

type Props = {
  mode: FieldMode;
  formation: FieldFormation;
  energy: number;
  stateLabel: string;
  sourceLabel: string;
  horizontal: number;
  vertical: number;
};

export function KineticHud({
  mode,
  formation,
  energy,
  stateLabel,
  sourceLabel,
  horizontal,
  vertical,
}: Props) {
  return (
    <motionUi.aside
      className="kinetic-hud"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <div className="hud-grid">
        <div>
          <span>Mode</span>
          <strong>{modeLabels[mode].toUpperCase()}</strong>
        </div>
        <div>
          <span>Formation</span>
          <strong>{formationLabels[formation].toUpperCase()}</strong>
        </div>
        <div>
          <span>Energy</span>
          <strong>{Math.round(energy * 100)}%</strong>
        </div>
        <div>
          <span>State</span>
          <strong>{stateLabel}</strong>
        </div>
        <div>
          <span>Source</span>
          <strong>{sourceLabel}</strong>
        </div>
      </div>
      <div
        className="hud-indicator"
        aria-label="Directional movement indicator"
      >
        <span className="up">Up</span>
        <span className="left">Left</span>
        <span className="right">Right</span>
        <span className="down">Down</span>
        <i
          style={{
            transform: `translate(${horizontal * 18}px, ${vertical * 18}px)`,
          }}
        />
      </div>
    </motionUi.aside>
  );
}
