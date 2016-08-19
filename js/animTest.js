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
    this.rawFrames = [];
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

    //Raw data
    for(frame=0; frame<numFrames; ++frame) {
        this.rawFrames[frame] = [];

        for (i = 0; i < numPoints; ++i) {
            for (var j = 0; j < 3; ++j) {
                this.rawFrames[frame][(i * numDims) + j] = rawData[j + (frameOffset * i) + (frame * numDims)];
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


        { feature: "BottomLeftEyelid2", point: 46, boneNum: 1, constraint: -1},
        { feature: "BottomLeftEyelid3", point: 47, boneNum: 2, constraint: -1},
        { feature: "BottomLipLeft1", point: 56, boneNum: 3, constraint: -1},
        { feature: "BottomLipLeft2", point: 55, boneNum: 4, constraint: -1},
        { feature: "BottomLipMiddle", point: 57, boneNum: 5, constraint: -1},
        { feature: "BottomLipRight1", point: 58, boneNum: 6, constraint: 1},
        { feature: "BottomLipRight2", point: 59, boneNum: 7, constraint: 1},
        { feature: "BottomRightEyelid2", point: 41, boneNum: 8, constraint: 1},
        { feature: "BottomRightEyelid3", point: 40, boneNum: 9, constraint: 1},
        { feature: "LeftEyebrowLeft2", point: 26, boneNum: 10, constraint: 1},
        { feature: "LeftEyebrowMiddle", point: 24, boneNum: 11, constraint: 1},
        { feature: "LeftEyebrowRight2", point: 22, boneNum: 12, constraint: 1},
        { feature: "RightEyebrowLeft2", point: 21, boneNum: 13, constraint: 1},
        { feature: "RightEyebrowMiddle", point: 19, boneNum: 14, constraint: 1},
        { feature: "RightEyebrowRight2", point: 17, boneNum: 15, constraint: 1},
        { feature: "TopLeftEyelid1", point: 44, boneNum: 16, constraint: 1},
        { feature: "TopLeftEyelid2", point: 43, boneNum: 17, constraint: 1},
        { feature: "TopLipLeft3", point: 54, boneNum: 18, constraint: 1},
        { feature: "TopLipMiddle", point: 51, boneNum: 19, constraint: 1},
        { feature: "TopLipRight3", point: 48, boneNum: 20, constraint: 1},
        { feature: "TopRightEyelid1", point: 37, boneNum: 21, constraint: 1},
        { feature: "TopRightEyelid2", point: 38, boneNum: 22, constraint: 1}
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
    this.startOrigin = new THREE.Vector3();
    this.currentOrigin = new THREE.Vector3();
    this.rawOrigin = new THREE.Vector3();
    this.deltaOrigin = new THREE.Vector3();
    this.deltaPos = new THREE.Vector3();
    this.deltaVector = new THREE.Vector3();
    this.refXVector = new THREE.Vector3(0, 1, 0);
    this.refYVector = new THREE.Vector3(0, 0, -1);

    var frameData = this.frames[0];
    this.startPos = [];
    for(i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        this.startPos.push(frameData[point+1]);
    }
    this.currentFrame = 1;
    this.neckOffset = 20;
    this.loader = new THREE.JSONLoader();

    this.calcOrigin(0);
    this.startOrigin.copy(this.currentOrigin);

    var _this = this;
    this.faceGroup = new THREE.Object3D();
    this.faceGroup.position.y = -this.neckOffset;
    this.scene.add(this.faceGroup);

    this.camera.position.set(0, 0, 100 );

    this.skinnedMesh = undefined;
    this.loader.load( './models/headBoneAnimationMesh13.js', function ( geometry, materials ) {

        for ( var k in materials ) {

            materials[k].skinning = true;

        }

        //DEBUG - Neck position
        var sphereGeom = new THREE.SphereBufferGeometry(3, 16, 16);
        var sphereMat = new THREE.MeshLambertMaterial( {color: 0x00ff00});
        var sphere = new THREE.Mesh(sphereGeom, sphereMat);
        //_this.scene.add(sphere);

        _this.skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, 1, 1 );
        _this.skinnedMesh.rotation.x = -Math.PI/2;
        _this.skinnedMesh.position.y = _this.neckOffset;
        _this.faceGroup.add(_this.skinnedMesh);

        // Note: We test the corresponding code path with this example -
        // you shouldn't include the next line into your own code:
        //skinnedMesh.skeleton.useVertexTexture = false;

        //_this.scene.add( _this.skinnedMesh );
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

    this.loader.load('./models/headMeshEyes.js', function(geometry, materials) {
        _this.eyeMesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        _this.eyeMesh.position.y = _this.neckOffset;
        _this.faceGroup.add(_this.eyeMesh);
    })
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
    if(!this.animating) return;

    var delta = this.clock.getDelta();

    if(this.playing) {
        this.elapsedTime += delta;
        if(this.elapsedTime >= this.frameTime) {
            this.elapsedTime -= this.frameTime;
            this.renderFrame();
        }
    }

    BaseApp.prototype.update.call(this);
};

Motivate.prototype.renderFrame = function() {
    if(this.currentFrame >= this.numFrames) {
        this.currentFrame = 1;
        this.resetBones();
    }

    $('#frame').html(this.currentFrame);
    var point, i, boneNumber, test, xRotation, yRotation, zRotation;
    var current, previous;
    var frameData = this.frames[this.currentFrame];
    var rawData = this.rawFrames[this.currentFrame];
    var previousFrameData = this.frames[this.currentFrame-1];

    //Get origin
    this.calcOrigin(this.currentFrame);
    this.deltaOrigin.subVectors(this.currentOrigin, this.startOrigin);

    //Rotations
    this.calcRawOrigin(this.currentFrame);
    //Vector from bridge of nose
    point = 28 * 3;
    //DEBUG
    //console.log("Raw origin = ", this.rawOrigin);

    this.deltaVector.x = rawData[point] - this.rawOrigin.x;
    this.deltaVector.y = rawData[point+1] - this.rawOrigin.y;
    this.deltaVector.z = rawData[point+2] - this.rawOrigin.z;

    //console.log("Delta = ", this.deltaVector);

    //x-axis rotation
    xRotation = this.refXVector.angleTo(this.deltaVector);

    //y-axis rotation
    point = 0;
    this.deltaVector.x = rawData[point] - this.rawOrigin.x;
    this.deltaVector.y = rawData[point+1] - this.rawOrigin.y;
    this.deltaVector.z = rawData[point+2] - this.rawOrigin.z;

    yRotation = this.refYVector.angleTo(this.deltaVector);

    //z-axis rotation
    zRotation = this.refXVector.angleTo(this.deltaVector);

    if(this.guiControls.Rotate) {
        this.faceGroup.rotation.x = Math.PI/2 - xRotation;
        this.faceGroup.rotation.y = Math.PI/2 - yRotation;
        this.faceGroup.rotation.z = Math.PI/2 - zRotation;
    }

    for(i=0; i<this.facialFeatures.length; ++i) {
        point = this.facialFeatures[i].point * 3;
        boneNumber = this.facialFeatures[i].boneNum;
        test = this.facialFeatures[i].constraint;

        this.deltaPos.x = frameData[point] - previousFrameData[point];
        this.deltaPos.y = frameData[point+2] - previousFrameData[point+2];

        current = frameData[point+1] - this.deltaOrigin.y;
        current -= this.startPos[i];

        /*
        if(test === 1) {
            if(current > 0) {
                current = 0;
            }
        }


        if(test === -1) {
            if(current > 0) {
                current = 0;
            }
        }
        */

        this.deltaPos.z = current * -1;
        //DEBUG
        //this.deltaPos.x = 0;
        //this.deltaPos.y = 0;

        $('#yPoint').html(this.deltaPos.z);

        this.deltaPos.multiplyScalar(this.guiControls.ScaleFactor);
        this.skinnedMesh.skeleton.bones[boneNumber].position.set(this.startBonePos[i].x, this.startBonePos[i].y, this.startBonePos[i].z + this.deltaPos.z);
    }

    ++this.currentFrame;
};

Motivate.prototype.calcOrigin = function(frame) {
    //Origin is point between ears - points 16 and 0
    var point = 16 * 3;
    var frameData = this.frames[frame];
    this.currentOrigin.x = frameData[point] - frameData[0];
    this.currentOrigin.y = frameData[point+1] - frameData[1];
    this.currentOrigin.z = frameData[point+2] - frameData[2];
    this.currentOrigin.multiplyScalar(0.5);
    this.currentOrigin.x += frameData[0];
    this.currentOrigin.y += frameData[1];
    this.currentOrigin.z += frameData[2];
};

Motivate.prototype.calcRawOrigin = function(frame) {
    //Origin is point between ears - points 16 and 0
    var point = 16 * 3;
    var rawData = this.rawFrames[frame];
    this.rawOrigin.x = rawData[point] - rawData[0];
    this.rawOrigin.y = rawData[point+1] - rawData[1];
    this.rawOrigin.z = rawData[point+2] - rawData[2];
    this.rawOrigin.multiplyScalar(0.5);
    this.rawOrigin.x += rawData[0];
    this.rawOrigin.y += rawData[1];
    this.rawOrigin.z += rawData[2];
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

