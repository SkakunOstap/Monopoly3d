import * as THREE from "three";


export default class Cell {
    constructor(scene, i) {
        this.index = i
        if (this.index % 10 === 0)
            this.cellGeometry = new THREE.BoxGeometry(2, .1, 2);
        else if (this.index % 20 < 10)
            this.cellGeometry = new THREE.BoxGeometry(1, .1, 2);
        else
            this.cellGeometry = new THREE.BoxGeometry(2, .1, 1);
        this.cellMaterial = new THREE.MeshBasicMaterial({color: i%2 ? 0x777777: (!i ? 0x00aaaa: 0x999999)});
        this.cellObj = new THREE.Mesh(this.cellGeometry, this.cellMaterial);
        let x = -5 + Math.min(this.index, 10) - Math.max(Math.min(this.index-20, 10), 0) - 0.5 * ((Math.floor(this.index/10)-2) % 2) - 0.5 * (this.index===0) + 0.5 * (this.index===20)
        let z = -5 + Math.max(Math.min(this.index-10, 10), 0) - Math.max(this.index-30, 0) + 0.5 * ((Math.floor(this.index/10)-1) % 2) - 0.5 * (this.index===10) + 0.5 * (this.index===30)
        this.cellObj.position.set(x, 0, z);
        scene.add(this.cellObj)
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
