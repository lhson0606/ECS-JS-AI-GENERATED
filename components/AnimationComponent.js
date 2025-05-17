/**
 * Animation component for frame-by-frame animation with SpriteRenderer support
 */

var AnimationComponent = gv.Component.extend({
    ctor: function(entityId) {
        this._super(entityId);
        this.animations = {};
        this.currentAnimation = "";
        this.frameRate = 0.1; // Default: 10 FPS
        this.isPlaying = false;
        this.loop = true;
        this.currentAction = null;
        this.onAnimationComplete = null; // Callback for animation completion
    },
    
    awake: function() {
        Log.debug("AnimationComponent: Awake");
    },
    
    start: function() {
        Log.debug("AnimationComponent: Start");
        
        // Get required components
        this.spriteRenderer = this.getComponent(SpriteRenderer);
        if (!this.spriteRenderer) {
            Log.error("AnimationComponent requires a SpriteRenderer");
            return;
        }
    },
    
    update: function(dt) {
        // Animation updates are handled by Cocos2d-x actions
    },
    
    /**
     * Add an animation from a sprite sheet
     * @param {string} name - Name of the animation
     * @param {string} pattern - Pattern for frame names (e.g., "hero_run_%d.png")
     * @param {number} frameCount - Number of frames
     * @param {number} [startIndex=1] - Starting index for frames
     */
    addAnimation: function(name, pattern, frameCount, startIndex) {
        startIndex = startIndex || 1;
        
        var frames = [];
        for (var i = 0; i < frameCount; i++) {
            var frameName = cc.formatStr(pattern, i + startIndex);
            var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
            if (frame) {
                frames.push(frame);
            } else {
                Log.warning("AnimationComponent: Could not find frame " + frameName);
            }
        }
        
        if (frames.length > 0) {
            var animation = new cc.Animation(frames, this.frameRate);
            this.animations[name] = animation;
            Log.debug("AnimationComponent: Added animation " + name + " with " + frames.length + " frames");
        }
    },
    
    /**
     * Add an animation from an array of frame names
     * @param {string} name - Name of the animation
     * @param {Array<string>} frameNames - Array of sprite frame names
     */
    addAnimationWithFrameNames: function(name, frameNames) {
        var frames = [];
        
        for (var i = 0; i < frameNames.length; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame(frameNames[i]);
            if (frame) {
                frames.push(frame);
            } else {
                Log.warning("AnimationComponent: Could not find frame " + frameNames[i]);
            }
        }
        
        if (frames.length > 0) {
            var animation = new cc.Animation(frames, this.frameRate);
            this.animations[name] = animation;
            Log.debug("AnimationComponent: Added animation " + name + " with " + frames.length + " frames");
        }
    },
    
    /**
     * Play an animation
     * @param {string} name - Name of the animation to play
     * @param {boolean} [loop=true] - Whether to loop the animation
     * @param {function} [callback] - Optional callback when non-looping animation completes
     */
    play: function(name, loop, callback) {
        // Don't restart the same animation
        if (this.currentAnimation === name && this.isPlaying) {
            return;
        }
        
        // Default to loop unless specified
        this.loop = (loop !== undefined) ? loop : true;
        this.onAnimationComplete = callback || null;
        
        var animation = this.animations[name];
        if (!animation) {
            Log.error("AnimationComponent: Animation " + name + " not found");
            return;
        }
        
        if (!this.spriteRenderer || !this.spriteRenderer.sprite) {
            Log.error("AnimationComponent: No sprite to animate");
            return;
        }
        
        // Stop current animation
        this.stop();
        
        // Create animate action
        var animate = new cc.Animate(animation);
        var action;
        
        if (this.loop) {
            action = cc.repeatForever(animate);
            this.spriteRenderer.sprite.runAction(action);
        } else {
            // For non-looping animations, we need to handle the callback
            var self = this;
            
            var callbackAction = cc.callFunc(function() {
                self.isPlaying = false;
                self.currentAnimation = "";
                
                if (self.onAnimationComplete) {
                    self.onAnimationComplete();
                }
            });
            
            action = cc.sequence(animate, callbackAction);
            this.spriteRenderer.sprite.runAction(action);
        }
        
        this.currentAction = action;
        this.currentAnimation = name;
        this.isPlaying = true;
        
        Log.debug("AnimationComponent: Playing animation " + name);
    },
    
    /**
     * Stop the current animation
     */
    stop: function() {
        if (this.spriteRenderer && this.spriteRenderer.sprite) {
            this.spriteRenderer.sprite.stopAllActions();
            this.currentAction = null;
            this.isPlaying = false;
            Log.debug("AnimationComponent: Stopped animation");
        }
    },
    
    /**
     * Pause the current animation
     */
    pause: function() {
        if (this.isPlaying && this.spriteRenderer && this.spriteRenderer.sprite) {
            this.spriteRenderer.sprite.pause();
            this.isPlaying = false;
        }
    },
    
    /**
     * Resume a paused animation
     */
    resume: function() {
        if (!this.isPlaying && this.currentAnimation && this.spriteRenderer && this.spriteRenderer.sprite) {
            this.spriteRenderer.sprite.resume();
            this.isPlaying = true;
        }
    },
    
    /**
     * Set the frame rate for animations
     * @param {number} framesPerSecond - Frames per second
     */
    setFrameRate: function(framesPerSecond) {
        this.frameRate = 1.0 / framesPerSecond;
        
        // Update existing animations
        for (var name in this.animations) {
            this.animations[name].setDelayPerUnit(this.frameRate);
        }
    },
    
    /**
     * Get the duration of an animation in seconds
     * @param {string} name - Animation name
     * @returns {number} Duration in seconds, or 0 if animation not found
     */
    getDuration: function(name) {
        var animation = this.animations[name];
        if (animation) {
            return animation.getDuration();
        }
        return 0;
    },
    
    /**
     * Display a specific frame from an animation
     * @param {string} animName - Animation name
     * @param {number} frameIndex - Index of the frame to display
     */
    showFrame: function(animName, frameIndex) {
        var animation = this.animations[animName];
        if (!animation || !this.spriteRenderer || !this.spriteRenderer.sprite) return;
        
        var frames = animation.getFrames();
        if (frameIndex >= 0 && frameIndex < frames.length) {
            // Stop any running animation
            this.stop();
            
            // Set the frame
            this.spriteRenderer.sprite.setSpriteFrame(frames[frameIndex].getSpriteFrame());
        }
    },
    
    destroy: function() {
        this.stop();
    }
});
