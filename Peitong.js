//Variables
let renderer, scene, camera, pointlight, spotlight, shaderMaterial;
let mode = true;// game mode, true for player vs cpu, false for cpu vs cpu
let fieldW = 400,
    fieldH = 200;
let blockW, blockH, blockD, blockQ;
let block1Y = 0,// velocity of player paddle on y axis
    block2Y = 0,// velocity of opponent paddle on y aixs.
    blockV = 3;
let ball, block1, block2;
let ballX = 1,
    ballY = 1,
    ballVMax = 3.5,// maximum speed for the ball, 
    ballV = 1;
let score1 = 0,// player score
    score2 = 0,// opponent score
    scoreMax = 15;//
let diff = 0.5;
let TABLE_TEXTURE_IMG = "floor-wood.jpg";//texture is loaded by threejs texture loader
const clock = new THREE.Clock();
const __shader = Shaders.S01;

function init() {
    document.getElementById("winCondition").innerHTML =
        "First to " + scoreMax + "wins!";
    score1 = 0;
    score2 = 0;
    createScene();
    renderScene();
}
function createScene() {
    var WID = 800,
        HGT = 600;
    var FOV = 60,
        ASPRTO = WID / HGT,
        NEAR = 1,
        FAR = 1000000;
    var c = document.getElementById("canvas");
    //Settings of the vertex shader and the fragment shader is in shader.js.
    shaderMaterial = new THREE.ShaderMaterial(
        {
            uniforms: __shader.uniforms,
            vertexShader: __shader.vertexShader,
            fragmentShader: __shader.fragmentShader,
            transparent: true,
        }
    );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    camera = new THREE.PerspectiveCamera(FOV, ASPRTO, NEAR, FAR);
    scene = new THREE.Scene();
    scene.add(camera);
    camera.position.z = 320;
    renderer.setSize(WID, HGT);
    c.appendChild(renderer.domElement);
    var planeW = fieldW,
        planeH = fieldH,
        planeQ = 10;
    var block1Mat = new THREE.MeshLambertMaterial({ color: 0x6600ff });
    var block2Mat = new THREE.MeshLambertMaterial({ color: 0xf00606 });
    var planeMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
    var tableMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    var sidesMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    Texture = new THREE.TextureLoader().load(TABLE_TEXTURE_IMG);
    var groundMat = new THREE.MeshLambertMaterial({ map: Texture });
    //Create surface
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeW * 0.95, planeH, planeQ, planeQ),
        planeMat
    );
    scene.add(plane);
    plane.receiveShadow = true;
    //Create background
    var table = new THREE.Mesh(
        new THREE.BoxGeometry(planeW * 1.05, planeH * 1.05, 100, planeQ, planeQ, 1),
        tableMat
    );
    table.position.z = -51;
    scene.add(table);
    table.receiveShadow = true;
    //Create the ball
    var ballRad = 6,
        ballSeg = 6,
        ballRings = 6;
    //Both of the shader material are retrived from classwork.
    __shader.uniforms.textureA.value = new THREE.TextureLoader().load('stone-bump.jpg');// Vertex shader material
    __shader.uniforms.textureB.value = new THREE.TextureLoader().load('floor-wood.jpg');// Fragment shader material
    ball = new THREE.Mesh(
        new THREE.SphereBufferGeometry(ballRad, ballSeg, ballRings),
        shaderMaterial
    );
    scene.add(ball);
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = ballRad;
    ball.receiveShadow = true;
    ball.castShadow = true;

    blockW = 10;
    blockH = 32;
    blockD = 10;
    blockQ = 2;
    //Block 1 is the paddle for the player.
    block1 = new THREE.Mesh(
        new THREE.BoxGeometry(blockW, blockH, blockD, blockQ, blockQ, blockQ),
        block1Mat
    );
    scene.add(block1);
    block1.receiveShadow = true;
    block1.castShadow = true;
    //Block 2 is the paddle for the opponent.
    block2 = new THREE.Mesh(
        new THREE.BoxGeometry(blockW, blockH, blockD, blockQ, blockQ, blockQ),
        block2Mat
    );
    scene.add(block2);
    block2.receiveShadow = true;
    block2.castShadow = true;
    block1.position.x = -fieldW / 2 + blockW;
    block2.position.x = fieldW / 2 - blockW;
    block1.position.z = blockD;
    block2.position.z = blockD;
    //Actual background.
    var ground = new THREE.Mesh(
        new THREE.BoxGeometry(2000, 1000, 3, 1, 1, 1),
        groundMat
    );
    ground.position.z = -150;
    ground.receiveShadow = true;
    scene.add(ground);
    //Lights.
    pointlight = new THREE.PointLight(0xf8f8f8, 2.9, 10000);
    pointlight.position.x = -1000;
    pointlight.position.y = 0;
    pointlight.position.z = 1000;
    scene.add(pointlight);
    spotLight = new THREE.SpotLight(0xf8d898, 1.5);
    spotLight.position.set(0, 0, 460);
    spotLight.castShadow = true;
    scene.add(spotLight);
    renderer.shadowMap.enabled = true;
}

