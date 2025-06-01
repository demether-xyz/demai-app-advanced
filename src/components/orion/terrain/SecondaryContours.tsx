/**
 * Secondary Topographic Contours Component
 * 
 * Renders intermediate elevation details for the topographic terrain background:
 * - Lower mountain ranges and foothills
 * - Intermediate elevation contour lines
 * - Valley flow patterns and drainage connections
 * - Micro-terrain details bridging ridges and valleys
 * 
 * This represents the secondary layer of the topographic map, adding
 * depth and complexity to complement the primary mountain features.
 * Shows intermediate elevations, foothill regions, and valley systems
 * that create a complete topographic visualization.
 */

import React from 'react';
import { 
  COLOR_PALETTE, 
  STROKE_WEIGHTS, 
  OPACITY_LEVELS,
  SVG_SETTINGS 
} from './TerrainConstants';

/**
 * Props for the SecondaryContours component
 */
export interface SecondaryContoursProps {
  /** Custom className for styling */
  className?: string;
  /** Whether to show the Left Brain Hemisphere */
  showLeftBrain?: boolean;
  /** Whether to show the Right Brain Extensions */
  showRightBrain?: boolean;
  /** Whether to show micro-terrain details */
  showMicroDetails?: boolean;
  /** Custom opacity override for secondary contours */
  secondaryOpacity?: number;
  /** Custom opacity override for micro details */
  microOpacity?: number;
}

/**
 * SecondaryContours - Intermediate detail layer
 * 
 * Renders:
 * 1. Left Brain Hemisphere (medium blue #438ea6, 10 paths)
 * 2. Right Brain Extensions (subtle blue #787a8f, 8 paths)
 * 3. Micro-terrain details and flowing connections
 * 
 * Performance: 5-10ms render time, higher impact
 */
