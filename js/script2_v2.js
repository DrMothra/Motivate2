/**
 * Created by atg on 18/07/2016.
 */

var FRAMES_PER_SECOND = 25;
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

    var textureLoader = new THREE.TextureLoader();

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
    var numFrames = 725, validFrames = 708, numPoints = 66, numDims = 3, point=0;
    this.offsetFrame = numFrames - validFrames;
    this.numFrames = numFrames;
    this.frames = [];
    this.rawFrames = [];
    var frame, i, j;
    var frameOffset = numFrames*numDims;

    frameOffset = validFrames*numDims;
    for(frame=0; frame<validFrames; ++frame) {
        this.frames[frame] = [];

        for (i = 0; i < numPoints; ++i) {
            for (j = 0; j < 3; ++j) {
                this.frames[frame][(i * numDims) + j] = facialData[j + (frameOffset * i) + (frame * numDims)];
            }
        }
    }

    //Orientation vector
    this.startVector = new THREE.Vector3();
    this.endVector = new THREE.Vector3();
    this.refVector = new THREE.Vector3(1, 0, 0);
    this.diffVector = new THREE.Vector3();

    var frameData = this.frames[0];
    this.currentFrame = 1;
    this.currentValidFrame = 1;
    this.loader = new THREE.JSONLoader();

    var _this = this;

    this.camera.position.set(0, 0, 400 );

    this.currentFace = 0;
    this.faceTextures = [];
    this.faceTextures.push(textureLoader.load( "images/participant1.jpg" ));
    this.faceTextures.push(textureLoader.load( "images/participant4.jpg" ));
    this.faceTextures.push(textureLoader.load( "images/participant6.jpg" ));

    planeGeom = new THREE.PlaneBufferGeometry(70, 70);
    mat = new THREE.MeshLambertMaterial({ map: this.faceTextures[this.currentFace]});
    this.planeMesh = new THREE.Mesh(planeGeom, mat);
    this.planePosition = new THREE.Vector3(110, 0, 40);
    this.planeMesh.scale.set(1, 1.5, 1);
    this.planeMesh.position.copy(this.planePosition);

    this.scene.add(this.planeMesh);

    /*
    this.loader.load( './models/facePlaneLeigh.json', function ( geometry, materials ) {

        _this.planeMesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        _this.planeMesh.scale.set( 40, 40, 1 );
        _this.planeMesh.position.set(0, 0, 0);
        //_this.skinnedMesh.rotation.x = Math.PI/2;
        _this.scene.add(_this.planeMesh);
    });
    */
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.ScaleX = 1.0;
        this.ScaleY = 1.0;
        this.ScaleZ = 1.0;
        this.PosX = 0;
        this.PosY = 0;
        this.PosZ = 0;
        this.RotX = 0;
        this.RotY = 0;
        this.RotZ = 0;
        this.ScaleFactor = 0.25;
        this.Rotate = true;
        this.Participant = [];
    };

    //Create GUI
    var gui = new dat.GUI();

    var scaleX = gui.add(this.guiControls, 'ScaleX', 0.7, 5).step(0.25);
    scaleX.onChange(function(value) {
        _this.onScaleChanged(X_AXIS, value);
    });

    var scaleY = gui.add(this.guiControls, 'ScaleY', 0.7, 5).step(0.25);
    scaleY.onChange(function(value) {
        _this.onScaleChanged(Y_AXIS, value);
    });

    var scaleZ = gui.add(this.guiControls, 'ScaleZ', 0.7, 5).step(0.25);
    scaleZ.onChange(function(value) {
        _this.onScaleChanged(Z_AXIS, value);
    });

    var posX = gui.add(this.guiControls, 'PosX', 0, 200).step(10);
    posX.onChange(function(value) {
        _this.onPosChanged(X_AXIS, value);
    });

    var posY = gui.add(this.guiControls, 'PosY', 0, 200).step(10);
    posY.onChange(function(value) {
        _this.onPosChanged(Y_AXIS, value);
    });

    var posZ = gui.add(this.guiControls, 'PosZ', 0, 200).step(10);
    posZ.onChange(function(value) {
        _this.onPosChanged(Z_AXIS, value);
    });

    var rotx = gui.add(this.guiControls, 'RotX', -3, 3).step(0.25);
    rotx.onChange(function(value) {
        _this.onRotChanged(X_AXIS, value);
    });

    var roty = gui.add(this.guiControls, 'RotY', -3, 3).step(0.25);
    roty.onChange(function(value) {
        _this.onRotChanged(Y_AXIS, value);
    });

    var rotz = gui.add(this.guiControls, 'RotZ', -3, 3).step(0.25);
    rotz.onChange(function(value) {
        _this.onRotChanged(Z_AXIS, value);
    });

    gui.add(this.guiControls, 'ScaleFactor', 0.01, 0.5).step(0.01);

    gui.add(this.guiControls, 'Rotate');

    this.participants = ['Particpant1', 'Particpant4', 'Particpant6'];

    var faces = gui.add(this.guiControls, 'Participant', this.participants);
    faces.onChange(function(value) {
        _this.onTextureChanged(value);
    });
};

Motivate.prototype.onRotChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.planeMesh.rotation.x = value;
            break;

        case Y_AXIS:
            this.planeMesh.rotation.y = value;
            break;

        case Z_AXIS:
            this.planeMesh.rotation.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.onScaleChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.planeMesh.scale.x = value;
            break;

        case Y_AXIS:
            this.planeMesh.scale.y = value;
            break;

        case Z_AXIS:
            this.planeMesh.scale.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.onPosChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.planeMesh.position.x = value;
            break;

        case Y_AXIS:
            this.planeMesh.position.y = value;
            break;

        case Z_AXIS:
            this.planeMesh.position.z = value;
            break;

        default:
            break;
    }
};

Motivate.prototype.onTextureChanged = function(value) {
    var i;

    for(i=0; i<this.faceTextures.length; ++i) {
        if(value === this.participants[i]) break;
    }

    this.planeMesh.material.map = this.faceTextures[i];
    this.planeMesh.material.map.needsUpdate = true;
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
        this.reset();
        return;
    }

    $('#frame').html(this.currentFrame);
    var point, frameData, previousFrameData;

    //Get vector aligned to face
    //Vector between points 0 and 16
    if(this.currentFrame > this.offsetFrame) {
        point = 0 * 3;
        frameData = this.frames[this.currentValidFrame];
        previousFrameData = this.frames[this.currentValidFrame-1];
        this.startVector.set(frameData[point], frameData[point+1], frameData[point+2]);
        point = 16 * 3;
        this.endVector.set(frameData[point] - this.startVector.x, this.startVector.y - frameData[point+1], this.startVector.z - frameData[point+2]);
        //this.endVector.sub(this.startVector);
        this.planeMesh.quaternion.setFromUnitVectors(this.refVector, this.endVector.normalize());
        point = 29 * 3;
        this.diffVector.set(frameData[point]-previousFrameData[point], -(frameData[point+1]-previousFrameData[point+1]), 0);
        this.planeMesh.position.add(this.diffVector.multiplyScalar(this.guiControls.ScaleFactor));
        ++this.currentValidFrame;
    }

    ++this.currentFrame;
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
Motivate.prototype.reset = function() {
    this.playing = false;
    $('#play').html('Play');
    this.currentFrame = 1;
    this.currentValidFrame = 1;
    this.planeMesh.position.set(80, 50, 40);
    this.elapsedTime = 0;
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

