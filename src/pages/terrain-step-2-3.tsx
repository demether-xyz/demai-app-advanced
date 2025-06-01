/**
 * Terrain Step 2.3 Test Page - Secondary Contours Verification
 * 
 * Test page to verify SecondaryContours component implementation.
 * Used for QA Checkpoint 2.3 validation.
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { TerrainBackground, PrimaryContours, SecondaryContours } from '../components/orion/terrain';

/**
 * TerrainStep2_3Page - Test page for secondary contours
 */
const TerrainStep2_3Page: React.FC = () => {
  // Background controls
  const [includeGradient, setIncludeGradient] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);

  // Primary contours controls
  const [showPrimaryContours, setShowPrimaryContours] = useState(true);
  const [primaryOpacity, setPrimaryOpacity] = useState(0.8);

  // Secondary contours controls
  const [showSecondaryContours, setShowSecondaryContours] = useState(true);
  const [showLeftBrain, setShowLeftBrain] = useState(true);
  const [showRightBrain, setShowRightBrain] = useState(true);
  const [showMicroDetails, setShowMicroDetails] = useState(true);
  const [secondaryOpacity, setSecondaryOpacity] = useState(0.6);
  const [microOpacity, setMicroOpacity] = useState(0.4);

  return (
    <>
      <Head>
        <title>Terrain Step 2.3 Test - Secondary Contours</title>
        <meta name="description" content="Test page for Step 2.3 Secondary Contours verification" />
      </Head>

      <div style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Complete SVG with all layers */}
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
              showCentralRidge={true}
              showConcentricRings={true}
              primaryOpacity={primaryOpacity}
              ringOpacity={0.7}
            />
          )}

          {/* Secondary Contours Layer (Step 2.3) */}
          {showSecondaryContours && (
            <SecondaryContours
              showLeftBrain={showLeftBrain}
              showRightBrain={showRightBrain}
              showMicroDetails={showMicroDetails}
              secondaryOpacity={secondaryOpacity}
              microOpacity={microOpacity}
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
          minWidth: '380px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
            🧪 Step 2.3: Secondary Contours Test
          </h2>
          
          {/* Background Controls */}
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ fontWeight: 'bold', marginBottom: '8px', cursor: 'pointer' }}>
              Background & Primary Layers
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
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPrimaryContours}
                    onChange={(e) => setShowPrimaryContours(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Show Primary Contours
                </label>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Primary Opacity: {primaryOpacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={primaryOpacity}
                  onChange={(e) => setPrimaryOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={!showPrimaryContours}
                />
              </div>
            </div>
          </details>

          {/* Secondary Contours Controls */}
          <details open style={{ marginBottom: '16px' }}>
            <summary style={{ fontWeight: 'bold', marginBottom: '8px', cursor: 'pointer' }}>
              Secondary Contours Controls
            </summary>
            
            <div style={{ marginLeft: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showSecondaryContours}
                    onChange={(e) => setShowSecondaryContours(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Show Secondary Contours Layer
                </label>
              </div>

              <div style={{ marginBottom: '12px', paddingLeft: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showLeftBrain}
                      onChange={(e) => setShowLeftBrain(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!showSecondaryContours}
                    />
                    Left Brain Hemisphere
                  </label>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>
                    10 intermediate paths • #438ea6 • 1.5px + 0.8px strokes
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showRightBrain}
                      onChange={(e) => setShowRightBrain(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!showSecondaryContours}
                    />
                    Right Brain Extensions
                  </label>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>
                    8 extension paths • #787a8f • 1.5px + 0.8px strokes
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showMicroDetails}
                      onChange={(e) => setShowMicroDetails(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!showSecondaryContours}
                    />
                    Micro-terrain Details
                  </label>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>
                    12 flow connections • 0.8px stroke • Low opacity
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Secondary Opacity: {secondaryOpacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={secondaryOpacity}
                  onChange={(e) => setSecondaryOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={!showSecondaryContours}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Micro Detail Opacity: {microOpacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={microOpacity}
                  onChange={(e) => setMicroOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={!showSecondaryContours || !showMicroDetails}
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
            <strong>Step 2.3 QA Checklist:</strong><br />
            ✓ Left Brain Hemisphere (10 paths)<br />
            ✓ Right Brain Extensions (8 paths)<br />
            ✓ Micro-terrain details (12 flows)<br />
            ✓ Bright blue left contours (#438ea6)<br />
            ✓ Accent blue right contours (#787a8f)<br />
            ✓ Multi-stroke weight variation<br />
            ✓ Layer composition with primaries<br />
            ✓ Interactive granular controls<br />
            ✓ Performance within 5-10ms target<br />
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
          maxWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Feature Specifications</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Left Brain Hemisphere:</strong><br />
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
              • Location: (300-900, 400-800)<br />
              • 10 SVG path elements<br />
              • Primary: 5 main ridges (1.5px)<br />
              • Detail: 5 inner layers (0.8px)<br />
              • Stroke: #438ea6 bright blue<br />
              • Opacity: 0.6 base (configurable)
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Right Brain Extensions:</strong><br />
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
              • Location: (1500-2000, 200-600)<br />
              • 8 SVG path elements<br />
              • Primary: 5 main extensions (1.5px)<br />
              • Detail: 3 inner layers (0.8px)<br />
              • Stroke: #787a8f accent blue<br />
              • Opacity: 0.6 base (configurable)
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Micro-terrain Details:</strong><br />
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
              • 12 flow connection paths<br />
              • Bridge central & peripheral<br />
              • Texture details and layers<br />
              • Mixed colors (primary/bright/accent)<br />
              • Stroke: 0.8px detail lines<br />
              • Opacity: 0.4 base with variations
            </div>
          </div>

          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #eee'
          }}>
            <strong>Performance:</strong> 5-10ms target<br />
            <strong>Layer:</strong> z-index 3<br />
            <strong>Total Elements:</strong> 30 (18 main + 12 micro)
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
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Step 2.3 Colors</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#438ea6', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Left Brain: #438ea6
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#787a8f', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Right Brain: #787a8f
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#265074', 
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            Micro Details: #265074
          </div>

          <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
            Stroke Weights: 1.5px, 0.8px<br />
            Opacity Range: 0.6 → 0.2
          </div>
        </div>
      </div>
    </>
  );
};

export default TerrainStep2_3Page; 