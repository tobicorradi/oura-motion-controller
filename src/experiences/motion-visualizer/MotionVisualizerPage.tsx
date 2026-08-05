import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { AppShell } from "../../components/AppShell";
import { useMotion } from "../../motion/MotionProvider";
import { directionLabel } from "./direction";
import { MotionField } from "./MotionField";
import { useMotionVisualization } from "./useMotionVisualization";
import "./visualizer.css";

const signed = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
export function MotionVisualizerPage() {
  const fieldRef = useRef<HTMLElement>(null);
  const calibrationTimers = useRef<number[]>([]);
  const {
    motion,
    autoDemo,
    toggleAutoDemo,
    reset: resetShared,
    calibrate,
    source,
  } = useMotion();
  const visualization = useMotionVisualization(
    fieldRef,
    motion,
    source,
    autoDemo,
    () => {
      if (autoDemo) toggleAutoDemo();
    },
    resetShared,
  );
  const [showTrail, setShowTrail] = useState(true);
  const [calibration, setCalibration] = useState<
    "idle" | "running" | "complete"
  >("idle");
  const status = visualization.metrics.returning
    ? "Returning to neutral"
    : directionLabel(visualization.metrics.direction);
  const calibrateView = () => {
    if (calibration !== "idle") return;
    setCalibration("running");
    calibrationTimers.current.push(
      window.setTimeout(() => {
        visualization.reset();
        calibrate();
        setCalibration("complete");
        calibrationTimers.current.push(
          window.setTimeout(() => setCalibration("idle"), 1400),
        );
      }, 2000),
    );
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        toggleAutoDemo();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [toggleAutoDemo]);
  useEffect(
    () => () =>
      calibrationTimers.current.forEach((timer) => clearTimeout(timer)),
    [],
  );
  return (
    <AppShell accent="amber">
      <main className="motion-visualizer-page">
        <header className="experience-header">
          <Link to="/" className="back">
            ← Home
          </Link>
          <ConnectionStatus />
        </header>
        <section className="motion-visualizer-heading">
          <div>
            <p className="eyebrow">Motion language / Demo input</p>
            <h1>Motion Input</h1>
            <p>How movement becomes interface control.</p>
          </div>
          <div className="visualizer-controls">
            <span className="demo-badge">
              {source === "oura" ? "Live Oura" : "Demo Mode"}
            </span>
            <button onClick={toggleAutoDemo} aria-pressed={autoDemo}>
              Auto Demo {autoDemo ? "On" : "Off"}
            </button>
            <button onClick={calibrateView}>Calibrate</button>
            <button onClick={visualization.reset}>
              Reset <kbd>R</kbd>
            </button>
            <button
              onClick={() => setShowTrail((value) => !value)}
              aria-pressed={showTrail}
            >
              Trail {showTrail ? "On" : "Off"}
            </button>
          </div>
        </section>
        <section className="visualizer-layout">
          <MotionField
            fieldRef={fieldRef}
            displayedInputRef={visualization.displayedInputRef}
            trailRef={visualization.trailRef}
            showTrail={showTrail}
            intensity={visualization.metrics.intensity}
            direction={status}
          />
          <aside className="motion-insight">
            <p className="eyebrow">Live interpretation</p>
            <h2>{status}</h2>
            <p className="insight-copy">
              The dot shows directional hand tilt, not the physical position of
              your hand in space.
            </p>
            <div className="metrics">
              <div>
                <span>Direction</span>
                <strong>
                  {visualization.metrics.direction === "neutral"
                    ? "Neutral"
                    : visualization.metrics.direction}
                </strong>
              </div>
              <div>
                <span>Horizontal</span>
                <strong>{signed(visualization.metrics.horizontal)}</strong>
              </div>
              <div>
                <span>Vertical</span>
                <strong>{signed(visualization.metrics.vertical)}</strong>
              </div>
              <div>
                <span>Intensity</span>
                <strong>
                  {Math.round(visualization.metrics.intensity * 100)}%
                </strong>
              </div>
              <div>
                <span>Input source</span>
                <strong>{source === "demo" ? "Demo" : source}</strong>
              </div>
              <div>
                <span>State</span>
                <strong>
                  {visualization.metrics.intensity === 0 ? "Resting" : "Active"}
                </strong>
              </div>
            </div>
          </aside>
        </section>
        <section className="motion-pipeline">
          <p className="eyebrow">The input pipeline</p>
          <div>
            <span>
              Mouse / Keyboard<small>Demo mode today</small>
            </span>
            <i>↓</i>
            <span>Simulated motion values</span>
            <i>↓</i>
            <span>
              Normalization<small>−1 to +1</small>
            </span>
            <i>↓</i>
            <span>Direction + intensity</span>
            <i>↓</i>
            <span>
              React interface<small>Live Oura supported</small>
            </span>
          </div>
        </section>
        <footer className="visualizer-footer">
          <p>
            Move in any direction to test the input · Return to center to reach
            neutral · Use WASD or arrow keys as fallback
          </p>
          <span>
            <kbd>Space</kbd> toggle Auto Demo
          </span>
        </footer>
        {calibration !== "idle" && (
          <div className="calibration-overlay" role="status">
            <div>
              {calibration === "running" ? (
                <>
                  <i />
                  <p>Hold your hand in a comfortable neutral position</p>
                  <small>Calibrating input…</small>
                </>
              ) : (
                <>
                  <b>✓</b>
                  <p>Neutral position calibrated</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
