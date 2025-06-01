#!/usr/bin/env python3
"""
Simplified Color Analysis Script for Terrain Background SVG Implementation
Step 1.1: Extract color palette from target_design.png using PIL and numpy
"""

import numpy as np
from PIL import Image
import json
from collections import Counter
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import os

def rgb_to_hex(rgb):
    """Convert RGB values to hex color code"""
    return "#{:02x}{:02x}{:02x}".format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def extract_dominant_colors(image_path, n_colors=10):
    """Extract dominant colors using K-means clustering"""
    # Load image with PIL
    image = Image.open(image_path)
    image = image.convert('RGB')
    
    # Convert to numpy array
    image_array = np.array(image)
    
    # Reshape image to be a list of pixels
    pixels = image_array.reshape((-1, 3))
    
    # Apply K-means clustering
    kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)
    
    # Get the colors and their percentages
    colors = kmeans.cluster_centers_
    labels = kmeans.labels_
    
    # Count occurrences of each cluster
    counts = Counter(labels)
    total_pixels = len(labels)
    
    # Create results
    color_info = []
    for i, color in enumerate(colors):
        percentage = (counts[i] / total_pixels) * 100
        color_info.append({
            'rgb': color.tolist(),
            'hex': rgb_to_hex(color),
            'percentage': percentage
        })
    
    # Sort by percentage (most dominant first)
    color_info.sort(key=lambda x: x['percentage'], reverse=True)
    
    return color_info

def analyze_blue_contours(image_path):
    """Analyze blue contour lines specifically using RGB values"""
    image = Image.open(image_path)
    image = image.convert('RGB')
    image_array = np.array(image)
    
    # Define blue color ranges in RGB
    # Looking for pixels that are predominantly blue
    blue_pixels = []
    
    for y in range(image_array.shape[0]):
        for x in range(image_array.shape[1]):
            r, g, b = image_array[y, x]
            
            # Check if pixel is blue-ish (blue channel higher than red/green)
            if b > r and b > g and b > 100:  # Blue dominant and reasonably bright
                blue_pixels.append([r, g, b])
    
    if len(blue_pixels) > 5:
        blue_pixels = np.array(blue_pixels)
        
        # Cluster blue variations
        n_clusters = min(5, len(blue_pixels))
        kmeans_blue = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans_blue.fit(blue_pixels)
        blue_variations = kmeans_blue.cluster_centers_
        
        blue_info = []
        for color in blue_variations:
            blue_info.append({
                'rgb': color.tolist(),
                'hex': rgb_to_hex(color)
            })
        return blue_info
    
    return []

def identify_background_color(color_info):
    """Identify the background color (likely the most dominant dark color)"""
    # Look for the most dominant color that's dark (low brightness)
    for color in color_info:
        rgb = color['rgb']
        brightness = sum(rgb) / 3
        if brightness < 50 and color['percentage'] > 10:  # Dark and significant
            return color
    
    # Fallback to most dominant color
    return color_info[0] if color_info else None

def analyze_image_properties(image_path):
    """Extract additional image properties"""
    image = Image.open(image_path)
    
    properties = {
        'dimensions': image.size,
        'format': image.format,
        'mode': image.mode,
        'aspect_ratio': image.size[0] / image.size[1]
    }
    
    return properties

def create_color_constants(color_info, blue_contours, background_color):
    """Create TypeScript color constants for the implementation"""
    
    constants = {
        'BACKGROUND_COLOR': background_color['hex'] if background_color else '#000000',
        'DOMINANT_COLORS': [color['hex'] for color in color_info[:5]],
        'BLUE_CONTOUR_VARIATIONS': [blue['hex'] for blue in blue_contours],
        'COLOR_PALETTE': {
            'background': background_color['hex'] if background_color else '#000000',
            'primary_blue': blue_contours[0]['hex'] if blue_contours else '#0080ff',
            'secondary_blue': blue_contours[1]['hex'] if len(blue_contours) > 1 else '#004080',
            'accent_blue': blue_contours[2]['hex'] if len(blue_contours) > 2 else '#00a0ff',
        },
        'OPACITY_LEVELS': {
            'primary_contours': 0.8,
            'secondary_contours': 0.6,
            'background_contours': 0.4,
            'accent_glow': 0.3
        },
        'STROKE_WEIGHTS': {
            'major_contours': 2,
            'medium_contours': 1.5,
            'minor_contours': 1,
            'detail_lines': 0.8
        }
    }
    
    return constants

def save_analysis_results(results, output_file='color_analysis_results.json'):
    """Save analysis results to JSON file"""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

