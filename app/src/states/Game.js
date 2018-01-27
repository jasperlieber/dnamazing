/* globals __DEV__ */
import Phaser from 'phaser'



import GenomeData from "../../assets/data/genome"


export default class extends Phaser.State {
  init () {}
  preload () {}
  create () {

    this.colors=[0xcc3333, 0x999933, 0x3333cc, 0x33cc33]
    this.drawTree(GenomeData, game.width, game.height, 0, 0, 0);

  }
  render () {}


  drawTree(node, w, h, x, y, depth){

    if(typeof(node.color) !== "undefined"){
      let sq = game.add.sprite(x,y,"square");
      sq.tint = this.colors[node.color]
      sq.width = w;
      sq.height = h;
    }else{
      this.drawTree(node["0"], w, h/2, x, y, depth+1);
      this.drawTree(node["1"], w, h/2, x, y + (h/2), depth+1);
    }
  }
}
