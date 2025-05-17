# Entity Component System (ECS) for Cocos2d-x

This is a lightweight Entity Component System implementation for Cocos2d-x JavaScript games. The ECS architecture promotes better code organization, reusability, and flexibility.

## Overview

The ECS consists of three main parts:

1. **Entities**: Simple numeric IDs that represent game objects
2. **Components**: Data and behavior attached to entities
3. **Component Manager**: Handles component lifecycle and updates

Unlike traditional ECS architectures, this implementation doesn't have separate Systems. Instead, components contain their own update methods, similar to Unity's MonoBehaviour.

## Getting Started

### Creating an Entity

```javascript
// Create a new entity
var entityId = gv.EntityManager.createEntity();
```

### Adding Components

```javascript
// Add a transform component to the entity
var transform = gv.ComponentManager.addComponent(entityId, TransformComponent);
transform.setPosition(100, 200);

// Add a sprite component
var sprite = gv.ComponentManager.addComponent(entityId, SpriteComponent);
sprite.setTexture("res/images/player.png");
```

### Component Lifecycle

Each component has the following lifecycle methods:

1. **awake()**: Called immediately when the component is added
2. **start()**: Called before the first update
3. **update(dt)**: Called every frame with delta time
4. **fixedUpdate(dt)**: Called at fixed intervals
5. **destroy()**: Called when the component is removed

### Accessing Components

From within a component:

```javascript
// Get another component from the same entity
var transform = this.getComponent(TransformComponent);
var sprite = this.getComponent(SpriteComponent);

// Get all components of a type
var allColliders = this.getComponents(ColliderComponent);
```

From outside:

```javascript
// Get a component from an entity
var transform = gv.ComponentManager.getComponent(entityId, TransformComponent);

// Get all components of a type
var sprites = gv.ComponentManager.getComponents(entityId, SpriteComponent);
```

### Removing Components or Entities

```javascript
// Remove a specific component
gv.ComponentManager.removeComponent(entityId, component);

// Remove all components from an entity
gv.ComponentManager.removeAllComponents(entityId);

// Destroy an entity (also removes all its components)
gv.EntityManager.destroyEntity(entityId);
```

## Example Components

The ECS comes with several example components:

- **TransformComponent**: Handles position, rotation, and scale
- **SpriteComponent**: Renders a sprite at the transform position
- **AnimationComponent**: Manages frame-by-frame animations
- **MovementComponent**: Simple physics movement with velocity and acceleration

## Creating Custom Components

Create your own components by extending the base Component class:

```javascript
var MyCustomComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        // Initialize properties
        this.myProperty = 0;
    },
    
    awake: function() {
        // Called when component is added
        Log.debug("MyCustomComponent: Awake");
    },
    
    start: function() {
        // Called before first update
        this.otherComponent = this.getComponent(OtherComponent);
    },
    
    update: function(dt) {
        // Called every frame
        this.myProperty += dt;
    },
    
    fixedUpdate: function(dt) {
        // Called at fixed intervals
        // Good for physics calculations
    },
    
    destroy: function() {
        // Called when component is removed
        // Clean up resources here
    },
    
    myCustomMethod: function() {
        // Your custom functionality
    }
});
```

## Best Practices

1. Keep components focused on a single responsibility
2. Use composition over inheritance
3. Cache component references in start() rather than looking them up every frame
4. Prefer communicating between components via method calls rather than direct property access
5. Clean up resources in destroy() to prevent memory leaks
