/**
 * Created by atg on 18/07/2016.
 */

var FRAME_TIME = 0.04;
var INC = 1;

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

    this.animating = false;

    //Sort data
    var numFrames = 300, numPoints = 66, numDims = 3, point=0;
    this.numFrames = numFrames;
    this.frames = [];
    var frame, i;
    var frameOffset = numFrames*numDims;
    for(frame=0; frame<numFrames; ++frame) {
        this.frames[frame] = [];

        for (i = 0; i < numPoints; ++i) {
            for (var j = 0; j < 3; ++j) {
                this.frames[frame][(i * numDims) + j] = facialData[j + (frameOffset * i) + (frame * numDims)];
            }
        }
    }

    this.facialFeatures = [
        { feature: "bottomLeftEyelid1", point: 45, boneNum: 1},
        { feature: "bottomLeftEyelid2", point: 46, boneNum: 2},
        { feature: "bottomLeftEyelid3", point: 47, boneNum: 3},
        { feature: "bottomLeftEyelid4", point: 42, boneNum: 4},
        { feature: "bottomLipLeft1", point: 56, boneNum: 5},
        { feature: "bottomLipLeft2", point: 55, boneNum: 6},
        { feature: "bottomLipMiddle", point: 57, boneNum: 7},
        { feature: "bottomLipRight1", point: 58, boneNum: 8},
        { feature: "bottomLipRight2", point: 59, boneNum: 9},
        { feature: "bottomRightEyelid1", point: 36, boneNum: 10},
        { feature: "bottomRightEyelid2", point: 41, boneNum: 11},
        { feature: "bottomRightEyelid3", point: 40, boneNum: 12},
        { feature: "bottomRightEyelid4", point: 39, boneNum: 13},
        { feature: "innerBottomLipLeft", point: 63, boneNum: 14},
        { feature: "innerBottomLipMiddle", point: 64, boneNum: 15},
        { feature: "innerBottomLipRight", point: 65, boneNum: 16},
        { feature: "innerTopLipLeft", point: 62, boneNum: 17},
        { feature: "innerTopLipMiddle", point: 61, boneNum: 18},
        { feature: "innerTopLipRight", point: 60, boneNum: 19},
        { feature: "topLeftEyelid1", point: 44, boneNum: 20},
        { feature: "topLeftEyelid2", point: 43, boneNum: 21},
        { feature: "topLipLeft1", point: 52, boneNum: 22},
        { feature: "topLipLeft2", point: 53, boneNum: 23},
        { feature: "topLipLeft3", point: 54, boneNum: 24},
        { feature: "topLipMiddle", point: 51, boneNum: 25},
        { feature: "topLipRight1", point: 50, boneNum: 26},
        { feature: "topLipRight2", point: 49, boneNum: 27},
        { feature: "topLipRight3", point: 48, boneNum: 28},
        { feature: "topRightEyelid1", point: 37, boneNum: 29},
        { feature: "topRightEyelid2", point: 38, boneNum: 30}
    ];

    //DEBUG spheres
    /*
    var geom = new THREE.SphereBufferGeometry(0.5, 16, 16);
    var mat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
    this.spheres = [];
    for(i=0; i<1; ++i) {
        this.spheres.push(new THREE.Mesh(geom, mat));
        this.scene.add(this.spheres[i]);
    }
    */

    //Bone update positions
    this.deltaPos = new THREE.Vector3();
    this.lastBonePos = [];
    var frameData = this.frames[0];
    for(i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        //DEBUG
        //this.lastBonePos.push(new THREE.Vector3(0, 0, 0));
        this.lastBonePos.push(new THREE.Vector3(frameData[point], frameData[point+1], frameData[point+2]));
    }

    this.currentFrame = 1;
    this.loader = new THREE.JSONLoader();

    var _this = this;
    this.skinnedMesh = undefined;
    this.mixer = undefined;
    this.loader.load( './models/headBoneAnimationMesh3.js', function ( geometry, materials ) {

        for ( var k in materials ) {

            materials[k].skinning = true;

        }

        _this.skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, 1, 1 );
        _this.skinnedMesh.rotation.x = -Math.PI/2;

        // Note: We test the corresponding code path with this example -
        // you shouldn't include the next line into your own code:
        //skinnedMesh.skeleton.useVertexTexture = false;

        _this.scene.add( _this.skinnedMesh );
        _this.animating = true;
        /*
        _this.mixer = new THREE.AnimationMixer( skinnedMesh );
        _this.mixer.clipAction( skinnedMesh.geometry.animations[ 0 ] ).play();
        */

        //DEBUG
        //_this.skinnedMesh.visible = false;
        console.log("Skinned = ", _this.skinnedMesh);
    });
};

Motivate.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();

    if(!this.animating) return;

    this.elapsedTime += delta;
    if(this.elapsedTime >= FRAME_TIME) {
        this.elapsedTime = 0;
        //if(this.headMesh) {
        this.renderFrame();
        //}
    }

    /*
    if(this.mixer) {
        this.mixer.update(delta);
    }
    */

    BaseApp.prototype.update.call(this);
};

Motivate.prototype.renderFrame = function() {
    if(this.currentFrame >= this.numFrames) return;

    var point, i, boneNumber;
    var frameData = this.frames[this.currentFrame];

    for(i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        boneNumber = this.facialFeatures[i].boneNum;

        //DEBUG
        /*
        frameData[point] = 0;
        frameData[point+1] = 0;
        frameData[point+2] = 2 * this.currentFrame;
        */

        this.deltaPos.x = frameData[point] - this.lastBonePos[i].x;
        this.deltaPos.y = (frameData[point+2] - this.lastBonePos[i].z) * -1;
        this.deltaPos.z = frameData[point+1] - this.lastBonePos[i].y;

        this.deltaPos.multiplyScalar(0.05);
        this.skinnedMesh.skeleton.bones[boneNumber].position.add(this.deltaPos);

        this.lastBonePos[i].x = frameData[point];
        this.lastBonePos[i].y = frameData[point+1];
        this.lastBonePos[i].z = frameData[point+2];

        //DEBUG
        if(point === 37*3) {
            console.log("Delta = ", this.deltaPos);
        }
    }

    ++this.currentFrame;
};

Motivate.prototype.resetFrames = function() {
    //Bones back to start
    var point = 37*3;
    var frameData = this.frames[0];
    this.lastBonePos.x = frameData[point];
    this.lastBonePos.z = frameData[point+1];
    this.lastBonePos.y = frameData[point+2];
    this.currentFrame = 1;
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    app.createScene();

    $('#control').on("click", function() {
        app.resetFrames();
    });

    app.run();
});

