import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  categories,
  defaultSelection,
  environmentValues,
  type EnvironmentCategory,
  type EnvironmentSelection,
} from "./environmentData";
import {
  applyWheelDeadZone,
  clampWheelPosition,
  nextCategory,
  releaseCategorySwitch,
  shouldSwitchCategory,
  snapWheelIndex,
} from "./environmentUtils";

type Input = { horizontal: number; vertical: number; isStill: boolean };

export function useEnvironmentWheel(
  containerRef: RefObject<HTMLElement | null>,
  input: Input,
  source: string,
  temperatureOnly = false,
) {
  const [activeCategory, setActiveCategory] =
    useState<EnvironmentCategory>("temperature");
  const [selection, setSelection] =
    useState<EnvironmentSelection>(defaultSelection);
  const [wheelPosition, setWheelPosition] = useState(
    defaultSelection.temperature,
  );
  const [autoDemo, setAutoDemo] = useState(true);
  const activeRef = useRef<EnvironmentCategory>("temperature");
  const selectionRef = useRef<EnvironmentSelection>({ ...defaultSelection });
  const position = useRef(defaultSelection.temperature);
  const velocity = useRef(0);
  const pointer = useRef({ horizontal: 0, vertical: 0 });
  const keys = useRef(new Set<string>());
  const autoRef = useRef(true);
  const armed = useRef(true);
  const lastCategoryAt = useRef(-Infinity);
  const lastUiAt = useRef(0);
  const inputRef = useRef(input);

  const setCategory = useCallback((category: EnvironmentCategory) => {
    activeRef.current = category;
    position.current = selectionRef.current[category];
    velocity.current = 0;
    setActiveCategory(category);
    setWheelPosition(position.current);
  }, []);
  const reset = useCallback(() => {
    selectionRef.current = { ...defaultSelection };
    position.current = defaultSelection.temperature;
    velocity.current = 0;
    activeRef.current = "temperature";
    setSelection({ ...defaultSelection });
    setActiveCategory("temperature");
    setWheelPosition(defaultSelection.temperature);
  }, []);
  const disableAuto = useCallback(() => {
    if (autoRef.current) setAutoDemo(false);
  }, []);

  useEffect(() => {
    autoRef.current = autoDemo;
  }, [autoDemo]);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onPointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointer.current = {
        horizontal: Math.max(
          -1,
          Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
        ),
        vertical: Math.max(
          -1,
          Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        ),
      };
      disableAuto();
    };
    const onPointerLeave = () => {
      pointer.current = { horizontal: 0, vertical: 0 };
    };
    const controlled = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "a",
      "A",
      "d",
      "D",
      "w",
      "W",
      "s",
      "S",
      "r",
      "R",
      " ",
    ]);
    const onKeyDown = (event: KeyboardEvent) => {
      if (!controlled.has(event.key)) return;
      event.preventDefault();
      if (event.key.toLowerCase() === "r") {
        reset();
        return;
      }
      if (event.key === " ") {
        setAutoDemo((value) => !value);
        return;
      }
      keys.current.add(event.key.toLowerCase());
      disableAuto();
    };
    const onKeyUp = (event: KeyboardEvent) =>
      keys.current.delete(event.key.toLowerCase());
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      removeEventListener("keydown", onKeyDown);
      removeEventListener("keyup", onKeyUp);
    };
  }, [containerRef, disableAuto, reset]);
  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const animate = (now: number) => {
      const delta = Math.min(0.04, (now - previous) / 1000);
      previous = now;
      const activeKeys = keys.current;
      const keyInput = {
        horizontal:
          (activeKeys.has("arrowright") || activeKeys.has("d") ? 1 : 0) -
          (activeKeys.has("arrowleft") || activeKeys.has("a") ? 1 : 0),
        vertical:
          (activeKeys.has("arrowdown") || activeKeys.has("s") ? 1 : 0) -
          (activeKeys.has("arrowup") || activeKeys.has("w") ? 1 : 0),
      };
      const keyboardActive =
        keyInput.horizontal !== 0 || keyInput.vertical !== 0;
      const demoCategory = temperatureOnly
        ? "temperature"
        : categories[Math.floor(now / 5200) % categories.length];
      const demoInput = {
        horizontal: 0,
        vertical: Math.sin(now / 1900) * 0.38,
        isStill: false,
      };
      const desired =
        source === "oura"
          ? inputRef.current
          : autoRef.current
            ? demoInput
            : keyboardActive
              ? { ...keyInput, isStill: false }
              : {
                  ...pointer.current,
                  isStill:
                    Math.abs(pointer.current.horizontal) < 0.05 &&
                    Math.abs(pointer.current.vertical) < 0.05,
                };
      if (
        !temperatureOnly &&
        autoRef.current &&
        demoCategory !== activeRef.current
      )
        setCategory(demoCategory);
      const horizontal = Number.isFinite(desired.horizontal)
        ? desired.horizontal
        : 0;
      if (!temperatureOnly) {
        if (
          shouldSwitchCategory(
            horizontal,
            armed.current,
            now,
            lastCategoryAt.current,
          )
        ) {
          armed.current = false;
          lastCategoryAt.current = now;
          setCategory(nextCategory(activeRef.current, horizontal > 0 ? 1 : -1));
        }
        if (releaseCategorySwitch(horizontal)) armed.current = true;
      }
      const vertical = applyWheelDeadZone(desired.vertical);
      const count = environmentValues[activeRef.current].length;
      const targetVelocity = vertical * 5.4;
      velocity.current +=
        (targetVelocity - velocity.current) * Math.min(1, 7 * delta);
      if (vertical === 0 || desired.isStill)
        velocity.current *= Math.pow(0.06, delta);
      position.current = clampWheelPosition(
        position.current + velocity.current * delta,
        count,
      );
      if (
        (vertical === 0 || desired.isStill) &&
        Math.abs(velocity.current) < 0.07
      )
        position.current +=
          (snapWheelIndex(position.current, count) - position.current) *
          Math.min(1, 10 * delta);
      const selected = snapWheelIndex(position.current, count);
      if (selectionRef.current[activeRef.current] !== selected) {
        selectionRef.current = {
          ...selectionRef.current,
          [activeRef.current]: selected,
        };
        setSelection(selectionRef.current);
      }
      if (now - lastUiAt.current > 70) {
        lastUiAt.current = now;
        setWheelPosition(position.current);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [setCategory, source, temperatureOnly]);
  return {
    activeCategory,
    selection,
    wheelPosition,
    wheelPositionRef: position,
    autoDemo,
    setCategory,
    reset,
    toggleAutoDemo: () => setAutoDemo((value) => !value),
    disableAuto,
  };
}
