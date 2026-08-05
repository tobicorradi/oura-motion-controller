import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { GalleryCard } from "./galleryData";
import {
  applySpatialDeadZone,
  clampPosition,
  clampSpatial,
  getTargetVelocity,
  nearestCard,
  type SpatialInput,
} from "./spatialUtils";

const limit = 430;
export function useSpatialNavigation(
  viewportRef: RefObject<HTMLElement | null>,
  boardRef: RefObject<HTMLDivElement | null>,
  cards: GalleryCard[],
  liveInput?: SpatialInput,
) {
  const position = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const input = useRef<SpatialInput>({ horizontal: 0, vertical: 0 });
  const pointer = useRef<SpatialInput>({ horizontal: 0, vertical: 0 });
  const keys = useRef(new Set<string>());
  const autoRef = useRef(true);
  const neutralSince = useRef(performance.now());
  const lastUi = useRef(0);
  const [autoDemo, setAutoDemo] = useState(true);
  const [activeCard, setActiveCard] = useState(cards[4]);
  const [movement, setMovement] = useState("Neutral");
  const [inputDisplay, setInputDisplay] = useState<SpatialInput>({
    horizontal: 0,
    vertical: 0,
  });
  const reset = useCallback(() => {
    position.current = { x: 0, y: 0 };
    velocity.current = { x: 0, y: 0 };
    input.current = { horizontal: 0, vertical: 0 };
    pointer.current = { horizontal: 0, vertical: 0 };
    neutralSince.current = performance.now();
  }, []);
  const toggleAutoDemo = useCallback(() => setAutoDemo((value) => !value), []);
  useEffect(() => {
    autoRef.current = autoDemo;
  }, [autoDemo]);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const disableAuto = () => {
      if (autoRef.current) setAutoDemo(false);
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = viewport.getBoundingClientRect();
      pointer.current = {
        horizontal: clampSpatial(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        ),
        vertical: clampSpatial(
          ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
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
      if (event.key === "r" || event.key === "R") {
        reset();
        return;
      }
      if (event.key === " ") {
        setAutoDemo((value) => !value);
        return;
      }
      keys.current.add(event.key.toLowerCase());
      if (!["r", " "].includes(event.key.toLowerCase())) disableAuto();
    };
    const onKeyUp = (event: KeyboardEvent) =>
      keys.current.delete(event.key.toLowerCase());
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerleave", onPointerLeave);
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    return () => {
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerleave", onPointerLeave);
      removeEventListener("keydown", onKeyDown);
      removeEventListener("keyup", onKeyUp);
    };
  }, [viewportRef, reset]);
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
      const hasKeys = keyInput.horizontal !== 0 || keyInput.vertical !== 0;
      const demoInput = {
        horizontal:
          Math.sin(now / 4100) * 0.62 * (Math.sin(now / 7100) > -0.5 ? 1 : 0.2),
        vertical: Math.cos(now / 5200) * 0.44,
      };
      const desired =
        liveInput ??
        (autoRef.current ? demoInput : hasKeys ? keyInput : pointer.current);
      input.current.horizontal +=
        (desired.horizontal - input.current.horizontal) *
        Math.min(1, 7 * delta);
      input.current.vertical +=
        (desired.vertical - input.current.vertical) * Math.min(1, 7 * delta);
      const cleaned = {
        horizontal: applySpatialDeadZone(input.current.horizontal),
        vertical: applySpatialDeadZone(input.current.vertical),
      };
      const target = getTargetVelocity(cleaned);
      velocity.current.x +=
        (target.x - velocity.current.x) * Math.min(1, 7 * delta);
      velocity.current.y +=
        (target.y - velocity.current.y) * Math.min(1, 7 * delta);
      position.current = clampPosition(
        {
          x: position.current.x + velocity.current.x * delta,
          y: position.current.y + velocity.current.y * delta,
        },
        limit,
      );
      const neutral =
        !autoRef.current && cleaned.horizontal === 0 && cleaned.vertical === 0;
      if (neutral) {
        if (neutralSince.current === 0) neutralSince.current = now;
        if (
          now - neutralSince.current > 300 &&
          Math.hypot(velocity.current.x, velocity.current.y) < 22
        ) {
          const focus = nearestCard(cards, position.current);
          position.current.x +=
            (-focus.x - position.current.x) * Math.min(1, 5 * delta);
          position.current.y +=
            (-focus.y - position.current.y) * Math.min(1, 5 * delta);
        }
      } else neutralSince.current = 0;
      const focus = nearestCard(cards, position.current);
      boardRef.current?.style.setProperty(
        "transform",
        `translate3d(${position.current.x}px, ${position.current.y}px, 0)`,
      );
      boardRef.current
        ?.querySelectorAll<HTMLElement>("[data-card-id]")
        .forEach((element) => {
          const card = cards.find((item) => item.id === element.dataset.cardId);
          if (!card) return;
          const distance = Math.hypot(
            card.x + position.current.x,
            card.y + position.current.y,
          );
          const depth = Math.max(0, Math.min(1, distance / 690));
          element.style.setProperty("--depth", String(depth));
          element.dataset.active = String(card.id === focus.id);
        });
      if (now - lastUi.current > 120) {
        lastUi.current = now;
        setActiveCard((current) => (current.id === focus.id ? current : focus));
        setInputDisplay({ ...input.current });
        const isSnapping = neutral && now - neutralSince.current > 300;
        const label = isSnapping
          ? "Snapping"
          : cleaned.horizontal === 0 && cleaned.vertical === 0
            ? "Neutral"
            : cleaned.horizontal !== 0 && cleaned.vertical !== 0
              ? "Moving diagonally"
              : cleaned.horizontal < 0
                ? "Moving left"
                : cleaned.horizontal > 0
                  ? "Moving right"
                  : cleaned.vertical < 0
                    ? "Moving up"
                    : "Moving down";
        setMovement(label);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [boardRef, cards, liveInput]);
  return {
    activeCard,
    autoDemo,
    inputDisplay,
    movement,
    reset,
    toggleAutoDemo,
  };
}
