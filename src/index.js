import { Runner, Render } from 'matter-js';
import createItems from './create-items';
import config from './config';
import engine from './modules/engine';
import runner from './modules/runner';
import render from './modules/render';

window.addEventListener('load', function () {
  config.init();
  initGame();
});

function initGame() {
  createItems();

  Runner.run(runner, engine);
  Render.run(render);
}