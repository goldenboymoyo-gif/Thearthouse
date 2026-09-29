// The slanted section edges of the live site (Site123 "shape divider").
export default function Shape({ position = 'bottom', fill }) {
  return (
    <svg
      className={`shape ${position}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={fill ? { fill } : undefined}
      aria-hidden="true"
    >
      <g transform={position === 'top' ? 'translate(50, 50) rotate(-180) translate(-50, -50)' : undefined}>
        <polygon points="0,100 100,0 100,100" />
      </g>
    </svg>
  );
}
