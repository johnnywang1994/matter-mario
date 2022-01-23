import { Events, Body, Bodies, Composite } from 'matter-js';
import engine from '../engine';
import { render } from '../render';
import { createSpriteAnimation } from '../utils';
import config, { ctx, loader, worldItems } from '../../config';

class Mushroom {
  constructor(x, y, direction = 'front') {
    this.image = '';
    this.vel = {
      x: 0,
      y: 0,
    };
    this.status = ''; // dead, beat, alive
    this.direction = direction; // front, back
    this.drawCallback = null;

    this.body = Bodies.circle(x, y, 10, {
      label: 'Mushroom',
      collisionFilter: {
        group: config.group.enemy,
        category: config.category.default,
        mask: config.category.default,
      },
      friction: 0.001,
      density: 1,
      render: { fillStyle: 'transparent' },
    });

    this.animation = {};

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  starBeat() {
    window.transport.audio.stomp.play();
    this.status = 'beat';
    this.body.collisionFilter.mask = config.category.isolate;
    Body.setVelocity(this.body, {
      x: this.body.velocity.x,
      y: -4,
    });
    setTimeout(() => {
      worldItems.delete(this.body);
      Events.off(render, 'afterRender', this.drawCallback);
      Composite.remove(engine.world, this.body);
    }, 1000);
  }

  die() {
    window.transport.audio.stomp.play();
    this.status = 'dead';
    Body.setStatic(this.body, true);
    this.body.isSensor = true;
    setTimeout(() => {
      worldItems.delete(this.body);
      Events.off(render, 'afterRender', this.drawCallback);
      Composite.remove(engine.world, this.body);
    }, 500);
  }

  changeDirection() {
    this.direction = this.direction === 'front' ? 'back' : 'front';
  }

  dead() {
    this.animation.dead.loop();
  }

  beat() {
    this.animation.move.loop();
  }

  alive() {
    if (Math.abs(this.body.velocity.x) < 0.06) {
      this.changeDirection();
    }
    this.animation.move.play();
    this.animation.move.loop();
    const xMovement = this.direction === 'front' ? 0.6 : -0.6;
    Body.setVelocity(this.body, {
      x: xMovement,
      y: this.body.velocity.y,
    });
  }

  async render() {
    const self = this;
    self.status = 'alive';
    self.image = loader.assets.enemy;

    self.animation.move = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32,32] },
      target: { size: [32,32] },
      offset: { x: -18, y: -23 },
      body: self.body,
      frames: [0, 1],
      rate: 0.1,
    });

    self.animation.dead = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32,32] },
      target: { size: [32,32] },
      offset: { x: -18, y: -23 },
      body: self.body,
      frames: [2],
      rate: 1,
    });

    this.drawCallback = () => {
      if (typeof this[this.status] === 'function') {
        this[this.status]();
      }
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Mushroom;
