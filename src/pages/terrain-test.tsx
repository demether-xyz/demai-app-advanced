/**
 * Terrain Test Page - Step 2.1 Verification
 * 
 * Test page to verify TerrainBackground component implementation.
 * Used for QA Checkpoint 2.1 validation.
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { TerrainBackground } from '../components/orion/terrain';

/**
 * TerrainTestPage - Test page for terrain background component
 */
const TerrainTestPage: React.FC = () => {
  const [includeGradient, setIncludeGradient] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);
  const [gradientOpacity, setGradientOpacity] = useState(0.8);

  return (
    <>
      <Head>
        <title>Terrain Background Test - Step 2.1</title>
        <meta name="description" content="Test page for TerrainBackground component verification" />
      </Head>

      <div style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* TerrainBackground Component */}
        <TerrainBackground
          width="100%"
          height="100%"
          includeGradient={includeGradient}
          backgroundOpacity={backgroundOpacity}
          gradientOpacity={gradientOpacity}
        />

        {/* Test Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          minWidth: '300px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
            🧪 Step 2.1: Background Foundation Test
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeGradient}
                onChange={(e) => setIncludeGradient(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Include Gradient Overlay
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
              Background Opacity: {backgroundOpacity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
              Gradient Opacity: {gradientOpacity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={gradientOpacity}
              onChange={(e) => setGradientOpacity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
            <strong>QA Checklist:</strong><br />
            ✓ Base SVG canvas with proper viewBox<br />
            ✓ Dark background color (#05050f)<br />
            ✓ Radial gradient overlay (#09142a → #05050f)<br />
            ✓ Responsive scaling<br />
            ✓ Performance optimization<br />
          </div>
        </div>

        {/* Color Reference Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          fontSize: '12px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Color Reference</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#05050f', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Background: #05050f
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#09142a', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Gradient Start: #09142a
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
            ViewBox: 2074 × 1178<br />
            Aspect Ratio: 1.76
          </div>
        </div>
      </div>
    </>
  );
};

export default TerrainTestPage; 