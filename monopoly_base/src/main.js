import * as THREE from 'three';
import {OrbitControls} from "three/addons";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

camera.position.set(10, 10, 10)

// const light = new THREE.DirectionalLight(0xffffff, 10);
// light.position.set(-10, 10, 10);
// scene.add(light);

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function get_cubes() {
    return [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
}


function shuffle(array) {
    let randIndex;
    for (let i = 0; i < array.length; i++) {
        randIndex = Math.floor(Math.random() * array.length);
        [array[i], array[randIndex]] = [array[randIndex], array[i]];
    }
}


class Cell {
    constructor(scene, i) {
        if (i % 10 === 0)
            this.cellGeometry = new THREE.BoxGeometry(2, .1, 2);
        else if (i % 20 < 10)
            this.cellGeometry = new THREE.BoxGeometry(1, .1, 2);
        else
            this.cellGeometry = new THREE.BoxGeometry(2, .1, 1);
        this.cellMaterial = new THREE.MeshBasicMaterial({color: i%2 ? 0x777777: (!i ? 0x00aaaa: 0x999999)});
        this.cellObj = new THREE.Mesh(this.cellGeometry, this.cellMaterial);
        let x = -5 + Math.min(i, 10) - Math.max(Math.min(i-20, 10), 0) - 0.5 * ((Math.floor(i/10)-2) % 2) - 0.5 * (i===0) + 0.5 * (i===20)
        let z = -5 + Math.max(Math.min(i-10, 10), 0) - Math.max(i-30, 0) + 0.5 * ((Math.floor(i/10)-1) % 2)  - 0.5 * (i===10) + 0.5 * (i===30)
        this.cellObj.position.set(x, 0, z);
        scene.add(this.cellObj)
        this.index = i
    }

    consoleRender(board) {
        let res = '['
        for (const player of board.players) {
            if (player.index === this.index) {
                res += player.color
            }
        }
        if (res.length === 1)
            res += ' '
        res += ']'
        return res
    }
}


class Player {
    constructor(scene, color, cellObj, position, max_players) {
        this.index = 0
        this.color = color

        this.position = position
        this.money = 15000
        this.repeatDoubles = 0

        this.playerGeometry = new THREE.CylinderGeometry(1/(max_players+1), 1/(max_players+1), .1);
        this.playerMaterial = new THREE.MeshBasicMaterial({color: color});
        this.playerObj = new THREE.Mesh(this.playerGeometry, this.playerMaterial);
        this.setPlayerPosition(cellObj, max_players);
        scene.add(this.playerObj);
    }

    setPlayerPosition(cellObj, max_players) {
        this.playerObj.position.set(
            cellObj.position.x,
            cellObj.position.y+cellObj.geometry.parameters.height,
            cellObj.position.z
        );
        if (this.index % 10 === 0) {
            this.playerObj.position.x += ((this.index === 10 || this.index === 20)*2-1)*cellObj.geometry.parameters.width*(((max_players-1)/2-this.position)/(max_players+1));
            this.playerObj.position.z += ((this.index === 20 || this.index === 30)*2-1)*cellObj.geometry.parameters.depth*(((max_players-1)/2-this.position)/(max_players+1));
        }
        else if (this.index % 20 < 10)
            this.playerObj.position.z += ((this.index > 20)*2-1)*cellObj.geometry.parameters.depth*(((max_players-1)/2-this.position)/(max_players+1));
        else
            this.playerObj.position.x += ((this.index < 20)*2-1)*cellObj.geometry.parameters.width*(((max_players-1)/2-this.position)/(max_players+1));
    }

    move(board, di) {
        this.index += di;
        if (this.index >= 40) {
            console.log("You have completed a circle!");
            this.index %= 40;
            this.money += 2000;
            if (this.index === 0)
                this.money += 1000;
        }
        const cellObj = board.board[this.index].cellObj;
        this.setPlayerPosition(cellObj, board.playerNum);
    }
}


class Board {
    constructor(scene, playerNum) {
        if (playerNum > 5)
            throw new Error('Too big player number')
        this.boardGeometry = new THREE.BoxGeometry(9, .1, 9);
        this.boardMaterial = new THREE.MeshBasicMaterial({color: 0x555555, emissive: 0x555555});
        this.boardObj = new THREE.Mesh(this.boardGeometry, this.boardMaterial);
        this.playerNum = playerNum;
        scene.add(this.boardObj);

        this.board = [];
        for (let i = 0; i < 40; i++) {
            this.board.push(new Cell(scene, i));
        }

        this.players = []
        this.playerColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff].slice(0, this.playerNum)
        // shuffle(this.player_colors)
        for (let i = 0; i < this.playerNum; i++) {
            this.players.push(new Player(scene, this.playerColors[i], this.board[0].cellObj, i, this.playerNum));
        }
        this.current_player = 0
    }

    consoleMoveCurrentPlayer(repeats = 0) {
        if (repeats === 0)
            console.clear()
        cubes = get_cubes();
        console.log(cubes);
        if (cubes[0] === cubes[1] && repeats >= 2) {
            console.log("Doubled three times. Jail time!");
            this.current_player = (this.current_player + 1) % this.players.length;
        } else {
            this.players[this.current_player].index += cubes[0] + cubes[1];
            if (board.players[this.current_player].index >= 40) {
                console.log("You have completed a circle!");
                board.players[this.current_player].index %= 40;
            }
            board.render();
            if (cubes[0] === cubes[1]) {
                console.log("Double! You move one more time");
                this.consoleMoveCurrentPlayer(repeats + 1);
            } else {
                this.current_player = (this.current_player + 1) % this.players.length;
            }
        }
    }

    moveCurrentPlayer() {
        cubes = get_cubes();
        console.log(cubes);
        if (cubes[0] === cubes[1] && this.players[this.current_player].repeatDoubles >= 2) {
            console.log("Doubled three times. Jail time!");
            this.current_player = (this.current_player + 1) % this.players.length;
        } else {
            this.players[this.current_player].move(this, cubes[0] + cubes[1]);
            if (cubes[0] === cubes[1]) {
                console.log("Double! You move one more time");
                this.players[this.current_player].repeatDoubles += 1
            } else {
                this.current_player = (this.current_player + 1) % this.players.length;
            }
        }
    }

    render() {
        // 0 1 2 3 4 5 6 7 8 9 10
        // 39                  11
        // 38                  12
        // 37                  13
        // 36                  14
        // 35                  15
        // 34                  16
        // 33                  17
        // 32                  18
        // 31                  19
        // 3029282726252423222120
        for (let i = 0; i < 11; i++) {
            if (i === 0)
                console.log(this.board.slice(0, 11).map(cell => cell.consoleRender(this)).join(' '));
            else if (i === 10)
                console.log(this.board.slice(20, 31).reverse().map(cell => cell.consoleRender(this)).join(' '));
            else
                console.log(this.board[40-i].consoleRender(this) + ' '.repeat(37) + this.board[i+10].consoleRender(this));
        }
    }
}

const testButton = document.getElementById("testButton");
const board = new Board(scene,3);

let cubes;

testButton.addEventListener("click", function () {
    board.moveCurrentPlayer(0);
})


function animate() {
    controls.update();
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);