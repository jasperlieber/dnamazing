import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {
    game.stage.backgroundColor = '#000000'
  }

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('square', 'assets/images/common/square_1.jpg');
    this.load.image('circle', 'assets/images/common/circle_64.png');
    this.load.image('arc1', 'assets/images/common/arc1.png');
    this.load.image('arc2', 'assets/images/common/arc2.png');
    this.load.image('arc3', 'assets/images/common/arc3.png');
    this.load.image('arc4', 'assets/images/common/arc4.png');


  }

  create () {
    this.state.start('Game')
  }
}
