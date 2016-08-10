/**
 * Created by atg on 05/07/2016.
 */

var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;
var NUM_LINES = 3, NUM_POINTS = 66;
var EYE_POINTS = 6, MOUTH_POINTS = 12;

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

    //Delta vectors
    this.deltaVector = new THREE.Vector3();
    this.deltaPos = new THREE.Vector3();
    this.pointOne = new THREE.Vector3();
    this.pointTwo = new THREE.Vector3();
    this.deltaQuat = new THREE.Quaternion();
    this.xAxis = new THREE.Vector3(1, 0, 0);
    this.tempVector = new THREE.Vector3();
    this.originVector = new THREE.Vector3();
    this.previousOrigin = new THREE.Vector3();
    this.refVector = new THREE.Vector3(0, 100, 0);
    this.rotatedVector = new THREE.Vector3();
    this.currentPoint = new THREE.Vector3();

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

    //Create points
    var sphereGeom = new THREE.SphereBufferGeometry(0.5, 16, 16);
    this.sphereMatBlue = new THREE.MeshLambertMaterial( {color:0x0000ff});
    this.sphereMatWhite = new THREE.MeshLambertMaterial( {color:0xffffff});
    this.spheres = [];
    this.sphereGroup = new THREE.Object3D();
    this.scene.add(this.sphereGroup);

    for(i=0; i<NUM_POINTS; ++i) {
        this.spheres.push(new THREE.Mesh(sphereGeom, this.sphereMatBlue));
        this.sphereGroup.add(this.spheres[i]);
    }
    this.sphereGroup.rotation.x = Math.PI;
    this.sphereGroup.position.set(-250, 110, 0);

    //Lines
    var lineMat = new THREE.LineBasicMaterial( {color: 0xff0000});
    this.debugLines = [];
    this.lineGeoms = [];
    for(i=0; i<NUM_LINES; ++i) {
        this.lineGeoms.push(new THREE.Geometry());
        this.lineGeoms[i].vertices.push(new THREE.Vector3(100, 0, 0),
            new THREE.Vector3(0, 100, 0));
        this.debugLines.push(new THREE.Line(this.lineGeoms[i], lineMat));
        this.sphereGroup.add(this.debugLines[i]);
    }

    //Eyes
    var eyeLineMat = new THREE.LineBasicMaterial( {color: 0x00ff00});
    this.rightEyeGeom = new THREE.Geometry();
    this.leftEyeGeom = new THREE.Geometry();
    for(i=0; i<(EYE_POINTS+1); ++i) {
        this.rightEyeGeom.vertices.push(new THREE.Vector3());
        this.leftEyeGeom.vertices.push(new THREE.Vector3());
    }
    var eyeLine = new THREE.Line(this.rightEyeGeom, eyeLineMat);
    this.sphereGroup.add(eyeLine);
    eyeLine = new THREE.Line(this.leftEyeGeom, eyeLineMat);
    this.sphereGroup.add(eyeLine);

    //Mouth
    this.mouthGeom = new THREE.Geometry();
    for(i=0; i<(MOUTH_POINTS+1);++i) {
        this.mouthGeom.vertices.push(new THREE.Vector3());
    }
    var mouthLine = new THREE.Line(this.mouthGeom, eyeLineMat);
    this.sphereGroup.add(mouthLine);

    this.frameTime = 1/this.guiControls.FPS;
    this.calcOrigin(0);
    this.previousOrigin.copy(this.originVector);
    
    this.currentFrame = 1;
    this.renderFrame();

};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.Point = 51;
        this.Lines = false;
        this.FPS = 30;
    };

    //Create GUI
    var gui = new dat.GUI();

    gui.add(this.guiControls, 'Point', 0, 65).step(1);
    gui.add(this.guiControls, 'Lines');
    gui.add(this.guiControls, 'FPS', 1, 50).step(1);
};

