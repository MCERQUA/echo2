"""
Basic Blender Python Operations Example
======================================

This file demonstrates fundamental Blender Python (bpy) operations
that can be used as building blocks for more complex scripts.

Usage: 
1. Open Blender
2. Go to Scripting workspace
3. Open this file or paste contents into the text editor
4. Run the script (Alt+P or Run Script button)

Author: Echo Systems
Date: March 20, 2025
"""

import bpy
import bmesh
import math
import random
from mathutils import Vector

# --------------------------------------------------------
# 1. SCENE MANAGEMENT
# --------------------------------------------------------

def clear_scene():
    """Remove all objects from the scene"""
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    # Delete selected objects
    bpy.ops.object.delete()
    
    # Also remove all materials
    for material in bpy.data.materials:
        bpy.data.materials.remove(material)
        
    # Clear all collections except the default "Collection"
    for collection in bpy.data.collections:
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
            
    print("Scene cleared.")

# --------------------------------------------------------
# 2. OBJECT CREATION AND MANIPULATION
# --------------------------------------------------------

def create_basic_objects():
    """Create basic primitive objects in the scene"""
    
    # Create a cube
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
    cube = bpy.context.active_object
    cube.name = "Example_Cube"
    
    # Create a sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(3, 0, 0), segments=32, ring_count=16)
    sphere = bpy.context.active_object
    sphere.name = "Example_Sphere"
    
    # Create a cylinder
    bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=2, location=(-3, 0, 0), vertices=32)
    cylinder = bpy.context.active_object
    cylinder.name = "Example_Cylinder"
    
    # Create a plane
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, -3, 0))
    plane = bpy.context.active_object
    plane.name = "Example_Plane"
    
    print("Basic objects created.")
    
    return {'cube': cube, 'sphere': sphere, 'cylinder': cylinder, 'plane': plane}

def transform_objects(objects):
    """Apply various transformations to objects"""
    
    # Scale the cube
    objects['cube'].scale = (1.0, 0.5, 2.0)
    
    # Rotate the sphere
    objects['sphere'].rotation_euler = (math.radians(45), 0, math.radians(45))
    
    # Move the cylinder up
    objects['cylinder'].location.z += 1.5
    
    # Apply transformations
    for obj in objects.values():
        # Select the object
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # Apply transformations
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    print("Transformations applied.")

# --------------------------------------------------------
# 3. MESH EDITING
# --------------------------------------------------------

def edit_mesh(obj):
    """Demonstrate mesh editing with bmesh"""
    
    # Ensure the object is a mesh
    if obj.type != 'MESH':
        print(f"Object {obj.name} is not a mesh.")
        return
    
    # Create a bmesh from the mesh
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    
    # Perform edits (extrude the top face)
    # Get the top face (assuming z-normal)
    top_face = None
    for face in bm.faces:
        if face.normal.z > 0.9:  # Approximately facing up
            top_face = face
            break
    
    if top_face:
        # Extrude the top face
        result = bmesh.ops.extrude_face_region(bm, geom=[top_face])
        extruded_faces = [f for f in result['geom'] if isinstance(f, bmesh.types.BMFace)]
        
        # Move the extrusion upward
        bmesh.ops.translate(
            bm,
            vec=Vector((0, 0, 1.0)),
            verts=[v for v in result['geom'] if isinstance(v, bmesh.types.BMVert)]
        )
    
    # Update the mesh
    bm.to_mesh(me)
    me.update()
    bm.free()
    
    print(f"Mesh editing completed on {obj.name}.")

# --------------------------------------------------------
# 4. MATERIAL CREATION
# --------------------------------------------------------

def create_materials():
    """Create some example materials"""
    
    # Create a red material
    red_mat = bpy.data.materials.new(name="Red_Material")
    red_mat.use_nodes = True
    nodes = red_mat.node_tree.nodes
    
    # Set the color of the principled BSDF shader
    principled = nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (1.0, 0.0, 0.0, 1.0)
    
    # Create a blue glass material
    glass_mat = bpy.data.materials.new(name="Blue_Glass")
    glass_mat.use_nodes = True
    nodes = glass_mat.node_tree.nodes
    
    # Set up glass properties
    principled = nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (0.0, 0.5, 1.0, 1.0)
        principled.inputs["Metallic"].default_value = 0.0
        principled.inputs["Roughness"].default_value = 0.0
        principled.inputs["Transmission"].default_value = 0.9
        principled.inputs["IOR"].default_value = 1.45
    
    # Create a metal material
    metal_mat = bpy.data.materials.new(name="Gold_Metal")
    metal_mat.use_nodes = True
    nodes = metal_mat.node_tree.nodes
    
    # Set up metal properties
    principled = nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (1.0, 0.8, 0.0, 1.0)
        principled.inputs["Metallic"].default_value = 1.0
        principled.inputs["Roughness"].default_value = 0.2
    
    print("Materials created.")
    
    return {'red': red_mat, 'glass': glass_mat, 'metal': metal_mat}

