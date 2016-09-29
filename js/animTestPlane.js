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

    //Load plane to play video
    var video = document.getElementById("videoPlayer");
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    var planeGeom = new THREE.PlaneBufferGeometry(400, 300);
    var mat = new THREE.MeshLambertMaterial({color: 0xb5b5b5, transparent: false, map: texture});
    var plane = new THREE.Mesh(planeGeom, mat);
    this.scene.add(plane);

    this.playing = false;
    this.frameTime = 1/FRAMES_PER_SECOND;
    this.pointOne = new THREE.Vector3();
    this.pointTwo = new THREE.Vector3();

    //Sort data
    var numFrames = 331, numPoints = 66, numDims = 3, point=0;
    this.numFrames = numFrames;
    this.frames = [];
    this.rawFrames = [];
    var frame, i, j;
    var frameOffset = numFrames*numDims;
    for(frame=0; frame<numFrames; ++frame) {
        this.frames[frame] = [];

        for (i = 0; i < numPoints; ++i) {
            for (j = 0; j < 3; ++j) {
                this.frames[frame][(i * numDims) + j] = facialData[j + (frameOffset * i) + (frame * numDims)];
            }
        }
    }

    //Raw data
    for(frame=0; frame<numFrames; ++frame) {
        this.rawFrames[frame] = [];

        for (i = 0; i < numPoints; ++i) {
            for (j = 0; j < 3; ++j) {
                this.rawFrames[frame][(i * numDims) + j] = rawData[j + (frameOffset * i) + (frame * numDims)];
            }
        }
    }

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
    this.currentFrame = 1;
    this.neckOffset = 20;
    this.loader = new THREE.JSONLoader();

    this.calcOrigin(0);
    this.startOrigin.copy(this.currentOrigin);

    var _this = this;

    this.camera.position.set(0, 0, 100 );

    this.skinnedMesh = undefined;
    this.loader.load( './models/facePlaneLeigh.json', function ( geometry, materials ) {

        /*
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

        _this.mixer = new THREE.AnimationMixer( skinnedMesh );
        _this.mixer.clipAction( skinnedMesh.geometry.animations[ 0 ] ).play();


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
        */
        _this.skinnedMesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        _this.skinnedMesh.scale.set( 1, _this.guiControls.ScaleY, _this.guiControls.ScaleZ );
        _this.skinnedMesh.position.set(_this.guiControls.PosX, _this.guiControls.PosY, _this.guiControls.PosZ);
        _this.skinnedMesh.rotation.y = -Math.PI/2;
        _this.scene.add(_this.skinnedMesh);
    });
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.ScaleX = 1.0;
        this.ScaleY = 80.0;
        this.ScaleZ = 39.0;
        this.PosX = 13;
        this.PosY = 39;
        this.PosZ = 9;
        this.Rotate = true;
        this.ScaleFactor = 0.25;
    };

    //Create GUI
    var gui = new dat.GUI();

    var scaleX = gui.add(this.guiControls, 'ScaleX', 0.1, 100).step(0.25);
    scaleX.onChange(function(value) {
        _this.onScaleChanged(X_AXIS, value);
    });

    var scaleY = gui.add(this.guiControls, 'ScaleY', 0.1, 100).step(0.25);
    scaleY.onChange(function(value) {
        _this.onScaleChanged(Y_AXIS, value);
    });

    var scaleZ = gui.add(this.guiControls, 'ScaleZ', 0.1, 100).step(0.25);
    scaleZ.onChange(function(value) {
        _this.onScaleChanged(Z_AXIS, value);
    });

    var posX = gui.add(this.guiControls, 'PosX', -100, 100).step(0.25);
    posX.onChange(function(value) {
        _this.onPosChanged(X_AXIS, value);
    });

    var posY = gui.add(this.guiControls, 'PosY', -100, 100).step(0.25);
    posY.onChange(function(value) {
        _this.onPosChanged(Y_AXIS, value);
    });

    var posZ = gui.add(this.guiControls, 'PosZ', -100, 100).step(0.25);
    posZ.onChange(function(value) {
        _this.onPosChanged(Z_AXIS, value);
    });

    gui.add(this.guiControls, 'ScaleFactor', 0.01, 0.5).step(0.01);

    gui.add(this.guiControls, 'Rotate');
};

Motivate.prototype.onRotChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.skinnedMesh.rotation.x = value;
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

Motivate.prototype.onScaleChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.skinnedMesh.scale.x = value;
            break;

        case Y_AXIS:
            this.skinnedMesh.scale.y = value;
            break;

        case Z_AXIS:
            this.skinnedMesh.scale.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.onPosChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.skinnedMesh.position.x = value;
            break;

        case Y_AXIS:
            this.skinnedMesh.position.y = value;
            break;

        case Z_AXIS:
            this.skinnedMesh.position.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.update = function() {
    //Perform any updates
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
        this.skinnedMesh.rotation.x = xRotation;
        this.skinnedMesh.rotation.y = yRotation;
        this.skinnedMesh.rotation.z = zRotation;
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

