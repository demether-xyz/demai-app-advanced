#!/usr/bin/env python3
"""
Color Analysis Script for Terrain Background SVG Implementation
Step 1.1: Extract color palette from target_design.png
"""

import cv2
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
    # Load image
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Reshape image to be a list of pixels
    pixels = image.reshape((-1, 3))
    
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
    """Analyze blue contour lines specifically"""
    image = cv2.imread(image_path)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define range for blue colors in HSV
    # Blue hue range is approximately 100-130 in OpenCV HSV
    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([130, 255, 255])
    
    # Create mask for blue areas
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Extract blue pixels
    blue_pixels = image[blue_mask > 0]
    
    if len(blue_pixels) > 0:
        # Convert to RGB
        blue_pixels_rgb = cv2.cvtColor(blue_pixels.reshape(-1, 1, 3), cv2.COLOR_BGR2RGB).reshape(-1, 3)
        
        # Cluster blue variations
        if len(blue_pixels_rgb) > 5:
            kmeans_blue = KMeans(n_clusters=min(5, len(blue_pixels_rgb)), random_state=42, n_init=10)
            kmeans_blue.fit(blue_pixels_rgb)
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
        }
    }
    
    return constants

def save_analysis_results(results, output_file='color_analysis_results.json'):
    """Save analysis results to JSON file"""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

def create_color_swatch_visualization(color_info, blue_contours, output_file='color_swatch.png'):
    """Create a visual color swatch for verification"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
    
    # Dominant colors swatch
    ax1.set_title('Dominant Colors from Image')
    colors_for_plot = [color['hex'] for color in color_info[:10]]
    percentages = [color['percentage'] for color in color_info[:10]]
    
    bars1 = ax1.barh(range(len(colors_for_plot)), percentages, color=colors_for_plot)
    ax1.set_yticks(range(len(colors_for_plot)))
    ax1.set_yticklabels([f"{color['hex']} ({color['percentage']:.1f}%)" 
                        for color in color_info[:10]])
    ax1.set_xlabel('Percentage')
    
    # Blue contour colors
    if blue_contours:
        ax2.set_title('Blue Contour Variations')
        blue_colors = [blue['hex'] for blue in blue_contours]
        bars2 = ax2.barh(range(len(blue_colors)), [1] * len(blue_colors), color=blue_colors)
        ax2.set_yticks(range(len(blue_colors)))
        ax2.set_yticklabels([blue['hex'] for blue in blue_contours])
        ax2.set_xlabel('Blue Variations')
    else:
        ax2.text(0.5, 0.5, 'No blue contours detected', ha='center', va='center', transform=ax2.transAxes)
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()

def main():
    """Main analysis function"""
    image_path = 'target_design.png'
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return
    
    print("Starting color analysis...")
    
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
    print("Creating color constants...")
    constants = create_color_constants(color_info, blue_contours, background_color)
    
    # Prepare results
    results = {
        'dominant_colors': color_info,
        'blue_contour_variations': blue_contours,
        'background_color': background_color,
        'typescript_constants': constants,
        'analysis_summary': {
            'total_colors_found': len(color_info),
            'blue_variations_found': len(blue_contours),
            'background_identified': background_color is not None
        }
    }
    
    # Save results
    print("Saving analysis results...")
    save_analysis_results(results, 'color_analysis_results.json')
    
    # Create visualization
    print("Creating color swatch visualization...")
    create_color_swatch_visualization(color_info, blue_contours, 'color_swatch.png')
    
    # Print summary
    print("\n" + "="*50)
    print("COLOR ANALYSIS SUMMARY")
    print("="*50)
    print(f"Background Color: {background_color['hex'] if background_color else 'Not identified'}")
    print(f"Total Dominant Colors: {len(color_info)}")
    print(f"Blue Contour Variations: {len(blue_contours)}")
    
    print("\nTop 5 Dominant Colors:")
    for i, color in enumerate(color_info[:5]):
        print(f"  {i+1}. {color['hex']} ({color['percentage']:.1f}%)")
    
    if blue_contours:
        print("\nBlue Contour Colors:")
        for i, blue in enumerate(blue_contours):
            print(f"  {i+1}. {blue['hex']}")
    
    print(f"\nResults saved to: color_analysis_results.json")
    print(f"Color swatch saved to: color_swatch.png")
    print("\nStep 1.1 QA Checkpoint:")
    print("✓ Color extraction completed")
    print("✓ Blue contour analysis completed") 
    print("✓ Background color identified" if background_color else "⚠ Background color needs manual verification")
    print("✓ TypeScript constants generated")
    print("✓ Visual validation files created")

if __name__ == "__main__":
    main() 