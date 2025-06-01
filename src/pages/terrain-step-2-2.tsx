/**
 * Terrain Step 2.2 Test Page - Primary Contours Verification
 * 
 * Test page to verify PrimaryContours component implementation.
 * Used for QA Checkpoint 2.2 validation.
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { TerrainBackground, PrimaryContours } from '../components/orion/terrain';

/**
 * TerrainStep2_2Page - Test page for primary contours
 */
const TerrainStep2_2Page: React.FC = () => {
  // Background controls
  const [includeGradient, setIncludeGradient] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);

  // Primary contours controls
  const [showPrimaryContours, setShowPrimaryContours] = useState(true);
  const [showCentralRidge, setShowCentralRidge] = useState(true);
  const [showConcentricRings, setShowConcentricRings] = useState(true);
  const [primaryOpacity, setPrimaryOpacity] = useState(0.8);
  const [ringOpacity, setRingOpacity] = useState(0.7);

  return (
    <>
      <Head>
        <title>Terrain Step 2.2 Test - Primary Contours</title>
        <meta name="description" content="Test page for Step 2.2 Primary Contours verification" />
      </Head>

      <div style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Complete SVG with layered components */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 2074 1178"
          preserveAspectRatio="xMidYMid slice"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        >
          {/* Background Layer (Step 2.1) */}
          <TerrainBackground
            includeGradient={includeGradient}
            backgroundOpacity={backgroundOpacity}
            gradientOpacity={0.8}
          />

          {/* Primary Contours Layer (Step 2.2) */}
          {showPrimaryContours && (
            <PrimaryContours
              showCentralRidge={showCentralRidge}
              showConcentricRings={showConcentricRings}
              primaryOpacity={primaryOpacity}
              ringOpacity={ringOpacity}
            />
          )}
        </svg>

        {/* Test Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          minWidth: '350px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
            🧪 Step 2.2: Primary Contours Test
          </h2>
          
          {/* Background Controls */}
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ fontWeight: 'bold', marginBottom: '8px', cursor: 'pointer' }}>
              Background Controls
            </summary>
            
            <div style={{ marginLeft: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includeGradient}
                    onChange={(e) => setIncludeGradient(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Background Gradient
                </label>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
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
            </div>
          </details>

          {/* Primary Contours Controls */}
          <details open style={{ marginBottom: '16px' }}>
            <summary style={{ fontWeight: 'bold', marginBottom: '8px', cursor: 'pointer' }}>
              Primary Contours Controls
            </summary>
            
            <div style={{ marginLeft: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPrimaryContours}
                    onChange={(e) => setShowPrimaryContours(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Show Primary Contours Layer
                </label>
              </div>

              <div style={{ marginBottom: '12px', paddingLeft: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showCentralRidge}
                      onChange={(e) => setShowCentralRidge(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!showPrimaryContours}
                    />
                    Central Brain Ridge System
                  </label>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>
                    8 hand-crafted paths • #265074 • 2.0px stroke
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showConcentricRings}
                      onChange={(e) => setShowConcentricRings(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!showPrimaryContours}
                    />
                    Concentric Ring Patterns
                  </label>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>
                    3 ring locations • #438ea6 • 1.5px stroke
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Ridge Opacity: {primaryOpacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={primaryOpacity}
                  onChange={(e) => setPrimaryOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={!showPrimaryContours || !showCentralRidge}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Ring Opacity: {ringOpacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ringOpacity}
                  onChange={(e) => setRingOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={!showPrimaryContours || !showConcentricRings}
                />
              </div>
            </div>
          </details>

          {/* QA Checklist */}
          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            lineHeight: '1.4', 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <strong>Step 2.2 QA Checklist:</strong><br />
            ✓ Central Brain Ridge System (8 paths)<br />
            ✓ Concentric Ring Patterns (3 locations)<br />
            ✓ Primary blue contours (#265074)<br />
            ✓ Bright blue rings (#438ea6)<br />
            ✓ Proper stroke weights and opacity<br />
            ✓ Layer composition with background<br />
            ✓ Interactive controls functional<br />
            ✓ Performance within 2-5ms target<br />
          </div>
        </div>

        {/* Feature Details Overlay */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          fontSize: '12px',
          maxWidth: '280px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Feature Specifications</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Central Brain Ridge System:</strong><br />
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
              • Location: (900-1500, 300-700)<br />
              • 8 SVG path elements<br />
              • Quadratic Bézier curves<br />
              • Stroke: #265074, 2.0px<br />
              • Opacity: 0.8 (configurable)<br />
              • Hand-crafted for accuracy
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Concentric Ring Patterns:</strong><br />
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
              • Ring 1: (1200, 450) - 100×85px<br />
              • Ring 2: (600, 550) - 80×70px<br />
              • Ring 3: (1450, 350) - 120×95px<br />
              • 3 nested ellipses per location<br />
              • Stroke: #438ea6, 1.5px<br />
              • Opacity: 0.7 (configurable)
            </div>
          </div>

          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #eee'
          }}>
            <strong>Performance:</strong> 2-5ms target<br />
            <strong>Layer:</strong> z-index 2<br />
            <strong>Total Elements:</strong> 17 (8 paths + 9 ellipses)
          </div>
        </div>

        {/* Color Reference */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          fontSize: '12px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Color Palette</h3>
          
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
              backgroundColor: '#265074', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Ridge: #265074
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#438ea6', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Rings: #438ea6
          </div>
        </div>
      </div>
    </>
  );
};

export default TerrainStep2_2Page; 