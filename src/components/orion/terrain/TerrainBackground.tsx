/**
 * Topographic Terrain Background Component
 * 
 * Provides the base canvas and dark terrain foundation for the topographic
 * elevation map visualization. This is Layer 1 (z-index: 1) in the 
 * component hierarchy.
 * 
 * Features:
 * - Dark terrain base color matching topographic reference
 * - Radial gradient overlay for atmospheric depth
 * - Responsive SVG canvas with proper aspect ratio
 * - Foundation for overlaying elevation contours and mountain features
 * 
 * This component establishes the visual foundation that represents
 * the base terrain surface before elevation contours are applied.
 */

import React from 'react';
import { 
  BACKGROUND_COLOR, 
  GRADIENTS, 
  SVG_SETTINGS,
  COLOR_PALETTE 
} from './TerrainConstants';

/**
 * Props for the TerrainBackground component
 */
export interface TerrainBackgroundProps {
  /** Custom width override (defaults to 100%) */
  width?: string | number;
  /** Custom height override (defaults to 100%) */
  height?: string | number;
  /** Custom className for styling */
  className?: string;
  /** Whether to include the gradient overlay */
  includeGradient?: boolean;
  /** Custom background opacity (defaults to 1.0) */
  backgroundOpacity?: number;
  /** Custom gradient opacity (defaults to 0.8) */
  gradientOpacity?: number;
}

/**
 * TerrainBackground - Foundation layer for terrain visualization
 * 
 * Renders:
 * 1. Base SVG canvas with proper dimensions and viewBox
 * 2. Dark background fill (#05050f) 
 * 3. Optional radial gradient overlay (#09142a → #05050f)
 * 
 * Performance: <1ms render time, minimal impact
 */
export const TerrainBackground: React.FC<TerrainBackgroundProps> = ({
  width = '100%',
  height = '100%',
  className = '',
  includeGradient = true,
  backgroundOpacity = 1.0,
  gradientOpacity = 0.8
}) => {
  // Generate unique gradient ID to avoid conflicts
  const gradientId = React.useMemo(() => 
    `terrain-bg-gradient-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${SVG_SETTINGS.viewBox.width} ${SVG_SETTINGS.viewBox.height}`}
      preserveAspectRatio="xMidYMid slice"
      className={`terrain-background ${className}`}
      style={{ 
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }}
      aria-label="Terrain background visualization"
    >
      {/* Gradient Definitions */}
      {includeGradient && (
        <defs>
          <radialGradient
            id={gradientId}
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="objectBoundingBox"
          >
            <stop 
              offset="0%" 
              stopColor={GRADIENTS.background.start}
              stopOpacity={gradientOpacity}
            />
            <stop 
              offset="100%" 
              stopColor={GRADIENTS.background.end}
              stopOpacity={gradientOpacity}
            />
          </radialGradient>
        </defs>
      )}

      {/* Base Background Fill */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={BACKGROUND_COLOR}
        opacity={backgroundOpacity}
        aria-label="Base terrain background"
      />

      {/* Gradient Overlay */}
      {includeGradient && (
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
          opacity={gradientOpacity}
          aria-label="Background gradient overlay"
        />
      )}
    </svg>
  );
};

/**
 * Default export for the TerrainBackground component
 */
export default TerrainBackground; 