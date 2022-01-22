import { Events, Render } from 'matter-js';
import config, { ctx, loader, idItems, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import Coin from '../items/coin';
import Mushroom from '../items/mushroom';
import Turtle from './turtle';
import { triggerAt } from '../utils';

class Scene {
  constructor() {
    this.timer = null;
    this.seconds = 400;
    this.coins = 0;
    this.coin = new Coin(config.width-98, 22, 2, false);
    this.enemyTriggers = [
      triggerAt(100, new Mushroom(400, config.height-48)),
      triggerAt(1100, new Mushroom(1300, 0)),
      triggerAt(1100, new Mushroom(1348, 0)),
      triggerAt(1420, new Mushroom(1610, config.height-48)),
      triggerAt(1420, new Mushroom(1648, config.height-48)),
      triggerAt(1550, new Turtle(1700, config.height-48)), // turtle
      triggerAt(1700, new Mushroom(1820, config.height-48)),
      triggerAt(1700, new Mushroom(1840, config.height-48)),
      triggerAt(1900, new Mushroom(2050, config.height-48)),
      triggerAt(1900, new Mushroom(2070, config.height-48)),
      triggerAt(2200, new Mushroom(2360, 30)),
      triggerAt(2570, new Mushroom(2700, config.height-48)),
      triggerAt(2570, new Mushroom(2720, config.height-48)),
      triggerAt(2750, new Turtle(2900, 0)),
    ];

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

  drawPlayerPos() {
    const { position: pos } = idItems.player.body;
    ctx.fillStyle = '#fff';
    ctx.fillText(`x: ${Math.floor(pos.x)}, y: ${Math.floor(pos.y)}`, 0, 16);
  }

  loopTriggers() {
    const { position: pos } = idItems.player.body;
    this.enemyTriggers.forEach((fn) => fn(pos.x));
  }

  render() {
    this.startCountDown();
    this.coin.render();

    Events.on(render, 'afterRender', () => {
      this.drawTimer();
      this.drawCoin();
      this.loopTriggers();
      this.drawPlayerPos();
    })
  }
}

export default Scene;
