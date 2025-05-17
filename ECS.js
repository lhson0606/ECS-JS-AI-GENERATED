gv = gv || {};
ECS = {};

/**
 * Entity Component System for Cocos2d-x
 * Based on Unity-style component lifecycle with self-updating components
 */

// Entity Manager to handle entity creation and destruction
ECS.EntityManager = cc.Class.extend({
    _nextEntityId: 1,
    _entities: new Set(),
    
    /**
     * Create a new entity
     * @returns {number} Entity ID
     */
    createEntity: function() {
        var entityId = this._nextEntityId++;
        this._entities.add(entityId);
        Log.debug("EntityManager: Created entity " + entityId);
        return entityId;
    },
    
    /**
     * Destroy an entity and all its components
     * @param {number} entityId - The entity to destroy
     */
    destroyEntity: function(entityId) {
        if (this._entities.has(entityId)) {
            // Remove all components from the entity
            gv.ComponentManager.removeAllComponents(entityId);
            
            // Remove the entity
            this._entities.delete(entityId);
            Log.debug("EntityManager: Destroyed entity " + entityId);
        }
    },
    
    /**
     * Check if an entity exists
     * @param {number} entityId - The entity to check
     * @returns {boolean} True if the entity exists
     */
    hasEntity: function(entityId) {
        return this._entities.has(entityId);
    },
    
    /**
     * Get all entities
     * @returns {Array} Array of entity IDs
     */
    getAllEntities: function() {
        return Array.from(this._entities);
    },
});

// Base Component class
ECS.Component = cc.Class.extend({
    /**
     * Constructor
     * @param {number} entityId - Entity this component belongs to
     */
    ctor: function(entityId) {
        this.entityId = entityId;
        this.enabled = true;
        this._started = false;
    },

    _name: function() {
        throw new Error("Derived class must implement _name method");
    },

    /**
     * Called when component is first added (similar to Unity's Awake)
     */
    awake: function() {
        // Override in derived classes
    },
    
    /**
     * Called before the first update (similar to Unity's Start)
     */
    start: function() {
        // Override in derived classes
    },
    
    /**
     * Called every frame (similar to Unity's Update)
     * @param {number} dt - Delta time since last update
     */
    update: function(dt) {
        // Override in derived classes
    },
    
    /**
     * Called at fixed time intervals (similar to Unity's FixedUpdate)
     * @param {number} dt - Fixed delta time
     */
    fixedUpdate: function(dt) {
        // Override in derived classes
    },
    
    /**
     * Called when component is removed or entity is destroyed
     */
    destroy: function() {
        // Override in derived classes
    },
    
    /**
     * Get a component from the same entity
     * @param {Function} componentClass - The component class to get
     * @returns {Object} The component instance or null if not found
     */
    getComponent: function(componentClass) {
        return gv.ComponentManager.getComponent(this.entityId, componentClass);
    },
    
    /**
     * Get all components of a type from the same entity
     * @param {Function} componentClass - The component class to get
     * @returns {Array} Array of component instances
     */
    getComponents: function(componentClass) {
        return gv.ComponentManager.getComponents(this.entityId, componentClass);
    },
    
    /**
     * Add a component to the same entity
     * @param {Function} componentClass - The component class to add
     * @returns {Object} The new component instance
     */
    addComponent: function(componentClass) {
        return gv.ComponentManager.addComponent(this.entityId, componentClass);
    }
});

