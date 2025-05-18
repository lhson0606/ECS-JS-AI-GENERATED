# TransformComponent

## About

The TransformComponent provides position, rotation, and scale functionality for entities in the game world. It uses GLM.js for vector and matrix math, which allows for efficient 3D transformations.

## Usage

Add a TransformComponent to an entity to control its position, rotation, and scale in the game world. This component is required by many other components such as SpriteRenderer.

```javascript
// Create an entity and add a TransformComponent
var entityId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(entityId, TransformComponent);

// Set position
transform.setPosition(100, 200, 0);

// Set rotation (in degrees)
transform.setRotation(0, 0, 45);

// Set scale
transform.setScale(2);
```

## Example

```javascript
// Create a character entity with a transform
var characterId = ECS.gI().EntityManager.createEntity();
var transform = ECS.gI().ComponentManager.addComponent(characterId, TransformComponent);

// Position the character
transform.setPosition(cc.winSize.width/2, cc.winSize.height/2, 0);

// In update loop
transform.translate(velocity.x * dt, velocity.y * dt, 0);

// Parent-child relationships
var childEntityId = ECS.gI().EntityManager.createEntity();
var childTransform = ECS.gI().ComponentManager.addComponent(childEntityId, TransformComponent);
childTransform.setParent(transform);
```

## Notice

- The transform component supports hierarchical transformations through parent-child relationships.
- Modifying position, rotation, or scale will mark the transform as "dirty" and trigger a recalculation of the world matrix.
- World matrix is only recalculated when needed, to optimize performance.
- When getting world position or transforming points, the component will update the world matrix if it's marked as dirty.
- All child transforms are marked as dirty when a parent transform changes.
