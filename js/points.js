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
        { feature: "topLip", point: 51, vertices: [1659, 14, 17, 1658, 13, 16, 1657, 12, 15, 1656, 1, 11] }
    ];

    //Create points
    this.currentFrame = 0;
    //this.renderFrame(0);

    this.loader = new THREE.JSONLoader();
    var _this = this, mesh, material;
    this.loader.load("models/maleHead.js", function(geom, mat) {
        material = new THREE.MeshLambertMaterial({color:0x696969, wireframe:false});
        mesh = new THREE.Mesh(geom, material);
        mesh.rotation.x = Math.PI/2;
        _this.scene.add(mesh);
        _this.headMesh = mesh;
    });
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
    var sphere, point=0;

    var pointGroup = new THREE.Object3D();
    pointGroup.name = 'pointGroup'+frame;
    this.scene.add(pointGroup);
    var frameData = this.frames[frame];
    for(var i=0; i<frameData.length; ++i) {
        sphere = new THREE.Mesh(sphereGeom, i===64 ? sphereMatWhite : sphereMat);
        pointGroup.add(sphere);
        sphere.position.set(frameData[point++], frameData[point++], frameData[point++]);
    }
    pointGroup.position.set(-300, 175, 0);
    pointGroup.rotation.z = Math.PI;
    pointGroup.rotation.y = Math.PI;
};

Motivate.prototype.renderNextFrame = function() {
    var next = this.currentFrame + 1;
    if(next >= this.numFrames) return;
    //this.renderFrame(next);
    this.currentFrame = next;
    
    var feature = this.facialFeatures[0];

    var offset = feature.point*3, previous = next -1;
    this.deltaVector.x = this.frames[next][offset] - this.frames[previous][offset];
    this.deltaVector.z = this.frames[next][offset+1] - this.frames[previous][offset+1];
    this.deltaVector.y = this.frames[next][offset+2] - this.frames[previous][offset+2];
    this.deltaVector.multiplyScalar(1);
    //DEBUG
    console.log("Delta = ", this.deltaVector);
    //this.deltaVector.set(0,0,0.5);

    for(var i=0; i<feature.vertices.length; ++i) {
        this.headMesh.geometry.vertices[feature.vertices[i]].add(this.deltaVector);
    }
    this.headMesh.geometry.verticesNeedUpdate = true;
};

Motivate.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();
    this.elapsedTime += delta;
    if(this.elapsedTime >= FRAME_TIME) {
        this.elapsedTime = 0;
        if(this.headMesh) {
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
    //app.createGUI();
    app.createScene();

    $('#control').on("click", function() {
        app.renderNextFrame();
    });

    app.run();
});
