/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework
var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;

function degreesToRadians(degree) {
    return (Math.PI/180) * degree;
}

//Init this app from base
function Motivate() {
    BaseApp.call(this);
}

Motivate.prototype = new BaseApp();

Motivate.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    //GUI
    this.guiControls = null;
    this.gui = null;
    this.videoPlayer = document.getElementById("videoPlayer");
    this.videoPlayer.loop = true;
};

Motivate.prototype.createScene = function() {
    //Create scene
    var _this = this;
    BaseApp.prototype.createScene.call(this);

    //Video
    var video = document.getElementById("videoPlayer");
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    //Load example object
    var planeGeom = new THREE.PlaneBufferGeometry(400, 300);
    var mat = new THREE.MeshLambertMaterial({color: 0xb5b5b5, transparent: false, map: texture});
    var plane = new THREE.Mesh(planeGeom, mat);
    this.scene.add(plane);

    //Head
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) { };

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl( 'models/' );
    mtlLoader.setPath( 'models/' );
    mtlLoader.load( 'head.mtl', function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('head.obj', function (object) {
            _this.headObject = object;
            _this.headObject.position.set(_this.guiControls.PosX, _this.guiControls.PosY, _this.guiControls.PosZ);
            _this.headObject.rotation.set(_this.guiControls.RotX, _this.guiControls.RotY, _this.guiControls.RotZ);
            _this.headObject.scale.set(_this.guiControls.Scale, _this.guiControls.Scale, _this.guiControls.Scale);
            _this.scene.add(object);
        }, onProgress, onError);
    });
};

Motivate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    this.guiControls = new function() {
        this.Scale = 4.3;
        this.PosX = -2;
        this.PosY = 39;
        this.PosZ = -28;
        this.RotX = 7.0;
        this.RotY = 7.0;
        this.RotZ = 0.0;
    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    var scale = this.guiAppear.add(this.guiControls, 'Scale', 0.25, 20).step(0.25);
    scale.listen();
    scale.onChange(function(value) {
        _this.onScaleChanged(value);
    });

    var xPos = this.guiAppear.add(this.guiControls, 'PosX', -50, 50).step(0.25);
    xPos.listen();
    xPos.onChange(function(value) {
       _this.onPosChanged(X_AXIS, value);
    });

    var yPos = this.guiAppear.add(this.guiControls, 'PosY', -100, 100).step(0.25);
    yPos.listen();
    yPos.onChange(function(value) {
        _this.onPosChanged(Y_AXIS, value);
    });

    var zPos = this.guiAppear.add(this.guiControls, 'PosZ', -50, 50).step(0.25);
    zPos.listen();
    zPos.onChange(function(value) {
        _this.onPosChanged(Z_AXIS, value);
    });

    var xRot = this.guiAppear.add(this.guiControls, 'RotX', -90, 90).step(1.0);
    xRot.listen();
    xRot.onChange(function(value) {
        _this.onRotChanged(X_AXIS, value);
    });

    var yRot = this.guiAppear.add(this.guiControls, 'RotY', -90, 90).step(1.0);
    yRot.listen();
    yRot.onChange(function(value) {
        _this.onRotChanged(Y_AXIS, value);
    });

    var zRot = this.guiAppear.add(this.guiControls, 'RotZ', -90, 90).step(1.0);
    zRot.listen();
    zRot.onChange(function(value) {
        _this.onRotChanged(Z_AXIS, value);
    });

    this.gui = gui;
};

Motivate.prototype.onScaleChanged = function(value) {
    this.headObject.scale.set(value, value, value);
};

Motivate.prototype.onPosChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.headObject.position.x = value;
            break;
        case Y_AXIS:
            this.headObject.position.y = value;
            break;
        case Z_AXIS:
            this.headObject.position.z = value;
            break;
    }
};

Motivate.prototype.onRotChanged = function(axis, value) {
    switch(axis) {
        case X_AXIS:
            this.headObject.rotation.x = degreesToRadians(value);
            break;
        case Y_AXIS:
            this.headObject.rotation.y = degreesToRadians(value);
            break;
        case Z_AXIS:
            this.headObject.rotation.z = degreesToRadians(value);
            break;
        default:
            break;
    }
};

Motivate.prototype.update = function() {
    //Perform any updates

    BaseApp.prototype.update.call(this);
};

Motivate.prototype.playVideo = function() {
    /*
    if(this.videoPlayer.paused) {
        this.videoPlayer.play();
    } else {
        this.videoPlayer.pause();
    }
    */
    this.videoPlayer.load();

};

$(document).ready(function() {
    //See if we have WebGL support
    if(!Detector.webgl) {
        $('#notSupported').show();
    }
    
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Motivate();
    app.init(container);
    app.createGUI();
    app.createScene();

    //GUI callbacks
    $('#play').on("click", function() {
        app.playVideo();
    });
    app.run();
});