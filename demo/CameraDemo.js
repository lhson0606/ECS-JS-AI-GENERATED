/**
 * A demo scene that shows how to use the ECS camera system
 */

var CameraDemo = cc.Scene.extend({
    ctor: function() {
        this._super();
        
        // Create entity manager
        this.entityManager = new gv.EntityManager();
        
        // Initialize entities and components
        this.initEntities();
    },
    
    onEnter: function() {
        this._super();
        
        // Schedule update to run the ECS system
        this.scheduleUpdate();
    },
    
    update: function(dt) {
        // Update all entities and components
        this.entityManager.update(dt);
        
        // Update debug info
        this.updateDebugInfo();
    },    initEntities: function() {
        // Create camera entity
        var cameraEntity = this.entityManager.createEntity();
        
        // Add transform component to the camera
        var cameraTransform = this.entityManager.addComponent(cameraEntity, TransformComponent);
        cameraTransform.setPosition(cc.winSize.width / 2, cc.winSize.height / 2, 10);
        
        // Add camera component
        var camera = this.entityManager.addComponent(cameraEntity, CameraComponent);
        
        // Create some example entities
        this.createBackgroundEntity();
        this.createPlayerEntity();
        this.createEnemyEntities();
        this.createHierarchicalEntities();
        
        // Set camera to follow player
        camera.follow(this.playerTransform, true, 3);
        
        // Create visual representation of frustum
        this.createFrustumVisualization();
        
        // Add UI information
        this.createUILabels();
        
        // Default frustum culling state
        this.frustumCullingEnabled = true;
    },
    
    createBackgroundEntity: function() {
        // Create a background entity that doesn't follow the camera
        var bgEntity = this.entityManager.createEntity();
        
        // Add transform
        var bgTransform = this.entityManager.addComponent(bgEntity, TransformComponent);
        bgTransform.setPosition(cc.winSize.width / 2, cc.winSize.height / 2, 0);
        
        // Add sprite renderer
        var bgSprite = this.entityManager.addComponent(bgEntity, SpriteRenderer);
        
        // Use a texture for the background
        bgSprite.setTexture("res/game/images/background.png");
        
        // Don't apply camera transformations to the background
        bgSprite.setUseCamera(false);
    },
    
    createPlayerEntity: function() {
        // Create the player entity
        var playerEntity = this.entityManager.createEntity();
        
        // Add transform
        this.playerTransform = this.entityManager.addComponent(playerEntity, TransformComponent);
        this.playerTransform.setPosition(cc.winSize.width / 2, cc.winSize.height / 2, 1);
        
        // Add sprite renderer
        var playerSprite = this.entityManager.addComponent(playerEntity, SpriteRenderer);
        playerSprite.setTexture("res/game/images/player.png");
        
        // Use higher z-order for the player
        playerSprite.setZOrder(10);
        
        // Store player entity ID
        this.playerEntityId = playerEntity;
        
        // Add keyboard control for demo
        this.addKeyboardControl();
    },
      createEnemyEntities: function() {
        // Create some enemy entities around the map
        for (var i = 0; i < 10; i++) {
            var enemyEntity = this.entityManager.createEntity();
            
            // Random position
            var x = Math.random() * cc.winSize.width * 2;
            var y = Math.random() * cc.winSize.height * 2;
            
            // Add transform
            var enemyTransform = this.entityManager.addComponent(enemyEntity, TransformComponent);
            enemyTransform.setPosition(x, y, 1);
            
            // Add sprite renderer
            var enemySprite = this.entityManager.addComponent(enemyEntity, SpriteRenderer);
            enemySprite.setTexture("res/game/images/enemy.png");
            
            // Use camera transformations and frustum culling
            enemySprite.setUseCamera(true);
            enemySprite.setFrustumCulling(true);
            
            // Store enemy entity ID
            this.enemyEntities = this.enemyEntities || [];
            this.enemyEntities.push(enemyEntity);
        }
        
        // Create a special enemy that ignores frustum culling (always visible)
        var specialEntity = this.entityManager.createEntity();
        var specialTransform = this.entityManager.addComponent(specialEntity, TransformComponent);
        specialTransform.setPosition(cc.winSize.width * 1.5, cc.winSize.height * 1.5, 1);
        
        var specialSprite = this.entityManager.addComponent(specialEntity, SpriteRenderer);
        specialSprite.setTexture("res/game/images/enemy.png");
        specialSprite.setUseCamera(true);
        specialSprite.setFrustumCulling(false); // No frustum culling
        specialSprite.setColor(1, 0, 0, 1); // Red color to differentiate
        
        this.specialEntity = specialEntity;
    },
    
    addKeyboardControl: function() {
        var self = this;
        
        // Add keyboard event listener for controlling the player
        var listener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                self.handleKeyPressed(keyCode);
            },
            onKeyReleased: function(keyCode, event) {
                // Handle key release if needed
            }
        });
        
        cc.eventManager.addListener(listener, this);
    },
      handleKeyPressed: function(keyCode) {
        // Get player transform
        var playerTransform = this.entityManager.getComponent(this.playerEntityId, TransformComponent);
        
        // Move speed
        var moveSpeed = 10;
        
        // Handle arrow keys for movement
        switch(keyCode) {
            case cc.KEY.left:
            case cc.KEY.a:
                playerTransform.translate(-moveSpeed, 0, 0);
                break;
            case cc.KEY.right:
            case cc.KEY.d:
                playerTransform.translate(moveSpeed, 0, 0);
                break;
            case cc.KEY.up:
            case cc.KEY.w:
                playerTransform.translate(0, moveSpeed, 0);
                break;
            case cc.KEY.down:
            case cc.KEY.s:
                playerTransform.translate(0, -moveSpeed, 0);
                break;
            case cc.KEY.plus:
            case cc.KEY.equal:
                // Zoom in
                if (gv.Camera) gv.Camera.setZoom(gv.Camera.zoom * 1.1);
                break;
            case cc.KEY.minus:
                // Zoom out
                if (gv.Camera) gv.Camera.setZoom(gv.Camera.zoom * 0.9);
                break;
            case cc.KEY.r:
                // Toggle camera rotation
                if (gv.Camera) {
                    gv.Camera.enableRotation(!gv.Camera.applyRotation);
                    
                    // Apply some rotation to the camera to demonstrate
                    if (gv.Camera.applyRotation) {
                        gv.Camera.transform.setZRotation(15); // 15 degrees rotation
                    } else {
                        gv.Camera.transform.setZRotation(0);
                    }
                }
                break;
            case cc.KEY.f:
                // Toggle frustum culling for all enemy entities
                if (this.enemyEntities) {
                    this.frustumCullingEnabled = !this.frustumCullingEnabled;
                    
                    for (var i = 0; i < this.enemyEntities.length; i++) {
                        var sprite = this.entityManager.getComponent(this.enemyEntities[i], SpriteRenderer);
                        if (sprite) {
                            sprite.setFrustumCulling(this.frustumCullingEnabled);
                        }
                    }
                    
                    // Update debug info immediately
                    this.updateDebugInfo();
                    
                    // Show feedback
                    var state = this.frustumCullingEnabled ? "enabled" : "disabled";
                    Log.debug("Frustum culling " + state);
                }
                break;
        }
    },
    
    /**
     * Update debug info to display how many entities are visible/culled
     */
    updateDebugInfo: function() {
        if (!this.enemyEntities) return;
        
        var visibleCount = 0;
        var totalCount = this.enemyEntities.length;
        
        // Count visible entities
        for (var i = 0; i < totalCount; i++) {
            var spriteRenderer = this.entityManager.getComponent(this.enemyEntities[i], SpriteRenderer);
            if (spriteRenderer && spriteRenderer.sprite && spriteRenderer.sprite.isVisible()) {
                visibleCount++;
            }
        }
        
        // Create or update debug label
        if (!this.debugLabel) {
            this.debugLabel = new cc.LabelTTF("", "Arial", 16);
            this.debugLabel.setPosition(cc.winSize.width - 150, cc.winSize.height - 20);
            this.addChild(this.debugLabel, 100);
            this.debugLabel.setColor(cc.color(255, 255, 0)); // Yellow
        }
        
        this.debugLabel.setString("Visible: " + visibleCount + " / " + totalCount);
    },
    
    /**
     * Create a visual representation of the camera frustum
     * This helps to visualize what's being culled
     */
    createFrustumVisualization: function() {
        // Get camera frustum
        if (!gv.Camera) return;
        
        // Create a draw node for the frustum visualization
        if (!this.frustumDrawNode) {
            this.frustumDrawNode = new cc.DrawNode();
            this.addChild(this.frustumDrawNode, 50);
        }
        
        // Schedule frustum visualization updates
        this.schedule(this.updateFrustumVisualization, 0.1);
    },
    
    /**
     * Update the visual representation of camera frustum
     */
    updateFrustumVisualization: function() {
        if (!gv.Camera || !this.frustumDrawNode) return;
        
        // Clear previous drawing
        this.frustumDrawNode.clear();
        
        // Get camera frustum
        var frustum = gv.Camera.getFrustum();
        
        // Convert frustum bounds to screen space
        var topLeft = gv.Camera.worldToScreenPoint(new glm.vec3(frustum.left, frustum.top, 0));
        var topRight = gv.Camera.worldToScreenPoint(new glm.vec3(frustum.right, frustum.top, 0));
        var bottomLeft = gv.Camera.worldToScreenPoint(new glm.vec3(frustum.left, frustum.bottom, 0));
        var bottomRight = gv.Camera.worldToScreenPoint(new glm.vec3(frustum.right, frustum.bottom, 0));
        
        // Draw frustum outline
        var green = cc.color(0, 255, 0, 128);
        var vertices = [
            cc.p(topLeft.x, topLeft.y),
            cc.p(topRight.x, topRight.y),
            cc.p(bottomRight.x, bottomRight.y),
            cc.p(bottomLeft.x, bottomLeft.y)
        ];
        
        this.frustumDrawNode.drawPoly(vertices, green, 2, green);
    },
    
    /**
     * Create UI labels for information display
     */
    createUILabels: function() {
        // Create label for camera information
        var infoText = "Camera Demo - Controls:\n" +
                      "WASD/Arrows: Move player\n" +
                      "+/-: Zoom in/out\n" +
                      "R: Toggle camera rotation\n" +
                      "F: Toggle frustum culling";
        
        var infoLabel = new cc.LabelTTF(infoText, "Arial", 14);
        infoLabel.setAnchorPoint(0, 1);
        infoLabel.setPosition(10, cc.winSize.height - 10);
        infoLabel.setColor(cc.color(255, 255, 0));
        this.addChild(infoLabel, 100);
        
        // Add information about the red special entity
        var specialText = "Red Entity: Always visible (no frustum culling)";
        var specialLabel = new cc.LabelTTF(specialText, "Arial", 14);
        specialLabel.setAnchorPoint(0, 1);
        specialLabel.setPosition(10, cc.winSize.height - 80);
        specialLabel.setColor(cc.color(255, 100, 100));
        this.addChild(specialLabel, 100);
    },
    
    /**
     * Create a parent-child hierarchy of entities to test transforms
     */
    createHierarchicalEntities: function() {
        // Create parent entity
        var parentEntity = this.entityManager.createEntity();
        var parentTransform = this.entityManager.addComponent(parentEntity, TransformComponent);
        parentTransform.setPosition(cc.winSize.width, cc.winSize.height, 1);
        
        // Add sprite renderer
        var parentSprite = this.entityManager.addComponent(parentEntity, SpriteRenderer);
        parentSprite.setTexture("res/game/images/parent.png");
        parentSprite.setUseCamera(true);
        parentSprite.setFrustumCulling(true);
        
        // Create first child entity
        var childEntity1 = this.entityManager.createEntity();
        var childTransform1 = this.entityManager.addComponent(childEntity1, TransformComponent);
        childTransform1.setPosition(100, 0, 0); // Offset from parent
        childTransform1.setParent(parentTransform); // Set parent relationship
        
        // Add sprite renderer to child
        var childSprite1 = this.entityManager.addComponent(childEntity1, SpriteRenderer);
        childSprite1.setTexture("res/game/images/child.png");
        childSprite1.setUseCamera(true);
        childSprite1.setFrustumCulling(true);
        childSprite1.setColor(0, 1, 0, 1); // Green
        
        // Create second child entity (child of first child)
        var childEntity2 = this.entityManager.createEntity();
        var childTransform2 = this.entityManager.addComponent(childEntity2, TransformComponent);
        childTransform2.setPosition(80, 0, 0); // Offset from first child
        childTransform2.setParent(childTransform1); // Set parent relationship
        
        // Add sprite renderer to second child
        var childSprite2 = this.entityManager.addComponent(childEntity2, SpriteRenderer);
        childSprite2.setTexture("res/game/images/child.png");
        childSprite2.setUseCamera(true);
        childSprite2.setFrustumCulling(true);
        childSprite2.setColor(0, 0, 1, 1); // Blue
        
        // Store entity references
        this.hierarchyEntities = {
            parent: parentEntity,
            child1: childEntity1,
            child2: childEntity2
        };
        
        // Add rotation to the parent
        this.schedule(function() {
            var transform = this.entityManager.getComponent(parentEntity, TransformComponent);
            if (transform) {
                transform.rotate(0, 0, 1); // Rotate 1 degree per frame
            }
        }, 0.05);
    },
});

module.exports = CameraDemo;
