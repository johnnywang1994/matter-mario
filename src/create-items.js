import Ground from './modules/items/ground';
import Player from './modules/items/player';
import Mushroom from './modules/items/mushroom';
import Wall from './modules/items/wall';
import Mountain from './modules/items/mountain';
import Block from './modules/items/block';
import Item from './modules/items/item';
import config from './config';


function createItems() {
  new Wall(10, config.height/2);
  new Wall(config.mapWidth, config.height/2);
  const m1 = new Mountain(100, config.height-48);
  const ground = new Ground();

  // blocks
  const block_1 = new Block(340, 220, 4);
  const item_1 = new Item(300, 200);

  // player, enemies
  const player = new Player();
  const mushroom_1 = new Mushroom(300, config.height-48);

  player.setListener(ground);
  m1.render();
  ground.render();
  block_1.render();
  item_1.render();
  player.render();
  mushroom_1.render();
}

export default createItems;
