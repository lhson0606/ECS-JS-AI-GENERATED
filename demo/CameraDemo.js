/**
 * A demo scene that shows how to use the ECS camera system
 */
gv = gv || {};

var CameraDemo = cc.Layer.extend({
    ctor: function() {
        this._super();
        return true;
    },

    onEnter: function() {
        this._super();
        Log.debug("CameraDemo: onEnter");
        // gv.ECSEngine.reset();
        this.init();
        gv.ECSEngine.run();
    },

    init:function() {
        const sizes = cc.director.getVisibleSize();

        this.player = gv.EntityManager.createEntity();
        var transform = gv.ComponentManager.addComponent(this.player, ECS.TransformComponent);
        transform.setPosition(0, 0, 0);
        var sprite = gv.ComponentManager.addComponent(this.player, ECS.SpriteRenderer);
        sprite.setUseCamera(true);
        sprite.setTexture(res.images.ui.LOGO);

        // var logo = cc.Sprite(res.images.ui.LOGO);
        // logo.setPosition(300, 300);
        // this.addChild(logo, CONFIG_LAYERS.UI_BACKGROUND + 1);
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);
    },

    update: function(dt) {
        // Log.debug("CameraDemo: update");
        var camera = gv.Camera;
        var cameraTransform = gv.ComponentManager.getComponent(camera.entityId, "TransformComponent");
        var rotation = cameraTransform.rotation;
        var cameraPosition = cameraTransform.position;
        // test move camera
        // camera.moveBy(dt * 5, dt * 5, dt * 5);
        // test spin camera
        // camera.setRotation(0, 0, rotation.z + dt * 5);
        camera.moveTo(cameraPosition.x + dt * 5, cameraPosition.y + dt * 5, cameraPosition.z + dt * 5);

        var playerTransform = gv.ComponentManager.getComponent(this.player, "TransformComponent");
        // playerTransform.translate(dt * 5, dt * 5, dt * 5);
        // move player
        // playerTransform.setPosition(playerTransform.position.x + dt * 5, playerTransform.position.y + dt * 5, playerTransform.position.z);
        // Log.debug("Player position: " + playerTransform.position.x + ", " + playerTransform.position.y + ", " + playerTransform.position.z);
    },

    destroy: function() {
        this._super();
        gv.ECSEngine.stop();
    }
});