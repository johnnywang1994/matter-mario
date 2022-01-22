import Ground from './modules/items/ground';
import Player from './modules/items/player';
import Mushroom from './modules/items/mushroom';
import Wall from './modules/items/wall';
import Mountain from './modules/items/mountain';
import Block from './modules/items/block';
import Scene from './modules/items/scene';
import Pipe from './modules/items/pipe';
import EndFlag from './modules/items/endflag';
import Castle from './modules/items/castle';
import config from './config';

function createSolidStare(start_x, direction = 'back', height = 4) {
  const ground_y = config.height - 40;
  for (let r = 0; r < height; r++) {
    if (direction === 'back') {
      for (let c = 0; c < height - r; c++) {
        new Block(start_x + c*16, ground_y - r*16, 1).render();
      }
    } else if (direction === 'front') {
      for (let c = height; c > r; c--) {
        new Block(start_x + (c-1)*16, ground_y - r*16, 1).render();
      }
    }
  }
}

function createNormalBlocks() {
  new Block(306, 125, 3).render();
  new Block(338, 125, 3).render();
  new Block(370, 125, 3).render();
  new Block(1250, 125, 3).render();
  new Block(1282, 125, 3).render();

  new Block(1298, 67, 3).render();
  new Block(1314, 67, 3).render();
  new Block(1330, 67, 3).render();
  new Block(1346, 67, 3).render();
  new Block(1362, 67, 3).render();
  new Block(1378, 67, 3).render();
  new Block(1394, 67, 3).render();

  new Block(1458, 67, 3).render();
  new Block(1474, 67, 3).render();
  new Block(1490, 67, 3).render();

  new Block(1618, 125, 3).render();

  new Block(1890, 125, 3).render();

  new Block(1938, 67, 3).render();
  new Block(1954, 67, 3).render();
  new Block(1970, 67, 3).render();

  new Block(2034, 67, 3).render();
  new Block(2050, 125, 3).render();
  new Block(2066, 125, 3, 'coin', 8).render();
  new Block(2082, 67, 3).render();

  new Block(2620, 125, 3).render();
  new Block(2636, 125, 3).render();
  new Block(2668, 125, 3).render();
}

function createSolidBlocks() {
  createSolidStare(2136, 'front');
  createSolidStare(2232, 'back');

  createSolidStare(2136+192, 'front');
  createSolidStare(2232+192, 'back');

  createSolidStare(2808, 'front', 8);

  new Block(3064, config.height-40, 1).render();
}

function createItemBlocks() {
  new Block(240, 125, 4, 'coin').render();
  new Block(322, 125, 4, 0).render();
  new Block(354, 125, 4, 'coin').render();
  new Block(338, 67, 4, 'coin').render();
  new Block(1050, 125, 4, 1).render();
  new Block(1266, 125, 4, 2).render();

  new Block(1506, 67, 4, 'coin').render();
  new Block(1506, 125, 3, 'coin', 8).render();

  new Block(1634, 125, 3, 3).render();

  new Block(1714, 125, 4, 'coin').render();
  new Block(1762, 125, 4, 'coin').render();
  new Block(1810, 125, 4, 'coin').render();
  new Block(1762, 67, 4, 2).render();

  // new Block(100, 125, 4, 3).render(); // test

  new Block(2050, 67, 4, 'coin').render();
  new Block(2066, 67, 4, 'coin').render();

  new Block(2652, 125, 4, 'coin').render();
}

function createPipes() {
  new Pipe(442, config.height-48, 1).render();
  new Pipe(600, config.height-56, 2, true).render();
  new Pipe(710, config.height-64, 3).render();
  new Pipe(890, config.height-64, 3).render();

  new Pipe(2556, config.height-56, 2, true).render();

  new Pipe(2780, config.height-48, 1).render();
}

function createEnemies() {
  new Mushroom(620, config.height-48).render();
  new Mushroom(740, config.height-48).render();
  new Mushroom(780, config.height-48).render();
}

function createItems() {
  const scene = new Scene();
  const player = new Player();

  new Wall(-10, config.height/2);
  new Wall(config.mapWidth+14, config.height/2);
  new Mountain(40, config.height-44).render();
  new Ground().render();
  new EndFlag(3064, config.height - 48); // 3064
  new Castle(3200, config.height - 32).render();

  // normal blocks
  createNormalBlocks();

  // solid blocks
  createSolidBlocks();

  // grow blocks
  createItemBlocks();

  // create pipes
  createPipes();

  // enemies
  createEnemies();

  player.render();
  scene.render();
}

export default createItems;
