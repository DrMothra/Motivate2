/**
 * Created by atg on 18/07/2016.
 */

var FRAMES_PER_SECOND = 30;
var INC = 1;
var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;

//Init this app from base
function Motivate() {
    BaseApp.call(this);
}

Motivate.prototype = new BaseApp();

Motivate.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
};

Motivate.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    this.loader = new THREE.JSONLoader();

    this.camera.position.set(0, 0, 5 );
    var _this = this;

    this.loader.load( './models/blue.json', function ( geometry, materials ) {

        _this.skinnedMesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, 1, 1 );
        _this.scene.add(_this.skinnedMesh);

        console.log("Skinned = ", _this.skinnedMesh);
    });

};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.RotX = 0.01;
        this.RotY = 0.01;
        this.RotZ = 0.01;
        this.Rotate = false;
        this.ScaleFactor = 0.25;
    };

    //Create GUI
    var gui = new dat.GUI();

    var rotx = gui.add(this.guiControls, 'RotX', -3, 3).step(0.1);
    rotx.onChange(function(value) {
        _this.onRotChanged(X_AXIS, value);
    });

    var roty = gui.add(this.guiControls, 'RotY', -3, 3).step(0.1);
    roty.onChange(function(value) {
        _this.onRotChanged(Y_AXIS, value);
    });

    var rotz = gui.add(this.guiControls, 'RotZ', -3, 3).step(0.1);
    rotz.onChange(function(value) {
        _this.onRotChanged(Z_AXIS, value);
    });
    gui.add(this.guiControls, 'ScaleFactor', 0.01, 0.5).step(0.01);

    gui.add(this.guiControls, 'Rotate');
};

Motivate.prototype.onRotChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.faceGroup.rotation.x = value;
            break;

        case Y_AXIS:
            this.faceGroup.rotation.y = value;
            break;

        case Z_AXIS:
            this.faceGroup.rotation.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.update = function() {
    //Perform any updates

    var delta = this.clock.getDelta();

    BaseApp.prototype.update.call(this);
};


$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    app.createScene();
    app.createGUI();

    $('#play').on("click", function() {
        app.toggleFrames();
    });

    $('#next').on("click", function() {
        app.stepToNextFrame();
    });

    app.run();
});

