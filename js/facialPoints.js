/**
 * Created by atg on 05/07/2016.
 */

var FRAME_TIME = 0.04;

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

    this.headMesh = undefined;

    //Delta vectors
    this.deltaVector = new THREE.Vector3();
    this.pointOne = new THREE.Vector3();
    this.pointTwo = new THREE.Vector3();

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

Motivate.prototype.renderFrame = function(frame) {
    //Remove current frame
    var current = this.scene.getObjectByName('pointGroup'+this.currentFrame);
    if(current) {
        this.scene.remove(current);
    }
    var sphereGeom = new THREE.SphereBufferGeometry(1, 16, 16);
    var sphereMat = new THREE.MeshLambertMaterial( {color:0x0000ff});
    var sphereMatWhite = new THREE.MeshLambertMaterial( {color:0xffffff});
    var sphere, point=0, displayPoint=16;

    var pointGroup = new THREE.Object3D();
    pointGroup.name = 'pointGroup'+frame;
    this.scene.add(pointGroup);
    var frameData = this.frames[frame];
    var numSpheres = frameData.length/3;
    for(var i=0; i<numSpheres; ++i) {
        sphere = new THREE.Mesh(sphereGeom, i===displayPoint ? sphereMatWhite : sphereMat);
        pointGroup.add(sphere);
        if(i===displayPoint) {
            $('#frame').html(frame);
            $('#point').html(displayPoint);
            $('#xPoint').html(frameData[point]);
            $('#yPoint').html(frameData[point+1]);
            $('#zPoint').html(frameData[point+2]);

            //Rotation
            this.pointTwo.set(frameData[point], frameData[point+1], 0);
            this.pointOne.set(frameData[0], frameData[1], 0);
            var dist = this.pointTwo.distanceTo(this.pointOne);
            var deltaY = frameData[point+1] - frameData[1];
            var theta = Math.asin(deltaY/dist);
            $('#rotZ').html(theta);

            this.pointTwo.set(frameData[point], 0, frameData[point+2]);
            this.pointOne.set(frameData[0], 0, frameData[2]);
            dist = this.pointTwo.distanceTo(this.pointOne);
            var deltaZ = frameData[point+2] - frameData[2];
            theta = Math.asin(deltaZ/dist);
            $('#rotY').html(theta);

            this.pointTwo.set(0, frameData[point+1], frameData[point+2]);
            this.pointOne.set(0, frameData[1], frameData[2]);
            dist = this.pointTwo.distanceTo(this.pointOne);
            theta = Math.asin(deltaY/dist);
            $('#rotX').html(theta);
        }

        sphere.position.set(frameData[point++], frameData[point++], frameData[point++]);

    }
    pointGroup.position.set(-300, 175, 0);
    pointGroup.rotation.x = Math.PI;
};

Motivate.prototype.renderNextFrame = function() {

    var next = this.currentFrame + 1;
    if(next >= this.numFrames) return;
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

Motivate.prototype.resetFrames = function() {
    var next = 0;
    this.renderFrame(next);
    this.currentFrame = 0;
};

Motivate.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();
    this.elapsedTime += delta;
    /*
    if(this.elapsedTime >= FRAME_TIME) {
        this.elapsedTime = 0;
        //if(this.headMesh) {
            this.renderNextFrame();
        //}
    }
    */
    BaseApp.prototype.update.call(this);
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    //app.createGUI();
    app.createScene();

    $('#play').on("click", function() {
        app.resetFrames();
    });

    $('#next').on("click", function() {
        app.renderNextFrame();
    });

    app.run();
});
