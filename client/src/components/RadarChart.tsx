import { LANGUAGE_INFO, LoveLanguage } from "@/lib/quizData";
import { motion } from "framer-motion";

interface RadarChartProps {
  scores: Record<LoveLanguage, number>;
}

const LANGUAGES: LoveLanguage[] = ['A', 'B', 'C', 'D', 'E'];
const CENTER = 150;
const RADIUS = 110;
const LABEL_RADIUS = 135;

function polarToCartesian(angle: number, radius: number): [number, number] {
  // Start from top (-90 degrees)
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function getPolygonPoints(values: number[], maxValue: number): string {
  return LANGUAGES.map((_, i) => {
    const angle = (360 / LANGUAGES.length) * i;
    const value = values[i] / maxValue;
    const [x, y] = polarToCartesian(angle, RADIUS * value);
    return `${x},${y}`;
  }).join(' ');
}

export default function RadarChart({ scores }: RadarChartProps) {
  const values = LANGUAGES.map(l => scores[l]);
  const maxValue = Math.max(...values, 12); // At least 12 for scale
  const dataPoints = getPolygonPoints(values, maxValue);

  // Grid levels
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-auto">
        {/* Grid lines */}
        {gridLevels.map((level) => {
          const points = LANGUAGES.map((_, i) => {
            const angle = (360 / LANGUAGES.length) * i;
            const [x, y] = polarToCartesian(angle, RADIUS * level);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#3D3535"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {LANGUAGES.map((_, i) => {
          const angle = (360 / LANGUAGES.length) * i;
          const [x, y] = polarToCartesian(angle, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="#3D3535"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={dataPoints}
          fill="#E8736F"
          fillOpacity={0.15}
          stroke="#E8736F"
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />

        {/* Data points */}
        {LANGUAGES.map((lang, i) => {
          const angle = (360 / LANGUAGES.length) * i;
          const value = values[i] / maxValue;
          const [x, y] = polarToCartesian(angle, RADIUS * value);
          const info = LANGUAGE_INFO[lang];
          return (
            <motion.circle
              key={lang}
              cx={x}
              cy={y}
              r={5}
              fill={info.color}
              stroke="white"
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {LANGUAGES.map((lang, i) => {
          const angle = (360 / LANGUAGES.length) * i;
          const [x, y] = polarToCartesian(angle, LABEL_RADIUS);
          const info = LANGUAGE_INFO[lang];
          return (
            <g key={`label-${lang}`}>
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                className="text-[11px] font-medium"
                fill="#3D3535"
                fillOpacity={0.8}
              >
                {info.icon}
              </text>
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                className="text-[9px]"
                fill="#3D3535"
                fillOpacity={0.5}
              >
                {scores[lang]}점
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
