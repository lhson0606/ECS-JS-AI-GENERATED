/**
 * SpriteRenderer component for rendering sprites with GLM transform support
 */

ECS.SpriteRenderer = ECS.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.sprite = null;
        this.texturePath = "";
        this.anchor = new glm.vec2(0.5, 0.5); // Default anchor point (center)
        this.color = new glm.vec4(1, 1, 1, 1); // RGBA (white, fully opaque)
        this.visible = true;
        this.blendMode = null; // Use default Cocos blend mode
        this.zOrder = 0;
        this.useCamera = true; // Whether to apply camera transformations
        this.enableFrustumCulling = true; // Whether to use camera frustum culling
    },

    _name: function() {
        return "SpriteRenderer";
    },
    
    awake: function() {
        // Log.debug("SpriteRenderer: Awake");
    },
    
    start: function() {
        // Log.debug("SpriteRenderer: Start");
        
        // Get the transform component
        this.transform = this.getComponent("TransformComponent");
        if (!this.transform) {
            throw new Error("SpriteRenderer requires a TransformComponent");
        }
        
        // Create sprite if texture is set
        if (this.texturePath) {
            this.setTexture(this.texturePath);
        }
    },
    
    update: function(dt) {
        if (!this.sprite || !this.transform || !this.visible) return;
        
        // Ensure the transform's world matrix is up to date
        if (this.transform._isDirty) {
            this.transform.updateWorldMatrix();
        }
        
        // Extract world position from the transform
        var worldPos = this.transform.getWorldPosition();
        
        // Frustum culling - check if the entity is out of camera view
        if (this.useCamera && ECS.gI().camera && this.enableFrustumCulling) {
            // Create a simple bounding box for this entity
            var contentSize = this.sprite.getContentSize();
            var width = contentSize.width * this.transform.scale.x;
            var height = contentSize.height * this.transform.scale.y;
            
            var aabb = {
                min: new glm.vec3(
                    worldPos.x - (width/2),
                    worldPos.y - (height/2),
                    0
                ),
                max: new glm.vec3(
                    worldPos.x + (width/2),
                    worldPos.y + (height/2),
                    0
                )
            };
            
            // Check if the entity is visible in the camera frustum
            var isVisible = ECS.gI().camera.isBoxVisible(aabb);
            this.sprite.setVisible(isVisible);
            // if(!isVisible) {
            //     Log.debug("SpriteRenderer: Entity is not visible in camera frustum id: " + this.entityId);
            // }
            // If not visible, we can skip the rest of the update
            if (!isVisible) return;
        }
        if (this.useCamera && ECS.gI().camera) {
            // Log.debug("SpriteRenderer: Using camera for transformations");
            // Log.debug("Camera position: " + ECS.gI().camera.transform.position.x + ", " + ECS.gI().camera.transform.position.y);
            // Apply camera transformation to get screen position
            var screenPos = ECS.gI().camera.worldToScreenPoint(worldPos);
            // Log.debug("SpriteRenderer: Screen position: " + screenPos.x + ", " + screenPos.y);
            // Log.debug("SpriteRenderer: Screen position: " + screenPos.x + ", " + screenPos.y);
            // Update sprite position in screen space
            this.sprite.setPosition(screenPos.x + 50, screenPos.y);
            
            // Adjust scale based on camera zoom
            var scaleX = this.transform.scale.x * ECS.gI().camera.zoom;
            var scaleY = this.transform.scale.y * ECS.gI().camera.zoom;
            this.sprite.setScaleX(scaleX);
            this.sprite.setScaleY(scaleY);
            
            // Apply camera rotation if needed
            var finalRotation = this.transform.rotation.z;
            if (ECS.gI().camera.transform && ECS.gI().camera.applyRotation) {
                finalRotation -= ECS.gI().camera.transform.rotation.z;
            }
            this.sprite.setRotation(finalRotation);
        } else {
            // No camera, just use world position directly
            this.sprite.setPosition(worldPos.x, worldPos.y);
            
            // Update scale
            this.sprite.setScaleX(this.transform.scale.x);
            this.sprite.setScaleY(this.transform.scale.y);
            
            // Update rotation (in 2D we typically only use z-rotation)
            this.sprite.setRotation(this.transform.rotation.z);
        }
        
        // Set z-order based on z position
        if (this.sprite.getLocalZOrder() !== this.zOrder) {
            this.sprite.setLocalZOrder(this.zOrder);
        }
        
        // Update color and opacity
        var color = cc.color(
            Math.floor(this.color.r * 255),
            Math.floor(this.color.g * 255),
            Math.floor(this.color.b * 255)
        );
        
        this.sprite.setColor(color);
        this.sprite.setOpacity(Math.floor(this.color.a * 255));

        // this.sprite.setPosition(50, 50);
        // Log.debug("sprite: " + this.sprite);
        // Log sprite cocos sprite's position
        // Log.debug("SpriteRenderer: Sprite position: " + this.sprite.getPositionX() + ", " + this.sprite.getPositionY());
    },
    
    /**
     * Set the texture for the sprite
     * @param {string} texturePath - Path to the texture
     */
    setTexture: function(texturePath) {
        this.texturePath = texturePath;
        
        // Create sprite if it doesn't exist
        if (!this.sprite) {
            this.sprite = new cc.Sprite(texturePath);
            this.sprite.setAnchorPoint(this.anchor.x, this.anchor.y);
            
            // Add to scene with appropriate z-order
            ECS.gI().layer.addChild(this.sprite, this.zOrder);
            // cc.director.getRunningScene().addChild(this.sprite, this.zOrder);
            
            // Apply color and opacity
            this.updateColor();
            
            // Apply blend mode if set
            if (this.blendMode) {
                this.setBlendFunc(this.blendMode.src, this.blendMode.dst);
            }
        } else {
            // Update existing sprite's texture
            var texture = cc.textureCache.addImage(texturePath);
            this.sprite.setTexture(texture);
        }

        // this.sprite.setPosition(50, 50);
    },
    
    /**
     * Set sprite anchor point (0,0 is bottom left, 1,1 is top right)
     * @param {number} x - X anchor (0-1)
     * @param {number} y - Y anchor (0-1)
     */
    setAnchor: function(x, y) {
        // Log.debug("SpriteRenderer: Setting anchor point to " + x + ", " + y);
        this.anchor.x = x;
        this.anchor.y = y;
        
        if (this.sprite) {
            this.sprite.setAnchorPoint(x, y);
        }
    },
    
    /**
     * Set sprite color and opacity using RGBA values (0-1 range)
     * @param {number} r - Red (0-1)
     * @param {number} g - Green (0-1)
     * @param {number} b - Blue (0-1)
     * @param {number} a - Alpha (0-1)
     */
    setColor: function(r, g, b, a) {
        // Log.debug("SpriteRenderer: Setting color to " + r + ", " + g + ", " + b + ", " + a);
        a = (a !== undefined) ? a : this.color.a;
        
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        this.color.a = a;
        
        this.updateColor();
    },
    
    /**
     * Set opacity (alpha) only
     * @param {number} alpha - Alpha value (0-1)
     */
    setOpacity: function(alpha) {
        // Log.debug("SpriteRenderer: Setting opacity to " + alpha);
        this.color.a = alpha;
        
        if (this.sprite) {
            this.sprite.setOpacity(Math.floor(alpha * 255));
        }
    },
    
    /**
     * Update sprite color and opacity from the color vector
     */
    updateColor: function() {
        // Log.debug("SpriteRenderer: Updating color to " + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + this.color.a);
        if (!this.sprite) return;
        
        var color = cc.color(
            Math.floor(this.color.r * 255),
            Math.floor(this.color.g * 255),
            Math.floor(this.color.b * 255)
        );
        
        this.sprite.setColor(color);
        this.sprite.setOpacity(Math.floor(this.color.a * 255));
    },
    
    /**
     * Set z-order of the sprite
     * @param {number} zOrder - Z-order value
     */
    setZOrder: function(zOrder) {
        // Log.debug("SpriteRenderer: Setting z-order to " + zOrder);
        this.zOrder = zOrder;
        
        if (this.sprite) {
            this.sprite.setLocalZOrder(zOrder);
        }
    },
    
    /**
     * Set custom blend function
     * @param {number} src - Source blend factor
     * @param {number} dst - Destination blend factor
     */
    setBlendFunc: function(src, dst) {
        // Log.debug("SpriteRenderer: Setting blend function to src: " + src + ", dst: " + dst);
        this.blendMode = { src: src, dst: dst };
        
        if (this.sprite) {
            this.sprite.setBlendFunc(src, dst);
        }
    },
    
    /**
     * Set a normal additive blend mode (good for particles, glows, etc)
     */
    setAdditiveBlending: function() {
        // Log.debug("SpriteRenderer: Setting additive blending");
        this.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    },
    
    /**
     * Set the default alpha blend mode
     */
    setAlphaBlending: function() {
        // Log.debug("SpriteRenderer: Setting alpha blending");
        this.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
    },
    
    /**
     * Toggle sprite visibility
     * @param {boolean} visible - Whether the sprite should be visible
     */
    setVisible: function(visible) {
        // Log.debug("SpriteRenderer: Setting visibility to " + visible);
        this.visible = visible;
        
        if (this.sprite) {
            this.sprite.setVisible(visible);
        }
    },
    
    /**
     * Set whether to use camera transformations
     * @param {boolean} useCamera - Whether to apply camera transformations
     */
    setUseCamera: function(useCamera) {
        // Log.debug("SpriteRenderer: Setting useCamera to " + useCamera);
        if (useCamera) {
            // Check there is a camera component
            if (!ECS.gI().camera) {
                throw new Error("SpriteRenderer: No camera component found, but useCamera is set to true");
            }
        }
        this.useCamera = useCamera;
    },
    
    /**
     * Enable or disable frustum culling for this sprite
     * @param {boolean} enabled - Whether to use frustum culling 
     */
    setFrustumCulling: function(enabled) {
        // Log.debug("SpriteRenderer: Setting frustum culling to " + enabled);
        this.enableFrustumCulling = enabled === true;
    },
    
    /**
     * Set the sprite frame from a sprite sheet
     * @param {string} frameName - Name of the sprite frame
     */
    setSpriteFrame: function(frameName) {
        // Log.debug("SpriteRenderer: Setting sprite frame to " + frameName);
        var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
        if (frame) {
            if (!this.sprite) {
                this.sprite = new cc.Sprite(frame);
                this.sprite.setAnchorPoint(this.anchor.x, this.anchor.y);
                cc.director.getRunningScene().addChild(this.sprite, this.zOrder);
                this.updateColor();
            } else {
                this.sprite.setSpriteFrame(frame);
            }
        } else {
            Log.error("SpriteRenderer: Could not find sprite frame: " + frameName);
        }
    },
    
    destroy: function() {
        // Remove sprite from scene
        // Log.debug("SpriteRenderer: Destroying sprite");
        if (this.sprite) {
            this.sprite.removeFromParent(true);
            this.sprite = null;
        }
    }
});

