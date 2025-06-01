#!/usr/bin/env python3
"""
Topographic Terrain Analysis - Correct Interpretation
Re-analyze the target_design.png as topographic elevation contours
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw
import json
from pathlib import Path

def analyze_topographic_features(image_path):
    """
    Analyze the image as topographic terrain with elevation contours
    """
    # Load the image
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Find contours (elevation lines)
    contours, hierarchy = cv2.findContours(gray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Analyze topographic features
    features = {
        "mountain_peaks": [],      # High elevation points (enclosed contours)
        "ridge_lines": [],         # Main watershed/ridge systems
        "valley_systems": [],      # Low elevation drainage patterns
        "elevation_contours": [],  # Contour lines by elevation level
        "terrain_flow": []         # Water flow/drainage directions
    }
    
    print("🗻 TOPOGRAPHIC TERRAIN ANALYSIS")
    print("=" * 50)
    
    # Identify mountain peaks (small, enclosed, high-contrast contours)
    peaks = []
    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        if 1000 < area < 8000:  # Peak-sized areas
            # Calculate centroid
            M = cv2.moments(contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                
                # Check if it's likely a peak (high contrast center)
                peak_intensity = gray[cy, cx] if 0 <= cy < gray.shape[0] and 0 <= cx < gray.shape[1] else 0
                if peak_intensity > 100:  # Bright center = high elevation
                    peaks.append({
                        "center": (cx, cy),
                        "area": area,
                        "elevation_level": int(peak_intensity),
                        "contour_complexity": len(contour)
                    })
    
    features["mountain_peaks"] = sorted(peaks, key=lambda x: x["elevation_level"], reverse=True)
    
    # Identify ridge lines (long, connected high-intensity paths)
    ridges = []
    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        
        if area > 8000 and perimeter > 500:  # Large, elongated features
            # Calculate aspect ratio
            rect = cv2.minAreaRect(contour)
            width, height = rect[1]
            aspect_ratio = max(width, height) / min(width, height) if min(width, height) > 0 else 0
            
            if aspect_ratio > 2:  # Elongated = likely ridge
                ridges.append({
                    "contour_id": i,
                    "length": perimeter,
                    "area": area,
                    "aspect_ratio": aspect_ratio,
                    "center": rect[0],
                    "type": "major_ridge" if area > 20000 else "minor_ridge"
                })
    
    features["ridge_lines"] = sorted(ridges, key=lambda x: x["area"], reverse=True)
    
    # Identify valley systems (low-intensity, connected areas)
    valleys = []
    # Create binary mask for low-intensity areas (valleys)
    valley_mask = gray < 50  # Dark areas = low elevation
    valley_contours, _ = cv2.findContours(valley_mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in valley_contours:
        area = cv2.contourArea(contour)
        if area > 5000:  # Significant valley systems
            M = cv2.moments(contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                valleys.append({
                    "center": (cx, cy),
                    "area": area,
                    "type": "major_valley" if area > 15000 else "minor_valley"
                })
    
    features["valley_systems"] = sorted(valleys, key=lambda x: x["area"], reverse=True)
    
    # Analyze elevation contours by intensity levels
    elevation_levels = []
    for threshold in [30, 60, 90, 120, 150, 180]:  # Different elevation levels
        mask = (gray > threshold) & (gray < threshold + 30)
        level_contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        level_area = sum(cv2.contourArea(c) for c in level_contours)
        if level_area > 1000:
            elevation_levels.append({
                "elevation": threshold,
                "coverage_area": level_area,
                "contour_count": len(level_contours),
                "elevation_description": get_elevation_description(threshold)
            })
    
    features["elevation_contours"] = elevation_levels
    
    return features

def get_elevation_description(elevation):
    """Convert elevation value to descriptive terms"""
    if elevation < 50:
        return "valley_floor"
    elif elevation < 90:
        return "foothills"
    elif elevation < 130:
        return "mid_elevation"
    elif elevation < 170:
        return "high_elevation"
    else:
        return "mountain_peaks"

def create_topographic_overlay(image_path, features):
    """
    Create an overlay showing the identified topographic features
    """
    img = Image.open(image_path)
    overlay = img.copy()
    draw = ImageDraw.Draw(overlay)
    
    # Draw mountain peaks
    for peak in features["mountain_peaks"][:5]:  # Top 5 peaks
        x, y = peak["center"]
        size = max(10, int(peak["area"] / 500))
        
        # Draw peak marker
        draw.ellipse([x-size, y-size, x+size, y+size], 
                    outline="red", width=3)
        draw.text((x+size+5, y-10), f"Peak {peak['elevation_level']}m", 
                 fill="red")
    
    # Draw ridge lines
    for i, ridge in enumerate(features["ridge_lines"][:3]):  # Top 3 ridges
        x, y = ridge["center"]
        draw.text((x, y), f"Ridge {i+1}", fill="orange")
        
    # Draw valley systems
    for i, valley in enumerate(features["valley_systems"][:3]):  # Top 3 valleys
        x, y = valley["center"]
        draw.text((x, y), f"Valley {i+1}", fill="cyan")
    
    return overlay

def print_analysis_summary(features):
    """Print a summary of the topographic analysis"""
    print(f"\n🏔️  MOUNTAIN PEAKS IDENTIFIED: {len(features['mountain_peaks'])}")
    for i, peak in enumerate(features['mountain_peaks'][:3]):
        print(f"   Peak {i+1}: Elevation {peak['elevation_level']}m at {peak['center']}")
    
    print(f"\n⛰️  RIDGE SYSTEMS IDENTIFIED: {len(features['ridge_lines'])}")
    for i, ridge in enumerate(features['ridge_lines'][:3]):
        print(f"   Ridge {i+1}: {ridge['type']} - Length {ridge['length']:.0f}px")
    
    print(f"\n🏞️  VALLEY SYSTEMS IDENTIFIED: {len(features['valley_systems'])}")
    for i, valley in enumerate(features['valley_systems'][:3]):
        print(f"   Valley {i+1}: {valley['type']} - Area {valley['area']:.0f}px²")
    
    print(f"\n📊 ELEVATION DISTRIBUTION:")
    for level in features['elevation_contours']:
        coverage_pct = level['coverage_area'] / (2074 * 1178) * 100
        print(f"   {level['elevation_description']}: {coverage_pct:.1f}% coverage")

def create_conceptual_comparison():
    """
    Create a conceptual diagram showing the difference between 
    brain interpretation vs topographic interpretation
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))
    
    # Wrong interpretation (brain-like)
    ax1.set_title("❌ WRONG: Brain-like Interpretation", fontsize=14, color='red')
    ax1.text(0.1, 0.8, "• Central Brain Ridge System", fontsize=12)
    ax1.text(0.1, 0.7, "• Left Brain Hemisphere", fontsize=12)
    ax1.text(0.1, 0.6, "• Right Brain Extensions", fontsize=12)
    ax1.text(0.1, 0.5, "• Cortical layers", fontsize=12)
    ax1.text(0.1, 0.4, "• Neural connections", fontsize=12)
    ax1.text(0.1, 0.2, "❌ Biological/anatomical logic", fontsize=12, color='red')
    ax1.set_xlim(0, 1)
    ax1.set_ylim(0, 1)
    ax1.axis('off')
    
    # Correct interpretation (topographic)
    ax2.set_title("✅ CORRECT: Topographic Terrain", fontsize=14, color='green')
    ax2.text(0.1, 0.8, "• Mountain peaks & summits", fontsize=12)
    ax2.text(0.1, 0.7, "• Ridge lines & watersheds", fontsize=12)
    ax2.text(0.1, 0.6, "• Valley systems & drainage", fontsize=12)
    ax2.text(0.1, 0.5, "• Elevation contour lines", fontsize=12)
    ax2.text(0.1, 0.4, "• Terrain flow patterns", fontsize=12)
    ax2.text(0.1, 0.2, "✅ Elevation/geographic logic", fontsize=12, color='green')
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.axis('off')
    
    plt.tight_layout()
    plt.savefig('conceptual_comparison.png', dpi=150, bbox_inches='tight')
    print("\n📊 Conceptual comparison diagram saved: conceptual_comparison.png")

if __name__ == "__main__":
    image_path = "target_design.png"  # Fixed path - we're already in scripts dir
    
    print("🗺️  TOPOGRAPHIC TERRAIN ANALYSIS")
    print("Re-analyzing target design as elevation contours")
    print("=" * 60)
    
    # Analyze topographic features
    features = analyze_topographic_features(image_path)
    
    # Print summary
    print_analysis_summary(features)
    
    # Create overlay visualization
    overlay = create_topographic_overlay(image_path, features)
    overlay.save("topographic_analysis_overlay.png")
    print(f"\n🗺️  Topographic overlay saved: topographic_analysis_overlay.png")
    
    # Save features to JSON
    with open("topographic_features.json", "w") as f:
        json.dump(features, f, indent=2)
    print(f"📄 Topographic features saved: topographic_features.json")
    
    # Create conceptual comparison
    create_conceptual_comparison()
    
    print("\n" + "=" * 60)
    print("✅ ANALYSIS COMPLETE - Review the generated files:")
    print("   • topographic_analysis_overlay.png - Feature identification")
    print("   • topographic_features.json - Detailed feature data")
    print("   • conceptual_comparison.png - Brain vs Terrain comparison")
    print("=" * 60) 