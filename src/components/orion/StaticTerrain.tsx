import React from 'react';

interface StaticTerrainProps {
  width?: number;
  height?: number;
}

const StaticTerrain: React.FC<StaticTerrainProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  // Realistic topographic contour lines representing mountain elevation levels
  const contourPaths = [
    // Outer elevation rings (lower elevations) - wider spacing
    "M200,300 Q400,280 600,300 Q800,320 1000,300 Q1200,280 1400,300 Q1600,320 1700,400 Q1600,480 1400,500 Q1200,520 1000,500 Q800,480 600,500 Q400,520 200,500 Q100,400 200,300 Z",
    
    "M250,330 Q450,310 650,330 Q850,350 1050,330 Q1250,310 1450,330 Q1620,350 1650,400 Q1620,450 1450,470 Q1250,490 1050,470 Q850,450 650,470 Q450,490 250,470 Q150,420 250,330 Z",
    
    "M300,360 Q500,340 700,360 Q900,380 1100,360 Q1300,340 1500,360 Q1600,380 1580,400 Q1600,420 1500,440 Q1300,460 1100,440 Q900,420 700,440 Q500,460 300,440 Q200,400 300,360 Z",
    
    // Middle elevation rings - closer spacing indicating steeper slope
    "M350,385 Q550,365 750,385 Q950,405 1150,385 Q1350,365 1530,385 Q1560,400 1530,415 Q1350,435 1150,415 Q950,395 750,415 Q550,435 350,415 Q250,400 350,385 Z",
    
    "M400,405 Q600,385 800,405 Q1000,425 1200,405 Q1400,385 1520,405 Q1540,415 1520,425 Q1400,445 1200,425 Q1000,405 800,425 Q600,445 400,425 Q300,415 400,405 Z",
    
    "M450,420 Q650,400 850,420 Q1050,440 1250,420 Q1450,400 1510,420 Q1520,430 1510,440 Q1450,460 1250,440 Q1050,420 850,440 Q650,460 450,440 Q350,430 450,420 Z",
    
    // Higher elevation rings - very close spacing for steep mountain slopes
    "M500,435 Q700,415 900,435 Q1100,455 1300,435 Q1480,415 1500,435 Q1480,455 1300,475 Q1100,495 900,475 Q700,455 500,475 Q400,445 500,435 Z",
    
    "M550,448 Q750,428 950,448 Q1150,468 1350,448 Q1470,428 1485,448 Q1470,468 1350,488 Q1150,508 950,488 Q750,468 550,488 Q450,458 550,448 Z",
    
    "M600,460 Q800,440 1000,460 Q1200,480 1400,460 Q1460,440 1470,460 Q1460,480 1400,500 Q1200,520 1000,500 Q800,480 600,500 Q500,470 600,460 Z",
    
    // Peak elevation rings - tightest spacing at summit
    "M650,470 Q850,450 1050,470 Q1250,490 1420,470 Q1450,450 1455,470 Q1450,490 1420,510 Q1250,530 1050,510 Q850,490 650,510 Q550,480 650,470 Z",
    
    "M700,479 Q900,459 1100,479 Q1300,499 1410,479 Q1440,459 1442,479 Q1440,499 1410,519 Q1300,539 1100,519 Q900,499 700,519 Q600,489 700,479 Z",
    
    "M750,487 Q950,467 1150,487 Q1350,507 1400,487 Q1430,467 1431,487 Q1430,507 1400,527 Q1350,547 1150,527 Q950,507 750,527 Q650,497 750,487 Z",
    
    // Summit peak - smallest rings
    "M800,494 Q1000,474 1200,494 Q1380,494 1420,494 Q1380,514 1200,514 Q1000,514 800,514 Q700,504 800,494 Z",
    
    "M850,500 Q1050,480 1250,500 Q1370,500 1400,500 Q1370,520 1250,520 Q1050,520 850,520 Q750,510 850,500 Z",
    
    // Secondary smaller peak to the left
    "M150,200 Q250,180 350,200 Q450,220 500,280 Q450,340 350,360 Q250,380 150,360 Q50,340 30,280 Q50,220 150,200 Z",
    
    "M180,220 Q280,200 380,220 Q430,240 460,280 Q430,320 380,340 Q280,360 180,340 Q80,320 60,280 Q80,240 180,220 Z",
    
    "M210,240 Q310,220 410,240 Q440,260 450,280 Q440,300 410,320 Q310,340 210,320 Q110,300 90,280 Q110,260 210,240 Z",
    
    "M240,260 Q340,240 420,260 Q430,270 425,280 Q430,290 420,300 Q340,320 240,300 Q140,290 120,280 Q140,270 240,260 Z",
    
    // Ridge lines connecting peaks (typical of mountain ranges)
    "M500,280 Q600,275 700,280 Q800,285 900,280 Q1000,275 1100,280",
    "M480,300 Q580,295 680,300 Q780,305 880,300 Q980,295 1080,300",
    
    // Valley contours (lower elevation areas)
    "M100,600 Q300,580 500,600 Q700,620 900,600 Q1100,580 1300,600 Q1500,620 1700,600 Q1800,650 1700,700 Q1500,720 1300,700 Q1100,680 900,700 Q700,720 500,700 Q300,680 100,700 Q50,650 100,600",
    
    "M150,630 Q350,610 550,630 Q750,650 950,630 Q1150,610 1350,630 Q1550,650 1650,630 Q1720,670 1650,710 Q1550,730 1350,710 Q1150,690 950,710 Q750,730 550,710 Q350,690 150,710 Q80,670 150,630",
  ];

  return (
    <svg 
      className="w-full h-full" 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: 'rotate(8deg) scale(1.2)', transformOrigin: 'center' }}
    >
      <defs>
        {/* Topographic map style gradient */}
        <linearGradient id="staticTerrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.95" />
          <stop offset="20%" stopColor="#06b6d4" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.65" />
          <stop offset="80%" stopColor="#0369a1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#075985" stopOpacity="0.45" />
        </linearGradient>
        
        {/* Subtle glow for mountain contours */}
        <filter id="staticTerrainGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {contourPaths.map((pathData, index) => {
        // Vary appearance based on elevation level
        let strokeWidth, opacity, animationClass;
        
        if (index < 3) {
          // Low elevation contours - thicker lines, lower opacity
          strokeWidth = 1.8;
          opacity = 0.6;
          animationClass = "";
        } else if (index < 9) {
          // Mid elevation contours
          strokeWidth = 1.4;
          opacity = 0.7;
          animationClass = index % 4 === 0 ? "animate-pulse" : "";
        } else if (index < 15) {
          // High elevation contours - thinner lines, higher opacity
          strokeWidth = 1.0;
          opacity = 0.85;
          animationClass = index % 5 === 0 ? "animate-pulse" : "";
        } else if (index < 19) {
          // Secondary peak contours
          strokeWidth = 1.2;
          opacity = 0.75;
          animationClass = "";
        } else if (index < 21) {
          // Ridge lines
          strokeWidth = 0.8;
          opacity = 0.5;
          animationClass = "";
        } else {
          // Valley contours
          strokeWidth = 1.6;
          opacity = 0.4;
          animationClass = "";
        }
        
        return (
          <path
            key={index}
            d={pathData}
            stroke="url(#staticTerrainGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={opacity}
            filter="url(#staticTerrainGlow)"
            className={animationClass}
            style={{
              animationDuration: `${20 + (index % 8) * 2}s`,
              animationDelay: `${(index % 12) * 0.3}s`
            }}
          />
        );
      })}
    </svg>
  );
};

export default StaticTerrain; 