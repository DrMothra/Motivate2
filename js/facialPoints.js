/**
 * Created by atg on 05/07/2016.
 */

var FRAME_TIME = 0.04;
var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;
var NUM_LINES = 3;

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
    this.headMesh = undefined;

    //DEBUG shapes
    var geom = new THREE.BoxBufferGeometry(20, 10, 5);
    var mat = new THREE.MeshLambertMaterial( {color: 0xff0000});
    this.debugShape = new THREE.Mesh(geom, mat);
    this.debugShape.rotation.x = -Math.PI/2;
    //this.scene.add(this.debugShape);

    var lineMat = new THREE.LineBasicMaterial( {color: 0xff0000});
    this.debugLines = [];
    this.lineGeoms = [];
    for(var i=0; i<NUM_LINES; ++i) {
        this.lineGeoms.push(new THREE.Geometry());
        this.lineGeoms[i].vertices.push(new THREE.Vector3(100, 0, 0),
            new THREE.Vector3(0, 100, 0));
        this.debugLines.push(new THREE.Line(this.lineGeoms[i], lineMat));
    }

    //Neck point
    geom = new THREE.SphereBufferGeometry(1, 16, 16);
    this.neckPoint = new THREE.Mesh(geom, mat);
    this.scene.add(this.neckPoint);

    //Delta vectors
    this.deltaVector = new THREE.Vector3();
    this.pointOne = new THREE.Vector3();
    this.pointTwo = new THREE.Vector3();
    this.deltaQuat = new THREE.Quaternion();
    this.xAxis = new THREE.Vector3(1, 0, 0);
    this.tempVector = new THREE.Vector3();

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
        { feature: "topLip", point: 51, vertices: [1659, 14, 17, 1658, 13, 16, 1657, 12, 15, 1656, 1, 11] },
        { feature: "topLipRight1", point: 52, vertices: []},
        { feature: "topLipRight2", point: 53, vertices: []},
        { feature: "topLipRight3", point: 54, vertices: []},
        { feature: "topLipLeft1", point: 50, vertices: []},
        { feature: "topLipLeft2", point: 49, vertices: []},
        { feature: "topLipLeft3", point: 48, vertices: []},
        { feature: "bottomLip", point: 57, vertices: []},
        { feature: "bottomLipRight1", point: 56, vertices: []},
        { feature: "bottomLipRight2", point: 55, vertices: []},
        { feature: "bottomLipLeft1", point: 58, vertices: []},
        { feature: "bottomLipLeft2", point: 59, vertices: []},
        { feature: "MouthTopRight", point: 62, vertices: []},
        { feature: "MouthTop", point: 61, vertices: []},
        { feature: "MouthTopLeft", point: 60, vertices: []},
        { feature: "MouthBottom", point: 64, vertices: []},
        { feature: "MouthBottomRight", point: 63, vertices: []},
        { feature: "MouthBottomLeft", point: 65, vertices: []}
    ];

    //Create points
    this.currentFrame = 0;
    this.renderFrame(0);

    /*
    this.loader = new THREE.JSONLoader();
    var _this = this, mesh, material;
    this.loader.load("models/maleHead.js", function(geom, mat) {
        material = new THREE.MeshLambertMaterial({color:0x696969, wireframe:false});
        mesh = new THREE.Mesh(geom, material);
        mesh.rotation.x = Math.PI/2;
        _this.scene.add(mesh);
        _this.headMesh = mesh;
    });
    */
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.Point = 61;
        this.Lines = false;
        this.FPS = 30;
    };

    //Create GUI
    var gui = new dat.GUI();

    gui.add(this.guiControls, 'Point', 0, 65).step(1);
    gui.add(this.guiControls, 'Lines');
    gui.add(this.guiControls, 'FPS', 1, 50).step(1);
};

