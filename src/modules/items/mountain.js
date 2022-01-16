import { Events, Body, Bodies, Composite } from 'matter-js';
import engine from '../engine';
import render from '../render';
import { loadImage } from '../utils';
import config, { ctx } from '../../config';

// use more then once
let image;

class Mountain {
  constructor(x, y, w = 80, h = 48) {
    this.size = { w, h };
    this.body = Bodies.rectangle(x,y,80,48,{
      collisionFilter: {
        category: config.category.hide,
      },
      isStatic: true,
      render: {
        fillStyle: 'transparent',
      }
    });
    Composite.add(engine.world, this.body);
  }

  async render() {
    const { size } = this;
    const { position: pos } = this.body;
    const { min } = render.bounds;
    if (!image) {
      image = await loadImage('/cdn/Tilesets/OverWorld.png');;
    }

    Events.on(render, 'afterRender', (event) => {
      ctx.drawImage(
        image,
        48,74,80,48,
        pos.x-40-min.x,pos.y-24-min.y,size.w,size.h
      );
    });
  }
}

export default Mountain;
