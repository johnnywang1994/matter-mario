import { Bodies, Composite } from 'matter-js';
import engine from '../engine';
import config from '../../config';

class Wall {
  constructor(x, y) {
    this.body = Bodies.rectangle(x, y, 20, config.height, {
      isStatic: true,
    });
    Composite.add(engine.world, this.body);
  }
}

export default Wall;