Motivate.prototype.renderFrame = function(frame) {
    //Remove current frame
    var current = this.scene.getObjectByName('pointGroup'+this.currentFrame);
    if(current) {
        this.scene.remove(current);
    }
    var sphereGeom = new THREE.SphereBufferGeometry(1, 16, 16);
    var sphereMat = new THREE.MeshLambertMaterial( {color:0x0000ff});
    var sphereMatWhite = new THREE.MeshLambertMaterial( {color:0xffffff});
    var sphere, point=0, xRotPoint = 28, yzRotPoint = 16;
    var dist, deltaY, theta, xTheta;
    var linePoint, rotPoint;

    var pointGroup = new THREE.Object3D();
    pointGroup.name = 'pointGroup'+frame;
    this.scene.add(pointGroup);
    var frameData = this.frames[frame];
    var numSpheres = frameData.length/3;
    for(var i=0; i<numSpheres; ++i) {
        sphere = new THREE.Mesh(sphereGeom, i===this.guiControls.Point ? sphereMatWhite : sphereMat);
        pointGroup.add(sphere);
        if(i===yzRotPoint) {
            $('#frame').html(frame);
            $('#point').html(yzRotPoint);

            //Rotation
            this.pointTwo.set(frameData[point], frameData[point+1], 0);
            this.pointOne.set(frameData[0], frameData[1], 0);
            dist = this.pointTwo.distanceTo(this.pointOne);
            deltaY = frameData[point+1] - frameData[1];
            theta = Math.asin(deltaY/dist);
            //this.debugShape.rotation.y = theta * 20;
            $('#rotZ').html(theta);

            this.pointTwo.set(frameData[point], 0, frameData[point+2]);
            this.pointOne.set(frameData[0], 0, frameData[2]);
            dist = this.pointTwo.distanceTo(this.pointOne);
            var deltaZ =  frameData[2] - frameData[point+2];
            theta = Math.asin(deltaZ/dist);
            //DEBUG
            //this.debugShape.rotation.z = theta*20;
            $('#rotY').html(theta);
        }

        if(i===xRotPoint) {
            this.pointTwo.set(0, frameData[point+1], frameData[point+2]);
            this.pointOne.set(0, frameData[1], frameData[2]);
            dist = this.pointTwo.distanceTo(this.pointOne);
            deltaY = frameData[1] - frameData[point+1];
            xTheta = Math.asin(deltaY/dist);
            //DEBUG
            //this.debugShape.rotation.x = -Math.PI/2 + (theta*10);

            $('#rotX').html(xTheta);
        }

        if(frame >0) {
            var deltaPoint = this.guiControls.Point * 3;
            var previousFrameData = this.frames[frame-1];
            deltaY = frameData[deltaPoint+1] - previousFrameData[deltaPoint+1];
            $('#yPoint').html(deltaY);
        }
        sphere.position.set(frameData[point++], frameData[point++], frameData[point++]);
    }
    pointGroup.rotation.x = Math.PI;
    pointGroup.position.set(-660, 300, 400);

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

        pointGroup.add(this.debugLines[0]);
        pointGroup.add(this.debugLines[1]);
        pointGroup.add(this.debugLines[2]);
    }

    //Take rotation into account
    //Mid - point
    linePoint = 16*3;

    this.deltaVector.x = frameData[linePoint] - frameData[0];
    this.deltaVector.y = frameData[linePoint+1] - frameData[1];
    this.deltaVector.z = frameData[linePoint+2] - frameData[2];
    this.deltaVector.multiplyScalar(0.5);
    this.deltaVector.x += frameData[0];
    this.deltaVector.y += frameData[1];
    this.deltaVector.z += frameData[2];

    //Vector from point to origin
    rotPoint = 28 * 3;
    this.deltaVector.x = frameData[rotPoint] - this.deltaVector.x;
    this.deltaVector.y = frameData[rotPoint+1] - this.deltaVector.y;
    this.deltaVector.z = frameData[rotPoint+2] - this.deltaVector.z;

    this.tempVector.set(0, 100, 0);
    xTheta = this.tempVector.angleTo(this.deltaVector);
    console.log("Angle = ", xTheta);

};

Motivate.prototype.renderNextFrame = function() {

    var next = this.currentFrame + 1;
    if(next >= this.numFrames) next = 0;
    this.renderFrame(next);
    this.currentFrame = next;

    /*
    var feature = this.facialFeatures[0];

    var offset = feature.point*3, previous = next -1;
    this.deltaVector.x = this.frames[next][offset] - this.frames[previous][offset];
    this.deltaVector.z = this.frames[next][offset+1] - this.frames[previous][offset+1];
    this.deltaVector.y = (this.frames[next][offset+2] - this.frames[previous][offset+2]) * -1;
    this.deltaVector.multiplyScalar(0.01);

    for(var i=0; i<feature.vertices.length; ++i) {
        this.headMesh.geometry.vertices[feature.vertices[i]].add(this.deltaVector);
    }
    this.headMesh.geometry.verticesNeedUpdate = true;
    */
};

Motivate.prototype.toggleFrames = function() {
    this.playing = !this.playing;
    $('#play').html(this.playing ? 'Pause' : 'Play');
};

Motivate.prototype.stepToNextFrame = function() {
    if(this.playing) return;

    this.renderNextFrame();
};

Motivate.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();

    if(this.playing) {
        this.elapsedTime += delta;
        if(this.elapsedTime >= (1/this.guiControls.FPS)) {
            this.elapsedTime = 0;
            this.renderNextFrame();
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
