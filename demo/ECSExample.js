/**
 * Example usage of the ECS system
 */

var ECSExample = cc.Scene.extend({
    onEnter: function() {
        this._super();
        
        // Initialize ECS if not already initialized
        gv.initECS();
        
        // Create a background
        var background = new cc.LayerColor(cc.color(50, 60, 70));
        this.addChild(background);
        
        // Add example usage
        this.addLabel("ECS Example Scene", cc.p(cc.winSize.width/2, cc.winSize.height - 50));
        
        // Load sprite sheets for animations
        cc.spriteFrameCache.addSpriteFrames("path/to/sprites.plist");
        
        // Create player entity
        this.createPlayerEntity();
        
        // Create some enemy entities
        this.createEnemyEntity(cc.p(200, 300));
        this.createEnemyEntity(cc.p(400, 200));
        
        // Setup input handling
        this.setupInput();
        
        Log.info("ECS Example scene started");
    },
    
    addLabel: function(text, position) {
        var label = new cc.LabelTTF(text, "Arial", 24);
        label.setPosition(position);
        label.setColor(cc.color(255, 255, 255));
        this.addChild(label);
        return label;
    },
    
    createPlayerEntity: function() {
        // Create entity
        var playerEntity = gv.EntityManager.createEntity();
        this.playerEntity = playerEntity;
        
        // Add transform component
        var transform = gv.ComponentManager.addComponent(playerEntity, TransformComponent);
        transform.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        
        // Add sprite component
        var sprite = gv.ComponentManager.addComponent(playerEntity, SpriteComponent);
        sprite.setTexture("res/player_idle_1.png");
        
        // Add animation component
        var animation = gv.ComponentManager.addComponent(playerEntity, AnimationComponent);
        animation.addAnimation("idle", "player_idle_%d.png", 8);
        animation.addAnimation("run", "player_run_%d.png", 8);
        animation.setFrameRate(10);
        animation.play("idle");
        
        // Add movement component
        var movement = gv.ComponentManager.addComponent(playerEntity, MovementComponent);
        movement.maxSpeed = 200;
        movement.friction = 0.9;
        
        // Add player controller component (custom component)
        var controller = gv.ComponentManager.addComponent(playerEntity, PlayerControllerComponent);
        
        Log.debug("Created player entity with ID: " + playerEntity);
    },
    
    createEnemyEntity: function(position) {
        // Create entity
        var enemyEntity = gv.EntityManager.createEntity();
        
        // Add transform component
        var transform = gv.ComponentManager.addComponent(enemyEntity, TransformComponent);
        transform.setPosition(position.x, position.y);
        
        // Add sprite component
        var sprite = gv.ComponentManager.addComponent(enemyEntity, SpriteComponent);
        sprite.setTexture("res/enemy_idle_1.png");
        
        // Add animation component
        var animation = gv.ComponentManager.addComponent(enemyEntity, AnimationComponent);
        animation.addAnimation("idle", "enemy_idle_%d.png", 4);
        animation.addAnimation("attack", "enemy_attack_%d.png", 6);
        animation.setFrameRate(8);
        animation.play("idle");
        
        // Add enemy behavior component (custom component)
        var behavior = gv.ComponentManager.addComponent(enemyEntity, EnemyBehaviorComponent);
        behavior.setPatrolRadius(100);
        
        Log.debug("Created enemy entity with ID: " + enemyEntity);
        return enemyEntity;
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
                    this.handleTouchBegan(touch.getLocation());
                    return true;
                }.bind(this),
                onTouchMoved: function(touch, event) {
                    this.handleTouchMoved(touch.getLocation());
                }.bind(this),
                onTouchEnded: function(touch, event) {
                    this.handleTouchEnded(touch.getLocation());
                }.bind(this)
            }, this);
        }
    },
    
    handleKeyPressed: function(keyCode) {
        var controller = gv.ComponentManager.getComponent(this.playerEntity, PlayerControllerComponent);
        if (controller) {
            controller.handleKeyPressed(keyCode);
        }
    },
    
    handleKeyReleased: function(keyCode) {
        var controller = gv.ComponentManager.getComponent(this.playerEntity, PlayerControllerComponent);
        if (controller) {
            controller.handleKeyReleased(keyCode);
        }
    },
    
    handleTouchBegan: function(position) {
        var controller = gv.ComponentManager.getComponent(this.playerEntity, PlayerControllerComponent);
        if (controller) {
            controller.handleTouchBegan(position);
        }
    },
    
    handleTouchMoved: function(position) {
        var controller = gv.ComponentManager.getComponent(this.playerEntity, PlayerControllerComponent);
        if (controller) {
            controller.handleTouchMoved(position);
        }
    },
    
    handleTouchEnded: function(position) {
        var controller = gv.ComponentManager.getComponent(this.playerEntity, PlayerControllerComponent);
        if (controller) {
            controller.handleTouchEnded(position);
        }
    }
});

