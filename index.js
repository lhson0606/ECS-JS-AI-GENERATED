/**
 * ECS module index file
 * This file exposes all the ECS components and systems
 */

// Import components
var Components = require('./Components');
var Camera = require('./Camera');
var CameraDemo = require('./CameraDemo');

// Re-export everything
module.exports = {
    // Components
    TransformComponent: Components.TransformComponent,
    SpriteRenderer: Components.SpriteRenderer,
    AnimationComponent: Components.AnimationComponent,
    CameraComponent: Camera.CameraComponent,
    
    // Demo scenes
    CameraDemo: CameraDemo
};
