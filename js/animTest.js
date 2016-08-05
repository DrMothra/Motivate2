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

    this.playing = false;
    this.frameTime = 1/FRAMES_PER_SECOND;
    this.pointOne = new THREE.Vector3();
    this.pointTwo = new THREE.Vector3();

    //DEBUG shapes
    var geom = new THREE.BoxBufferGeometry(20, 10, 5);
    var mat = new THREE.MeshLambertMaterial( {color: 0xff0000});
    this.debugShape = new THREE.Mesh(geom, mat);
    this.debugShape.rotation.x = -Math.PI/2;
    //this.scene.add(this.debugShape);

    //Sort data
    var numFrames = 331, numPoints = 66, numDims = 3, point=0;
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
        /*
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
        { feature: "leftEyebrowLeft1", point: 25, boneNum: 20},
        { feature: "leftEyebrowLeft2", point: 26, boneNum: 21},
        { feature: "leftEyebrowMiddle", point: 24, boneNum: 22},
        { feature: "leftEyebrowRight1", point: 23, boneNum: 23},
        { feature: "leftEyebrowRight2", point: 22, boneNum: 24},
        { feature: "rightEyebrowLeft1", point: 20, boneNum: 25},
        { feature: "rightEyebrowLeft2", point: 21, boneNum: 26},
        { feature: "rightEyebrowMiddle", point: 19, boneNum: 27},
        { feature: "rightEyebrowRight2", point: 17, boneNum: 28},
        { feature: "rightEyebrowRight1", point: 18, boneNum: 29},
        { feature: "topLeftEyelid1", point: 44, boneNum: 30},
        { feature: "topLeftEyelid2", point: 43, boneNum: 31},
        { feature: "topLeftEyelid2", point: 43, boneNum: 31},
        { feature: "topLipLeft1", point: 52, boneNum: 32},
        { feature: "topLipLeft2", point: 53, boneNum: 33},
        { feature: "topLipLeft3", point: 54, boneNum: 34},
        { feature: "topLipMiddle", point: 51, boneNum: 35},
        { feature: "topLipRight1", point: 50, boneNum: 36},
        { feature: "topLipRight2", point: 49, boneNum: 37},
        { feature: "topLipRight3", point: 48, boneNum: 38},
        { feature: "topRightEyelid1", point: 37, boneNum: 39},
        { feature: "topRightEyelid2", point: 38, boneNum: 40}
        */


        { feature: "bottomLipLeft1", point: 56, boneNum: 1, constraint: -1},
        { feature: "bottomLipLeft2", point: 55, boneNum: 2, constraint: -1},
        { feature: "bottomLipMiddle", point: 57, boneNum: 3, constraint: -1},
        { feature: "bottomLipRight1", point: 58, boneNum: 4, constraint: -1},
        { feature: "bottomLipRight2", point: 59, boneNum: 5, constraint: -1},
        { feature: "topLipLeft1", point: 52, boneNum: 6, constraint: 1},
        { feature: "topLipLeft2", point: 53, boneNum: 7, constraint: 1},
        { feature: "topLipLeft3", point: 54, boneNum: 8, constraint: 1},
        { feature: "topLipMiddle", point: 51, boneNum: 9, constraint: 1},
        { feature: "topLipRight1", point: 50, boneNum: 10, constraint: 1},
        { feature: "topLipRight2", point: 49, boneNum: 11, constraint: 1},
        { feature: "topLipRight3", point: 48, boneNum: 12, constraint: 1}
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
    this.deltaVector = new THREE.Vector3();
    this.originVector = new THREE.Vector3();
    this.refVector = new THREE.Vector3(0, 100, 0);
    this.deltaQuat = new THREE.Quaternion();
    this.xAxis = new THREE.Vector3(1, 0, 0);
    this.rotatedVector = new THREE.Vector3();
    this.currentPoint = new THREE.Vector3();
    this.previousOrigin = new THREE.Vector3();

    var frameData = this.frames[0];
    var point;
    this.limitPos = [];
    for(var i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        this.limitPos.push(frameData[point+1]);
    }
    this.currentFrame = 1;
    this.loader = new THREE.JSONLoader();

    this.calcOrigin(0);
    this.previousOrigin.copy(this.originVector);
    this.calcOrigin(1);

    var _this = this;
    this.skinnedMesh = undefined;
    this.mixer = undefined;
    this.loader.load( './models/headBoneAnimationMesh9.js', function ( geometry, materials ) {

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

        var frameData = _this.frames[0];
        _this.startBonePos = [];
        var boneNumber;
        var bonePos = new THREE.Vector3();
        for(i=0; i<_this.facialFeatures.length; ++i) {
            boneNumber = _this.facialFeatures[i].boneNum;
            bonePos = _this.skinnedMesh.skeleton.bones[boneNumber].position;
            _this.startBonePos.push(new THREE.Vector3(bonePos.x, bonePos.y, bonePos.z));
        }
        //DEBUG
        //_this.skinnedMesh.visible = false;
        console.log("Skinned = ", _this.skinnedMesh);
    });
};

