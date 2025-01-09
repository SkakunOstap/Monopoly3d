import * as THREE from 'three';
import {OrbitControls} from "three/addons";
import Board from "./objects/board.js";
import * as TWEEN from "@tweenjs/tween.js";

// CONSTANTS
// ...

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(10, 10, 10);

const axesHelper = new THREE.AxesHelper(8);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;


// const light = new THREE.DirectionalLight(0xffffff, 10);
// light.position.set(-10, 10, 10);
// scene.add(light);

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function shuffle(array) {
    let randIndex;
    for (let i = 0; i < array.length; i++) {
        randIndex = Math.floor(Math.random() * array.length);
        [array[i], array[randIndex]] = [array[randIndex], array[i]];
    }
}


const testButton = document.getElementById("testButton");
const board = new Board(scene, camera,3);

testButton.addEventListener("click", function () {
    if (board.canMove) {
        board.moveCurrentPlayer();
    }
})


function animate(t) {
    TWEEN.update(t)
    // controls.update();
    camera.lookAt(board.players[board.current_player].playerObj.position);
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);