import { Render } from 'matter-js';
import engine from './engine';
import config from '../config';

const render = Render.create({
  canvas: document.querySelector(config.container),
  engine,
  options: {
    width: config.width,
    height: config.height,
    background: config.background,
    // https://stackoverflow.com/questions/34913835/how-can-i-move-camera-in-matter-js
    hasBounds: true, // for camera
    showVelocity: false, // speed indicator
    showAngleIndicator: false, // angle indicator
    showCollisions: true, // collision indicator
    showConvexHulls: true,
    wireframes: false,
  },
});

export default render;
