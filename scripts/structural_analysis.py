#!/usr/bin/env python3
"""
Structural Analysis Script for Terrain Background SVG Implementation
Step 1.2: Identify major terrain features and spatial relationships
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import json
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN
from scipy import ndimage
from scipy.spatial.distance import pdist, squareform
import cv2
import os

class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy types"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

def load_and_preprocess_image(image_path):
    """Load and preprocess the target design image for structural analysis"""
    image = Image.open(image_path)
    image = image.convert('RGB')
    
    # Convert to numpy array
    image_array = np.array(image)
    
    # Create grayscale version for edge detection
    gray = np.dot(image_array[...,:3], [0.2989, 0.5870, 0.1140])
    
    return image, image_array, gray

def detect_contour_lines(image_array, gray):
    """Detect and extract contour lines from the image"""
    # Apply edge detection to find contour lines
    # Using Canny edge detection
    edges = cv2.Canny(np.uint8(gray), 50, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours by size and shape
    significant_contours = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 100:  # Filter out very small contours
            # Calculate contour properties
            perimeter = cv2.arcLength(contour, True)
            if perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                significant_contours.append({
                    'contour': contour,
                    'area': area,
                    'perimeter': perimeter,
                    'circularity': circularity,
                    'centroid': tuple(np.mean(contour.reshape(-1, 2), axis=0).astype(int))
                })
    
    return significant_contours, edges

def identify_terrain_features(image_array, contours):
    """Identify specific terrain features from contours"""
    features = {
        'peaks': [],
        'valleys': [],
        'ridges': [],
        'major_contours': [],
        'secondary_contours': []
    }
    
    # Sort contours by area (largest first)
    sorted_contours = sorted(contours, key=lambda x: x['area'], reverse=True)
    
    for i, contour_data in enumerate(sorted_contours):
        contour = contour_data['contour']
        area = contour_data['area']
        circularity = contour_data['circularity']
        centroid = contour_data['centroid']
        
        # Classify based on size and shape
        if area > 5000:  # Large features
            if circularity > 0.7:  # More circular = likely peak/valley
                features['peaks'].append({
                    'type': 'peak',
                    'centroid': centroid,
                    'area': area,
                    'circularity': circularity,
                    'contour_points': contour.reshape(-1, 2).tolist(),
                    'classification': 'major'
                })
            else:  # Less circular = likely ridge
                features['ridges'].append({
                    'type': 'ridge',
                    'centroid': centroid,
                    'area': area,
                    'circularity': circularity,
                    'contour_points': contour.reshape(-1, 2).tolist(),
                    'classification': 'major'
                })
            features['major_contours'].append(contour_data)
        elif area > 1000:  # Medium features
            features['secondary_contours'].append({
                'type': 'secondary_contour',
                'centroid': centroid,
                'area': area,
                'circularity': circularity,
                'contour_points': contour.reshape(-1, 2).tolist(),
                'classification': 'secondary'
            })
    
    return features

def analyze_contour_density(image_array, contours):
    """Analyze contour line density patterns across the image"""
    height, width = image_array.shape[:2]
    
    # Create density grid
    grid_size = 50
    density_grid = np.zeros((height // grid_size + 1, width // grid_size + 1))
    
    # Count contours in each grid cell
    for contour_data in contours:
        centroid = contour_data['centroid']
        grid_x = min(centroid[0] // grid_size, density_grid.shape[1] - 1)
        grid_y = min(centroid[1] // grid_size, density_grid.shape[0] - 1)
        density_grid[grid_y, grid_x] += 1
    
    # Identify high and low density regions
    density_stats = {
        'max_density': float(np.max(density_grid)),
        'mean_density': float(np.mean(density_grid)),
        'std_density': float(np.std(density_grid)),
        'grid_size': grid_size,
        'density_map': density_grid.tolist()
    }
    
    return density_stats

def analyze_line_thickness(image_array, edges):
    """Analyze line thickness variations in the image"""
    # Apply distance transform to find line thicknesses
    dist_transform = cv2.distanceTransform(255 - edges, cv2.DIST_L2, 5)
    
    # Find non-zero regions (lines)
    line_pixels = edges > 0
    line_thicknesses = dist_transform[line_pixels]
    
    thickness_stats = {
        'mean_thickness': float(np.mean(line_thicknesses)) if len(line_thicknesses) > 0 else 0,
        'max_thickness': float(np.max(line_thicknesses)) if len(line_thicknesses) > 0 else 0,
        'std_thickness': float(np.std(line_thicknesses)) if len(line_thicknesses) > 0 else 0,
        'thickness_histogram': np.histogram(line_thicknesses, bins=10)[0].tolist() if len(line_thicknesses) > 0 else []
    }
    
    return thickness_stats

def document_spatial_relationships(features):
    """Document spatial relationships between terrain features"""
    relationships = []
    
    # Analyze relationships between peaks
    peaks = features['peaks']
    ridges = features['ridges']
    
    for i, peak1 in enumerate(peaks):
        for j, peak2 in enumerate(peaks[i+1:], i+1):
            distance = np.sqrt(
                (peak1['centroid'][0] - peak2['centroid'][0])**2 + 
                (peak1['centroid'][1] - peak2['centroid'][1])**2
            )
            relationships.append({
                'type': 'peak_to_peak',
                'feature1': f'peak_{i}',
                'feature2': f'peak_{j}',
                'distance': float(distance),
                'coordinates': [peak1['centroid'], peak2['centroid']]
            })
    
    # Analyze peak to ridge relationships
    for i, peak in enumerate(peaks):
        for j, ridge in enumerate(ridges):
            distance = np.sqrt(
                (peak['centroid'][0] - ridge['centroid'][0])**2 + 
                (peak['centroid'][1] - ridge['centroid'][1])**2
            )
            relationships.append({
                'type': 'peak_to_ridge',
                'feature1': f'peak_{i}',
                'feature2': f'ridge_{j}',
                'distance': float(distance),
                'coordinates': [peak['centroid'], ridge['centroid']]
            })
    
    return relationships

def create_structural_hierarchy_map(features, image_shape):
    """Create a hierarchical map of terrain features"""
    hierarchy = {
        'primary_features': [],
        'secondary_features': [],
        'micro_features': [],
        'coverage_analysis': {}
    }
    
    total_pixels = image_shape[0] * image_shape[1]
    
    # Classify features by importance/size
    all_features = features['peaks'] + features['ridges'] + features['secondary_contours']
    
    for feature in all_features:
        area_percentage = (feature['area'] / total_pixels) * 100
        
        if area_percentage > 0.5:  # Large features (>0.5% of image)
            hierarchy['primary_features'].append({
                **feature,
                'importance': 'primary',
                'area_percentage': area_percentage
            })
        elif area_percentage > 0.1:  # Medium features (0.1-0.5% of image)
            hierarchy['secondary_features'].append({
                **feature,
                'importance': 'secondary',
                'area_percentage': area_percentage
            })
        else:  # Small features (<0.1% of image)
            hierarchy['micro_features'].append({
                **feature,
                'importance': 'micro',
                'area_percentage': area_percentage
            })
    
    # Calculate coverage statistics
    hierarchy['coverage_analysis'] = {
        'primary_feature_count': len(hierarchy['primary_features']),
        'secondary_feature_count': len(hierarchy['secondary_features']),
        'micro_feature_count': len(hierarchy['micro_features']),
        'total_features': len(all_features),
        'primary_coverage_percent': sum(f['area_percentage'] for f in hierarchy['primary_features']),
        'secondary_coverage_percent': sum(f['area_percentage'] for f in hierarchy['secondary_features']),
        'micro_coverage_percent': sum(f['area_percentage'] for f in hierarchy['micro_features'])
    }
    
    return hierarchy

def create_feature_overlay_visualization(image, features, output_file='feature_overlay.png'):
    """Create a visualization overlaying identified features on the original image"""
    # Create a copy of the original image
    overlay_image = image.copy()
    draw = ImageDraw.Draw(overlay_image)
    
    # Define colors for different feature types
    colors = {
        'peak': (255, 0, 0, 128),      # Red for peaks
        'ridge': (0, 255, 0, 128),     # Green for ridges
        'secondary_contour': (0, 0, 255, 128)  # Blue for secondary contours
    }
    
    # Draw peaks
    for i, peak in enumerate(features['peaks']):
        centroid = peak['centroid']
        # Draw circle around peak
        draw.ellipse([centroid[0]-20, centroid[1]-20, centroid[0]+20, centroid[1]+20], 
                     outline='red', width=3)
        draw.text((centroid[0]+25, centroid[1]), f'P{i+1}', fill='red')
    
    # Draw ridges
    for i, ridge in enumerate(features['ridges']):
        centroid = ridge['centroid']
        # Draw rectangle around ridge
        draw.rectangle([centroid[0]-15, centroid[1]-15, centroid[0]+15, centroid[1]+15], 
                      outline='green', width=3)
        draw.text((centroid[0]+20, centroid[1]), f'R{i+1}', fill='green')
    
    # Draw secondary contours
    for i, contour in enumerate(features['secondary_contours'][:10]):  # Limit to first 10
        centroid = contour['centroid']
        # Draw small circle
        draw.ellipse([centroid[0]-5, centroid[1]-5, centroid[0]+5, centroid[1]+5], 
                     outline='blue', width=2)
    
    overlay_image.save(output_file)
    return output_file

def save_structural_analysis_results(results, output_file='structural_analysis_results.json'):
    """Save all structural analysis results to JSON"""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, cls=NumpyEncoder)

def main():
    """Main structural analysis function"""
    image_path = 'target_design.png'
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return
    
    print("Starting structural analysis for terrain features...")
    print("="*60)
    
    # Load and preprocess image
    print("Loading and preprocessing image...")
    image, image_array, gray = load_and_preprocess_image(image_path)
    
    # Detect contour lines
    print("Detecting contour lines...")
    contours, edges = detect_contour_lines(image_array, gray)
    
    # Identify terrain features
    print("Identifying terrain features...")
    features = identify_terrain_features(image_array, contours)
    
    # Analyze contour density
    print("Analyzing contour density patterns...")
    density_stats = analyze_contour_density(image_array, contours)
    
    # Analyze line thickness
    print("Analyzing line thickness variations...")
    thickness_stats = analyze_line_thickness(image_array, edges)
    
    # Document spatial relationships
    print("Documenting spatial relationships...")
    relationships = document_spatial_relationships(features)
    
    # Create structural hierarchy map
    print("Creating structural hierarchy map...")
    hierarchy = create_structural_hierarchy_map(features, image_array.shape)
    
    # Create feature overlay visualization
    print("Creating feature overlay visualization...")
    overlay_file = create_feature_overlay_visualization(image, features)
    
    # Compile all results
    results = {
        'image_properties': {
            'width': image_array.shape[1],
            'height': image_array.shape[0],
            'channels': image_array.shape[2] if len(image_array.shape) > 2 else 1
        },
        'terrain_features': features,
        'density_analysis': density_stats,
        'thickness_analysis': thickness_stats,
        'spatial_relationships': relationships,
        'structural_hierarchy': hierarchy,
        'analysis_summary': {
            'total_contours_detected': len(contours),
            'major_features_identified': len(features['peaks']) + len(features['ridges']),
            'secondary_features_identified': len(features['secondary_contours']),
            'coverage_percentage': hierarchy['coverage_analysis']['primary_coverage_percent'] + 
                                 hierarchy['coverage_analysis']['secondary_coverage_percent']
        }
    }
    
    # Save results
    print("Saving structural analysis results...")
    save_structural_analysis_results(results)
    
    # Print summary
    print("\n" + "="*60)
    print("STRUCTURAL ANALYSIS SUMMARY - STEP 1.2")
    print("="*60)
    
    print(f"\nTerrain Features Identified:")
    print(f"  Peaks: {len(features['peaks'])}")
    print(f"  Ridges: {len(features['ridges'])}")
    print(f"  Secondary Contours: {len(features['secondary_contours'])}")
    print(f"  Total Major Features: {len(features['peaks']) + len(features['ridges'])}")
    
    print(f"\nContour Analysis:")
    print(f"  Total Contours Detected: {len(contours)}")
    print(f"  Average Density: {density_stats['mean_density']:.2f} contours per grid cell")
    print(f"  Maximum Density: {density_stats['max_density']:.0f} contours per grid cell")
    
    print(f"\nLine Thickness Analysis:")
    print(f"  Mean Thickness: {thickness_stats['mean_thickness']:.2f} pixels")
    print(f"  Max Thickness: {thickness_stats['max_thickness']:.2f} pixels")
    print(f"  Thickness Variation: {thickness_stats['std_thickness']:.2f} pixels")
    
    print(f"\nSpatial Relationships:")
    print(f"  Feature Relationships Documented: {len(relationships)}")
    
    print(f"\nCoverage Analysis:")
    coverage = hierarchy['coverage_analysis']
    print(f"  Primary Features Coverage: {coverage['primary_coverage_percent']:.2f}%")
    print(f"  Secondary Features Coverage: {coverage['secondary_coverage_percent']:.2f}%")
    print(f"  Total Mapped Coverage: {coverage['primary_coverage_percent'] + coverage['secondary_coverage_percent']:.2f}%")
    
    print(f"\nFiles Generated:")
    print(f"  📄 Analysis Results: structural_analysis_results.json")
    print(f"  🎨 Feature Overlay: {overlay_file}")
    
    print(f"\n✅ STEP 1.2 QA CHECKPOINT:")
    print("  ✓ Major terrain features identified")
    print("  ✓ Contour line density patterns mapped") 
    print("  ✓ Line thickness variations analyzed")
    print("  ✓ Spatial relationships documented")
    print("  ✓ Structural hierarchy map created")
    print("  ✓ Feature overlay visualization generated")
    
    coverage_percent = coverage['primary_coverage_percent'] + coverage['secondary_coverage_percent']
    if coverage_percent >= 90:
        print(f"  ✓ Coverage requirement met: {coverage_percent:.1f}% >= 90%")
    else:
        print(f"  ⚠ Coverage below target: {coverage_percent:.1f}% < 90%")
    
    print(f"\n🎯 Next Step: Proceed to Step 1.3 - Component Categorization")
    print("    Use identified features to create component layer breakdown")

if __name__ == "__main__":
    main() 