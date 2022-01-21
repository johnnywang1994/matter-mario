import { Events, Render } from 'matter-js';
import config, { ctx, loader, idItems, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import Coin from '../items/coin';

class Scene {
  constructor() {
    this.timer = null;
    this.seconds = 400;
    this.coins = 0;
    this.coin = new Coin(config.width-98, 22, 2, false);

    idItems.scene = this;
  }

  startCountDown() {
    this.timer = setInterval(() => {
      this.seconds -= 1;
    }, 500);
  }

  stopCountDown() {
    clearInterval(this.timer);
  }

  addCoin(num = 1) {
    this.coins += num;
  }

  drawTimer() {
    ctx.font = '13px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('TIME', config.width-40, 16);
    ctx.fillText(this.seconds, config.width-31, 28);
  }

  drawCoin() {
    ctx.font = '13px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      `x ${this.coins.toString().padStart(2, '0')}`,
      config.width-90,
      28,
    );
  }

  render() {
    this.startCountDown();
    this.coin.render();

    Events.on(render, 'afterRender', () => {
      this.drawTimer();
      this.drawCoin();
    })
  }
}

export default Scene;
