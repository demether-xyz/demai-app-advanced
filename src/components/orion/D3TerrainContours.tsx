import React, { useEffect, useRef } from 'react';

interface D3TerrainContoursProps {
  width?: number;
  height?: number;
}

const D3TerrainContours: React.FC<D3TerrainContoursProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Generate height field data using noise functions
    const generateHeightField = (width: number, height: number) => {
      const data: number[] = [];
      const scale = 0.01; // Noise scale
      
      for (let y = 0; y < height; y += 4) { // Sample every 4 pixels for performance
        for (let x = 0; x < width; x += 4) {
          // Multiple octaves of noise for organic terrain
          const noise1 = Math.sin(x * scale) * Math.cos(y * scale);
          const noise2 = Math.sin(x * scale * 2) * Math.cos(y * scale * 2) * 0.5;
          const noise3 = Math.sin(x * scale * 4) * Math.cos(y * scale * 4) * 0.25;
          
          // Combine noises and add radial falloff for brain-like shape
          const centerX = width / 2;
          const centerY = height / 2;
          const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          const maxDistance = Math.min(width, height) / 2;
          const radialFalloff = Math.max(0, 1 - (distanceFromCenter / maxDistance));
          
          const elevation = (noise1 + noise2 + noise3) * radialFalloff;
          data.push(elevation);
        }
      }
      
      return data;
    };
    
    // Generate contour paths manually (simplified D3 contour approach)
    const generateContourPaths = () => {
      const paths: Array<{ path: string; elevation: number }> = [];
      const gridWidth = Math.floor(width / 4);
      const gridHeight = Math.floor(height / 4);
      const heightField = generateHeightField(width, height);
      
      // Define elevation levels
      const elevationLevels = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6];
      
      elevationLevels.forEach(targetElevation => {
        const contourPoints: Array<{ x: number; y: number }> = [];
        
        // Simple marching squares approach
        for (let y = 0; y < gridHeight - 1; y++) {
          for (let x = 0; x < gridWidth - 1; x++) {
            const i = y * gridWidth + x;
            
            // Get the four corner values
            const tl = heightField[i] || 0;
            const tr = heightField[i + 1] || 0;
            const bl = heightField[i + gridWidth] || 0;
            const br = heightField[i + gridWidth + 1] || 0;
            
            // Check if contour passes through this cell
            const values = [tl, tr, br, bl];
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            if (min <= targetElevation && targetElevation <= max) {
              // Add interpolated point
              const cellX = x * 4;
              const cellY = y * 4;
              
              // Simple interpolation
              const t = (targetElevation - min) / (max - min);
              const pointX = cellX + t * 4;
              const pointY = cellY + t * 4;
              
              contourPoints.push({ x: pointX, y: pointY });
            }
          }
        }
        
        // Convert points to SVG path
        if (contourPoints.length > 10) {
          // Sort points by angle from center for better path
          const centerX = width / 2;
          const centerY = height / 2;
          
          contourPoints.sort((a, b) => {
            const angleA = Math.atan2(a.y - centerY, a.x - centerX);
            const angleB = Math.atan2(b.y - centerY, b.x - centerX);
            return angleA - angleB;
          });
          
          // Create smooth path using curves
          let pathData = `M${contourPoints[0].x},${contourPoints[0].y}`;
          
          for (let i = 1; i < contourPoints.length; i++) {
            const current = contourPoints[i];
            const prev = contourPoints[i - 1];
            
            // Use quadratic curves for smoothness
            const cpX = (prev.x + current.x) / 2;
            const cpY = (prev.y + current.y) / 2;
            
            pathData += ` Q${cpX},${cpY} ${current.x},${current.y}`;
          }
          
          // Close the path
          pathData += ' Z';
          
          paths.push({
            path: pathData,
            elevation: targetElevation
          });
        }
      });
      
      return paths;
    };
    
    const contourPaths = generateContourPaths();
    
    // Clear previous content
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Add defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'd3TerrainGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stops = [
      { offset: '0%', color: '#06b6d4', opacity: '0.8' },
      { offset: '50%', color: '#3b82f6', opacity: '0.6' },
      { offset: '100%', color: '#0ea5e9', opacity: '0.4' }
    ];
    
    stops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      stopElement.setAttribute('stop-opacity', stop.opacity);
      gradient.appendChild(stopElement);
    });
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'd3TerrainGlow');
    
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '1.5');
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
    
    // Add contour paths
    contourPaths.forEach((contour, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', contour.path);
      path.setAttribute('stroke', 'url(#d3TerrainGradient)');
      path.setAttribute('stroke-width', (2 - Math.abs(contour.elevation) * 2).toString());
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', (0.8 - Math.abs(contour.elevation) * 0.3).toString());
      path.setAttribute('filter', 'url(#d3TerrainGlow)');
      
      // Add subtle animation
      if (index % 2 === 0) {
        path.style.animation = `pulse ${8 + index}s ease-in-out infinite`;
        path.style.animationDelay = `${index * 0.5}s`;
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

export default D3TerrainContours; 