def assign_materials(objects, materials):
    """Assign materials to objects"""
    
    # Assign red material to the cube
    if 'cube' in objects and 'red' in materials:
        objects['cube'].data.materials.clear()
        objects['cube'].data.materials.append(materials['red'])
    
    # Assign glass material to the sphere
    if 'sphere' in objects and 'glass' in materials:
        objects['sphere'].data.materials.clear()
        objects['sphere'].data.materials.append(materials['glass'])
    
    # Assign metal material to the cylinder
    if 'cylinder' in objects and 'metal' in materials:
        objects['cylinder'].data.materials.clear()
        objects['cylinder'].data.materials.append(materials['metal'])
    
    print("Materials assigned.")

# --------------------------------------------------------
# 5. ANIMATION
# --------------------------------------------------------

def create_animation(objects, frames=60):
    """Create a simple rotation animation"""
    
    # Set animation length
    bpy.context.scene.frame_end = frames
    
    for obj_name, obj in objects.items():
        # Skip the plane
        if obj_name == 'plane':
            continue
            
        # Set initial location keyframe at frame 1
        bpy.context.scene.frame_set(1)
        obj.location.z += 0
        obj.keyframe_insert(data_path="location", index=2)
        
        # Set mid animation keyframe at frame frames/2
        bpy.context.scene.frame_set(frames // 2)
        obj.location.z += 2
        obj.keyframe_insert(data_path="location", index=2)
        
        # Set final keyframe at frame frames
        bpy.context.scene.frame_set(frames)
        obj.location.z = obj.location.z - 2  # Back to start
        obj.keyframe_insert(data_path="location", index=2)
        
        # Add rotation animation
        bpy.context.scene.frame_set(1)
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler")
        
        bpy.context.scene.frame_set(frames)
        obj.rotation_euler = (0, 0, math.radians(360))
        obj.keyframe_insert(data_path="rotation_euler")
        
        # Make the animation loop
        for fcurve in obj.animation_data.action.fcurves:
            for keyframe in fcurve.keyframe_points:
                keyframe.interpolation = 'LINEAR'
    
    # Set frame back to 1
    bpy.context.scene.frame_set(1)
    
    print("Animation created.")

# --------------------------------------------------------
# 6. RENDERING SETUP
# --------------------------------------------------------

def setup_rendering():
    """Set up basic rendering parameters"""
    
    # Set render engine to Cycles
    bpy.context.scene.render.engine = 'CYCLES'
    
    # Set samples
    bpy.context.scene.cycles.samples = 64
    
    # Set output resolution
    bpy.context.scene.render.resolution_x = 1920
    bpy.context.scene.render.resolution_y = 1080
    
    # Create a camera
    bpy.ops.object.camera_add(location=(10, -10, 10))
    camera = bpy.context.active_object
    
    # Point camera at the origin
    bpy.ops.object.empty_add(location=(0, 0, 0))
    target = bpy.context.active_object
    target.name = "Camera_Target"
    
    constraint = camera.constraints.new('TRACK_TO')
    constraint.target = target
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    # Create a light
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    light = bpy.context.active_object
    light.data.energy = 2.0
    
    print("Rendering setup completed.")

# --------------------------------------------------------
# MAIN EXECUTION
# --------------------------------------------------------

def main():
    """Execute all example functions"""
    
    print("\n--- Starting Blender Python Example Script ---\n")
    
    # Clear the scene
    clear_scene()
    
    # Create objects
    objects = create_basic_objects()
    
    # Transform objects
    transform_objects(objects)
    
    # Edit the cube mesh
    edit_mesh(objects['cube'])
    
    # Create and assign materials
    materials = create_materials()
    assign_materials(objects, materials)
    
    # Create animation
    create_animation(objects)
    
    # Setup rendering
    setup_rendering()
    
    print("\n--- Blender Python Example Script Completed ---\n")

# Run the main function
if __name__ == "__main__":
    main()
