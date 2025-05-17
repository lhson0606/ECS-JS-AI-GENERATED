/**
 * Movement component for basic physics with GLM vector support
 */

var MovementComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.velocity = new glm.vec3(0, 0, 0);
        this.acceleration = new glm.vec3(0, 0, 0);
        this.maxSpeed = 300;
        this.friction = 0.9; // 0 to 1, where 1 is no friction
        this.mass = 1.0;
        this.useGravity = false;
        this.gravity = new glm.vec3(0, -9.8, 0); // Default gravity
    },
    
    awake: function() {
        Log.debug("MovementComponent: Awake");
    },
    
    start: function() {
        Log.debug("MovementComponent: Start");
        
        // Get the transform component
        this.transform = this.getComponent(TransformComponent);
        if (!this.transform) {
            Log.error("MovementComponent requires a TransformComponent");
            return;
        }
    },
    
    update: function(dt) {
        if (!this.transform) return;
        
        // Apply gravity if enabled
        if (this.useGravity) {
            this.applyForce(
                this.gravity.x * this.mass,
                this.gravity.y * this.mass,
                this.gravity.z * this.mass
            );
        }
        
        // Apply acceleration
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        this.velocity.z += this.acceleration.z * dt;
        
        // Apply speed limit
        var speedSquared = this.velocity.x * this.velocity.x + 
                         this.velocity.y * this.velocity.y + 
                         this.velocity.z * this.velocity.z;
                         
        if (speedSquared > this.maxSpeed * this.maxSpeed) {
            var speed = Math.sqrt(speedSquared);
            var ratio = this.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
            this.velocity.z *= ratio;
        }
        
        // Apply movement to transform
        this.transform.translate(
            this.velocity.x * dt,
            this.velocity.y * dt,
            this.velocity.z * dt
        );
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.z *= this.friction;
        
        // Stop completely if very slow (to avoid endless tiny movements)
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
        if (Math.abs(this.velocity.z) < 0.1) this.velocity.z = 0;
        
        // Reset acceleration (forces are applied each frame)
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.acceleration.z = 0;
    },
    
    /**
     * Apply a force to the object
     * @param {number} x - X component of force
     * @param {number} y - Y component of force
     * @param {number} z - Z component of force (0 by default)
     */
    applyForce: function(x, y, z) {
        z = z || 0;
        
        // F = ma, so a = F/m
        this.acceleration.x += x / this.mass;
        this.acceleration.y += y / this.mass;
        this.acceleration.z += z / this.mass;
    },
    
    /**
     * Apply a force vector
     * @param {glm.vec3} forceVec - Force vector
     */
    applyForceVec: function(forceVec) {
        this.applyForce(forceVec.x, forceVec.y, forceVec.z);
    },
    
    /**
     * Apply an impulse (immediate change in velocity)
     * @param {number} x - X impulse
     * @param {number} y - Y impulse
     * @param {number} z - Z impulse (0 by default)
     */
    applyImpulse: function(x, y, z) {
        z = z || 0;
        
        this.velocity.x += x / this.mass;
        this.velocity.y += y / this.mass;
        this.velocity.z += z / this.mass;
    },
    
    /**
     * Apply an impulse vector
     * @param {glm.vec3} impulseVec - Impulse vector
     */
    applyImpulseVec: function(impulseVec) {
        this.applyImpulse(impulseVec.x, impulseVec.y, impulseVec.z);
    },
    
    /**
     * Set the velocity directly
     * @param {number} x - X velocity
     * @param {number} y - Y velocity
     * @param {number} z - Z velocity (0 by default)
     */
    setVelocity: function(x, y, z) {
        z = z || 0;
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    },
    
    /**
     * Set the velocity using a GLM vector
     * @param {glm.vec3} velocityVec - Velocity vector
     */
    setVelocityVec: function(velocityVec) {
        this.velocity = velocityVec.clone();
    },
    
    /**
     * Get the current speed (magnitude of velocity)
     * @returns {number} Current speed
     */
    getSpeed: function() {
        return Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y + 
            this.velocity.z * this.velocity.z
        );
    },
    
    /**
     * Set the mass of the object
     * @param {number} mass - Mass value
     */
    setMass: function(mass) {
        if (mass <= 0) {
            Log.warning("MovementComponent: Mass must be greater than 0, setting to 0.1");
            this.mass = 0.1;
        } else {
            this.mass = mass;
        }
    },
    
    /**
     * Enable or disable gravity
     * @param {boolean} useGravity - Whether to use gravity
     */
    enableGravity: function(useGravity) {
        this.useGravity = useGravity;
    },
    
    /**
     * Set custom gravity vector
     * @param {number} x - X gravity
     * @param {number} y - Y gravity
     * @param {number} z - Z gravity
     */
    setGravity: function(x, y, z) {
        z = z || 0;
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravity.z = z;
    }
});
