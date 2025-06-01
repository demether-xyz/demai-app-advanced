/**
 * Terrain Component Exports
 * 
 * Barrel export file for all terrain-related components used in the Orion layout.
 * Exports color constants, types, and component implementations.
 */

// Export color constants and configuration
export * from './TerrainConstants';

// Export component implementations
export { default as TerrainBackground } from './TerrainBackground';
export type { TerrainBackgroundProps } from './TerrainBackground';

export { default as PrimaryContours } from './PrimaryContours';
export type { PrimaryContoursProps } from './PrimaryContours';

export { default as SecondaryContours } from './SecondaryContours';
export type { SecondaryContoursProps } from './SecondaryContours';

// TODO: Export additional components as they are implemented
// export { default as TerrainEffects } from './TerrainEffects';

// Re-export default as TERRAIN_COLORS for convenience
export { default as TERRAIN_COLORS } from './TerrainConstants'; 