import { Runner, Render } from 'matter-js';
import { Loader } from './gamer';
import createItems from './create-items';
import config from './config';
import engine from './modules/engine';
import runner from './modules/runner';
import render from './modules/render';

const loader = new Loader();

loader.add('overworld', '/cdn/Tilesets/OverWorld.png');
loader.add('items', '/cdn/Misc/Items.png');
loader.add('mario', '/cdn/Characters/Mario.png');
loader.add('mario_reverse', '/cdn/Characters/Mario_reverse.png');
loader.add('enemy', '/cdn/Characters/Enemies.png');

window.addEventListener('load', async function () {
  await loader.load();
  config.init(loader);
  initGame();
});

function initGame() {
  createItems();

  Runner.run(runner, engine);
  Render.run(render);
}