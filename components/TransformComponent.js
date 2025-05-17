/**
 * Transform component for position, rotation, and scale using GLM vectors
 */

var TransformComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.position = new glm.vec3(0, 0, 0);
        this.rotation = new glm.vec3(0, 0, 0); // x, y, z rotations in degrees
        this.scale = new glm.vec3(1, 1, 1);
        this.worldMatrix = new glm.mat4(1); // Identity matrix
        this._isDirty = true;
        this.parent = null;
        this.children = [];
    },
    
    awake: function() {
        Log.debug("TransformComponent: Awake - Using GLM vectors");
    },
    
    start: function() {
        Log.debug("TransformComponent: Start");
    },
    
    update: function(dt) {
        if (this._isDirty) {
            this.updateWorldMatrix();
        }
    },
    
    /**
     * Set the position using individual coordinates
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position (0 by default)
     */
    setPosition: function(x, y, z) {
        z = z || 0;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this._isDirty = true;
    },
    
    /**
     * Set the position using a GLM vector3
     * @param {glm.vec3} vec - Position vector
     */
    setPositionVec: function(vec) {
        this.position = vec.clone();
        this._isDirty = true;
    },
    
    /**
     * Set the rotation in degrees
     * @param {number} x - X rotation in degrees
     * @param {number} y - Y rotation in degrees
     * @param {number} z - Z rotation in degrees
     */
    setRotation: function(x, y, z) {
        z = z || 0;
        this.rotation.x = x;
        this.rotation.y = y;
        this.rotation.z = z;
        this._isDirty = true;
    },
    
    /**
     * Set the z-rotation (most common in 2D games)
     * @param {number} degrees - Rotation in degrees
     */
    setZRotation: function(degrees) {
        this.rotation.z = degrees;
        this._isDirty = true;
    },
    
    /**
     * Set the scale uniformly
     * @param {number} scale - Uniform scale factor
     */
    setScale: function(scale) {
        this.scale.x = scale;
        this.scale.y = scale;
        this.scale.z = scale;
        this._isDirty = true;
    },
    
    /**
     * Set the scale using individual values
     * @param {number} x - X scale
     * @param {number} y - Y scale
     * @param {number} z - Z scale (1 by default)
     */
    setScaleXYZ: function(x, y, z) {
        z = z || 1;
        this.scale.x = x;
        this.scale.y = y;
        this.scale.z = z;
        this._isDirty = true;
    },
    
    /**
     * Move the transform relative to its current position
     * @param {number} x - X delta
     * @param {number} y - Y delta
     * @param {number} z - Z delta
     */
    translate: function(x, y, z) {
        z = z || 0;
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
        this._isDirty = true;
    },
    
    /**
     * Rotate the transform relative to its current rotation
     * @param {number} x - X rotation delta in degrees
     * @param {number} y - Y rotation delta in degrees
     * @param {number} z - Z rotation delta in degrees
     */
    rotate: function(x, y, z) {
        z = z || 0;
        this.rotation.x += x;
        this.rotation.y += y;
        this.rotation.z += z;
        this._isDirty = true;
    },
    
    /**
     * Scale the transform relative to its current scale
     * @param {number} x - X scale factor
     * @param {number} y - Y scale factor
     * @param {number} z - Z scale factor
     */
    scaleBy: function(x, y, z) {
        z = z || 1;
        this.scale.x *= x;
        this.scale.y *= y;
        this.scale.z *= z;
        this._isDirty = true;
    },
    
    /**
     * Set parent-child relationship for hierarchical transforms
     * @param {TransformComponent} parent - Parent transform
     */
    setParent: function(parent) {
        if (this.parent) {
            // Remove from current parent
            var index = this.parent.children.indexOf(this);
            if (index !== -1) {
                this.parent.children.splice(index, 1);
            }
        }
        
        this.parent = parent;
        
        if (parent) {
            parent.children.push(this);
        }
        
        this._isDirty = true;
    },
    
    /**
     * Update the world transformation matrix
     */
    updateWorldMatrix: function() {
        // Start with identity matrix
        this.worldMatrix = new glm.mat4(1);
        
        // Apply transformations
        this.worldMatrix = glm.translate(this.worldMatrix, this.position);
        
        // Apply rotations (in order: X, Y, Z)
        if (this.rotation.x !== 0) {
            this.worldMatrix = glm.rotate(this.worldMatrix, glm.radians(this.rotation.x), new glm.vec3(1, 0, 0));
        }
        if (this.rotation.y !== 0) {
            this.worldMatrix = glm.rotate(this.worldMatrix, glm.radians(this.rotation.y), new glm.vec3(0, 1, 0));
        }
        if (this.rotation.z !== 0) {
            this.worldMatrix = glm.rotate(this.worldMatrix, glm.radians(this.rotation.z), new glm.vec3(0, 0, 1));
        }
        
        // Apply scale
        this.worldMatrix = glm.scale(this.worldMatrix, this.scale);
        
        // If has parent, multiply by parent's world matrix
        if (this.parent) {
            // Ensure parent's matrix is up to date
            if (this.parent._isDirty) {
                this.parent.updateWorldMatrix();
            }
            this.worldMatrix = glm.multiply(this.parent.worldMatrix, this.worldMatrix);
        }
        
        this._isDirty = false;
        
        // Mark all children as dirty
        for (var i = 0; i < this.children.length; i++) {
            this.children[i]._isDirty = true;
        }
    },
    
    /**
     * Get the world position (position after all parent transformations)
     * @returns {glm.vec3} World position
     */
    getWorldPosition: function() {
        if (this._isDirty) {
            this.updateWorldMatrix();
        }
        
        // Extract position from world matrix (column 3)
        return new glm.vec3(
            this.worldMatrix[3][0],
            this.worldMatrix[3][1],
            this.worldMatrix[3][2]
        );
    },
    
    /**
     * Convert a position from local space to world space
     * @param {glm.vec3} localPos - Position in local space
     * @returns {glm.vec3} Position in world space
     */
    localToWorldPosition: function(localPos) {
        if (this._isDirty) {
            this.updateWorldMatrix();
        }
        
        // Transform point
        var vec4 = new glm.vec4(localPos.x, localPos.y, localPos.z, 1.0);
        vec4 = glm.multiply(this.worldMatrix, vec4);
        
        return new glm.vec3(vec4.x, vec4.y, vec4.z);
    }
});
