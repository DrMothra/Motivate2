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

    this.loader.load( './models/facePlaneLeigh.json', function ( geometry, materials ) {

        /*
        for ( var k in materials ) {

            //materials[k].skinning = true;

        }

        _this.skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, 1, 1 );
        _this.scene.add(_this.skinnedMesh);

        var boneNames = [];
        for(var i=0; i<_this.skinnedMesh.skeleton.bones.length; ++i) {
            boneNames.push(_this.skinnedMesh.skeleton.bones[i].name);
        }

        _this.gui.add(_this.guiControls, "Bones", boneNames);

        console.log("Skinned = ", _this.skinnedMesh);
        */
        _this.skinnedMesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, 1, 1 );
        _this.skinnedMesh.rotation.y = -Math.PI/2;
        _this.scene.add(_this.skinnedMesh);
    });

};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.Bones = "";
        this.PosX = 0.01;
        this.PosY = 0.01;
        this.PosZ = 0.01;
        this.RotX = 0.01;
        this.RotY = 0.01;
        this.RotZ = 0.01;
        
        this.ScaleFactor = 0.25;
    };

    var stepSize = 0.01;
    //Create GUI
    this.gui = new dat.GUI();

    var posx = this.gui.add(this.guiControls, "PosX", -10, 10).step(stepSize);
    posx.onChange(function(value) {
        _this.onBonePosChanged(X_AXIS, value);
    });

    var posy = this.gui.add(this.guiControls, "PosY", -10, 10).step(stepSize);
    posy.onChange(function(value) {
        _this.onBonePosChanged(Y_AXIS, value);
    });

    var posz = this.gui.add(this.guiControls, "PosZ", -10, 10).step(stepSize);
    posz.onChange(function(value) {
        _this.onBonePosChanged(Z_AXIS, value);
    });

    var rotx = this.gui.add(this.guiControls, "RotX", -4, 4).step(0.1);
    rotx.onChange(function(value) {
        _this.onBoneRotChanged(X_AXIS, value);
    });

    var roty = this.gui.add(this.guiControls, "RotY", -4, 4).step(0.1);
    roty.onChange(function(value) {
        _this.onBoneRotChanged(Y_AXIS, value);
    });

    var rotz = this.gui.add(this.guiControls, "RotZ", -4, 4).step(0.1);
    rotz.onChange(function(value) {
        _this.onBoneRotChanged(Z_AXIS, value);
    });

    this.gui.add(this.guiControls, 'ScaleFactor', 0.01, 0.5).step(0.01);
    
};

Motivate.prototype.onBonePosChanged = function(axis, value) {
    var boneFound = false;
    var boneName = this.guiControls.Bones || "MASTER";
    var bones = this.skinnedMesh.skeleton.bones;
    for(var i=0; i<bones.length; ++i) {
        if(boneName === bones[i].name) {
            boneFound = true;
            break;
        }
    }

    if(!boneFound) return;

    switch(axis) {
        case X_AXIS:
            bones[i].position.x = value;
            break;

        case Y_AXIS:
            bones[i].position.y = value;
            break;

        case Z_AXIS:
            bones[i].position.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.onBoneRotChanged = function(axis, value) {
    var boneFound = false;
    var boneName = this.guiControls.Bones || "MASTER";
    var bones = this.skinnedMesh.skeleton.bones;
    for(var i=0; i<bones.length; ++i) {
        if(boneName === bones[i].name) {
            boneFound = true;
            break;
        }
    }

    if(!boneFound) return;

    switch(axis) {
        case X_AXIS:
            bones[i].rotation.x = value;
            break;

        case Y_AXIS:
            bones[i].rotation.y = value;
            break;

        case Z_AXIS:
            bones[i].rotation.z = value;
            break;

        default:
            break;
    }
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

