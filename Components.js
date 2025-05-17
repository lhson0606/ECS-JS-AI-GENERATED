/**
 * Import file for all ECS components
 * This file serves as a central point to include all component files
 */

// Create a global Components object
var Components = Components || {};

// Include all component classes here and add them to the global Components object
Components.TransformComponent = ECS.TransformComponent;
Components.SpriteRenderer = ECS.SpriteRenderer;
Components.AnimationComponent = ECS.AnimationComponent;
Components.CameraComponent = ECS.CameraComponent;

// Also make individual component classes available globally for backward compatibility
var TransformComponent = ECS.TransformComponent;
var SpriteRenderer = ECS.SpriteRenderer;
var AnimationComponent = ECS.AnimationComponent;
var CameraComponent = ECS.CameraComponent;
