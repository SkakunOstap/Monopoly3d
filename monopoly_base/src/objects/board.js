import * as THREE from "three";
import Player from "./player.js";
import Cell from "./cell.js";
import getCubes from "../utils/getCubes.js";
import * as TWEEN from "@tweenjs/tween.js";

export default class Board {
    constructor(scene, camera, playerNum) {
        if (playerNum > 5)
            throw new Error('Too big player number')
        this.playerNum = playerNum;
        this.canMove = true

        this.camera = camera;

        this.boardGeometry = new THREE.BoxGeometry(9, .1, 9);
        this.boardMaterial = new THREE.MeshBasicMaterial({color: 0x555555, emissive: 0x555555});
        this.boardObj = new THREE.Mesh(this.boardGeometry, this.boardMaterial);
        scene.add(this.boardObj);

        this.board = [];
        for (let i = 0; i < 40; i++) {
            this.board.push(new Cell(scene, i));
        }

        this.cameraPositions = [];
        for (let i = 0; i < 40; i++) {
            this.cameraPositions.push({
                x: -5 + Math.min(i, 10) - Math.max(Math.min(i-20, 10), 0) - 3 * ((Math.floor(i/10)-2) % 2) - 3 * (i===0) + 3 * (i===20),
                z: -5 + Math.max(Math.min(i-10, 10), 0) - Math.max(i-30, 0) + 3 * ((Math.floor(i/10)-1) % 2) - 3 * (i===10) + 2 * (i===30),
            })
        }


        this.players = []
        this.playerColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff].slice(0, this.playerNum)
        // shuffle(this.player_colors)
        for (let i = 0; i < this.playerNum; i++) {
            this.players.push(new Player(scene, this.playerColors[i], this.board[0].cellObj, i, this));
        }
        this.current_player = 0

        // this.camera.position.x = this.cameraPositions[2].x;
        this.camera.position.y = 1;
        // this.camera.position.z = this.cameraPositions[2].z;
        this.camera.lookAt(this.players[this.current_player].playerObj.position);
    }

    consoleMoveCurrentPlayer(repeats = 0) {
        if (repeats === 0)
            console.clear()
        const cubes = getCubes()
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
        const cubes = getCubes();
        console.log(cubes);
        if (cubes[0] === cubes[1] && this.players[this.current_player].repeatDoubles >= 2) {
            console.log("Doubled three times. Jail time!");
            this.players[this.current_player].repeatDoubles = 0
            this.players[this.current_player].index = 10
            const {newX, newZ} = this.players[this.current_player].getPositionOnCell(10, this);
            const tween = new TWEEN.Tween({
                x: this.players[this.current_player].playerObj.position.x,
                z: this.players[this.current_player].playerObj.position.z
            })
                .to({x: newX, z: newZ}, 500)
                .onUpdate((coords) => {
                    this.players[this.current_player].playerObj.position.x = coords.x;
                    this.players[this.current_player].playerObj.position.z = coords.z;
                })
                .easing(TWEEN.Easing.Exponential.InOut)
                .onStart(() => this.canMove = false)
                .onComplete(() => {
                    this.current_player = (this.current_player + 1) % this.players.length;
                    this.canMove = true;
                });
            tween.start()
            // this.players[this.current_player].setPlayerPosition(this.board[10].cellObj, this.playerNum);
        } else {
            this.players[this.current_player].boardStep(cubes[0] + cubes[1], this, cubes[0] === cubes[1]);
            if (cubes[0] === cubes[1]) {
                console.log("Double! You move one more time");
                this.players[this.current_player].repeatDoubles += 1
            } else {
                this.players[this.current_player].repeatDoubles = 0
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