export const SecondaryContours: React.FC<SecondaryContoursProps> = ({
  className = '',
  showLeftBrain = true,
  showRightBrain = true,
  showMicroDetails = true,
  secondaryOpacity = OPACITY_LEVELS.secondary_contours,
  microOpacity = 0.4
}) => {
  return (
    <g 
      className={`secondary-contours ${className}`}
      aria-label="Secondary terrain contours"
    >
      {/* Left Brain Hemisphere */}
      {showLeftBrain && (
        <g className="left-brain-hemisphere" aria-label="Left brain hemisphere contours">
          {/* Primary Left Ridge */}
          <path
            d="M 350 450 Q 450 480 550 500 Q 650 520 750 500 Q 800 480 850 450"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Primary left ridge"
          />

          {/* Left Brain Upper Fold */}
          <path
            d="M 320 400 Q 420 420 520 440 Q 620 460 720 440 Q 780 420 820 400"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Left brain upper fold"
          />

          {/* Left Brain Lower Fold */}
          <path
            d="M 380 520 Q 480 540 580 560 Q 680 580 780 560 Q 830 540 870 520"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Left brain lower fold"
          />

          {/* Left Temporal Lobe */}
          <path
            d="M 300 550 Q 400 580 500 600 Q 600 620 700 600 Q 750 580 800 550"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Left temporal lobe"
          />

          {/* Left Frontal Connection */}
          <path
            d="M 400 350 Q 500 380 600 400 Q 700 420 800 400"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Left frontal connection"
          />

          {/* Left Inner Detail 1 */}
          <path
            d="M 450 470 Q 550 490 650 480 Q 720 470 770 460"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.8}
            aria-label="Left inner detail 1"
          />

          {/* Left Inner Detail 2 */}
          <path
            d="M 480 420 Q 580 440 680 430 Q 730 420 780 410"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.8}
            aria-label="Left inner detail 2"
          />

          {/* Left Cortical Layer 1 */}
          <path
            d="M 360 480 Q 460 500 560 520 Q 660 540 740 520"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.6}
            aria-label="Left cortical layer 1"
          />

          {/* Left Cortical Layer 2 */}
          <path
            d="M 420 380 Q 520 400 620 420 Q 720 440 780 430"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.6}
            aria-label="Left cortical layer 2"
          />

          {/* Left Boundary Flow */}
          <path
            d="M 350 500 Q 450 530 550 540 Q 650 550 750 540 Q 800 530 850 500"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.5}
            aria-label="Left boundary flow"
          />
        </g>
      )}

      {/* Right Brain Extensions */}
      {showRightBrain && (
        <g className="right-brain-extensions" aria-label="Right brain extension contours">
          {/* Primary Right Ridge */}
          <path
            d="M 1550 300 Q 1650 320 1750 340 Q 1850 360 1950 340 Q 1980 320 2000 300"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Primary right ridge"
          />

          {/* Right Brain Upper Extension */}
          <path
            d="M 1520 250 Q 1620 270 1720 290 Q 1820 310 1920 290 Q 1960 270 1990 250"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Right brain upper extension"
          />

          {/* Right Brain Lower Extension */}
          <path
            d="M 1580 380 Q 1680 400 1780 420 Q 1880 440 1980 420 Q 2010 400 2040 380"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Right brain lower extension"
          />

          {/* Right Parietal Lobe */}
          <path
            d="M 1600 450 Q 1700 470 1800 480 Q 1900 490 2000 480 Q 2030 470 2060 450"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Right parietal lobe"
          />

          {/* Right Occipital Connection */}
          <path
            d="M 1650 520 Q 1750 540 1850 550 Q 1950 560 2000 550"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.medium_contours}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity}
            aria-label="Right occipital connection"
          />

          {/* Right Inner Detail 1 */}
          <path
            d="M 1580 330 Q 1680 350 1780 360 Q 1880 370 1950 360"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.8}
            aria-label="Right inner detail 1"
          />

          {/* Right Inner Detail 2 */}
          <path
            d="M 1620 280 Q 1720 300 1820 310 Q 1920 320 1980 310"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.8}
            aria-label="Right inner detail 2"
          />

          {/* Right Boundary Flow */}
          <path
            d="M 1570 410 Q 1670 430 1770 440 Q 1870 450 1970 440 Q 2020 430 2050 410"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={secondaryOpacity * 0.6}
            aria-label="Right boundary flow"
          />
        </g>
      )}

      {/* Micro-terrain Details and Flow Connections */}
      {showMicroDetails && (
        <g className="micro-terrain-details" aria-label="Micro-terrain details">
          {/* Central-Left Bridge */}
          <path
            d="M 850 450 Q 875 460 900 470 Q 925 480 950 470"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity}
            aria-label="Central-left bridge"
          />

          {/* Central-Right Bridge */}
          <path
            d="M 1480 380 Q 1505 390 1530 400 Q 1555 410 1580 400"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity}
            aria-label="Central-right bridge"
          />

          {/* Upper Flow Connection */}
          <path
            d="M 820 320 Q 860 325 900 330 Q 940 335 980 330"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity}
            aria-label="Upper flow connection"
          />

          {/* Lower Flow Connection */}
          <path
            d="M 870 520 Q 910 525 950 530 Q 990 535 1030 530"
            fill="none"
            stroke={COLOR_PALETTE.primary_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity}
            aria-label="Lower flow connection"
          />

          {/* Right Extension Flow */}
          <path
            d="M 1450 350 Q 1475 355 1500 360 Q 1525 365 1550 360"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity}
            aria-label="Right extension flow"
          />

          {/* Peripheral Detail Left */}
          <path
            d="M 300 420 Q 340 430 380 440 Q 420 450 460 440"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.8}
            aria-label="Peripheral detail left"
          />

          {/* Peripheral Detail Right */}
          <path
            d="M 1900 280 Q 1940 290 1980 300 Q 2020 310 2060 300"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.8}
            aria-label="Peripheral detail right"
          />

          {/* Texture Detail 1 */}
          <path
            d="M 600 460 Q 620 465 640 470 Q 660 475 680 470"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.6}
            aria-label="Texture detail 1"
          />

          {/* Texture Detail 2 */}
          <path
            d="M 1700 320 Q 1720 325 1740 330 Q 1760 335 1780 330"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.6}
            aria-label="Texture detail 2"
          />

          {/* Cortical Texture Left */}
          <path
            d="M 500 510 Q 520 515 540 520 Q 560 525 580 520"
            fill="none"
            stroke={COLOR_PALETTE.bright_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.5}
            aria-label="Cortical texture left"
          />

          {/* Cortical Texture Right */}
          <path
            d="M 1800 420 Q 1820 425 1840 430 Q 1860 435 1880 430"
            fill="none"
            stroke={COLOR_PALETTE.accent_blue}
            strokeWidth={STROKE_WEIGHTS.detail_lines}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={microOpacity * 0.5}
            aria-label="Cortical texture right"
          />
        </g>
      )}
    </g>
  );
};

/**
 * Default export for the SecondaryContours component
 */
export default SecondaryContours; 