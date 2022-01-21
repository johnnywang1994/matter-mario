import { Bodies, Body, Composite, Events } from 'matter-js';
import config, { ctx, loader, idItems, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import { createSpriteAnimation } from '../utils';

class Coin {
  constructor(x, y, type = 1, collectable = true) {
    this.type = type; // 1: rotate, 2: shine
    this.status = 'static'; // dead, static
    this.collectable = collectable;
    this.drawCallback = null;
    this.popping = false;
    this.body = Bodies.rectangle(x, y, 16, 16, {
      label: 'Coin',
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });

    this.animations = {};

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  popOut() {
    idItems.scene.addCoin();
    this.popping = true;
    Body.setStatic(this.body, false);
    Body.setVelocity(this.body, { x: 0, y: -5 });
    setTimeout(() => {
      this.die();
    }, 500);
  }

  die() {
    this.status = 'dead';
    worldItems.delete(this.body);
    Events.off(render, 'afterRender', this.drawCallback);
    Composite.remove(engine.world, this.body);
  }

  static() {
    this.animations.rotate.play();
    this.animations.rotate.loop();
  }

  render() {
    const sy = this.type === 2 ? 32 : 16;
    const rate = this.type === 2 ? 0.1 : 0.25;
    const follow = !this.collectable && this.type === 2 ? true : false;

    this.animations.rotate = createSpriteAnimation({
      ctx,
      render,
      image: loader.assets.items,
      source: { sy, size: [16,16] },
      target: { size: [16,16] },
      offset: { x: -8, y: -8 },
      body: this.body,
      frames: [0, 3],
      rate,
      follow,
    });

    this.drawCallback = () => {
      if (typeof this[this.status] === 'function') {
        this[this.status]();
      }
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Coin;