// Custom Component: Player Controller
var PlayerControllerComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.moveSpeed = 200;
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            attack: false
        };
        this.touchPosition = null;
        this.movingToTouch = false;
    },
    
    awake: function() {
        Log.debug("PlayerControllerComponent: Awake");
    },
    
    start: function() {
        Log.debug("PlayerControllerComponent: Start");
        
        // Get required components
        this.transform = this.getComponent(TransformComponent);
        this.movement = this.getComponent(MovementComponent);
        this.animation = this.getComponent(AnimationComponent);
        
        if (!this.transform || !this.movement || !this.animation) {
            Log.error("PlayerControllerComponent missing required components");
        }
    },
    
    update: function(dt) {
        if (!this.transform || !this.movement) return;
        
        var vx = 0;
        var vy = 0;
        
        // Handle keyboard input
        if (this.keys.up) vy += this.moveSpeed;
        if (this.keys.down) vy -= this.moveSpeed;
        if (this.keys.left) vx -= this.moveSpeed;
        if (this.keys.right) vx += this.moveSpeed;
        
        // Handle touch input
        if (this.movingToTouch && this.touchPosition) {
            var dx = this.touchPosition.x - this.transform.position.x;
            var dy = this.touchPosition.y - this.transform.position.y;
            var distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance > 5) {  // Only move if not close enough
                vx = (dx / distance) * this.moveSpeed;
                vy = (dy / distance) * this.moveSpeed;
            } else {
                this.movingToTouch = false;
            }
        }
        
        // Apply velocity
        this.movement.setVelocity(vx, vy);
        
        // Update animation
        var isMoving = (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1);
        
        if (isMoving && this.animation.currentAnimation !== "run") {
            this.animation.play("run");
        } else if (!isMoving && this.animation.currentAnimation !== "idle") {
            this.animation.play("idle");
        }
        
        // Update sprite direction based on movement
        var sprite = this.getComponent(SpriteComponent);
        if (sprite && sprite.sprite) {
            if (vx < 0) {
                sprite.sprite.setScaleX(-1); // Face left
            } else if (vx > 0) {
                sprite.sprite.setScaleX(1);  // Face right
            }
        }
    },
    
    handleKeyPressed: function(keyCode) {
        switch(keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
                this.keys.up = true;
                break;
            case cc.KEY.s:
            case cc.KEY.down:
                this.keys.down = true;
                break;
            case cc.KEY.a:
            case cc.KEY.left:
                this.keys.left = true;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.keys.right = true;
                break;
            case cc.KEY.space:
                this.keys.attack = true;
                this.attack();
                break;
        }
    },
    
    handleKeyReleased: function(keyCode) {
        switch(keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
                this.keys.up = false;
                break;
            case cc.KEY.s:
            case cc.KEY.down:
                this.keys.down = false;
                break;
            case cc.KEY.a:
            case cc.KEY.left:
                this.keys.left = false;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.keys.right = false;
                break;
            case cc.KEY.space:
                this.keys.attack = false;
                break;
        }
    },
    
    handleTouchBegan: function(position) {
        this.touchPosition = position;
        this.movingToTouch = true;
    },
    
    handleTouchMoved: function(position) {
        this.touchPosition = position;
    },
    
    handleTouchEnded: function(position) {
        this.movingToTouch = false;
    },
    
    attack: function() {
        // Example of a player attack action
        Log.debug("Player attack!");
        
        // Could trigger attack animation, spawn projectile entity, etc.
    }
});

