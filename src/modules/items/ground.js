import { Events, Body, Bodies, Composite, Composites } from 'matter-js';
import engine from '../engine';
import render from '../render';
import config, { ctx, loader } from '../../config';

class Ground {
  constructor() {
    const size = this.size = {
      width: 16,
      height: 16,
    };
    const cols = 100;
    const rows = 2;
    this.stack = Composites.stack(0,config.height-size.height*rows,cols,rows,0,0,function(x, y) {
      return Bodies.rectangle(x,y,size.width,size.height,{
        render: {
          fillStyle: 'transparent',
        },
      });
    });
    // need to combine stack bodies into a body
    // inorder to let Collision work nice
    const groundBody = this.body = Body.create({
      parts: this.stack.bodies,
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      isStatic: true,
    });
    Composite.add(engine.world, groundBody);
  }

  async render() {
    const image = loader.assets.overworld;
    const { bodies } = this.stack;

    Events.on(render, 'afterRender', () => {
      const { min } = render.bounds;
      for (let i = 0; i < bodies.length; i++) {
        const { position: pos } = bodies[i];
        ctx.drawImage(
          image,
          0,0,16,16,
          pos.x-8-min.x,pos.y-8-min.y,16,16,
        );
      }
    })
  }
}

export default Ground;
