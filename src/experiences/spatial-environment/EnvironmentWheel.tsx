import { useEffect, useRef, type MutableRefObject } from "react";
import {
  environmentValues,
  type EnvironmentCategory,
  type EnvironmentSelection,
} from "./environmentData";
import { clampWheelPosition } from "./environmentUtils";

type Props = {
  category: EnvironmentCategory;
  selection: EnvironmentSelection;
  position: number;
  positionRef: MutableRefObject<number>;
};

const ITEM_HEIGHT = 88;
const VISIBLE_ITEMS = 5;

const formatValue = (category: EnvironmentCategory, value: string | number) =>
  category === "temperature" ? `${value}°C` : value;

export function EnvironmentWheel({
  category,
  selection,
  position,
  positionRef,
}: Props) {
  const values = environmentValues[category] as readonly (string | number)[];
  const current = clampWheelPosition(position, values.length);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (trackRef.current)
        trackRef.current.style.transform = `translateY(${(Math.floor(VISIBLE_ITEMS / 2) - clampWheelPosition(positionRef.current, values.length)) * ITEM_HEIGHT}px)`;
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [positionRef, values.length]);
  return (
    <div
      className="environment-wheel"
      role="status"
      aria-label={`${category} wheel. Current value ${formatValue(category, values[selection[category]])}`}
    >
      <div className="wheel-curve" />
      <div className="wheel-selection-band" />
      <div
        className="wheel-viewport"
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      >
        <div ref={trackRef} className="wheel-track">
          {values.map((value, index) => {
            const distance = index - current;
            const abs = Math.abs(distance);
            return (
              <div
                key={String(value)}
                className={`wheel-item ${abs < 0.5 ? "selected" : ""}`}
                style={{
                  transform: `rotateX(${-distance * 13}deg) scale(${Math.max(0.62, 1 - abs * 0.13)}) translateZ(${Math.max(-42, 30 - abs * 22)}px)`,
                  opacity: Math.max(0.06, 1 - abs * 0.26),
                  filter: `blur(${Math.max(0, abs - 1.1) * 0.7}px)`,
                }}
              >
                {formatValue(category, value)}
              </div>
            );
          })}
        </div>
      </div>
      <span className="wheel-arrow up">⌃</span>
      <span className="wheel-arrow down">⌄</span>
    </div>
  );
}
