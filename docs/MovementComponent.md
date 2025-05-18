# MovementComponent

## About

The MovementComponent provides basic physics-like movement for entities. It manages properties like velocity, acceleration, friction, and mass, making it easy to implement natural movement in your game.

## Usage

Add a MovementComponent to an entity with a TransformComponent to enable physics-based movement. The component automatically updates the entity's position based on velocity and acceleration.

```javascript
// Create an entity with transform and movement components
var entityId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(entityId, TransformComponent);
var movement = ECS.gI().ComponentManager.addComponent(entityId, MovementComponent);

// Set initial position
transform.setPosition(100, 100, 0);

// Configure movement properties
movement.setMass(2.0);           // Heavier object
movement.maxSpeed = 200;         // Limit maximum speed
movement.friction = 0.95;        // Slight friction (0-1)

// Apply forces or set velocity directly
movement.applyForce(500, 0, 0);  // Push right
// Or
movement.setVelocity(100, 50, 0); // Set specific velocity
```

## Example

```javascript
// Create a character with physics movement
var characterId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(characterId, TransformComponent);
var sprite = ECS.gI().ComponentManager.addComponent(characterId, SpriteRenderer);
var movement = ECS.gI().ComponentManager.addComponent(characterId, MovementComponent);

// Configure movement properties
movement.maxSpeed = 300;
movement.friction = 0.9;

// Use gravity for platformer-style movement
movement.enableGravity(true);
movement.setGravity(0, -980, 0); // Strong downward gravity

// In update logic or input handling
function handleInput(dt) {
    // Apply left/right movement
    if (isLeftKeyPressed) {
        movement.applyForce(-2000, 0, 0);
    } else if (isRightKeyPressed) {
        movement.applyForce(2000, 0, 0);
    }
  
    // Handle jumping
    if (isJumpKeyPressed && isOnGround) {
        // Apply an upward impulse for jumping
        movement.applyImpulse(0, 600, 0);
    }
}
```

## Notice

- The MovementComponent requires a TransformComponent on the same entity.
- Forces are applied each frame and reset after updating velocity.
- Impulses are immediate changes to velocity.
- Friction is applied each frame to gradually slow the entity down (values between 0 and 1).
- A friction value of 1.0 means no friction, and 0.0 would stop the entity instantly.
- The component will automatically limit velocity to the maxSpeed value.
- Gravity can be enabled/disabled and customized for different game types.
- When velocity becomes very small (< 0.1), it's set to 0 to avoid endless tiny movements.
- Mass affects how forces impact the entity (higher mass = less acceleration from the same force).
