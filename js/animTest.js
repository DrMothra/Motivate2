/**
 * Created by atg on 18/07/2016.
 */


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

    var _this = this;
    var skinnedMesh;
    this.mixer = undefined;
    this.loader.load( './models/cylinderMorph.js', function ( geometry, materials ) {

        for ( var k in materials ) {

            materials[k].skinning = true;

        }

        skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
        skinnedMesh.scale.set( 1, 1, 1 );

        // Note: We test the corresponding code path with this example -
        // you shouldn't include the next line into your own code:
        skinnedMesh.skeleton.useVertexTexture = false;

        _this.scene.add( skinnedMesh );

        _this.mixer = new THREE.AnimationMixer( skinnedMesh );
        _this.mixer.clipAction( skinnedMesh.geometry.animations[ 0 ] ).play();
    });
};

Motivate.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();

    if(this.mixer) {
        this.mixer.update(delta);
    }
    BaseApp.prototype.update.call(this);
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    app.createScene();

    app.run();
});