// Component Manager to handle component creation, retrieval and updates
ECS.ComponentManager = cc.Class.extend({
    _components: {},  // Type -> Array of components
    _entityComponents: {}, // Entity ID -> Type -> Array of components
    
    /**
     * Initialize the component manager
     */
    ctor: function() {
        this._components = {};
        this._entityComponents = {};
        
        // Schedule fixed updates
        this._fixedUpdateInterval = 0.02; // 50 times per second
        this._fixedUpdateAccumulator = 0;
        
        Log.info("ComponentManager: Initialized");
    },
    
    /**
     * Add a component to an entity
     * @param {number} entityId - The entity ID
     * @param {Function} componentClass - The component class
     * @returns {Object} The created component
     */
    addComponent: function(entityId, componentClass) {
        if (!gv.EntityManager.hasEntity(entityId)) {
            Log.error("ComponentManager: Cannot add component to non-existent entity " + entityId);
            return null;
        }

        // Create component instance
        var component = new componentClass(entityId);

        // Get the component type name
        var typeName = component._name();

        if(!typeName) {
            throw new Error("Component class does not have a valid name");
        }
        
        // Initialize component arrays if needed
        if (!this._components[typeName]) {
            this._components[typeName] = [];
        }
        
        if (!this._entityComponents[entityId]) {
            this._entityComponents[entityId] = {};
        }
        
        if (!this._entityComponents[entityId][typeName]) {
            this._entityComponents[entityId][typeName] = [];
        }
        
        // Add component to arrays
        this._components[typeName].push(component);
        this._entityComponents[entityId][typeName].push(component);
        
        // Call awake
        component.awake();

        Log.debug("ComponentManager: Added " + typeName + " to entity " + entityId);
        return component;
    },
    
    /**
     * Get a component from an entity
     * @param {number} entityId - The entity ID
     * @param {Function} componentClass - The component class
     * @returns {Object} The component or null if not found
     */
    getComponent: function(entityId, componentClass) {
        // Get the component type name
        var typeName = componentClass;

        // Check if this component class is registered
        if (!this._components[typeName]) {
            Log.error("ComponentManager: Component class " + typeName + " is not registered");
            return null;
        }
        
        // Check if entity has components of this type
        if (!this._entityComponents[entityId] || !this._entityComponents[entityId][typeName]) {
            return null;
        }
        
        // Return the first component of this type
        if (this._entityComponents[entityId][typeName].length > 0) {
            return this._entityComponents[entityId][typeName][0];
        }
        
        return null;
    },
    
    /**
     * Get all components of a type from an entity
     * @param {number} entityId - The entity ID
     * @param {Function} componentClass - The component class
     * @returns {Array} Array of components
     */
    getComponents: function(entityId, componentClass) {
        // Get the component type name
        var typeName = componentClass;

        // check if this component class is registered
        if (!this._components[typeName]) {
            Log.error("ComponentManager: Component class " + typeName + " is not registered");
            return [];
        }
        
        // Check if entity has components of this type
        if (!this._entityComponents[entityId] || !this._entityComponents[entityId][typeName]) {
            return [];
        }
        
        // Return all components of this type
        return this._entityComponents[entityId][typeName].slice();
    },
    
    /**
     * Remove a component from an entity
     * @param {number} entityId - The entity ID
     * @param {Object} component - The component instance to remove
     */
    removeComponent: function(entityId, component) {
        if (!component) return;
        
        // Get the component type name
        var typeName = component;

        // Check if this component class is registered
        if (!this._components[typeName]) {
            throw new Error("ComponentManager: Component class " + typeName + " is not registered");
        }

        // Call destroy
        component.destroy();
        
        // Remove from arrays
        var index = this._components[typeName].indexOf(component);
        if (index !== -1) {
            this._components[typeName].splice(index, 1);
        }
        
        if (this._entityComponents[entityId] && this._entityComponents[entityId][typeName]) {
            index = this._entityComponents[entityId][typeName].indexOf(component);
            if (index !== -1) {
                this._entityComponents[entityId][typeName].splice(index, 1);
            }
            
            if (this._entityComponents[entityId][typeName].length === 0) {
                delete this._entityComponents[entityId][typeName];
            }
        }
        
        Log.debug("ComponentManager: Removed " + typeName + " from entity " + entityId);
    },
    
    /**
     * Remove all components from an entity
     * @param {number} entityId - The entity ID
     */
    removeAllComponents: function(entityId) {
        if (!this._entityComponents[entityId]) return;
        
        // Get all components
        var components = [];
        for (var typeName in this._entityComponents[entityId]) {
            components = components.concat(this._entityComponents[entityId][typeName]);
        }
        
        // Remove each component
        for (var i = 0; i < components.length; i++) {
            this.removeComponent(entityId, components[i]);
        }
        
        // Delete entity entry
        delete this._entityComponents[entityId];
        
        Log.debug("ComponentManager: Removed all components from entity " + entityId);
    },
    
    /**
     * Update method called every frame
     * @param {number} dt - Delta time since last update
     */
    update: function(dt) {
        // Handle fixed updates
        this._fixedUpdateAccumulator += dt;
        while (this._fixedUpdateAccumulator >= this._fixedUpdateInterval) {
            this._fixedUpdateAccumulator -= this._fixedUpdateInterval;
            this._processFixedUpdate(this._fixedUpdateInterval);
        }
        
        // Process regular updates
        this._processUpdate(dt);
    },
    
    /**
     * Process regular updates for all components
     * @param {number} dt - Delta time
     * @private
     */
    _processUpdate: function(dt) {
        // Iterate through all component types
        for (var typeName in this._components) {
            var components = this._components[typeName];
            
            // Update each component
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                
                // Call start if needed
                if (component.enabled && !component._started) {
                    component.start();
                    component._started = true;
                }
                
                // Call update
                if (component.enabled) {
                    component.update(dt);
                }
            }
        }
    },
    
    /**
     * Process fixed updates for all components
     * @param {number} dt - Fixed delta time
     * @private
     */
    _processFixedUpdate: function(dt) {
        // Iterate through all component types
        for (var typeName in this._components) {
            var components = this._components[typeName];
            
            // Update each component
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                
                // Call fixed update
                if (component.enabled) {
                    component.fixedUpdate(dt);
                }
            }
        }
    },

    startAll: function() {
        // Iterate through all component types
        for (var typeName in this._components) {
            var components = this._components[typeName];
            
            // Call start on each component
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                component.start();
            }
        }
    }
});

ECS.ECSEngine = cc.Class.extend({
    ctor: function() {
        this.entityManager = gv.EntityManager;
        this.componentManager = gv.ComponentManager;
    },

    reset: function() {
        this.entityManager._nextEntityId = 1;
        this.entityManager._entities.clear();
        this.componentManager._components = {};
        this.componentManager._entityComponents = {};
    },

    run: function() {
        this.componentManager.startAll();
        // Schedule the ECS update using the correct Cocos2d-x API
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);
    },

    stop: function() {
        // Unschedule the ECS update using the correct Cocos2d-x API
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    },

    update: function(dt) {
        // Update the component manager
        this.componentManager.update(dt);
    }
});

initECS = function() {
    gv.EntityManager = new ECS.EntityManager();
    gv.ComponentManager = new ECS.ComponentManager();
    gv.ECSEngine = new ECS.ECSEngine();

    // create a default camera entity
    var cameraEntity = gv.EntityManager.createEntity();
    var transform = gv.ComponentManager.addComponent(cameraEntity, ECS.TransformComponent);
    var cameraComponent = gv.ComponentManager.addComponent(cameraEntity, ECS.CameraComponent);
    cameraComponent.setPosition(0, 0, 0);
    cameraComponent.setRotation(0, 0, 0);
};


