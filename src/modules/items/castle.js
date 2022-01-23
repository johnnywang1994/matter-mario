import { Events, Body, Bodies, Composite, Composites, Render } from 'matter-js';
import engine from '../engine';
import { render } from '../render';
import config, { ctx, loader } from '../../config';

class Castle {
  constructor(x, y) {
    this.body = Bodies.rectangle(x-40,y-40,80,80,{
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: 'transparent',
      },
    });

    Composite.add(engine.world, this.body);
  }

  render() {
    const { position: pos } = this.body;
    const { castle } = loader.assets;
    const { min } = render.bounds;
    Events.on(render, 'afterRender', () => {
      ctx.drawImage(castle,pos.x-40-min.x,pos.y-40-min.y,80,80);
    });
  }
}

export default Castle;