Motivate.prototype.resetBones = function() {
    //Set all bones to start pos
    var boneNumber;
    for(var i=0; i<this.facialFeatures.length; ++i) {
        boneNumber = this.facialFeatures[i].boneNum;
        this.skinnedMesh.skeleton.bones[boneNumber].position.set(this.startBonePos[i].x, this.startBonePos[i].y, this.startBonePos[i].z);
    }
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.RotX = 0.01;
        this.RotY = 0.01;
        this.RotZ = 0.01;
        this.Rotate = false;
        this.ScaleFactor = 0.05;
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
    gui.add(this.guiControls, 'ScaleFactor', 0.01, 0.2).step(0.01);

    gui.add(this.guiControls, 'Rotate');
};

Motivate.prototype.onRotChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.skinnedMesh.rotation.x = -Math.PI/2 - value;
            break;

        case Y_AXIS:
            this.skinnedMesh.rotation.y = value;
            break;

        case Z_AXIS:
            this.skinnedMesh.rotation.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.update = function() {
    //Perform any updates
    if(!this.animating) return;

    var delta = this.clock.getDelta();

    if(this.playing) {
        this.elapsedTime += delta;
        if(this.elapsedTime >= this.frameTime) {
            this.elapsedTime = 0;
            this.renderFrame();
        }
    }

    BaseApp.prototype.update.call(this);
};

