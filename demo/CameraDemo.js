/**
 * A demo scene that shows how to use the ECS camera system
 */
gv = gv || {};

CameraDemo = cc.Layer.extend({
    ctor: function() {
        this._super();
        this.createScene();
    },

    createScene:function() {
        Log.debug("CameraDemo init");
        Log.debug("Creating ECS context");
        ECS.gI().createContext(this);
        const sizes = cc.director.getVisibleSize();
        // gv.EntityFactory.createCameraEntity(glm.vec3(0, 0, 0));
        for (let i = 0; i < 64; i++) {
            for (let j = 0; j < 64; j++) {
                var logo = gv.EntityFactory.createCocosSpriteEntityWithPosition(res.images.ui.LOGO, glm.vec3(i * 50, j * 50, 0));
                // logo.setScale(0.5);
            }
        }
        this.player = gv.EntityFactory.createCocosSpriteEntity(res.images.ui.LOGO);
        this.player2 = gv.EntityFactory.createCocosSpriteEntityWithPosition(res.images.ui.LOGO, glm.vec3(50, -150, 0));
        // var logo = cc.Sprite(res.images.ui.LOGO);
        // logo.setPosition(300, 300);
        // this.addChild(logo, CONFIG_LAYERS.UI_BACKGROUND + 1);
        ECS.gI().run();
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);
    },

    update: function(dt) {
        var camera = ECS.gI().camera;
        var cameraTransform = ECS.gI().ComponentManager.getComponent(camera.entityId, "TransformComponent");

        // Move camera up
        // camera.moveTo(cameraPosition.x, cameraPosition.y + dt * 50, cameraPosition.z);
        // Move camera down
        // camera.moveTo(cameraPosition.x, cameraPosition.y - dt * 50, cameraPosition.z);
        //
        // // Move camera left
        // camera.moveTo(cameraPosition.x - dt * 50, cameraPosition.y, cameraPosition.z);
        // // Move camera right
        // camera.moveTo(cameraPosition.x + dt * 50, cameraPosition.y, cameraPosition.z);

        // Move by -z
        // camera.moveBy(0, 0, -dt * 50);
        // Move by +z
        // camera.moveBy(0, 0, dt * 50);

        // Zoom in
        // camera.zoomBy(5 * dt);
        // Zoom out
        // camera.zoom(-0.1);

        // var playerTransform = ECS.gI().ComponentManager.getComponent(this.player, "TransformComponent");
        // playerTransform.translate(dt * 5, dt * 5, dt * 5);
        // move player
        // playerTransform.setPosition(playerTransform.position.x + dt * 5, playerTransform.position.y + dt * 5, playerTransform.position.z);
        // Log.debug("Player position: " + playerTransform.position.x + ", " + playerTransform.position.y + ", " + playerTransform.position.z);
    },

    destroy: function() {
        this._super();
    }
});