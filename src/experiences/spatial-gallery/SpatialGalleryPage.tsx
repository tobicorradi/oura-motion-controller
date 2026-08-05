import { useRef } from "react";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { AppShell } from "../../components/AppShell";
import { galleryCards } from "./galleryData";
import { useSpatialNavigation } from "./useSpatialNavigation";
import { useMotion } from "../../motion/MotionProvider";
import "./spatial.css";

export function SpatialGalleryPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { source, motion } = useMotion();
  const navigation = useSpatialNavigation(
    viewportRef,
    boardRef,
    galleryCards,
    source === "oura"
      ? { horizontal: motion.horizontal, vertical: motion.vertical }
      : undefined,
  );
  const { activeCard, inputDisplay, movement } = navigation;
  return (
    <AppShell accent="gallery">
      <main className="spatial-page">
        <header className="experience-header">
          <Link to="/" className="back">
            ← Home
          </Link>
          <ConnectionStatus />
        </header>
        <section className="spatial-heading">
          <div>
            <p className="eyebrow">Experience 05 / Directional interface</p>
            <h1>Spatial Gallery</h1>
            <p>Explore an interface through movement.</p>
          </div>
          <div className="spatial-actions">
            <button
              onClick={navigation.toggleAutoDemo}
              aria-pressed={navigation.autoDemo}
            >
              Auto Demo {navigation.autoDemo ? "On" : "Off"}
            </button>
            <button onClick={navigation.reset}>
              Reset <kbd>R</kbd>
            </button>
          </div>
        </section>
        <section
          ref={viewportRef}
          className="spatial-viewport"
          aria-label="A directional gallery of nine interactive concept cards. Move the pointer, use arrow keys, or use WASD to explore."
        >
          <div ref={boardRef} className="spatial-board">
            {galleryCards.map((card) => (
              <article
                key={card.id}
                data-card-id={card.id}
                data-active="false"
                className={`spatial-card visual-${card.visual}`}
                style={{
                  left: `calc(50% + ${card.x}px)`,
                  top: `calc(50% + ${card.y}px)`,
                }}
              >
                <div className="card-visual" aria-hidden="true">
                  <i />
                  <b />
                  <em />
                </div>
                <div className="spatial-card-meta">
                  <span>{card.index}</span>
                  <span>{card.category}</span>
                </div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                <footer>
                  {card.meta}
                  <strong>Focused</strong>
                </footer>
              </article>
            ))}
          </div>
          <div className="spatial-center" aria-hidden="true" />
          <p className="spatial-sr">
            Focused gallery item: {activeCard.title}. {activeCard.description}
          </p>
        </section>
        <section className="spatial-hud">
          <div className="focus-readout">
            <span>In focus</span>
            <strong>{activeCard.title}</strong>
            <p>
              {activeCard.category} · {activeCard.index} / 09
            </p>
          </div>
          <div
            className="movement-indicator"
            aria-label={`Directional input: ${movement}`}
          >
            <span className="direction up">Up</span>
            <span className="direction left">Left</span>
            <span className="direction right">Right</span>
            <span className="direction down">Down</span>
            <i
              style={{
                transform: `translate(${inputDisplay.horizontal * 24}px, ${inputDisplay.vertical * 24}px)`,
              }}
            />
            <b>{movement}</b>
          </div>
        </section>
        <footer className="spatial-footer">
          <p>
            Move in any direction to explore · Return to the center to focus ·
            Use WASD or arrow keys as fallback
          </p>
          <span>
            <kbd>Space</kbd> toggle Auto Demo
          </span>
        </footer>
        <ul className="spatial-sr">
          {galleryCards.map((card) => (
            <li key={card.id}>
              {card.title}: {card.description}
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}
