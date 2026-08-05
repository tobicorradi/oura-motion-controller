import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../components/AppShell";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { useMotion } from "../../motion/MotionProvider";
import { atmosphereStyle, createAtmosphere } from "./atmosphere";
import { categoryValue } from "./environmentData";
import { EnvironmentPreview } from "./EnvironmentPreview";
import { EnvironmentWheel } from "./EnvironmentWheel";
import { useEnvironmentWheel } from "./useEnvironmentWheel";
import "./environment.css";
import "./environmentShell.css";

export function SpatialEnvironmentPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const { motion, source, status, useDemoMode } = useMotion();
  const disconnected =
    source === "oura" &&
    !["streaming", "waiting-for-data", "calibrating"].includes(status);
  const input = disconnected
    ? { horizontal: 0, vertical: 0, isStill: true }
    : motion;
  const wheel = useEnvironmentWheel(viewportRef, input, source, true);
  const temperature = categoryValue("temperature", wheel.selection) as number;
  const atmosphere = useMemo(
    () => createAtmosphere(temperature, "Soft Neutral", "Gentle"),
    [temperature],
  );

  return (
    <AppShell accent="gallery">
      <main className="environment-page" style={atmosphereStyle(atmosphere)}>
        <section className="environment-heading">
          <div>
            <p className="eyebrow">Experience 05 / Temperature wheel</p>
            <h1>Spatial Environment</h1>
            <p>Shape warmth through motion.</p>
          </div>
          <div className="environment-actions">
            <button
              onClick={wheel.toggleAutoDemo}
              aria-pressed={wheel.autoDemo}
            >
              Auto Demo {wheel.autoDemo ? "On" : "Off"}
            </button>
            <button onClick={wheel.reset}>
              Reset <kbd>R</kbd>
            </button>
            <details>
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
        <div
          className="environment-single-category"
          aria-label="Active category"
        >
          <i>♨</i>Temperature
        </div>
        <section
          ref={viewportRef}
          className="environment-stage"
          aria-label="Motion controlled temperature wheel. Move vertically to adjust the temperature."
        >
          <div className="environment-ambient" />
          <EnvironmentWheel
            category="temperature"
            selection={wheel.selection}
            position={wheel.wheelPosition}
            positionRef={wheel.wheelPositionRef}
          />
          <EnvironmentPreview
            temperature={temperature}
            atmosphere={atmosphere}
          />
          {disconnected && (
            <div className="environment-warning">
              <strong>Live connection needs attention</strong>
              <button onClick={useDemoMode}>Return to Demo Mode</button>
            </div>
          )}
        </section>
        <section className="environment-instructions">
          <i>✦</i>
          <div>
            <strong>Control the temperature</strong>
            <p>
              Move up or down to adjust the temperature.
              <br />
              Hold still to let the wheel settle.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
