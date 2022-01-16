import { Events, Body, Bodies, Composite } from 'matter-js';
import engine from '../engine';
import render from '../render';
import { loadImage, createSpriteAnimation } from '../utils';
import config, { ctx } from '../../config';

class Mushroom {
  constructor(x, y) {
    this.image = '';
    this.vel = {
      x: 0,
      y: 0,
    };
    this.body = Bodies.circle(x, y, 10, {
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      friction: 0.001,
      render: { fillStyle: 'transparent' },
    });
    this.animation = {};

    Composite.add(engine.world, this.body);
  }

  drawFrame() {
    this.animation.move.loop();
    this.animation.move.next();
    Body.setVelocity(this.body, {
      x: -0.5,
      y: this.body.velocity.y,
    });
  }

  async render() {
    const self = this;
    self.image = await loadImage('/cdn/Characters/Enemies.png');

    self.animation.move = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32,32] },
      target: { size: [32,32] },
      offset: { x: -18, y: -23 },
      body: self.body,
      frames: [0, 1],
      rate: 0.05,
    });

    Events.on(render, 'afterRender', (event) => {
      self.drawFrame();
    });
  }
}

export default Mushroom;
