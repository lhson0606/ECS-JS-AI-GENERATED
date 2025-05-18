# Entity Component System (ECS)

## About

The Entity Component System (ECS) is an architectural pattern used for organizing game objects. It separates identity (Entities), data (Components), and behavior (Systems). This implementation follows a Unity-like approach where components have lifecycle methods and handle their own updates.

## Components

The ECS framework provides these core components:

1. **TransformComponent**: Handles position, rotation, and scale with hierarchical support
2. **SpriteRenderer**: Renders sprites with camera integration and visual effects
3. **AnimationComponent**: Provides frame-by-frame animation capabilities
4. **MovementComponent**: Implements basic physics movement with forces and velocity

## Usage

### Entity Creation and Management

```javascript
// Create an entity
var entityId = ECS.gI().EntityManager.createEntity();

// Add components
var transform = ECS.gI().ComponentManager.addComponent(entityId, TransformComponent);
var sprite = ECS.gI().ComponentManager.addComponent(entityId, SpriteRenderer);

// Destroy an entity when no longer needed
ECS.gI().EntityManager.destroyEntity(entityId);
```

### Component Lifecycle

Components have these lifecycle methods:

- **awake()**: Called immediately when component is added
- **start()**: Called before the first update
- **update(dt)**: Called every frame with delta time
- **destroy()**: Called when component is removed or entity is destroyed

## Example

```javascript
// Game setup
function createPlayer() {
    var playerId = ECS.gI().EntityManager.createEntity();
  
    // Add required components
    var transform = gv.ComponentManager.addComponent(playerId, TransformComponent);
    var sprite = ECS.gI().ComponentManager.addComponent(playerId, SpriteRenderer);
    var animator = ECS.gI().ComponentManager.addComponent(playerId, AnimationComponent);
    var movement = ECS.gI().ComponentManager.addComponent(playerId, MovementComponent);
  
    // Configure components
    transform.setPosition(cc.winSize.width/2, cc.winSize.height/2, 0);
    sprite.setTexture("res/sprites/player.png");
  
    // Add animations
    animator.addAnimation("idle", "player_idle_%d.png", 4);
    animator.addAnimation("run", "player_run_%d.png", 8);
    animator.play("idle");
  
    // Configure movement
    movement.maxSpeed = 300;
    movement.friction = 0.9;
  
    return playerId;
}

// Input handling
function handlePlayerInput(playerId, dt) {
    var movement = ECS.gI().ComponentManager.getComponent(playerId, MovementComponent);
    var animator = ECS.gI().ComponentManager.getComponent(playerId, AnimationComponent);
  
    // Handle movement
    var force = {x: 0, y: 0};
  
    if (isKeyPressed(cc.KEY.left)) {
        force.x = -1000;
        animator.play("run");
    } else if (isKeyPressed(cc.KEY.right)) {
        force.x = 1000;
        animator.play("run");
    } else {
        animator.play("idle");
    }
  
    if (force.x !== 0 || force.y !== 0) {
        movement.applyForce(force.x, force.y, 0);
    }
}
```

## Notice

- Components should be added in a logical order, as some depend on others (e.g., SpriteRenderer depends on TransformComponent).
- The ECS framework automatically handles the update cycle for all components.
- Getting components with `getComponent()` returns the first component of that type on the entity.
- Use `getComponents()` to get all components of a particular type on an entity.
- Components can easily reference each other through the entity ID they share.
