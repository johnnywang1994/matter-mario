import { Body, Bodies, Composite } from 'matter-js';
import engine from '../engine';
import { worldItems } from '../../config';


class EndFlag {
  constructor(x, y) {
    const topBall = Bodies.circle(x,y-140,3,{
      render: {
        fillStyle: '#4a9c11',
        strokeStyle: 'black',
        lineWidth: 2,
      },
    });
    const flagpole = Bodies.rectangle(x,y-70,2,140,{
      render: {
        fillStyle: '#8dd09b',
        strokeStyle: '#5a9984',
        lineWidth: 3,
      },
    });
    const detector = Bodies.rectangle(x-4,y-70,2,140, {
      label: 'EndFlag',
      render: { fillStyle: 'transparent' },
      isStatic: true,
      isSensor: true,
    });

    this.body = Body.create({
      parts: [flagpole, topBall],
      isStatic: true,
    });

    worldItems.set(this.body, this);
    Composite.add(engine.world, [this.body, detector]);
  }

  end() {
    Body.setStatic(this.body, true);
  }
}

export default EndFlag;
