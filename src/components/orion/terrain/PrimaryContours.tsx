/**
 * Primary Topographic Contours Component
 * 
 * Renders the main elevation contours for the topographic terrain background:
 * - Major mountain ridge systems and watersheds
 * - Primary summit contour patterns at peak locations  
 * - Main elevation lines showing the highest terrain features
 * 
 * This represents the primary layer of the topographic map, showing
 * the most prominent elevation features: mountain ranges, ridge lines,
 * and summit contours that define the overall terrain structure.
 */

import React from 'react';
import { 
  COLOR_PALETTE, 
  STROKE_WEIGHTS, 
  OPACITY_LEVELS,
  SVG_SETTINGS 
} from './TerrainConstants';

/**
 * Props for the PrimaryContours component
 */
export interface PrimaryContoursProps {
  /** Custom className for styling */
  className?: string;
  /** Whether to show the Central Brain Ridge System */
  showCentralRidge?: boolean;
  /** Whether to show the Concentric Ring Patterns */
  showConcentricRings?: boolean;
  /** Custom opacity override for primary contours */
  primaryOpacity?: number;
  /** Custom opacity override for concentric rings */
  ringOpacity?: number;
}

/**
 * PrimaryContours - Major terrain features layer
 * 
 * Renders:
 * 1. Central Brain Ridge System (primary blue #265074, 8 paths)
 * 2. 3 Concentric Ring Patterns (bright blue #438ea6)
 * 
 * Performance: 2-5ms render time, medium impact
 */
export const PrimaryContours: React.FC<PrimaryContoursProps> = ({
  className = '',
  showCentralRidge = true,
  showConcentricRings = true,
  primaryOpacity = OPACITY_LEVELS.primary_contours,
  ringOpacity = 0.7
}) => {
  // Concentric ring data from Step 1.2 structural analysis
  const concentricRings = [
    { cx: 1200, cy: 450, rx: 100, ry: 85, id: 'ring-1' },
    { cx: 600, cy: 550, rx: 80, ry: 70, id: 'ring-2' },
    { cx: 1450, cy: 350, rx: 120, ry: 95, id: 'ring-3' }
  ];

  return (
    <g 
      className={`primary-contours ${className}`}
      aria-label="Primary terrain contours"
    >
      {/* Central Brain Ridge System */}
      {showCentralRidge && (
        <g className="central-brain-ridge" aria-label="Central brain ridge system">
          {/* Main Central Ridge - Path 1 */}
          <path
            d="M 1000 350 Q 1100 380 1200 400 Q 1300 420 1400 380 Q 1450 360 1480 340"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Main central ridge contour"
          />

          {/* Central Ridge Branch - Path 2 */}
          <path
            d="M 950 400 Q 1050 420 1150 450 Q 1250 480 1350 450 Q 1420 430 1450 400"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Central ridge branch contour"
          />

          {/* Upper Brain Fold - Path 3 */}
          <path
            d="M 920 320 Q 1020 340 1120 360 Q 1220 380 1320 360 Q 1400 340 1460 320"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Upper brain fold contour"
          />

          {/* Lower Brain Fold - Path 4 */}
          <path
            d="M 980 480 Q 1080 500 1180 520 Q 1280 540 1380 520 Q 1440 500 1480 480"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Lower brain fold contour"
          />

          {/* Left Brain Connection - Path 5 */}
          <path
            d="M 900 380 Q 940 420 980 460 Q 1020 500 1060 520"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Left brain connection"
          />

          {/* Right Brain Connection - Path 6 */}
          <path
            d="M 1450 380 Q 1420 420 1390 460 Q 1360 500 1330 520"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Right brain connection"
          />

          {/* Inner Detail - Path 7 */}
          <path
            d="M 1050 380 Q 1150 400 1250 420 Q 1350 440 1400 420"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Inner detail contour"
          />

          {/* Brain Core - Path 8 */}
          <path
            d="M 1100 420 Q 1200 440 1300 460 Q 1350 480 1380 500"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.major_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={primaryOpacity}
            aria-label="Brain core contour"
          />
        </g>
      )}

      {/* Concentric Ring Patterns */}
      {showConcentricRings && (
        <g className="concentric-rings" aria-label="Concentric ring patterns">
          {concentricRings.map((ring, index) => (
            <g key={ring.id} className={`ring-group ring-${index + 1}`}>
              {/* Outer ring */}
              <ellipse
                cx={ring.cx}
                cy={ring.cy}
                rx={ring.rx}
                ry={ring.ry}
                fill="none"
                stroke={COLOR_PALETTE.bright_blue}
                strokeWidth={STROKE_WEIGHTS.medium_contours}
                opacity={ringOpacity}
                aria-label={`Concentric ring ${index + 1} outer`}
              />
              
              {/* Middle ring */}
              <ellipse
                cx={ring.cx}
                cy={ring.cy}
                rx={ring.rx * 0.7}
                ry={ring.ry * 0.7}
                fill="none"
                stroke={COLOR_PALETTE.bright_blue}
                strokeWidth={STROKE_WEIGHTS.medium_contours}
                opacity={ringOpacity * 0.8}
                aria-label={`Concentric ring ${index + 1} middle`}
              />
              
              {/* Inner ring */}
              <ellipse
                cx={ring.cx}
                cy={ring.cy}
                rx={ring.rx * 0.4}
                ry={ring.ry * 0.4}
                fill="none"
                stroke={COLOR_PALETTE.bright_blue}
                strokeWidth={STROKE_WEIGHTS.medium_contours}
                opacity={ringOpacity * 0.6}
                aria-label={`Concentric ring ${index + 1} inner`}
              />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

/**
 * Default export for the PrimaryContours component
 */
export default PrimaryContours; 