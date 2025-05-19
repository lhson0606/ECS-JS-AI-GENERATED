/**
 * A demo scene that shows how to use the ECS camera system
 */
gv = gv || {};

CameraDemo = cc.Layer.extend({
    ctor: function() {
        this._super();
        // Initialize key states for WASD movement
        this.keyStates = {
            'W': false,
            'A': false,
            'S': false,
            'D': false,
            'R': false,
            '+': false,
            '-': false
        };
        this.cameraSpeed = 200; // Speed of camera movement
        this.zoomSpeed = 0.5;   // Speed of zoom
        this.spinSpeed = 45;    // Speed of rotation (degrees per second)
        this.mousePos = cc.p(0, 0); // Store mouse position
        
        this.createScene();
    },

    createScene:function() {
        Log.debug("CameraDemo init");
        Log.debug("Creating ECS context");
        ECS.gI().createContext(this);
        const sizes = cc.director.getVisibleSize();
        
        // Create test entities
        this.player = gv.EntityFactory.createCocosSpriteEntity(res.images.ui.LOGO, glm.vec3(0, 0, 0));
        // this.player2 = gv.EntityFactory.createCocosSpriteEntityWithPosition(res.images.ui.LOGO, glm.vec3(300, 300, 0));
        
        // Create instruction text
        this.createInstructionText(sizes);
        
        // Setup keyboard and mouse event listeners
        this.setupInputListeners();
        
        ECS.gI().run();
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);
    },
    
    createInstructionText: function(sizes) {
        // Title
        var titleText = gv.UIFactory.createPrimaryText("Camera Demo", sizes.width/2, sizes.height - 50, 30);
        this.addChild(titleText, 10);
        
        // Controls instructions
        var controlsY = sizes.height - 100;
        var controlsX = 20;
        var lineHeight = 30;
        
        var moveText = gv.UIFactory.createPrimaryText("Move Camera: W,A,S,D keys", controlsX, controlsY, 20);
        moveText.setAnchorPoint(0, 0.5);
        this.addChild(moveText, 10);
        
        var zoomText = gv.UIFactory.createPrimaryText("Zoom: + and - keys", controlsX, controlsY - lineHeight, 20);
        zoomText.setAnchorPoint(0, 0.5);
        this.addChild(zoomText, 10);
        
        var spinText = gv.UIFactory.createPrimaryText("Spin Camera: R key", controlsX, controlsY - lineHeight*2, 20);
        spinText.setAnchorPoint(0, 0.5);
        this.addChild(spinText, 10);
        
        var resetText = gv.UIFactory.createPrimaryText("Zoom centers on mouse position", controlsX, controlsY - lineHeight*3, 20);
        resetText.setAnchorPoint(0, 0.5);
        this.addChild(resetText, 10);
    },
    
    setupInputListeners: function() {
        // Keyboard Event Listener
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                var target = event.getCurrentTarget();
                switch(keyCode) {
                    case CONSTANTS.keys.W:
                        target.keyStates['W'] = true;
                        break;
                    case CONSTANTS.keys.A:
                        target.keyStates['A'] = true;
                        break;
                    case CONSTANTS.keys.S:
                        target.keyStates['S'] = true;
                        break;
                    case CONSTANTS.keys.D:
                        target.keyStates['D'] = true;
                        break;
                    case CONSTANTS.keys.R:
                        target.keyStates['R'] = true;
                        break;
                    case CONSTANTS.keys.PLUS:
                    case CONSTANTS.keys.PLUS_NUMPAD:
                        target.keyStates['+'] = true;
                        break;
                    case CONSTANTS.keys.MINUS:
                    case CONSTANTS.keys.MINUS_NUMPAD:
                        target.keyStates['-'] = true;
                        break;
                }
            },
            onKeyReleased: function(keyCode, event) {
                var target = event.getCurrentTarget();
                switch(keyCode) {
                    case CONSTANTS.keys.W:
                        target.keyStates['W'] = false;
                        break;
                    case CONSTANTS.keys.A:
                        target.keyStates['A'] = false;
                        break;
                    case CONSTANTS.keys.S:
                        target.keyStates['S'] = false;
                        break;
                    case CONSTANTS.keys.D:
                        target.keyStates['D'] = false;
                        break;
                    case CONSTANTS.keys.R:
                        target.keyStates['R'] = false;
                        break;
                    case CONSTANTS.keys.PLUS:
                    case CONSTANTS.keys.PLUS_NUMPAD:
                        target.keyStates['+'] = false;
                        break;
                    case CONSTANTS.keys.MINUS:
                    case CONSTANTS.keys.MINUS_NUMPAD:
                        target.keyStates['-'] = false;
                        break;
                }
            }
        }, this);
        
        // Mouse Event Listener
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove: function(event) {
                var target = event.getCurrentTarget();
                target.mousePos = event.getLocation();
            }
        }, this);
    },    
    
    update: function(dt) {
        let camera = ECS.gI().camera;
        if (!camera) return;
        
        let cameraTransform = ECS.gI().ComponentManager.getComponent(camera.entityId, "TransformComponent");
        if (!cameraTransform) return;
        
        // Handle keyboard camera movement with WASD keys
        if (this.keyStates['W']) {
            camera.moveBy(0, this.cameraSpeed * dt, 0);
        }
        if (this.keyStates['S']) {
            camera.moveBy(0, -this.cameraSpeed * dt, 0);
        }
        if (this.keyStates['A']) {
            camera.moveBy(-this.cameraSpeed * dt, 0, 0);
        }
        if (this.keyStates['D']) {
            camera.moveBy(this.cameraSpeed * dt, 0, 0);
        }
        
        // Handle camera rotation with R key
        if (this.keyStates['R']) {
            camera.spin(this.spinSpeed * dt);
        }
        
        // Handle zoom with + and - keys
        if (this.keyStates['+']) {
            this.zoomAtMousePosition(this.zoomSpeed * dt);
        }
        if (this.keyStates['-']) {
            this.zoomAtMousePosition(-this.zoomSpeed * dt);
        }
        
        // Update player if needed
        // var playerTransform = ECS.gI().ComponentManager.getComponent(this.player, "TransformComponent");
        // if (playerTransform) {
        //     // Optional: Add player movement logic here
        //     // playerTransform.rotate(0, 0, dt * 20); // Rotate player slowly
        // }
    },
    
    // Helper method to zoom at the mouse position
    zoomAtMousePosition: function(zoomAmount) {
        if (!zoomAmount || !ECS.gI().camera) return;
        
        var camera = ECS.gI().camera;
        var oldZoom = camera.zoom;
        var newZoom = oldZoom + zoomAmount;
        
        // Enforce minimum and maximum zoom levels
        newZoom = Math.max(0.1, Math.min(10, newZoom));
        
        // Get mouse position in world space before zoom
        var mouseWorldBefore = camera.screenToWorldPoint(new glm.vec2(this.mousePos.x, this.mousePos.y));
        
        // Apply the zoom
        camera.setZoom(newZoom);
        
        // Get mouse position in world space after zoom
        var mouseWorldAfter = camera.screenToWorldPoint(new glm.vec2(this.mousePos.x, this.mousePos.y));
        
        // Calculate the difference and move the camera to keep mouse position fixed
        var diff = glm.sub(mouseWorldBefore, mouseWorldAfter);
        camera.moveBy(diff.x, diff.y, 0);
    },

    destroy: function() {
        this._super();
    }
});