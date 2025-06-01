import React from 'react';

interface TopographicTerrainProps {
  width?: number;
  height?: number;
}

const TopographicTerrain: React.FC<TopographicTerrainProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  // Generate contour lines using mathematical functions
  const generateContourLines = () => {
    const lines: string[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Much more elevation levels for higher density
    const elevations = [
      { level: 1, amplitude: 280, frequency: 0.003, offset: 0 },
      { level: 2, amplitude: 250, frequency: 0.004, offset: Math.PI / 8 },
      { level: 3, amplitude: 220, frequency: 0.005, offset: Math.PI / 4 },
      { level: 4, amplitude: 190, frequency: 0.006, offset: Math.PI / 3 },
      { level: 5, amplitude: 160, frequency: 0.007, offset: Math.PI / 2 },
      { level: 6, amplitude: 130, frequency: 0.008, offset: Math.PI / 6 },
      { level: 7, amplitude: 110, frequency: 0.009, offset: Math.PI / 5 },
      { level: 8, amplitude: 90, frequency: 0.010, offset: Math.PI / 7 },
      { level: 9, amplitude: 70, frequency: 0.011, offset: Math.PI / 9 },
      { level: 10, amplitude: 50, frequency: 0.012, offset: Math.PI / 11 },
      { level: 11, amplitude: 35, frequency: 0.013, offset: Math.PI / 13 },
      { level: 12, amplitude: 20, frequency: 0.014, offset: Math.PI / 15 },
    ];
    
    elevations.forEach((elevation, index) => {
      // Create flowing contour lines
      const points: string[] = [];
      const numPoints = 300; // More points for smoother curves
      
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        
        // Base radius with noise
        const baseRadius = elevation.amplitude + (index * 15);
        
        // Add multiple sine waves for organic shape with more complexity
        const noise1 = Math.sin(angle * 3 + elevation.offset) * 25;
        const noise2 = Math.sin(angle * 5 + elevation.offset * 2) * 18;
        const noise3 = Math.sin(angle * 7 + elevation.offset * 3) * 12;
        const noise4 = Math.sin(angle * 11 + elevation.offset * 4) * 8;
        const noise5 = Math.sin(angle * 13 + elevation.offset * 5) * 5;
        
        const radius = baseRadius + noise1 + noise2 + noise3 + noise4 + noise5;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.8; // Slightly flatten
        
        if (i === 0) {
          points.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
        } else {
          points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
        }
      }
      
      points.push('Z'); // Close the path
      lines.push(points.join(' '));
    });
    
    // Add many more flowing internal lines for density
    for (let i = 0; i < 25; i++) {
      const points: string[] = [];
      const startAngle = (i / 25) * Math.PI * 2;
      const length = 200 + Math.random() * 300;
      const startRadius = 30 + Math.random() * 100;
      
      for (let j = 0; j <= 80; j++) {
        const t = j / 80;
        const angle = startAngle + Math.sin(t * Math.PI * 3) * 0.8;
        const distance = startRadius + t * length;
        
        // Add noise to make lines more organic
        const lineNoise = Math.sin(t * Math.PI * 6) * 15;
        const finalDistance = distance + lineNoise;
        
        const x = centerX + Math.cos(angle) * finalDistance;
        const y = centerY + Math.sin(angle) * finalDistance * 0.8;
        
        if (j === 0) {
          points.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
        } else {
          points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
        }
      }
      
      lines.push(points.join(' '));
    }
    
    // Add secondary flowing patterns for extra density
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 15; i++) {
        const points: string[] = [];
        const baseAngle = (i / 15) * Math.PI * 2 + (layer * Math.PI / 6);
        const baseRadius = 60 + layer * 80;
        const waveLength = 150 + layer * 50;
        
        for (let j = 0; j <= 60; j++) {
          const t = j / 60;
          const angle = baseAngle + Math.sin(t * Math.PI * 4) * 0.6;
          const radius = baseRadius + Math.sin(t * Math.PI * 8) * 20 + t * waveLength;
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius * 0.8;
          
          if (j === 0) {
            points.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
          } else {
            points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
          }
        }
        
        lines.push(points.join(' '));
      }
    }
    
    // Add cross-flowing patterns for brain-like complexity
    for (let i = 0; i < 20; i++) {
      const points: string[] = [];
      const direction = i % 2 === 0 ? 1 : -1;
      const startAngle = (i / 20) * Math.PI * 2;
      const curvature = 0.5 + Math.random() * 0.8;
      
      for (let j = 0; j <= 50; j++) {
        const t = j / 50;
        const angle = startAngle + direction * t * Math.PI * curvature;
        const radius = 80 + t * 200 + Math.sin(t * Math.PI * 4) * 25;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.8;
        
        if (j === 0) {
          points.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
        } else {
          points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
        }
      }
      
      lines.push(points.join(' '));
    }
    
    return lines;
  };
  
  const contourLines = generateContourLines();
  
  return (
    <svg 
      className="w-full h-full" 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
        </linearGradient>
        
        <filter id="terrainGlow">
          <feGaussianBlur stdDeviation="1.2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {contourLines.map((pathData, index) => {
        // Vary stroke width and opacity based on line type
        const isMainContour = index < 12; // Main elevation contours
        const isFlowingLine = index >= 12 && index < 37; // Flowing internal lines
        const isSecondaryPattern = index >= 37 && index < 82; // Secondary patterns
        const isCrossFlow = index >= 82; // Cross-flowing patterns
        
        let strokeWidth, opacity;
        
        if (isMainContour) {
          strokeWidth = 2.2 - (index * 0.15);
          opacity = 0.9 - (index * 0.06);
        } else if (isFlowingLine) {
          strokeWidth = 1.2;
          opacity = 0.4 + Math.random() * 0.2;
        } else if (isSecondaryPattern) {
          strokeWidth = 0.8;
          opacity = 0.25 + Math.random() * 0.15;
        } else {
          strokeWidth = 0.6;
          opacity = 0.2 + Math.random() * 0.1;
        }
        
        return (
          <path
            key={index}
            d={pathData}
            stroke="url(#terrainGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={opacity}
            filter="url(#terrainGlow)"
            className={index % 3 === 0 ? "animate-pulse" : ""}
            style={{
              animationDuration: `${12 + (index % 8) * 2}s`,
              animationDelay: `${(index % 10) * 0.3}s`
            }}
          />
        );
      })}
    </svg>
  );
};

export default TopographicTerrain; 