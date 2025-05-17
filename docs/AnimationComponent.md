# AnimationComponent

## About
The AnimationComponent provides frame-by-frame animation capabilities for entities with a SpriteRenderer. It manages animations as collections of sprite frames and handles animation playback with controls for looping, frame rate, and callbacks.

## Usage
Add an AnimationComponent to an entity that already has a SpriteRenderer to enable animations. First, add animations to the component, then play the animations when needed.

```javascript
// Create an entity with necessary components
var entityId = gv.EntityManager.createEntity();
var transform = gv.ComponentManager.addComponent(entityId, TransformComponent);
var spriteRenderer = gv.ComponentManager.addComponent(entityId, SpriteRenderer);
var animator = gv.ComponentManager.addComponent(entityId, AnimationComponent);

// Load a sprite sheet first (typically done once at game startup)
cc.spriteFrameCache.addSpriteFrames("res/sprites/character_sheet.plist");

// Add animations using a naming pattern
animator.addAnimation("run", "character_run_%d.png", 8);

// Add an animation using explicit frame names
animator.addAnimationWithFrameNames("attack", [
    "character_attack_1.png",
    "character_attack_2.png",
    "character_attack_3.png",
    "character_attack_4.png"
]);

// Play an animation with looping
animator.play("run", true);

// Play an animation once with a completion callback
animator.play("attack", false, function() {
    // Return to idle animation when attack is complete
    animator.play("idle");
});
```

## Example

```javascript
// Character with different movement animations
var characterId = gv.EntityManager.createEntity();
var transform = gv.ComponentManager.addComponent(characterId, TransformComponent);
var sprite = gv.ComponentManager.addComponent(characterId, SpriteRenderer);
var animator = gv.ComponentManager.addComponent(characterId, AnimationComponent);

// Add idle, run and jump animations
animator.addAnimation("idle", "hero_idle_%d.png", 4);
animator.addAnimation("run", "hero_run_%d.png", 8);
animator.addAnimation("jump", "hero_jump_%d.png", 6);

// Set animation speed (frames per second)
animator.setFrameRate(12);

// In game logic, change animations based on state
function updateCharacterAnimation(isRunning, isJumping) {
    if (isJumping) {
        animator.play("jump", false, function() {
            // Return to previous animation when jump completes
            animator.play(isRunning ? "run" : "idle");
        });
    } else if (isRunning) {
        animator.play("run");
    } else {
        animator.play("idle");
    }
}
```

## Notice
- The AnimationComponent requires a SpriteRenderer on the same entity.
- Sprite frames must be preloaded in the sprite frame cache before creating animations.
- Animation names must be unique within the component.
- The frame rate applies to all animations added to the component.
- Animation playback is handled by Cocos2d actions, so it integrates well with the Cocos2d-x rendering system.
- For non-looping animations, you can provide a callback function that will be called when the animation completes.
- Only one animation can play at a time on a single entity.
