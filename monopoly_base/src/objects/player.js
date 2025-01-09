import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";


export default class Player {
    constructor(scene, color, cellObj, playerInd, board) {
        this.index = 0
        this.color = color

        this.playerInd = playerInd
        this.money = 15000
        this.repeatDoubles = 0

        this.playerGeometry = new THREE.CylinderGeometry(1/(board.playerNum+2), 1/(board.playerNum+2), .2);
        this.playerMaterial = new THREE.MeshBasicMaterial({color: color});
        this.playerObj = new THREE.Mesh(this.playerGeometry, this.playerMaterial);

        this.moveTo(this.index, board);
        scene.add(this.playerObj);
    }

    getPositionOnCell(i, board) {
        const cellObj = board.board[i].cellObj
        let newX = cellObj.position.x,
            newY = cellObj.position.y+0.5*this.playerGeometry.parameters.height,
            newZ = cellObj.position.z;
        if (i % 10 === 0) {
            newX += ((i === 10 || i === 20)*2-1)*cellObj.geometry.parameters.width*(((board.playerNum-1)/2-this.playerInd)/(board.playerNum+1));
            newZ += ((i === 20 || i === 30)*2-1)*cellObj.geometry.parameters.depth*(((board.playerNum-1)/2-this.playerInd)/(board.playerNum+1));
        }
        else if (i % 20 < 10)
            newZ += ((i > 20)*2-1)*cellObj.geometry.parameters.depth*(((board.playerNum-1)/2-this.playerInd)/(board.playerNum+1));
        else
            newX += ((i < 20)*2-1)*cellObj.geometry.parameters.width*(((board.playerNum-1)/2-this.playerInd)/(board.playerNum+1));
        return {x: newX, y: newY, z: newZ};
    }

    moveTo(i, board) {
        const {x, y, z} = this.getPositionOnCell(i, board);
        this.playerObj.position.x = x;
        this.playerObj.position.y = y;
        this.playerObj.position.z = z;
    }

    animatePlayerObj(di, board, isDouble, animationSpeed=500) {
        let j;
        const j0 = Math.ceil((this.index+1)/10);
        for (j = j0; j < Math.ceil((this.index+di)/10); j++) {
            const tween = new TWEEN.Tween(j === j0 ? {x: this.playerObj.position.x, y: this.playerObj.position.y, z: this.playerObj.position.z}: this.getPositionOnCell((j*10-10)%40, board))
                .to(this.getPositionOnCell((j*10)%40, board), animationSpeed)
                .onUpdate((coords) => {
                    this.playerObj.position.x = coords.x;
                    this.playerObj.position.z = coords.z;
                })
                .onStart(() => board.canMove = false)
                .delay(animationSpeed*(j-j0))
                .easing(TWEEN.Easing.Exponential.InOut);
            tween.start();
        }
        const tween = new TWEEN.Tween(j === j0 ? {x: this.playerObj.position.x, y: this.playerObj.position.y, z: this.playerObj.position.z}: this.getPositionOnCell((j*10-10)%40, board))
            .to(this.getPositionOnCell((this.index+di)%40, board), animationSpeed)
            .onUpdate((coords) => {
                this.playerObj.position.x = coords.x;
                this.playerObj.position.z = coords.z;
            })
            .onStart(() => board.canMove = false)
            .onComplete(() => {
                // new cameraTween = new TWEEN.Tween()
                if (!isDouble)
                    board.current_player = (board.current_player + 1) % board.players.length;
                board.canMove = true
            })
            .delay(j === j0 ? 0: animationSpeed*(j-j0))
            .easing(TWEEN.Easing.Exponential.InOut);
        // const tweenX = new TWEEN.Tween({x: this.playerObj.position.x})
        //     .to({x: newX}, 500)
        //     .onUpdate((coords) => {
        //         this.playerObj.position.x = coords.x;
        //     })
        //     .onStart(() => board.canMove = false)
        //     .delay((Math.ceil(this.index / 10) % 2) ? 0: 500)
        //     .easing(TWEEN.Easing.Exponential.InOut);
        // const tweenZ = new TWEEN.Tween({z: this.playerObj.position.z})
        //     .to({z: newZ}, 500)
        //     .onUpdate((coords) => {
        //         this.playerObj.position.z = coords.z;
        //     })
        //     .onComplete(() => board.canMove = true)
        //     .delay((!(Math.ceil(this.index / 10) % 2)) ? 0: 500)
        //     .easing(TWEEN.Easing.Exponential.InOut);
        // tweenX.start();
        // tweenZ.start();
        tween.start();
    }

    boardStep(di, board, isDouble) {
        this.animatePlayerObj(di, board, isDouble);
        this.index += di;
        if (this.index >= 40) {
            console.log("You have completed a circle!");
            this.index %= 40;
            this.money += 2000;
            if (this.index === 0)
                this.money += 1000;
        }
    }
}

// newX += ((this.index === 10 || this.index === 20)*2-1)*cellObj.geometry.parameters.width*(((max_players-1)/2-this.position)/(max_players+1));
// newZ += ((this.index === 20 || this.index === 30)*2-1)*cellObj.geometry.parameters.depth*(((max_players-1)/2-this.position)/(max_players+1));