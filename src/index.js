import { Engine, Runner, Render, Composite, Events, Bounds } from 'matter-js';
import createItems from './create-items';
import audio from './audio';
import config, { ctx, idItems, worldItems } from './config';
import Loader from './modules/loader';
import engine from './modules/engine';
import runner from './modules/runner';
import render from './modules/render';

const loader = new Loader();

loader.add('overworld', '/cdn/Tilesets/OverWorld.png');
loader.add('items', '/cdn/Misc/Items.png');
loader.add('mario', '/cdn/Characters/Mario.png');
loader.add('mario_reverse', '/cdn/Characters/Mario_reverse.png');
loader.add('enemy', '/cdn/Characters/Enemies.png');
loader.add('enemy_reverse', '/cdn/Characters/Enemies_reverse.png');
loader.add('castle', '/cdn/Tilesets/Castle.png');

// transport global function
window.transport = {
  life: 3,
  audio,
  initFrontPage,
  initGame,
  stopGame,
  gameOver,
};

window.addEventListener('load', async function () {
  await loader.load();
  initFrontPage();
});

function initFrontPage() {
  config.init(loader);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, config.width, config.height);
  ctx.drawImage(
    loader.assets.mario,
    0,0,32,32,
    config.width/2-32,config.height/2-16,32,32
  );
  ctx.font = '13px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(
    `x ${window.transport.life}`,
    config.width/2,
    config.height/2+12,
  );

  setTimeout(() => {
    initGame();
  }, 2000);
}

function initGame() {
  audio.bgm.play();
  createItems();

  Runner.run(runner, engine);
  Render.run(render);
}

function stopGame() {
  if (engine) {
    // stop renderer
    Composite.clear(engine.world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    // remove events(item render)
    Events.off(engine, 'collisionActive');
    Events.off(render, 'afterRender');
    Bounds.shift(render.bounds, { x: 0, y: 0 }); // reset camera
    render.textures = {};
    idItems.length = 0;
    worldItems.clear();
  }
}

function gameOver() {
  
}