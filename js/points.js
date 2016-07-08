/**
 * Created by atg on 05/07/2016.
 */

var FRAME_TIME = 0.04, NOSE_POINT = 27, LEFT_TEMPLE = 0, RIGHT_TEMPLE = 16;

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
    this.templeRightVector = new THREE.Vector3();
    this.templeLeftVector = new THREE.Vector3();

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

        { feature: "topLip", point: 51, vertices: [3413, 6950, 3412, 6470, 14, 6468, 3231, 6469, 3230, 6465, 13, 6463, 3229, 6464, 3228] },
        { feature: "topLipRight1", point: 52, vertices: [6755, 3582, 7468, 3586, 106, 7470, 277, 7478, 6949, 3584, 7474, 4246, 17, 6634,
            60, 6628, 6467, 3302, 6629, 3300, 16, 6635, 61, 6630, 6462, 3310, 6640, 3306]},
        { feature: "topLipRight2", point: 53, vertices: [7476, 4230, 9051, 280, 9052, 608, 9055, 4232, 9056, 58, 6622, 57, 6623, 3298,
            6612, 59, 6624, 55, 6638, 3304, 6620, 44, 6600, 52, 6570, 3286, 6597, 42, 6568, 43]},
        { feature: "topLipRight3", point: 54, vertices: [4234, 7404, 3558, 7398, 9060, 258, 7405, 257, 4248, 9063, 4236, 7402,
            6611, 56, 6616, 54, 3292, 6610, 3296, 6617, 3294, 6607, 6596, 51, 6590, 49, 3284, 6591, 3282, 6585, 6594, 50, 6588, 48]},
        { feature: "topLipLeft1", point: 50, vertices: [6760, 3583, 7472, 3587, 1718, 7473, 1870, 7481, 6951, 3585, 7475, 4247, 1659,
            6636, 1702, 6633, 6471, 3303, 6632, 3301, 1658, 6637, 1703, 6631, 6466, 3311, 6641, 3307]},
        { feature: "topLipLeft2", point: 49, vertices: [7480, 4231, 9053, 1872, 9054, 2200, 9057, 4233, 9058, 1700, 6626, 1699,
            6625, 3299, 6615, 1701, 6627, 1697, 6639, 3305, 6621]},
        { feature: "topLipLeft3", point: 48, vertices: [4235, 7408, 3559, 7400, 9062, 1850, 7407, 1849, 4249, 9064, 4237, 7403,
            6613, 3293, 6614, 1698, 6619, 1696, 3297, 6618, 3295, 6608, 6599, 1693, 6593, 1691, 3285, 6592, 3283, 6586,
            6595, 1692, 6589, 1690]},
        { feature: "bottomLip", point: 57, vertices: [3221, 6440, 3220, 6444, 6, 6441,
            3225, 6452, 3224, 6451, 1, 6447, 3223, 6448, 3222, 6450, 0, 6445, 3411, 6947, 3410]},
        { feature: "bottomLipRight1", point: 56, vertices: [6442, 3266, 6554, 3264, 7, 6558, 41, 6555, 6453, 3268, 6560, 3270, 9,
            6505, 28, 6499, 6446, 3242, 6500, 3240, 8, 6504, 27, 6498, 6946, 4194, 8959, 4192]},
        { feature: "bottomLipRight2", point: 55, vertices: [36, 6535, 35, 6536, 3256, 6530, 37, 6534, 33, 6546, 3260, 6522,
            40, 6547, 34, 6562, 3272, 6564, 26, 6493, 23, 6494, 3238, 6487, 25, 6492, 24, 8957, 4190, 7420]},
        { feature: "bottomLipLeft1", point: 58, vertices: [6443, 3267, 6557, 3265, 1653, 6559, 1683, 6556, 6454, 3269, 6561,
            3271, 1655, 6507, 1670, 6503, 6449, 3243, 6502, 3241, 1654, 6506, 1669, 6501, 6948, 4195, 8960, 4193]},
        { feature: "bottomLipLeft2", point: 59, vertices: [1678, 6539, 1677, 6538, 3257, 6532, 1679, 6537, 1675, 6549, 3261, 6526,
            1682, 6548, 1676, 6563, 3273, 6565, 1668, 6497, 1665, 6496, 3239, 6489, 1667, 6495, 1666, 8958, 4191, 7421]},
        { feature: "MouthTopRight", point: 62, vertices: [6642, 45, 6571, 44, 6600, 52, 3308, 6572, 3276, 6570, 3286, 6597,
            6566, 42, 6568, 43]},
        { feature: "MouthTop", point: 61, vertices: [1657, 6461, 12, 6458, 15, 6460, 3227, 6459, 3226, 6457, 1656, 6456, 10, 6455, 11]},
        { feature: "MouthTopLeft", point: 60, vertices: [1694, 6601, 1686, 6573, 1687, 6643, 6598, 3287, 6574, 3277, 6575, 3309,
            1685, 6569, 1684, 6567]},
        { feature: "MouthBottom", point: 64, vertices: [6439, 3, 6435, 3219, 6436,  3218, 6438, 2, 6433]},
        { feature: "MouthBottomRight", point: 63, vertices: [5, 6551, 38, 6542, 6434, 3262, 6540, 3258, 4, 6530, 39, 6541]},
        { feature: "MouthBottomLeft", point: 65, vertices: [1652, 6553, 1680, 6545, 6437,  3263, 6544, 3259, 1651, 6552, 1681, 6543]}
    ];

    //Create points
    this.currentFrame = 0;

    this.loader = new THREE.JSONLoader();
    var _this = this, mesh, material;
    this.loader.load("models/maleHeadTextured.js", function(geom, mat) {
        //material = new THREE.MeshLambertMaterial({color:0x696969, wireframe:false});
        mesh = new THREE.Mesh(geom, new THREE.MultiMaterial( mat ));
        //mesh = new THREE.Mesh(geom, material);
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
        this.deltaVector.y = this.frames[next][offset+1] - this.frames[previous][offset+1];
        this.deltaVector.z = this.frames[next][offset+2] - this.frames[previous][offset+2];
        //DEBUG
        if(feature.point === 51) {
            console.log("Y = ", this.frames[previous][offset+1]);
        }
        this.deltaVector.multiplyScalar(this.guiControls.Scale);

        for(j=0; j<feature.vertices.length; ++j) {
            this.headMesh.geometry.vertices[feature.vertices[j]].add(this.deltaVector);
        }
    }
    //Head height
    offset = NOSE_POINT * 3;
    this.deltaVector.x = this.frames[next][offset] - this.frames[previous][offset];
    this.deltaVector.y = this.frames[next][offset+1] - this.frames[previous][offset+1];
    this.deltaVector.z = this.frames[next][offset+2] - this.frames[previous][offset+2];
    this.deltaVector.multiplyScalar(0.1);
    this.headMesh.position.x += this.deltaVector.x;
    this.headMesh.position.y += this.deltaVector.y;
    this.headMesh.position.z += this.deltaVector.z;

    //Head rotation
    var leftOffset = LEFT_TEMPLE * 3, rightOffset = RIGHT_TEMPLE * 3;
    this.templeRightVector.x = this.frames[next][rightOffset];
    this.templeRightVector.y = this.frames[next][rightOffset+1];
    this.templeRightVector.z = this.frames[next][rightOffset+2];

    this.templeLeftVector.x = this.frames[next][leftOffset];
    this.templeLeftVector.y = this.frames[next][leftOffset+1];
    this.templeLeftVector.z = this.frames[next][leftOffset+2];

    this.templeRightVector.z = this.templeLeftVector.z = 0;
    var opp = this.templeRightVector.y - this.templeLeftVector.y;
    this.templeRightVector.sub(this.templeLeftVector);
    var length = this.templeRightVector.length();
    var angle = Math.asin(opp/length);
    this.headMesh.rotation.z = angle;

    this.templeRightVector.x = this.frames[next][rightOffset];
    this.templeRightVector.y = this.frames[next][rightOffset+1];
    this.templeRightVector.z = this.frames[next][rightOffset+2];

    this.templeLeftVector.x = this.frames[next][leftOffset];
    this.templeLeftVector.y = this.frames[next][leftOffset+1];
    this.templeLeftVector.z = this.frames[next][leftOffset+2];

    this.templeRightVector.y = this.templeLeftVector.y = 0;

    opp = this.templeRightVector.z - this.templeLeftVector.z;
    this.templeRightVector.sub(this.templeLeftVector);
    length = this.templeRightVector.length();
    angle = Math.asin(opp/length);
    this.headMesh.rotation.y = angle;
    //DEBUG
    //console.log("Angle = ", angle);

    this.headMesh.geometry.verticesNeedUpdate = true;
};

Motivate.prototype.resetFrames = function() {
    this.currentFrame = 0;
    this.headMesh.geometry = this.origGeom.clone();
};

Motivate.prototype.createGUI = function() {
    var _this = this;
    this.guiControls = new function() {
        this.Scale = 0.025;
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