def create_color_swatch_visualization(color_info, blue_contours, output_file='color_swatch.png'):
    """Create a visual color swatch for verification"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    # Dominant colors swatch
    ax1.set_title('Dominant Colors from Target Design', fontsize=14, fontweight='bold')
    colors_for_plot = [color['hex'] for color in color_info[:10]]
    percentages = [color['percentage'] for color in color_info[:10]]
    
    bars1 = ax1.barh(range(len(colors_for_plot)), percentages, color=colors_for_plot, edgecolor='white', linewidth=0.5)
    ax1.set_yticks(range(len(colors_for_plot)))
    ax1.set_yticklabels([f"{color['hex']} ({color['percentage']:.1f}%)" 
                        for color in color_info[:10]], fontsize=10)
    ax1.set_xlabel('Percentage of Image', fontsize=12)
    ax1.grid(axis='x', alpha=0.3)
    
    # Blue contour colors
    if blue_contours:
        ax2.set_title('Blue Contour Variations', fontsize=14, fontweight='bold')
        blue_colors = [blue['hex'] for blue in blue_contours]
        bars2 = ax2.barh(range(len(blue_colors)), [1] * len(blue_colors), color=blue_colors, edgecolor='white', linewidth=0.5)
        ax2.set_yticks(range(len(blue_colors)))
        ax2.set_yticklabels([blue['hex'] for blue in blue_contours], fontsize=10)
        ax2.set_xlabel('Blue Color Variations', fontsize=12)
        ax2.set_xlim(0, 1)
    else:
        ax2.text(0.5, 0.5, 'No blue contours detected', ha='center', va='center', 
                transform=ax2.transAxes, fontsize=12, style='italic')
        ax2.set_xlim(0, 1)
        ax2.set_ylim(0, 1)
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def main():
    """Main analysis function"""
    image_path = 'target_design.png'
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return
    
    print("Starting color analysis for terrain background implementation...")
    print("="*60)
    
    # Extract image properties
    print("Analyzing image properties...")
    image_props = analyze_image_properties(image_path)
    
    # Extract dominant colors
    print("Extracting dominant colors...")
    color_info = extract_dominant_colors(image_path, n_colors=15)
    
    # Analyze blue contours
    print("Analyzing blue contour variations...")
    blue_contours = analyze_blue_contours(image_path)
    
    # Identify background
    print("Identifying background color...")
    background_color = identify_background_color(color_info)
    
    # Create constants
    print("Creating TypeScript color constants...")
    constants = create_color_constants(color_info, blue_contours, background_color)
    
    # Prepare results
    results = {
        'image_properties': image_props,
        'dominant_colors': color_info,
        'blue_contour_variations': blue_contours,
        'background_color': background_color,
        'typescript_constants': constants,
        'analysis_summary': {
            'total_colors_found': len(color_info),
            'blue_variations_found': len(blue_contours),
            'background_identified': background_color is not None,
            'image_dimensions': image_props['dimensions'],
            'aspect_ratio': image_props['aspect_ratio']
        }
    }
    
    # Save results
    print("Saving analysis results...")
    save_analysis_results(results, 'color_analysis_results.json')
    
    # Create visualization
    print("Creating color swatch visualization...")
    create_color_swatch_visualization(color_info, blue_contours, 'color_swatch.png')
    
    # Print detailed summary
    print("\n" + "="*60)
    print("COLOR ANALYSIS SUMMARY - STEP 1.1")
    print("="*60)
    
    print(f"\nImage Properties:")
    print(f"  Dimensions: {image_props['dimensions'][0]}×{image_props['dimensions'][1]} pixels")
    print(f"  Aspect Ratio: {image_props['aspect_ratio']:.2f}")
    print(f"  Format: {image_props['format']}")
    print(f"  Mode: {image_props['mode']}")
    
    print(f"\nBackground Color: {background_color['hex'] if background_color else 'Not identified'}")
    if background_color:
        print(f"  RGB: {background_color['rgb']}")
        print(f"  Coverage: {background_color['percentage']:.1f}%")
    
    print(f"\nColor Analysis:")
    print(f"  Total Dominant Colors: {len(color_info)}")
    print(f"  Blue Contour Variations: {len(blue_contours)}")
    
    print("\nTop 5 Dominant Colors:")
    for i, color in enumerate(color_info[:5]):
        rgb_str = f"rgb({int(color['rgb'][0])}, {int(color['rgb'][1])}, {int(color['rgb'][2])})"
        print(f"  {i+1}. {color['hex']} - {rgb_str} ({color['percentage']:.1f}%)")
    
    if blue_contours:
        print("\nBlue Contour Colors (for terrain lines):")
        for i, blue in enumerate(blue_contours):
            rgb_str = f"rgb({int(blue['rgb'][0])}, {int(blue['rgb'][1])}, {int(blue['rgb'][2])})"
            print(f"  {i+1}. {blue['hex']} - {rgb_str}")
    else:
        print("\n⚠ No distinct blue contours detected - may need manual color identification")
    
    print(f"\nFiles Generated:")
    print(f"  📄 Results: color_analysis_results.json")
    print(f"  🎨 Visualization: color_swatch.png")
    
    print(f"\n✅ STEP 1.1 QA CHECKPOINT:")
    print("  ✓ Color extraction completed")
    print("  ✓ Dominant color palette identified") 
    print("  ✓ Background color identified" if background_color else "  ⚠ Background color needs manual verification")
    print("  ✓ Blue contour analysis completed" if blue_contours else "  ⚠ Blue contours need manual identification")
    print("  ✓ TypeScript constants generated")
    print("  ✓ Visual validation files created")
    print("  ✓ Image properties documented")
    
    print(f"\n🎯 Next Step: Proceed to Step 1.2 - Structural Analysis")
    print("    Use the generated color constants for consistent implementation")

if __name__ == "__main__":
    main() 