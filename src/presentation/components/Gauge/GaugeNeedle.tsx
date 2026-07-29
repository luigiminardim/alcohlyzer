import { memo } from 'react';

interface GaugeNeedleProps {
  angle: number;
}

export const GaugeNeedle = memo(function GaugeNeedle({ angle }: GaugeNeedleProps) {
  return (
    <g
      style={{
        transformOrigin: '100px 100px',
        transform: `rotate(${angle - 90}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Needle Line */}
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="20"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Center Pivot */}
      <circle cx="100" cy="100" r="10" fill="#2c2e33" />
      <circle cx="100" cy="100" r="4" fill="#fff" />
    </g>
  );
});
