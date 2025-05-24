# Procedural Geometry and Mathematical Modeling in Blender

This document collects resources for creating precise, mathematically-defined shapes and structures in Blender, focusing on procedural generation techniques rather than manual modeling.

## Mathematical Foundations

### Parametric Equations Resources

Parametric equations define shapes by expressing coordinates as functions of one or more parameters, allowing precise control over complex geometry.

1. **Essential Parametric Equation References:**
   - [Paul Bourke's Surfaces Collection](http://paulbourke.net/geometry/): Comprehensive library of parametric surfaces with equations
   - ["Geometric Models" by Keenan Crane](https://www.cs.cmu.edu/~kmcrane/Projects/ModelRepository/): High-quality geometric models with mathematical descriptions
   - ["The Algorithmic Beauty of Plants" (L-systems)](http://algorithmicbotany.org/papers/abop/abop.pdf): Mathematical approach to procedural plant generation

2. **Common Parametric Surfaces:**
   ```python
   # Torus
   def torus_point(u, v, R, r):
       # R = major radius, r = minor radius
       x = (R + r * math.cos(v)) * math.cos(u)
       y = (R + r * math.cos(v)) * math.sin(u)
       z = r * math.sin(v)
       return (x, y, z)
   
   # Helicoid
   def helicoid_point(u, v, a):
       x = u * math.cos(v)
       y = u * math.sin(v)
       z = a * v
       return (x, y, z)
   
   # Mobius Strip
   def mobius_point(u, v, R, a):
       # u = angle around strip, v = distance from center
       x = (R + v/2 * math.cos(u/2)) * math.cos(u)
       y = (R + v/2 * math.cos(u/2)) * math.sin(u)
       z = v/2 * math.sin(u/2)
       return (x, y, z)
   ```

### Computational Geometry Concepts

1. **Key Techniques:**
   - **Subdivision Surfaces:** Iterative refinement methods
   - **Voronoi Diagrams:** Space partitioning based on distance to points
   - **Delaunay Triangulation:** Optimizing mesh triangulation
   - **Marching Cubes:** Converting implicit surfaces to meshes
   - **Constructive Solid Geometry (CSG):** Boolean operations on volumes

2. **Mesh Processing Operations:**
   - Decimation (reducing vertex count while preserving shape)
   - Remeshing (recalculating mesh topology)
   - Smoothing algorithms
   - Offset surfaces (parallel surfaces at distance)

## Blender-Specific Implementation

### Procedural Mesh Creation in Blender Python

1. **BMesh Module Approach:**
   ```python
   import bpy
   import bmesh
   import math
   
   def create_parametric_surface(surface_function, u_range, v_range, u_steps, v_steps):
       # Create a new mesh and bmesh
       mesh = bpy.data.meshes.new("ParametricSurface")
       bm = bmesh.new()
       
       # Create vertices grid
       vertices = []
       for i in range(u_steps + 1):
           u = u_range[0] + i * (u_range[1] - u_range[0]) / u_steps
           for j in range(v_steps + 1):
               v = v_range[0] + j * (v_range[1] - v_range[0]) / v_steps
               # Calculate point using the parametric function
               point = surface_function(u, v)
               # Add vertex to bmesh
               vertices.append(bm.verts.new(point))
       
       # Create faces from the grid
       for i in range(u_steps):
           for j in range(v_steps):
               v1 = vertices[i * (v_steps + 1) + j]
               v2 = vertices[i * (v_steps + 1) + j + 1]
               v3 = vertices[(i + 1) * (v_steps + 1) + j + 1]
               v4 = vertices[(i + 1) * (v_steps + 1) + j]
               bm.faces.new([v1, v2, v3, v4])
       
       # Update the mesh and create object
       bm.to_mesh(mesh)
       mesh.update()
       bm.free()
       
       # Create object with the mesh
       obj = bpy.data.objects.new("ParametricSurface", mesh)
       bpy.context.collection.objects.link(obj)
       return obj
   ```

2. **Numpy-Based Efficient Implementation:**
   ```python
   import bpy
   import numpy as np
   import math
   
   def create_parametric_surface_numpy(surface_function, u_range, v_range, u_steps, v_steps):
       # Create mesh and object
       mesh = bpy.data.meshes.new("ParametricSurface")
       obj = bpy.data.objects.new("ParametricSurface", mesh)
       bpy.context.collection.objects.link(obj)
       
       # Generate parameter grids
       u = np.linspace(u_range[0], u_range[1], u_steps + 1)
       v = np.linspace(v_range[0], v_range[1], v_steps + 1)
       
       # Create vertices array
       vertices = []
       for u_val in u:
           for v_val in v:
               point = surface_function(u_val, v_val)
               vertices.append(point)
       
       # Create faces
       faces = []
       for i in range(u_steps):
           for j in range(v_steps):
               idx1 = i * (v_steps + 1) + j
               idx2 = i * (v_steps + 1) + j + 1
               idx3 = (i + 1) * (v_steps + 1) + j + 1
               idx4 = (i + 1) * (v_steps + 1) + j
               faces.append([idx1, idx2, idx3, idx4])
       
       # Create the mesh
       mesh.from_pydata(vertices, [], faces)
       mesh.update()
       
       return obj
   ```

### Notable Blender Add-ons for Procedural Geometry

1. **Built-in Tools:**
   - **Extra Objects Add-on:** Mathematical surfaces, regular solids
   - **Add Mesh: Extra Objects:** Parametric shapes and curves
   - **Geometry Nodes:** Node-based procedural modeling (Blender 2.92+)

2. **External Add-ons:**
   - [**Animation Nodes**](https://github.com/JacquesLucke/animation_nodes): Node-based procedural system
   - [**Tissue**](https://github.com/alessandro-zomparelli/tissue): Advanced tessellation tools
   - [**Sorcar**](https://github.com/aachman98/Sorcar): Node-based procedural modeling
   - [**MESHmachine**](https://gumroad.com/l/MESHmachine): Advanced mesh operations
   - [**BY-GEN**](https://gumroad.com/l/BY-GEN): Procedural architecture

## Architectural and Organic Forms

### Architectural Geometry

1. **Procedural Buildings:**
   - [**Building Tools**](https://github.com/ranjian0/building_tools): Procedural architecture
   - **Floor plan to 3D generation techniques**
   - **Modular building systems**
   - **Façade generation algorithms**

2. **Mathematical Patterns in Architecture:**
   - **Islamic geometric patterns**
   - **Parametric facades**
   - **Tessellation and space-filling patterns**
   - **Structurally optimized forms (minimal surfaces, etc.)**

### Organic and Natural Forms

1. **L-systems for Plants and Trees:**
   ```python
   # L-system implementation (simplified)
   def apply_rules(axiom, rules, iterations):
       result = axiom
       for _ in range(iterations):
           new_result = ""
           for char in result:
               new_result += rules.get(char, char)
           result = new_result
       return result
   
   # Example: Koch curve
   axiom = "F"
   rules = {"F": "F+F-F-F+F"}
   result = apply_rules(axiom, rules, 3)
   ```

2. **Terrain Generation:**
   - **Fractal noise (Perlin, Simplex, etc.)**
   - **Hydraulic erosion simulation**
   - **Terrain sculpting algorithms**

3. **Animal and Human Forms:**
   - **Anatomical proportions and relationships**
   - **Joint systems and constraints**
   - **Muscle deformation models**

## Advanced Mathematical Concepts

### Fractals and Recursion

1. **Fractal Types:**
   - **Mandelbrot and Julia sets**
   - **Sierpinski Triangle/Gasket**
   - **Menger Sponge**
   - **Dragon Curves**
   - **Terrain-generating fractals**

2. **Implementation Techniques:**
   ```python
   # Recursive Sierpinski Triangle (3D)
   def sierpinski_tetrahedron(vertices, depth):
       if depth == 0:
           # Create tetrahedron from vertices
           return create_tetrahedron(vertices)
       else:
           # Find midpoints
           midpoints = []
           for i in range(4):
               for j in range(i+1, 4):
                   midpoints.append((
                       (vertices[i][0] + vertices[j][0]) / 2,
                       (vertices[i][1] + vertices[j][1]) / 2,
                       (vertices[i][2] + vertices[j][2]) / 2
                   ))
           
           # Recursive calls for smaller tetrahedra
           results = []
           # Define four new tetrahedra at corners
           # (Implementation simplified for clarity)
           return results
   ```

### Non-Euclidean and Higher-Dimensional Geometry

1. **Projections from Higher Dimensions:**
   - **Hypercube (Tesseract) projections**
   - **3D cross-sections of 4D objects**

2. **Curved Space Representation:**
   - **Hyperbolic and spherical geometries**
   - **Minimal surfaces**
   - **Differential geometry concepts**

## Optimization and Performance

1. **Mesh Optimization Techniques:**
   - **Level of detail (LOD) systems**
   - **Instancing for repeated structures**
   - **Avoiding n-gons for better topology**
   - **Quad-dominant mesh patterns**

2. **Computational Efficiency:**
   - **Using NumPy for vector operations**
   - **Caching intermediate results**
   - **Preview modes with reduced resolution**
   - **Progressive mesh generation**

## References and Learning Resources

1. **Books:**
   - "The Algorithmic Beauty of Plants" - Przemyslaw Prusinkiewicz & Aristid Lindenmayer
   - "Computational Geometry: Algorithms and Applications" - Mark de Berg
   - "Real-Time Collision Detection" - Christer Ericson
   - "Generative Design" - Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni

2. **Online Courses:**
   - [Computational Design Course (edX)](https://www.edx.org/course/computational-design-for-digital-fabrication)
   - [Grasshopper Fundamentals](https://www.lynda.com/Grasshopper-tutorials/Grasshopper-Fundamentals/174491-2.html)
   - [Coding Math (YouTube)](https://www.youtube.com/user/codingmath)

3. **Research Papers:**
   - "Subdivision Surfaces in Character Animation" - DeRose, Kass, Truong
   - "Generalized Cylinders from Parallel Transport" - Hanson, Ma
   - "Implicit Surfaces that Interpolate" - Greg Turk, James O'Brien

---

This document will be expanded with additional implementation examples and resources as they are discovered or developed.