Motivate.prototype.renderFrame = function() {
    //Position spheres
    var sphere, point=0, xRotPoint = 28, yzRotPoint = 16;
    var dist, deltaY, theta, xTheta;
    var linePoint, rotPoint;
    var i, eyePoint, mouthPoint;
    var current, previous;

    if(this.currentFrame >= this.numFrames) {
        this.calcOrigin(0);
        this.previousOrigin.copy(this.originVector);
        this.currentFrame = 1;
        var videoElem = document.getElementById("videoPlayer");
        videoElem.play();
    }

    var frameData = this.frames[this.currentFrame];
    var previousFrameData = this.frames[this.currentFrame-1];
    //Get origin
    this.calcOrigin(this.currentFrame);
    this.deltaVector.subVectors(this.originVector, this.previousOrigin);
    
    var numSpheres = frameData.length/3;
    for(i=0; i<numSpheres; ++i) {
        this.spheres[i].material = this.sphereMatBlue;
        if(i === this.guiControls.Point) {
            point = i*3;
            $('#frame').html(this.currentFrame);
            $('#point').html(i);
            $('#xPoint').html(frameData[point]);
            $('#yPoint').html(frameData[point+1]);
            $('#zPoint').html(frameData[point+2]);
            this.spheres[i].material = this.sphereMatWhite;

            this.deltaPos.x = frameData[point] - previousFrameData[point];
            this.deltaPos.y = frameData[point+2] - previousFrameData[point+2];
            //DEBUG
            this.deltaPos.x = this.deltaPos.y = 0;
            current = frameData[point+1];
            previous = previousFrameData[point+1];
            $('#deltaY').html(current - previous);
            current -= this.deltaVector.y;
            $('#deltaOrig').html(this.deltaVector.y);
            $('#mouthY').html(current - previous);
        }
        this.spheres[i].position.set(frameData[point++], frameData[point++], frameData[point++]);
    }

    this.previousOrigin.copy(this.originVector);
    ++this.currentFrame;

    if(this.guiControls.Lines) {
        this.lineGeoms[0].vertices[0].x = frameData[0];
        this.lineGeoms[0].vertices[0].y = frameData[1];
        this.lineGeoms[0].vertices[0].z = frameData[2];
        linePoint = 16*3;
        this.lineGeoms[0].vertices[1].x = frameData[linePoint];
        this.lineGeoms[0].vertices[1].y = frameData[linePoint+1];
        this.lineGeoms[0].vertices[1].z = frameData[linePoint+2];
        this.lineGeoms[0].verticesNeedUpdate = true;

        this.deltaVector.x = frameData[linePoint] - frameData[0];
        this.deltaVector.y = frameData[linePoint+1] - frameData[1];
        this.deltaVector.z = frameData[linePoint+2] - frameData[2];
        this.deltaVector.multiplyScalar(0.5);
        this.deltaVector.x += frameData[0];
        this.deltaVector.y += frameData[1];
        this.deltaVector.z += frameData[2];

        linePoint = 28*3;
        this.lineGeoms[1].vertices[0].x = frameData[linePoint];
        this.lineGeoms[1].vertices[0].y = frameData[linePoint+1];
        this.lineGeoms[1].vertices[0].z = frameData[linePoint+2];

        this.lineGeoms[1].vertices[1].x = this.deltaVector.x;
        this.lineGeoms[1].vertices[1].y = this.deltaVector.y;
        this.lineGeoms[1].vertices[1].z = this.deltaVector.z;
        this.lineGeoms[1].verticesNeedUpdate = true;

        this.lineGeoms[2].vertices[0].x = this.deltaVector.x;
        this.lineGeoms[2].vertices[0].y = this.deltaVector.y;
        this.lineGeoms[2].vertices[0].z = this.deltaVector.z;

        this.lineGeoms[2].vertices[1].x = this.deltaVector.x;
        this.lineGeoms[2].vertices[1].y = this.deltaVector.y + 300;
        this.lineGeoms[2].vertices[1].z = this.deltaVector.z;
        this.lineGeoms[2].verticesNeedUpdate = true;
    }

    //Eye lines
    for(i=0, eyePoint=36*3; i<EYE_POINTS; ++i) {
        this.rightEyeGeom.vertices[i].x = frameData[eyePoint++];
        this.rightEyeGeom.vertices[i].y = frameData[eyePoint++];
        this.rightEyeGeom.vertices[i].z = frameData[eyePoint++];
    }
    this.rightEyeGeom.vertices[6] = this.rightEyeGeom.vertices[0];
    this.rightEyeGeom.verticesNeedUpdate = true;

    for(i=0, eyePoint=42*3; i<EYE_POINTS; ++i) {
        this.leftEyeGeom.vertices[i].x = frameData[eyePoint++];
        this.leftEyeGeom.vertices[i].y = frameData[eyePoint++];
        this.leftEyeGeom.vertices[i].z = frameData[eyePoint++];
    }
    this.leftEyeGeom.vertices[EYE_POINTS] = this.leftEyeGeom.vertices[0];
    this.leftEyeGeom.verticesNeedUpdate = true;

    //Mouth lines
    for(i=0, mouthPoint = 48*3; i<MOUTH_POINTS; ++i) {
        this.mouthGeom.vertices[i].x = frameData[mouthPoint++];
        this.mouthGeom.vertices[i].y = frameData[mouthPoint++];
        this.mouthGeom.vertices[i].z = frameData[mouthPoint++];
    }
    this.mouthGeom.vertices[MOUTH_POINTS] = this.mouthGeom.vertices[0];
    this.mouthGeom.verticesNeedUpdate = true;
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

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    app.createGUI();
    app.createScene();

    $('#play').on("click", function() {
        app.toggleFrames();
    });

    $('#next').on("click", function() {
        app.stepToNextFrame();
    });

    app.run();
});