//Mechanics of the ball
function ballPhys() {
    //If the ball went over the bottom line of each side, add score accordingly and reset the ball.
    if (ball.position.x <= -fieldW / 2) {
        score2++;
        document.getElementById("score").innerHTML = score1 + "-" + score2;
        resetBall(2);
        scoreCheck();
    }
    if (ball.position.x >= fieldW / 2) {
        score1++;
        document.getElementById("score").innerHTML = score1 + "-" + score2;
        resetBall(1);
        scoreCheck();
    }
    //If ball went over the sides, bounce the ball back(Collision detection for the ball).
    if (ball.position.y <= -fieldH / 2) {
        ballY = -ballY;
    }
    if (ball.position.y >= fieldH / 2) {
        ballY = -ballY;
    }
    ball.position.x += ballX * ballV;
    ball.position.y += ballY * ballV;
    if (ballV < ballVMax) {
        ballV += 0.01;
    } else {
        ballV = ballVMax;
    }
    if (ballY > ballV * 2) {
        ballY = ballV * 2;
    } else if (ballY < -ballV * 2) {
        ballY = -ballV * 2;
    }
}
//simple mechanics for the opponent paddle
function opponentPhys() {
    if (ballX > 0 && ball.position.x >= -fieldW / 3) {
        block2Y = (ball.position.y - block2.position.y) * diff;
        if (Math.abs(block2Y) <= blockV) {
            block2.position.y += block2Y;
        } else {
            if (block2Y > blockV) {
                block2.position.y += blockV;
            } else if (block2Y < -blockV) {
                block2.position.y -= blockV;
            }
        }
    }
}
//player side cpu mechanics, identical to the opponent side.
function playerSideCPUPhys() {
    if (ballX < 0 && ball.position.x <= fieldW / 3) {
        block1Y = (ball.position.y - block1.position.y) * diff;
        if (Math.abs(block1Y) <= blockV) {
            block1.position.y += block1Y;
        } else {
            if (block1Y > blockV) {
                block1.position.y += blockV;
            } else if (block1Y < -blockV) {
                block1.position.y -= blockV;
            }
        }
    }
}
//Controls('Controls.js') for the player
function playerPhys() {
    //left
    if (Key.isDown(Key.A)) {
        if (block1.position.y < fieldH * 0.45) {
            block1Y = blockV * 0.5;
        } else {
            block1Y = 0;
        }
    }
    //right
    else if (Key.isDown(Key.D)) {
        if (block1.position.y > -fieldH * 0.45) {
            block1Y = -blockV * 0.5;
        } else {
            block1Y = 0;
        }
    } else {
        block1Y = 0;
    }
    block1.position.y += block1Y;
}
//Put the camera 'behind' the player.
function cam() {
    camera.position.x = block1.position.x - 100;
    camera.position.y = (block1.position.y - camera.position.y) * 0.5;
    camera.position.z = block1.position.z + 100;
    camera.rotation.y = (-60 * Math.PI) / 180;
    camera.rotation.z = (-90 * Math.PI) / 180;
}
//Collision detection for the paddles.
function blockPhys() {
    //////////////////////////player////////////////////////
    if (
        ball.position.x <= block1.position.x + blockW &&
        ball.position.x >= block1.position.x
    ) {
        if (
            ball.position.y <= block1.position.y + blockH / 2 &&
            ball.position.y >= block1.position.y - blockH / 2
        ) {
            if (ballX < 0) {
                ballX = -ballX;
                ballY -= block1Y * 0.7;
            }
        }
    }
    ////////////////////////////opponent////////////////////
    if (
        ball.position.x <= block2.position.x + blockW &&
        ball.position.x >= block2.position.x
    ) {
        if (
            ball.position.y <= block2.position.y + blockH / 2 &&
            ball.position.y >= block2.position.y - blockH / 2
        ) {
            if (ballX > 0) {
                ballX = -ballX;
                ballY -= block2Y * 0.7;
            }
        }
    }
}
//Function for resetting the ball, parameter is the condition.
//1 is if player wins, any other number is for opponent wins.
function resetBall(num) {
    ball.position.x = 0;
    ball.position.y = 0;
    if (num == 1) {
        ballX = -1;
    } else {
        ballX = 1;
    }
    //also reset the ball's speed and Y position.
    ballY = 1;
    ballV = 0.5;
}
var bounceT = 0;
//Check the score after each round, change the score board accordingly.
function scoreCheck() {
    if (score1 >= scoreMax) {
        ballV = 0;
        document.getElementById("score").innerHTML = "Player wins.";
        document.getElementById("winCondition").innerHTML = "Please F5 to replay.";
        bounceT++;
        block1.position.z = Math.sin(bounceT * 0.1) * 10;
        block1.scale.z = 2 + Math.abs(Math.sin(bounceT * 0.1)) * 10;
        block1.scale.y = 2 + Math.abs(Math.sin(bounceT * 0.1)) * 10;
    } else if (score2 >= scoreMax) {
        ballV = 0;
        document.getElementById("score").innerHTML = "Opponent wins.";
        document.getElementById("winCondition").innerHTML = "Please F5 to replay.";
        bounceT++;
        block2.position.z = Math.sin(bounceT * 0.1) * 10;
        block2.scale.z = 2 + Math.abs(Math.sin(bounceT * 0.1)) * 10;
        block2.scale.y = 2 + Math.abs(Math.sin(bounceT * 0.1)) * 10;
    }
}
//Game mode switching function
function switchMode() {
    if (mode == true) {
        mode = false;
    } else if (mode == false) {
        mode = true;
    }
}
//Main render function
function renderScene() {
    requestAnimationFrame(renderScene);
    __shader.uniforms.time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    ballPhys();
    blockPhys();
    cam();
    opponentPhys();
    //Switching mode is available during the game.
    if (mode) {
        playerPhys();
        document.getElementById("currMode").innerHTML = "Current Mode: P1 vs CPU";
    } else if (!mode) {
        playerSideCPUPhys();
        document.getElementById("currMode").innerHTML = "Current Mode: CPU vs CPU";
    }
}