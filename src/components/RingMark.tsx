export function RingMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`ring-mark ${small ? "ring-small" : ""}`}
      aria-hidden="true"
    >
      <i />
      <b />
    </div>
  );
}
