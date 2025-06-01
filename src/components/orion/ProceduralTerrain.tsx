import React, { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

interface ProceduralTerrainProps {
  width?: number;
  height?: number;
}

const ProceduralTerrain: React.FC<ProceduralTerrainProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Initialize Simplex noise for realistic terrain generation
    const noise2D = createNoise2D();
    
    // Generate realistic height field using multiple octaves of noise
    const generateHeightField = (gridWidth: number, gridHeight: number): number[][] => {
      const heightField: number[][] = [];
      
      const centerX = gridWidth / 2;
      const centerY = gridHeight / 2;
      const maxRadius = Math.min(gridWidth, gridHeight) * 0.7;
      
      const rotationAngle = Math.PI / 12;
      
      for (let y = 0; y < gridHeight; y++) {
        heightField[y] = [];
        for (let x = 0; x < gridWidth; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          
          const rotatedX = dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle);
          const rotatedY = dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle);
          
          const distanceFromCenter = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
          const normalizedDistance = Math.min(distanceFromCenter / maxRadius, 1);
          
          const radialFalloff = Math.pow(1 - normalizedDistance, 1.2);
          
          const noiseX = x + rotatedX * 0.1;
          const noiseY = y + rotatedY * 0.1;
          
          const scale1 = 0.015;
          const scale2 = 0.04;
          const scale3 = 0.08;
          const scale4 = 0.18;
          
          const noise1 = noise2D(noiseX * scale1, noiseY * scale1) * 1.0;
          const noise2 = noise2D(noiseX * scale2, noiseY * scale2) * 0.5;
          const noise3 = noise2D(noiseX * scale3, noiseY * scale3) * 0.25;
          const noise4 = noise2D(noiseX * scale4, noiseY * scale4) * 0.125;
          
          const angle = Math.atan2(rotatedY, rotatedX);
          const angularNoise = noise2D(
            centerX + Math.cos(angle * 8) * maxRadius * 0.2,
            centerY + Math.sin(angle * 8) * maxRadius * 0.2
          ) * 0.4;
          
          let elevation = (noise1 + noise2 + noise3 + noise4 + angularNoise) * radialFalloff;
          
          elevation = Math.max(0, (elevation + 1) * 0.5 * 100);
          
          heightField[y][x] = elevation;
        }
      }
      
      return heightField;
    };
    
    // Simple marching squares contour extraction
    const extractContours = (heightField: number[][], levels: number[], scale: number): string[] => {
      const contours: string[] = [];
      const gridWidth = heightField[0].length;
      const gridHeight = heightField.length;
      
      levels.forEach(level => {
        const segments: Array<{x1: number, y1: number, x2: number, y2: number}> = [];
        
        // Extract contour segments using marching squares
        for (let y = 0; y < gridHeight - 1; y++) {
          for (let x = 0; x < gridWidth - 1; x++) {
            const tl = heightField[y][x];
            const tr = heightField[y][x + 1];
            const bl = heightField[y + 1][x];
            const br = heightField[y + 1][x + 1];
            
            // Determine which corners are above the threshold
            let config = 0;
            if (tl > level) config |= 1;
            if (tr > level) config |= 2;
            if (br > level) config |= 4;
            if (bl > level) config |= 8;
            
            // Interpolation function
            const interp = (v1: number, v2: number): number => {
              if (Math.abs(v2 - v1) < 0.001) return 0.5;
              return (level - v1) / (v2 - v1);
            };
            
            // Calculate interpolated edge points
            const topT = interp(tl, tr);
            const rightT = interp(tr, br);
            const bottomT = interp(bl, br);
            const leftT = interp(tl, bl);
            
            const cellX = x * scale;
            const cellY = y * scale;
            
            const top = { x: cellX + topT * scale, y: cellY };
            const right = { x: cellX + scale, y: cellY + rightT * scale };
            const bottom = { x: cellX + bottomT * scale, y: cellY + scale };
            const left = { x: cellX, y: cellY + leftT * scale };
            
            // Generate line segments based on configuration
            switch (config) {
              case 1: case 14:
                segments.push({ x1: left.x, y1: left.y, x2: top.x, y2: top.y });
                break;
              case 2: case 13:
                segments.push({ x1: top.x, y1: top.y, x2: right.x, y2: right.y });
                break;
              case 3: case 12:
                segments.push({ x1: left.x, y1: left.y, x2: right.x, y2: right.y });
                break;
              case 4: case 11:
                segments.push({ x1: right.x, y1: right.y, x2: bottom.x, y2: bottom.y });
                break;
              case 6: case 9:
                segments.push({ x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y });
                break;
              case 7: case 8:
                segments.push({ x1: left.x, y1: left.y, x2: bottom.x, y2: bottom.y });
                break;
            }
          }
        }
        
        // Connect segments into paths
        const paths = connectSegments(segments);
        contours.push(...paths);
      });
      
      return contours;
    };
    
    // Connect line segments into continuous paths
    const connectSegments = (segments: Array<{x1: number, y1: number, x2: number, y2: number}>): string[] => {
      const paths: string[] = [];
      const used = new Set<number>();
      
      for (let i = 0; i < segments.length; i++) {
        if (used.has(i)) continue;
        
        const path: Array<{x: number, y: number}> = [];
        let current = segments[i];
        used.add(i);
        
        path.push({ x: current.x1, y: current.y1 });
        path.push({ x: current.x2, y: current.y2 });
        
        // Try to connect more segments
        let connected = true;
        while (connected) {
          connected = false;
          const lastPoint = path[path.length - 1];
          
          for (let j = 0; j < segments.length; j++) {
            if (used.has(j)) continue;
            
            const seg = segments[j];
            const tolerance = 5;
            
            if (Math.abs(lastPoint.x - seg.x1) < tolerance && Math.abs(lastPoint.y - seg.y1) < tolerance) {
              path.push({ x: seg.x2, y: seg.y2 });
              used.add(j);
              connected = true;
              break;
            } else if (Math.abs(lastPoint.x - seg.x2) < tolerance && Math.abs(lastPoint.y - seg.y2) < tolerance) {
              path.push({ x: seg.x1, y: seg.y1 });
              used.add(j);
              connected = true;
              break;
            }
          }
        }
        
        // Convert path to SVG
        if (path.length > 2) {
          let pathString = `M${path[0].x.toFixed(1)},${path[0].y.toFixed(1)}`;
          for (let i = 1; i < path.length; i++) {
            pathString += ` L${path[i].x.toFixed(1)},${path[i].y.toFixed(1)}`;
          }
          paths.push(pathString);
        }
      }
      
      return paths;
    };
    
    // Clear previous content
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Set up SVG definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Enhanced gradient for realistic terrain
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'proceduralTerrainGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const gradientStops = [
      { offset: '0%', color: '#0ea5e9', opacity: '0.9' },
      { offset: '25%', color: '#06b6d4', opacity: '0.8' },
      { offset: '50%', color: '#3b82f6', opacity: '0.7' },
      { offset: '75%', color: '#0284c7', opacity: '0.6' },
      { offset: '100%', color: '#0369a1', opacity: '0.5' }
    ];
    
    gradientStops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      stopElement.setAttribute('stop-opacity', stop.opacity);
      gradient.appendChild(stopElement);
    });
    
    // Enhanced glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'proceduralTerrainGlow');
    
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '2');
    blur.setAttribute('result', 'coloredBlur');
    
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode1.setAttribute('in', 'coloredBlur');
    const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode2.setAttribute('in', 'SourceGraphic');
    
    merge.appendChild(mergeNode1);
    merge.appendChild(mergeNode2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    
    defs.appendChild(gradient);
    defs.appendChild(filter);
    svg.appendChild(defs);
    
    // Generate terrain with higher resolution for bigger terrain
    const gridWidth = Math.floor(width / 8);  // Increased resolution from 12 to 8
    const gridHeight = Math.floor(height / 8);
    const scale = 8;  // Reduced scale for higher detail
    
    const heightField = generateHeightField(gridWidth, gridHeight);
    
    // Create more elevation levels for better contour density
    const levels: number[] = [];
    for (let i = 2; i <= 98; i += 3) {  // More levels: every 3 instead of 5
      levels.push(i);
    }
    
    const contourPaths = extractContours(heightField, levels, scale);
    
    // Render contour paths
    contourPaths.forEach((pathData, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', 'url(#proceduralTerrainGradient)');
      path.setAttribute('fill', 'none');
      
      // Vary appearance based on level - adjusted for more levels
      const level = Math.floor(index / 6);  // Changed from 4 to 6 for better distribution
      const strokeWidth = Math.max(0.4, 2.5 - level * 0.06);  // Slightly thinner lines
      const opacity = Math.max(0.25, 0.95 - level * 0.04);    // Better opacity distribution
      
      path.setAttribute('stroke-width', strokeWidth.toString());
      path.setAttribute('opacity', opacity.toString());
      path.setAttribute('filter', 'url(#proceduralTerrainGlow)');
      
      // Add subtle animation to fewer paths for performance
      if (index % 8 === 0) {  // Changed from 5 to 8
        path.style.animation = `pulse ${15 + index * 0.2}s ease-in-out infinite`;
        path.style.animationDelay = `${index * 0.05}s`;
      }
      
      svg.appendChild(path);
    });
    
  }, [width, height]);
  
  return (
    <svg 
      ref={svgRef}
      className="w-full h-full" 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="xMidYMid slice"
    />
  );
};

export default ProceduralTerrain; 