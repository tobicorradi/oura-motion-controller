import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { AppShell } from "../../components/AppShell";
import { useMotion } from "../../motion/MotionProvider";
import {
  BURST_THRESHOLD,
  STABLE_DELAY_MS,
  qualityKeys,
  qualityLabels,
} from "./constants";
import { KineticFieldScene } from "./KineticFieldScene";
import {
  DirectionArrow,
  KineticTips,
  MovementPanel,
  ParticleMetricsPanel,
} from "./KineticPanels";
import type { FieldMode } from "./types";
import "./kinetic.css";

export function KineticFieldPage() {
  const { motion, source, status, useDemoMode } = useMotion();
  const mode: FieldMode = "repel";
  const formation = "sphere" as const;
  const [quality, setQuality] =
    useState<(typeof qualityKeys)[number]>("balanced");
  const [radius, setRadius] = useState(2.3);
  const [resetSignal, setResetSignal] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [stableField, setStableField] = useState(false);

  const disconnected =
    source === "oura" &&
    !["streaming", "waiting-for-data", "calibrating"].includes(status);
  const sceneMotion = disconnected
    ? { ...motion, horizontal: 0, vertical: 0, energy: 0, isStill: true }
    : motion;

  useEffect(() => {
    if (
      Math.abs(motion.horizontal) > 0.05 ||
      Math.abs(motion.vertical) > 0.05 ||
      motion.energy > 0.04
    )
      setInteracted(true);
  }, [motion.energy, motion.horizontal, motion.vertical]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )
        return;
      if (event.key === "r" || event.key === "R") {
        setResetSignal((value) => value + 1);
        setInteracted(true);
      }
      if (event.code === "Space") setInteracted(true);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!(motion.isStill || disconnected)) {
      setStableField(false);
      return;
    }
    const timer = window.setTimeout(
      () => setStableField(true),
      STABLE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [
    disconnected,
    motion.isStill,
    motion.energy,
    motion.horizontal,
    motion.vertical,
  ]);

  const stateLabel = useMemo(() => {
    if (disconnected) return "CALMING";
    if (stableField) return "STABLE FIELD";
    if (motion.energy > BURST_THRESHOLD || !motion.isStill)
      return "FIELD ACTIVE";
    return "SETTLING";
  }, [disconnected, motion.energy, motion.isStill, stableField]);

  const subtitle = "Move your hand. Control the field.";

  return (
    <AppShell>
      <main className="kinetic-page">
        <section className="kinetic-heading">
          <div>
            <h1>Kinetic Field</h1>
            <p>{subtitle}</p>
          </div>
          <div className="kinetic-header-actions">
            <div
              className={`kinetic-live-status ${source === "oura" ? "live" : ""}`}
            >
              <strong>
                <i />
                {source === "oura" ? "Live mode" : "Demo mode"}
              </strong>
              <span>
                {source === "oura" ? "Using Oura Ring" : "Mouse and keyboard"}
              </span>
            </div>
            <button
              className="kinetic-fullscreen"
              onClick={() => document.documentElement.requestFullscreen?.()}
              aria-label="Enter fullscreen"
            >
              ⛶
            </button>
            <details className="kinetic-connection">
              <summary>Connection</summary>
              <div>
                <Link to="/" className="back">
                  ← Home
                </Link>
                <ConnectionStatus />
              </div>
            </details>
          </div>
        </section>

        <section className="kinetic-stage">
          <label className="kinetic-radius-control">
            <span>
              Particle Radius <b>{radius.toFixed(2)}</b>
            </span>
            <input
              type="range"
              min="0.8"
              max="3.5"
              step="0.05"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
          </label>
          <div className="kinetic-grid">
            <div className="kinetic-main-column">
              <div className="kinetic-scene-shell">
                <KineticFieldScene
                  motion={sceneMotion}
                  mode={mode}
                  formation={formation}
                  radius={radius}
                  quality={quality}
                  disconnected={disconnected}
                  resetSignal={resetSignal}
                />
                <DirectionArrow
                  horizontal={motion.horizontal}
                  vertical={motion.vertical}
                  energy={motion.energy}
                />
                {disconnected && (
                  <div className="kinetic-warning" role="status">
                    <strong>Live connection needs attention</strong>
                    <p>
                      The field will stay rendered while motion settles back
                      into formation.
                    </p>
                    <button onClick={useDemoMode}>Return to Demo Mode</button>
                  </div>
                )}
              </div>
              <div className="kinetic-instructions">
                <div className="hand-icon">✋</div>
                <div>
                  <strong>Move your hand</strong>
                  <p>
                    Try moving in different directions
                    <br />
                    to see the particles react.
                  </p>
                </div>
                <ul>
                  <li>Up</li>
                  <li>Right</li>
                  <li>Down</li>
                  <li>Left</li>
                </ul>
              </div>
            </div>
            <aside className="kinetic-side-column">
              <MovementPanel
                horizontal={motion.horizontal}
                vertical={motion.vertical}
                energy={motion.energy}
                stateLabel={stateLabel}
              />
              <ParticleMetricsPanel quality={quality} energy={motion.energy} />
              <KineticTips />
            </aside>
          </div>
          <details className="kinetic-advanced">
            <summary>Field settings</summary>
            <div>
              <label>
                Quality{" "}
                {qualityKeys.map((key) => (
                  <button
                    key={key}
                    className={quality === key ? "active" : ""}
                    onClick={() => setQuality(key)}
                  >
                    {qualityLabels[key]}
                  </button>
                ))}
              </label>
              <button
                className="kinetic-reset"
                onClick={() => setResetSignal((value) => value + 1)}
              >
                Reset <kbd>R</kbd>
              </button>
            </div>
          </details>
        </section>

        <footer className="kinetic-footer">
          <p>
            Particles react to tilt, motion energy and stillness. This scene
            suggests force and flow, not literal hand position tracking.
          </p>
          <span>
            {interacted
              ? "Sphere field active · R reset"
              : "Mouse and keyboard remain available in Demo Mode."}
          </span>
        </footer>
      </main>
    </AppShell>
  );
}
