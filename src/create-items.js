import Ground from './modules/items/ground';
import Player from './modules/items/player';
import Mushroom from './modules/items/mushroom';
import Wall from './modules/items/wall';
import Mountain from './modules/items/mountain';
import config from './config';

function createItems() {
  new Wall(10, config.height/2);
  new Wall(config.mapWidth, config.height/2);
  const m1 = new Mountain(100, config.height-48);
  const ground = new Ground();
  const player = new Player();
  const mushroom_1 = new Mushroom(300, config.height-48);

  player.listener(ground);
  m1.render();
  ground.render();
  player.render();
  mushroom_1.render();
}

export default createItems;
