/**
 * A 2D Camera component for the ECS system
 * This provides view transformations for rendering entities
 */

// Camera component to handle view transformations
ECS.CameraComponent = ECS.Component.extend({    
    ctor: function(entityId) {
        this._super(entityId);
        this.viewMatrix = new glm.mat4(1); // Identity matrix
        this.projectionMatrix = new glm.mat4(1); // Identity matrix for 2D
        this.combined = new glm.mat4(1); // Combined view and projection
        this.viewportSize = new glm.vec2(
            cc.winSize.width,
            cc.winSize.height
        );
        this.zoom = 1.0;
        this.near = 0.1;
        this.far = 1000.0;
        this.active = true;
        this._needsUpdate = true;
        this.applyRotation = true; // Whether to apply camera rotation to sprites
        
        // Follow properties
        this._followTarget = null;
        this._smoothFollow = false;
        this._smoothSpeed = 5;
        this.up = new glm.vec3(0, -1, 0); // Y is up
    },

    _name: function() {
        return "CameraComponent";
    },
    
    awake: function() {
        // Log.debug("CameraComponent: Awake");
        
        // Get the transform component
        this.transform = this.getComponent("TransformComponent");
        if (!this.transform) {
            throw new Error("CameraComponent requires a TransformComponent");
        }
        
        // Initialize matrices
        this.updateMatrices();
        
        // Set as global camera if no other camera is active
        if (!ECS.gI().camera) {
            this.setAsMain();
        }
    },
    
    start: function() {
        // Log.debug("CameraComponent: Start");
    },

    update: function(dt) {
        if (!this.transform) return;
        // Log.debug("Camera position: " + this.transform.position.x + ", " + this.transform.position.y + ", " + this.transform.position.z);
        // this.moveTo(this.transform.position.x + dt * 5, this.transform.position.y + dt*5, this.transform.position.z);
        // this.setZoom(this.zoom - dt * 0.1);

        // Handle follow functionality
        if (this._followTarget) {
            var targetPos = this._followTarget.getWorldPosition();
            
            if (this._smoothFollow) {
                // Smooth follow with lerp
                var currentPos = this.transform.position;
                var smoothSpeed = this._smoothSpeed * dt;
                
                // Calculate new position with lerp
                var newX = currentPos.x + (targetPos.x - currentPos.x) * smoothSpeed;
                var newY = currentPos.y + (targetPos.y - currentPos.y) * smoothSpeed;
                
                // Update camera position
                this.transform.setPosition(newX, newY, currentPos.z);
            } else {
                // Instant follow
                this.transform.setPosition(targetPos.x, targetPos.y, this.transform.position.z);
            }
        }
        
        // Update matrices if needed
        if (this._needsUpdate || this.transform._isDirty) {
            this.updateMatrices();
        }
    },
    
    /**
     * Update view and projection matrices
     */
    updateMatrices: function() {
        if (!this.transform) return;
        
        // Ensure transform matrix is up to date
        if (this.transform._isDirty) {
            this.transform.updateWorldMatrix();
        }
        
        // Calculate view matrix (inverse of transform's world matrix)
        var position = this.transform.getWorldPosition();   
        var lookAt = glm.add(position, new glm.vec3(0, 0, -1)); // Look along negative Z
        
        this.viewMatrix = glm.lookAt(position, lookAt, this.up);
        
        // For 2D: use orthographic projection
        var halfWidth = (this.viewportSize.x / this.zoom) * 0.5;
        var halfHeight = (this.viewportSize.y / this.zoom) * 0.5;
        
        this.projectionMatrix = glm.ortho(
            -halfWidth, halfWidth,
            -halfHeight, halfHeight,
            this.near, this.far
        );
        
        // Combine view and projection
        this.combined = glm.mul(this.projectionMatrix, this.viewMatrix);
        
        this._needsUpdate = false;
    },
    
    /**
     * Set this camera as the main camera (globally accessible)
     */
    setAsMain: function() {
        ECS.gI().camera = this;
        
        this.active = true;
        Log.debug("CameraComponent: Set as main camera");
    },
    
    /**
     * Set the zoom level
     * @param {number} zoom - Zoom factor (> 1 zooms in, < 1 zooms out)
     */
    setZoom: function(zoom) {
        if (zoom <= 0) {
            Log.warning("CameraComponent: Zoom must be positive, setting to 0.1");
            zoom = 0.1;
        }
        
        this.zoom = zoom;
        this._needsUpdate = true;
    },
    
    /**
     * Convert a world position to screen position
     * @param {glm.vec3} worldPos - Position in world space
     * @returns {glm.vec2} Position in screen space (pixels)
     */
    worldToScreenPoint: function(worldPos) {
        if (this._needsUpdate) {
            this.updateMatrices();
        }
        
        // Create homogeneous coordinate
        var worldVec4 = new glm.vec4(worldPos.x, worldPos.y, worldPos.z, 1.0);
        
        // Apply camera transformation
        var clipSpace = glm.mul(this.combined, worldVec4);
        
        // Perspective division (for completeness, although in 2D w should remain 1)
        var ndcSpace = new glm.vec3(
            clipSpace.x / clipSpace.w,
            clipSpace.y / clipSpace.w,
            clipSpace.z / clipSpace.w
        );
        
        // Convert NDC to screen space
        return new glm.vec2(
            ((ndcSpace.x + 1.0) * 0.5) * this.viewportSize.x,
            ((1.0 - ndcSpace.y) * 0.5) * this.viewportSize.y // Flip Y to match Cocos2d-x
        );
    },
    
    /**
     * Convert a screen position to world position (at z=0)
     * @param {glm.vec2} screenPos - Position in screen space (pixels)
     * @returns {glm.vec3} Position in world space (at z=0)
     */
    screenToWorldPoint: function(screenPos) {
        if (this._needsUpdate) {
            this.updateMatrices();
        }
        
        // Convert screen space to NDC
        var ndcX = (screenPos.x / this.viewportSize.x) * 2.0 - 1.0;
        var ndcY = 1.0 - (screenPos.y / this.viewportSize.y) * 2.0; // Flip Y to match Cocos2d-x
        
        // Create homogeneous NDC coordinate (assume z=0 for 2D)
        var ndcVec4 = new glm.vec4(ndcX, ndcY, 0.0, 1.0);
        
        // Invert the camera transformation
        var invMatrix = glm.inverse(this.combined);
        var worldVec4 = glm.multiply(invMatrix, ndcVec4);
        
        // Convert back to vec3 (dividing by w for completeness)
        return new glm.vec3(
            worldVec4.x / worldVec4.w,
            worldVec4.y / worldVec4.w,
            worldVec4.z / worldVec4.w
        );
    },
    
    /**
     * Resize the camera viewport
     * @param {number} width - Viewport width in pixels
     * @param {number} height - Viewport height in pixels
     */
    resize: function(width, height) {
        this.viewportSize.x = width;
        this.viewportSize.y = height;
        this._needsUpdate = true;
    },
    
    /**
     * Check if a world position is visible in the camera view
     * @param {glm.vec3} worldPos - Position in world space
     * @returns {boolean} True if the position is visible
     */    
    isVisible: function(worldPos) {
        var screenPos = this.worldToScreenPoint(worldPos);
        return (
            screenPos.x >= 0 && screenPos.x <= this.viewportSize.x &&
            screenPos.y >= 0 && screenPos.y <= this.viewportSize.y
        );
    },
    
    /**
     * Move the camera to a specific world position
     * @param {glm.vec3|number} x - World position X or vec3 position
     * @param {number} y - World position Y (optional if x is vec3)
     * @param {number} z - World position Z (optional if x is vec3)
     */
    moveTo: function(x, y, z) {
        if (!this.transform) return;
        
        if (x instanceof glm.vec3) {
            this.transform.setPosition(x.x, x.y, x.z);
        } else {
            z = z || 0;
            this.transform.setPosition(x, y, z);
        }

        // Mark the transform as dirty
        this.transform._isDirty = true;
        this._needsUpdate = true;

        // Update matrices after moving
        this.updateMatrices();
    },
    
    /**
     * Move the camera relative to its current position
     * @param {glm.vec3|number} x - Delta X or vec3 delta position
     * @param {number} y - Delta Y (optional if x is vec3)
     * @param {number} z - Delta Z (optional if x is vec3)
     */
    moveBy: function(x, y, z) {
        if (!this.transform) return;
        
        if (x instanceof glm.vec3) {
            this.transform.translate(x.x, x.y, x.z);
        } else {
            z = z || 0;
            this.transform.translate(x, y, z);
        }

        // Mark the transform as dirty
        this.transform._isDirty = true;
        this._needsUpdate = true;

        // Update matrices after moving
        this.updateMatrices();
    },
    
    /**
     * Set the camera to follow a specific transform component
     * @param {TransformComponent} transform - The transform to follow
     * @param {boolean} smooth - Whether to smooth follow (default: false)
     * @param {number} smoothSpeed - Speed of smooth following, lower is smoother (default: 5)
     */
    follow: function(transform, smooth, smoothSpeed) {
        this._followTarget = transform;
        this._smoothFollow = smooth || false;
        this._smoothSpeed = smoothSpeed || 5;
        
        // If not smooth, immediately move to target
        if (!this._smoothFollow && this._followTarget) {
            var targetPos = this._followTarget.getWorldPosition();
            this.transform.setPosition(targetPos.x, targetPos.y, this.transform.position.z);
        }
    },
    
    /**
     * Stop following a transform
     */
    stopFollowing: function() {
        this._followTarget = null;
    },
      /**
     * Get the camera frustum in world space coordinates
     * Useful for visibility culling of objects
     * @returns {Object} Frustum bounds {left, right, bottom, top, near, far}
     */
    getFrustum: function() {
        if (this._needsUpdate) {
            this.updateMatrices();
        }
        
        var halfWidth = (this.viewportSize.x / this.zoom) * 0.5;
        var halfHeight = (this.viewportSize.y / this.zoom) * 0.5;
        
        var position = this.transform.getWorldPosition();
        var rotation = this.transform.rotation.z;
        
        // Base frustum calculation (without rotation)
        var frustum = {
            left: position.x - halfWidth,
            right: position.x + halfWidth,
            bottom: position.y - halfHeight,
            top: position.y + halfHeight,
            near: this.near,
            far: this.far
        };
        
        // If we have rotation, we need to calculate the rotated corners
        // and then find the min/max bounds
        if (rotation !== 0 && this.applyRotation) {
            var rad = cc.degreesToRadians(rotation);
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);
            
            // Calculate the four corners of the frustum
            var corners = [
                { x: position.x - halfWidth, y: position.y - halfHeight }, // bottom-left
                { x: position.x + halfWidth, y: position.y - halfHeight }, // bottom-right
                { x: position.x + halfWidth, y: position.y + halfHeight }, // top-right
                { x: position.x - halfWidth, y: position.y + halfHeight }  // top-left
            ];
            
            // Rotate each corner around the camera position
            for (var i = 0; i < 4; i++) {
                var dx = corners[i].x - position.x;
                var dy = corners[i].y - position.y;
                
                corners[i].x = position.x + (dx * cos - dy * sin);
                corners[i].y = position.y + (dx * sin + dy * cos);
            }
            
            // Find the min/max bounds of the rotated corners
            var minX = Infinity, minY = Infinity;
            var maxX = -Infinity, maxY = -Infinity;
            
            for (var i = 0; i < 4; i++) {
                minX = Math.min(minX, corners[i].x);
                minY = Math.min(minY, corners[i].y);
                maxX = Math.max(maxX, corners[i].x);
                maxY = Math.max(maxY, corners[i].y);
            }
            
            // Update the frustum with the rotated bounds
            frustum.left = minX;
            frustum.right = maxX;
            frustum.bottom = minY;
            frustum.top = maxY;
        }
        
        return frustum;
    },
    
    /**
     * Check if a bounding box is visible in the camera frustum
     * @param {Object} aabb - Axis-aligned bounding box {min: glm.vec3, max: glm.vec3}
     * @returns {boolean} True if the box is visible
     */
    isBoxVisible: function(aabb, checkZ) {
        var frustum = this.getFrustum();
        
        // Check if the box is completely outside the frustum in X and Y
        if (aabb.max.x < frustum.left || aabb.min.x > frustum.right) return false;
        if (aabb.max.y < frustum.bottom || aabb.min.y > frustum.top) return false;
        
        // Only check Z if explicitly requested (for 3D objects in a 2D world)
        if (checkZ === true) {
            if (aabb.max.z < frustum.near || aabb.min.z > frustum.far) return false;
        }
        
        return true;
    },
      /**
     * Enable or disable camera rotation affecting sprites
     * @param {boolean} enable - Whether to apply camera rotation to sprites
     */
    enableRotation: function(enable) {
        this.applyRotation = enable === true;
    },
    
    /**
     * Check if an entity is visible in the camera view based on its bounds
     * @param {number} entityId - Entity ID to check
     * @param {number} margin - Optional extra margin to add around the entity (default: 0)
     * @returns {boolean} True if the entity is visible
     */
    isEntityVisible: function(entityId, margin) {
        // Default margin is 0
        margin = margin || 0;
        
        // Get the entity's transform component
        var transform = this.getEntityComponent(entityId, TransformComponent);
        if (!transform) return false;
        
        // Get the entity's sprite renderer for size information
        var renderer = this.getEntityComponent(entityId, SpriteRenderer);
        if (!renderer || !renderer.sprite) return false;
        
        // Get world position of the entity
        var worldPos = transform.getWorldPosition();
        
        // Get the content size of the sprite for bounds calculation
        var contentSize = renderer.sprite.getContentSize();
        var width = contentSize.width * transform.scale.x;
        var height = contentSize.height * transform.scale.y;
        
        // Create AABB for the entity (only 2D - xy plane)
        var aabb = {
            min: new glm.vec3(
                worldPos.x - (width/2) - margin,
                worldPos.y - (height/2) - margin,
                0  // We can just use 0 for 2D
            ),
            max: new glm.vec3(
                worldPos.x + (width/2) + margin,
                worldPos.y + (height/2) + margin,
                0  // We can just use 0 for 2D
            )
        };
        
        // Check if the AABB is visible in the frustum (without Z check)
        return this.isBoxVisible(aabb, false);
    },
    
    /**
     * Helper method to get a component from an entity
     * @param {number} entityId - Entity ID
     * @param {function} componentType - Component constructor to find
     * @returns {Object} The component or null if not found
     */
    getEntityComponent: function(entityId, componentType) {
        if (!ECS.gI().EntityManager) return null;
        return ECS.gI().EntityManager.getComponent(entityId, componentType);
    },

    setPosition: function(x, y, z) {
        this.transform.setPosition(x, y, z);

        this._needsUpdate = true;
        this.updateMatrices();
    },

    setRotation: function(x, y, z) {
        this.transform.setRotation(x, y, z);

        this._needsUpdate = true;
        this.updateMatrices();
    },

    setScale: function(x, y, z) {
        this.transform.setScale(x, y, z);

        this._needsUpdate = true;
        this.updateMatrices();
    },

    zoomBy: function(delta) {
        this.zoom += delta;
        this._needsUpdate = true;
        this.updateMatrices();
    },

    spin: function(degree) {
        // Convert degrees to radians
        var radians = cc.degreesToRadians(degree);
        
        // Create rotation matrix around Z-axis for 2D
        var rotMat = new glm.mat4(1.0); // Identity matrix
        rotMat = glm.rotate(rotMat, radians, new glm.vec3(0, 0, 1));
        
        // Get current position
        var position = this.transform.getWorldPosition();
        
        // Rotate the up vector
        var upVec4 = new glm.vec4(this.up.x, this.up.y, this.up.z, 0);
        upVec4 = glm.mul(rotMat, upVec4);
        this.up = glm.normalize(new glm.vec3(upVec4.x, upVec4.y, upVec4.z));
        let lookAt = glm.add(position, new glm.vec3(0, 0, -1));
        // Rotate the lookAt direction
        var lookDirection = glm.sub(lookAt, position);
        var lookVec4 = new glm.vec4(lookDirection.x, lookDirection.y, lookDirection.z, 0);
        lookVec4 = glm.mul(rotMat, lookVec4);
        this.lookAt = glm.add(position, new glm.vec3(lookVec4.x, lookVec4.y, lookVec4.z));
        
        // Mark for matrix update
        this._needsUpdate = true;
        this.updateMatrices();
    }
});