Motivate.prototype.renderFrame = function() {
    if(this.currentFrame >= this.numFrames) {
        this.calcOrigin(0);
        this.previousOrigin.copy(this.originVector);
        this.currentFrame = 1;
        this.calcOrigin(this.currentFrame);
        this.resetBones();
    }

    $('#frame').html(this.currentFrame);
    var point, i, boneNumber, test, xTheta;
    var current, previous;
    var frameData = this.frames[this.currentFrame];
    var previousFrameData = this.frames[this.currentFrame-1];

    //Get origin
    this.calcOrigin(this.currentFrame);

    //Vector from bridge of nose
    point = 28 * 3;
    this.deltaVector.x = frameData[point] - this.originVector.x;
    this.deltaVector.y = frameData[point+1] - this.originVector.y;
    this.deltaVector.z = frameData[point+2] - this.originVector.z;

    //x-axis rotation
    xTheta = this.refVector.angleTo(this.deltaVector);
    //Angle from zero not 90 degrees
    xTheta = Math.PI/2 - xTheta;
    this.deltaQuat.setFromAxisAngle(this.xAxis, -xTheta);

    this.deltaVector.subVectors(this.originVector, this.previousOrigin);

    for(i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        boneNumber = this.facialFeatures[i].boneNum;
        test = this.facialFeatures[i].constraint;

        /*
        this.currentPoint.x = frameData[point];
        this.currentPoint.y = frameData[point+1];
        this.currentPoint.z = frameData[point+2];

        this.rotatedVector.x = frameData[point];
        this.rotatedVector.y = frameData[point+1];
        this.rotatedVector.z = frameData[point+2];

        this.rotatedVector.applyQuaternion(this.deltaQuat);
        this.currentPoint.sub(this.rotatedVector);

        this.currentPoint.multiplyScalar(0.001);
        this.skinnedMesh.skeleton.bones[boneNumber].position.add(this.currentPoint);
        */

        this.deltaPos.x = frameData[point] - previousFrameData[point];
        this.deltaPos.y = frameData[point+2] - previousFrameData[point+2];
        //DEBUG
        this.deltaPos.x = this.deltaPos.y = 0;
        current = frameData[point+1];
        previous = previousFrameData[point+1];

        if(test === 1) {
            if(current > this.limitPos[i]) current = this.limitPos[i];
            if(previous > this.limitPos[i]) previous = this.limitPos[i];
        }
        if(test === -1) {
            if(current < this.limitPos[i]) current = this.limitPos[i];
            if(previous < this.limitPos[i]) previous = this.limitPos[i];
        }
        this.deltaPos.z = (current - previous) - (this.deltaVector.y);
        this.deltaPos.z *= -1;

        $('#yPoint').html(this.deltaPos.z);

        this.deltaPos.multiplyScalar(this.guiControls.ScaleFactor);
        this.skinnedMesh.skeleton.bones[boneNumber].position.add(this.deltaPos);
    }


    //Rotation
    //$('#frame').html(this.currentFrame);
    point = 16*3;

    //About Z-axis
    if(this.guiControls.Rotate) {
        this.pointTwo.set(frameData[point], frameData[point+1], 0);
        this.pointOne.set(frameData[0], frameData[1], 0);
        var dist = this.pointTwo.distanceTo(this.pointOne);
        var deltaY = frameData[point+1] - frameData[1];
        var theta = Math.asin(deltaY/dist);
        //This is y axis on model
        //DEBUG
        this.skinnedMesh.rotation.y = theta;
        //$('#rotZ').html(theta);

        //About y-axis
        this.pointTwo.set(frameData[point], 0, frameData[point+2]);
        this.pointOne.set(frameData[0], 0, frameData[2]);
        dist = this.pointTwo.distanceTo(this.pointOne);
        var deltaZ = frameData[point+2] - frameData[2];
        theta = Math.asin(deltaZ/dist);
        //This is z axis on model
        //DEBUG
        this.skinnedMesh.rotation.z = theta;
        //this.debugShape.rotation.z = theta*20;
        //$('#rotY').html(theta);

        //About x-axis
        point = 28*3;
        this.pointTwo.set(0, frameData[point+1], frameData[point+2]);
        this.pointOne.set(0, frameData[1], frameData[2]);
        dist = this.pointTwo.distanceTo(this.pointOne);
        deltaY = frameData[point+1] - frameData[1];
        theta = Math.asin(deltaY/dist);
        //DEBUG
        this.skinnedMesh.rotation.x = -Math.PI/2 + theta;
        //this.debugShape.rotation.x = this.skinnedMesh.rotation.x;
        //$('#rotX').html(theta);
    }

    this.previousOrigin.copy(this.originVector);

    ++this.currentFrame;
};

Motivate.prototype.calcOrigin = function(frame) {
    //Origin is point between ears - points 16 and 0
    var point = 16 * 3;
    var frameData = this.frames[frame];
    this.originVector.x = frameData[point] - frameData[0];
    this.originVector.y = frameData[point+1] - frameData[1];
    this.originVector.z = frameData[point+2] - frameData[2];
    this.originVector.multiplyScalar(0.5);
    this.originVector.x += frameData[0];
    this.originVector.y += frameData[1];
    this.originVector.z += frameData[2];
};

Motivate.prototype.toggleFrames = function() {
    this.playing = !this.playing;
    $('#play').html(this.playing ? 'Pause' : 'Play');
    var videoElem = document.getElementById("videoPlayer");
    this.playing ? videoElem.play() : videoElem.pause();
};

Motivate.prototype.stepToNextFrame = function() {
    if(this.playing) return;

    this.renderFrame();
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

