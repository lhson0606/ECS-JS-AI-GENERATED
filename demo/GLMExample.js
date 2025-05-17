/**
 * Example of using the GLM-based Transform and SpriteRenderer components
 */

var GLMExample = cc.Scene.extend({
    onEnter: function() {
        this._super();
        
        // Initialize ECS
        gv.initECS();
        
        // Create background
        var background = new cc.LayerColor(cc.color(40, 40, 60));
        this.addChild(background);
        
        // Add title
        this.addLabel("GLM Transform & SpriteRenderer Example", cc.p(cc.winSize.width/2, cc.winSize.height - 40));
        
        // Load sprite sheet for animations
        cc.spriteFrameCache.addSpriteFrames(res.SPRITESHEET_PLIST);
        
        // Create player entity with hierarchy
        this.createPlayerEntity();
        
        // Create some test objects
        this.createRotatingObject(cc.p(200, 300), "res/game/images/item1.png");
        this.createRotatingObject(cc.p(400, 300), "res/game/images/item2.png");
        
        // Setup input handling
        this.setupInput();
        
        // Schedule update to show transform info
        this.scheduleUpdate();
        
        // Create info label
        this.infoLabel = this.addLabel("Transform info will appear here", cc.p(cc.winSize.width/2, 100));
        
        Log.info("GLM Example scene started");
    },
    
    update: function(dt) {
        // Update info label with player transform details
        if (this.playerTransform) {
            var worldPos = this.playerTransform.getWorldPosition();
            var info = "Position: " + worldPos.x.toFixed(1) + ", " + worldPos.y.toFixed(1) + ", " + worldPos.z.toFixed(1) + "\n" +
                       "Rotation: " + this.playerTransform.rotation.z.toFixed(1) + "°\n" +
                       "Scale: " + this.playerTransform.scale.x.toFixed(2) + ", " + this.playerTransform.scale.y.toFixed(2);
            this.infoLabel.setString(info);
        }
    },
    
    addLabel: function(text, position) {
        var label = new cc.LabelTTF(text, "Arial", 24);
        label.setPosition(position);
        label.setColor(cc.color(255, 255, 255));
        this.addChild(label);
        return label;
    },
    
    createPlayerEntity: function() {
        // Create parent entity (player body)
        var playerEntity = gv.EntityManager.createEntity();
        this.playerEntity = playerEntity;
        
        // Add transform component to the player
        var transform = gv.ComponentManager.addComponent(playerEntity, TransformComponent);
        transform.setPosition(cc.winSize.width/2, cc.winSize.height/2, 0);
        this.playerTransform = transform;
        
        // Add sprite renderer
        var sprite = gv.ComponentManager.addComponent(playerEntity, SpriteRenderer);
        sprite.setTexture("res/game/images/player.png");
        
        // Add animation
        var animation = gv.ComponentManager.addComponent(playerEntity, AnimationComponent);
        animation.addAnimation("idle", "player_idle_%d.png", 8);
        animation.addAnimation("run", "player_run_%d.png", 8);
        animation.setFrameRate(10);
        animation.play("idle");
        
        // Add movement component
        var movement = gv.ComponentManager.addComponent(playerEntity, MovementComponent);
        movement.maxSpeed = 200;
        movement.friction = 0.9;
        
        // Create child entity (weapon)
        var weaponEntity = gv.EntityManager.createEntity();
        
        // Add transform to weapon (as child of player)
        var weaponTransform = gv.ComponentManager.addComponent(weaponEntity, TransformComponent);
        weaponTransform.setPosition(30, 0, 0); // Offset from player
        weaponTransform.setParent(transform);  // Set parent-child relationship
        
        // Add sprite renderer to weapon
        var weaponSprite = gv.ComponentManager.addComponent(weaponEntity, SpriteRenderer);
        weaponSprite.setTexture("res/game/images/weapon.png");
        
        Log.debug("Created player entity hierarchy");
        
        return playerEntity;
    },
    
    createRotatingObject: function(position, texturePath) {
        // Create entity
        var entity = gv.EntityManager.createEntity();
        
        // Add transform
        var transform = gv.ComponentManager.addComponent(entity, TransformComponent);
        transform.setPosition(position.x, position.y, 0);
        
        // Add sprite renderer
        var sprite = gv.ComponentManager.addComponent(entity, SpriteRenderer);
        sprite.setTexture(texturePath);
        
        // Add a custom component for continuous rotation
        var rotator = gv.ComponentManager.addComponent(entity, RotatorComponent);
        rotator.rotationSpeed = 45; // degrees per second
        
        return entity;
    },
    
    setupInput: function() {
        // Enable keyboard input
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function(keyCode, event) {
                    this.handleKeyPressed(keyCode);
                }.bind(this),
                onKeyReleased: function(keyCode, event) {
                    this.handleKeyReleased(keyCode);
                }.bind(this)
            }, this);
        }
        
        // Add touch input
        if ('touches' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) {
                    this.handleTouch(touch.getLocation());
                    return true;
                }.bind(this)
            }, this);
        }
    },
    
    handleKeyPressed: function(keyCode) {
        var movement = gv.ComponentManager.getComponent(this.playerEntity, MovementComponent);
        var animation = gv.ComponentManager.getComponent(this.playerEntity, AnimationComponent);
        var speed = 200;
        
        switch(keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
                movement.setVelocity(movement.velocity.x, speed);
                animation.play("run");
                break;
                
            case cc.KEY.s:
            case cc.KEY.down:
                movement.setVelocity(movement.velocity.x, -speed);
                animation.play("run");
                break;
                
            case cc.KEY.a:
            case cc.KEY.left:
                movement.setVelocity(-speed, movement.velocity.y);
                animation.play("run");
                
                // Flip sprite to face left
                var sprite = gv.ComponentManager.getComponent(this.playerEntity, SpriteRenderer);
                if (sprite && sprite.sprite) {
                    sprite.sprite.setScaleX(-1);
                }
                break;
                
            case cc.KEY.d:
            case cc.KEY.right:
                movement.setVelocity(speed, movement.velocity.y);
                animation.play("run");
                
                // Reset sprite scale to face right
                var sprite = gv.ComponentManager.getComponent(this.playerEntity, SpriteRenderer);
                if (sprite && sprite.sprite) {
                    sprite.sprite.setScaleX(1);
                }
                break;
                
            case cc.KEY.q:
                // Rotate left
                this.playerTransform.rotate(0, 0, 10);
                break;
                
            case cc.KEY.e:
                // Rotate right
                this.playerTransform.rotate(0, 0, -10);
                break;
                
            case cc.KEY.z:
                // Scale down
                this.playerTransform.scaleBy(0.9, 0.9, 1);
                break;
                
            case cc.KEY.x:
                // Scale up
                this.playerTransform.scaleBy(1.1, 1.1, 1);
                break;
        }
    },
    
    handleKeyReleased: function(keyCode) {
        var movement = gv.ComponentManager.getComponent(this.playerEntity, MovementComponent);
        var animation = gv.ComponentManager.getComponent(this.playerEntity, AnimationComponent);
        
        switch(keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
            case cc.KEY.s:
            case cc.KEY.down:
                movement.setVelocity(movement.velocity.x, 0);
                break;
                
            case cc.KEY.a:
            case cc.KEY.left:
            case cc.KEY.d:
            case cc.KEY.right:
                movement.setVelocity(0, movement.velocity.y);
                break;
        }
        
        // If stopped, play idle animation
        if (movement.velocity.x === 0 && movement.velocity.y === 0) {
            animation.play("idle");
        }
    },
    
    handleTouch: function(position) {
        // Move the player towards the touch position
        var movement = gv.ComponentManager.getComponent(this.playerEntity, MovementComponent);
        var animation = gv.ComponentManager.getComponent(this.playerEntity, AnimationComponent);
        
        // Get direction to touch position
        var playerPos = this.playerTransform.position;
        var dx = position.x - playerPos.x;
        var dy = position.y - playerPos.y;
        
        // Calculate distance
        var distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 0) {
            // Normalize direction and set velocity
            var speed = 200;
            movement.setVelocity(
                (dx / distance) * speed,
                (dy / distance) * speed
            );
            
            // Play run animation
            animation.play("run");
            
            // Set sprite direction
            var sprite = gv.ComponentManager.getComponent(this.playerEntity, SpriteRenderer);
            if (sprite && sprite.sprite) {
                if (dx < 0) {
                    sprite.sprite.setScaleX(-1); // Face left
                } else {
                    sprite.sprite.setScaleX(1);  // Face right
                }
            }
        }
    }
});

// Custom component for continuous rotation
var RotatorComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.rotationSpeed = 90; // 90 degrees per second
        this.oscillate = false;
        this.initialRotation = 0;
        this.rotationRange = 45;
    },
    
    start: function() {
        this.transform = this.getComponent(TransformComponent);
        if (!this.transform) {
            Log.error("RotatorComponent requires a TransformComponent");
            return;
        }
        
        this.initialRotation = this.transform.rotation.z;
        this.elapsedTime = 0;
    },
    
    update: function(dt) {
        if (!this.transform) return;
        
        this.elapsedTime += dt;
        
        if (this.oscillate) {
            // Oscillate back and forth within a range
            var rotation = this.initialRotation + 
                           Math.sin(this.elapsedTime * this.rotationSpeed / 50) * this.rotationRange;
            this.transform.setZRotation(rotation);
        } else {
            // Continuous rotation
            this.transform.rotate(0, 0, this.rotationSpeed * dt);
        }
    }
});
