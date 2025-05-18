# SpriteRenderer

## About

The SpriteRenderer component renders a sprite for an entity with support for camera transformations, frustum culling, and other visual properties. It works with the TransformComponent to position the sprite in the world.

## Usage

Add a SpriteRenderer to an entity after adding a TransformComponent to render a sprite at the entity's position. SpriteRenderer handles sprite appearance, blend modes, anchor points, and camera integration.

```javascript
// Create an entity with transform and sprite renderer
var entityId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(entityId, TransformComponent);
var spriteRenderer = ECS.gI().ComponentManager.addComponent(entityId, SpriteRenderer);

// Set position using transform
transform.setPosition(100, 200, 0);

// Set sprite texture
spriteRenderer.setTexture("res/sprites/character.png");

// Set color and opacity (RGBA values from 0 to 1)
spriteRenderer.setColor(1, 0.5, 0.5, 0.8);  // Red tint with 80% opacity
```

## Example

```javascript
// Create a UI element that doesn't use camera transformations
var uiEntityId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(uiEntityId, TransformComponent);
var sprite = ECS.gI().ComponentManager.addComponent(uiEntityId, SpriteRenderer);

// Position in screen space
transform.setPosition(cc.winSize.width - 50, 50, 0);

// UI elements typically don't need camera transformations
sprite.setUseCamera(false);

// Set the sprite texture
sprite.setTexture("res/ui/button.png");

// For particle effects, you might want additive blending
// sprite.setAdditiveBlending();
```

## Notice

- The SpriteRenderer requires a TransformComponent on the same entity.
- Frustum culling is enabled by default to optimize rendering (sprites out of camera view aren't drawn).
- The anchor point is (0.5, 0.5) by default, which centers the sprite at the entity's position.
- Color values are in the 0-1 range, not 0-255.
- When using camera integration, sprites will correctly respond to camera movement and zoom.
- Sprites can be set to use sprite frames from sprite sheets for efficient rendering.
- The SpriteRenderer properly cleans up its resources when destroyed.