// Custom Component: Enemy Behavior
var EnemyBehaviorComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.patrolRadius = 50;
        this.moveSpeed = 100;
        this.startPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.thinkTimer = 0;
        this.thinkInterval = 2; // Time between AI decisions
        this.state = "idle"; // idle, patrol, chase, attack
        this.playerDetectionRange = 200;
    },
    
    awake: function() {
        Log.debug("EnemyBehaviorComponent: Awake");
    },
    
    start: function() {
        Log.debug("EnemyBehaviorComponent: Start");
        
        // Get required components
        this.transform = this.getComponent(TransformComponent);
        this.movement = this.getComponent(MovementComponent);
        this.animation = this.getComponent(AnimationComponent);
        
        if (this.transform) {
            this.startPosition.x = this.transform.position.x;
            this.startPosition.y = this.transform.position.y;
        }
    },
    
    update: function(dt) {
        if (!this.transform || !this.movement) return;
        
        // Update AI thinking
        this.thinkTimer += dt;
        if (this.thinkTimer >= this.thinkInterval) {
            this.think();
            this.thinkTimer = 0;
        }
        
        // Handle different states
        switch (this.state) {
            case "idle":
                // Do nothing
                break;
                
            case "patrol":
                // Move towards target position
                this.moveTowards(this.targetPosition.x, this.targetPosition.y);
                
                // Check if we've reached the target
                var dx = this.targetPosition.x - this.transform.position.x;
                var dy = this.targetPosition.y - this.transform.position.y;
                var distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 10) {
                    // Reached target, go back to idle
                    this.state = "idle";
                    this.movement.setVelocity(0, 0);
                    
                    if (this.animation) {
                        this.animation.play("idle");
                    }
                }
                break;
                
            case "chase":
                // Chase player logic would go here
                break;
                
            case "attack":
                // Attack logic would go here
                break;
        }
        
        // Update sprite direction based on movement
        var sprite = this.getComponent(SpriteComponent);
        if (sprite && sprite.sprite && this.movement.velocity.x !== 0) {
            if (this.movement.velocity.x < 0) {
                sprite.sprite.setScaleX(-1); // Face left
            } else {
                sprite.sprite.setScaleX(1);  // Face right
            }
        }
    },
    
    think: function() {
        // Check for player first
        var playerEntity = this.findPlayerEntity();
        if (playerEntity) {
            var playerTransform = gv.ComponentManager.getComponent(playerEntity, TransformComponent);
            if (playerTransform) {
                var dx = playerTransform.position.x - this.transform.position.x;
                var dy = playerTransform.position.y - this.transform.position.y;
                var distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < this.playerDetectionRange) {
                    // Player detected, chase or attack
                    this.state = "chase";
                    this.targetPosition.x = playerTransform.position.x;
                    this.targetPosition.y = playerTransform.position.y;
                    return;
                }
            }
        }
        
        // No player in range, patrol randomly
        if (Math.random() < 0.7) {  // 70% chance to start patrolling
            this.state = "patrol";
            
            // Choose a random point within patrol radius
            var angle = Math.random() * Math.PI * 2;
            var distance = Math.random() * this.patrolRadius;
            
            this.targetPosition.x = this.startPosition.x + Math.cos(angle) * distance;
            this.targetPosition.y = this.startPosition.y + Math.sin(angle) * distance;
            
            if (this.animation) {
                this.animation.play("idle"); // Assuming we have a "walk" animation
            }
        } else {
            // Stay idle
            this.state = "idle";
            this.movement.setVelocity(0, 0);
            
            if (this.animation) {
                this.animation.play("idle");
            }
        }
    },
    
    moveTowards: function(x, y) {
        if (!this.transform || !this.movement) return;
        
        var dx = x - this.transform.position.x;
        var dy = y - this.transform.position.y;
        var distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 0) {
            var vx = (dx / distance) * this.moveSpeed;
            var vy = (dy / distance) * this.moveSpeed;
            this.movement.setVelocity(vx, vy);
        }
    },
    
    findPlayerEntity: function() {
        // In a real game, you would have a more efficient way to find the player
        // For this example, we'll just look for an entity with a PlayerControllerComponent
        var entities = gv.EntityManager.getAllEntities();
        
        for (var i = 0; i < entities.length; i++) {
            var controller = gv.ComponentManager.getComponent(entities[i], PlayerControllerComponent);
            if (controller) {
                return entities[i];
            }
        }
        
        return null;
    },
    
    setPatrolRadius: function(radius) {
        this.patrolRadius = radius;
    }
});
