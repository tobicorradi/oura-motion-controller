import { useMotion } from "../motion/MotionProvider";
import "./axisControls.css";

export function AxisControls() {
  const { diagnostics, reset, updateSettings } = useMotion();
  const { invertHorizontal, invertVertical } = diagnostics.settings;

  return (
    <section className="axis-controls" aria-label="Motion axis controls">
      <span>Motion axes</span>
      <div>
        <button
          aria-pressed={invertHorizontal}
          onClick={() =>
            updateSettings({ invertHorizontal: !invertHorizontal })
          }
        >
          ↔ Invert X
        </button>
        <button
          aria-pressed={invertVertical}
          onClick={() => updateSettings({ invertVertical: !invertVertical })}
        >
          ↕ Invert Y
        </button>
      </div>
      <button className="axis-reset" onClick={reset}>
        ⟳ Reset position
      </button>
    </section>
  );
}
