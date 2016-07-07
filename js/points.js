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

        { feature: "topLip", point: 51, vertices: [3413, 6950, 3412, 6470, 14, 6468, 3231, 6469, 3230, 6465, 13, 6463, 3229, 6464, 3228,
            6461, 12, 6458, 3227, 6459, 3226, 6456, 10, 6455] },
        { feature: "topLipRight1", point: 52, vertices: [6755, 3582, 7468, 3586, 106, 7470, 277, 7478, 6949, 3584, 7474, 4246, 17, 6634,
            60, 6628, 6467, 3302, 6629, 3300, 16, 6635, 61, 6630, 6462, 3310, 6640, 3306, 15, 6642, 45, 6571, 6458, 3308, 6573, 3276,
            11, 6566]}
        //{ feature: "topLipRight2", point: 53, vertices: [248, 1121, 264, 246, 608, 258, 57, 56, 55, 52, 51, 43, 50]},
        //{ feature: "topLipRight3", point: 54, vertices: [245, 253, 257, 254, 54, 53, 49, 47, 48, 46, 22]},
        //{ feature: "topLipLeft1", point: 50, vertices: [1858, 1873, 1871, 1870, 1872, 1869, 1700, 1702, 1701, 1703, 1686, 1687, 1684]},
        //{ feature: "topLipLeft2", point: 49, vertices: [1840, 2704, 1856, 1838, 2200, 1850, 1699, 1698, 1697, 1694, 1693, 1685, 1692]},
        //{ feature: "topLipLeft3", point: 48, vertices: [1837, 1845, 1849, 1846, 1696, 1695, 1691, 1689, 1690, 1688, 1664]}


        //{ feature: "bottomLip", point: 57, vertices: [1652, 3, 5, 1651, 2, 4, 1653, 6, 7, 1655, 1, 9, 1654, 0, 8]}
        //{ feature: "bottomLipRight1", point: 56, vertices: []},
        //{ feature: "bottomLipRight2", point: 55, vertices: []},
        //{ feature: "bottomLipLeft1", point: 58, vertices: []},
        // { feature: "bottomLipLeft2", point: 59, vertices: []},
        //{ feature: "MouthTopRight", point: 62, vertices: []},
        //{ feature: "MouthTop", point: 61, vertices: [6461, 12, 6458, 3227, 6459, 3226, 6456, 10, 6455]},
        //{ feature: "MouthTopLeft", point: 60, vertices: [1693, 6599, 1694, 6592, 3285, 6598, 1692, 6595, 1685]}
        //{ feature: "MouthBottom", point: 64, vertices: []},
        //{ feature: "MouthBottomRight", point: 63, vertices: []},
        //{ feature: "MouthBottomLeft", point: 65, vertices: []}

    ];

    //Create points
    this.currentFrame = 0;

    this.loader = new THREE.JSONLoader();
    var _this = this, mesh, material;
    this.loader.load("models/maleHeadTextured.js", function(geom, mat) {
        //material = new THREE.MeshLambertMaterial({color:0x696969, wireframe:false});
        mesh = new THREE.Mesh(geom, new THREE.MultiMaterial( mat ));
        _this.origGeom = geom.clone();
        //mesh.rotation.x = Math.PI/2;
        _this.scene.add(mesh);
        _this.headMesh = mesh;
    });
};

Motivate.prototype.renderNextFrame = function() {
    var next = this.currentFrame + 1;
    if(next >= this.numFrames) return;
    this.currentFrame = next;

    var feature, offset, previous, i, j;
    for(i=0; i<this.facialFeatures.length; ++i) {
        feature = this.facialFeatures[i];

        offset = feature.point*3;
        previous = next -1;
        this.deltaVector.x = this.frames[next][offset] - this.frames[previous][offset];
        this.deltaVector.z = this.frames[next][offset+1] - this.frames[previous][offset+1];
        this.deltaVector.y = (this.frames[next][offset+2] - this.frames[previous][offset+2]) * -1;
        this.deltaVector.multiplyScalar(this.guiControls.Scale);

        for(j=0; j<feature.vertices.length; ++j) {
            this.headMesh.geometry.vertices[feature.vertices[j]].add(this.deltaVector);
        }
    }

    this.headMesh.geometry.verticesNeedUpdate = true;
};

Motivate.prototype.resetFrames = function() {
    this.currentFrame = 0;
    this.headMesh.geometry = this.origGeom.clone();
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.Scale = 0.01;
    };

    //Create GUI
    var gui = new dat.GUI();
    var scale = gui.add(this.guiControls, 'Scale', 0, 0.1).step(0.001);
    scale.listen();
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
    app.createGUI();
    app.createScene();

    $('#control').on("click", function() {
        app.resetFrames();
    });

    app.run();
});
