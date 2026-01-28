import { createWorld, createEntity, addComponent} from './core/esc.js';
import { initRenderSystem, renderSystem } from './systems/renderSystem.js';
import { initInput, inputSystem } from './systems/inputSystem.js';
import { Path } from './components/index.js';
import { towerSystem } from './systems/towerSystem.js';
import { movementSystem } from './systems/simpleMovementSystem.js';
import { projectileSystem } from './systems/projectileSystem.js';
import { waveSystem, resetWaves, startWave    } from './systems/waveSystem.js';
import { cleanupSystem, isGameOver, resetGameOver } from './systems/cleanupSystem.js';
import { getGold, getLives, resetEconomy } from './systems/economySystem.js';
import { TOWER_TYPES, PATH_WAYPOINTS } from './game/config.js';
import { getSelectedTowerType, setSelectedTowerType } from './systems/inputSystem.js';




const canvas = document.getElementById('gameCanvas');
initRenderSystem(canvas);
initInput(canvas);

let world = createWorld();

const initWorld = () => {
  world = createWorld();

  world = createEntity(world);
  const pathEntityId = world.nextEntityId - 1;
  world = addComponent(pathEntityId, 'path', Path(PATH_WAYPOINTS), world);

  return world;
}

world = initWorld();

let type = ''

const updateUI = (world) => {
  if (!world || !world.entities) return world;

  const enemies = world.entities.filter(e => e.components.enemy).length;
  const towers = world.entities.filter(e => e.components.tower).length;
  const gold = getGold();
  const lives = getLives();

  
  document.getElementById('enemies').textContent = enemies;
  document.getElementById('towers').textContent = towers;
  document.getElementById('gold').textContent = gold;
  document.getElementById('lives').textContent = lives;

  const selectedType = getSelectedTowerType();
  document.querySelectorAll('button[id^="btn-tower"]').forEach(btn => {
    if(btn.id.includes('basic'))
      type = 'BASIC'
    else if (btn.id.includes('sniper'))
      type = 'SNIPER'
    else
      type ='AOE'
    const cost = TOWER_TYPES[type].cost;
    
    btn.disabled = gold < cost;
    btn.style.opacity = gold < cost ? '0.5' : '1';
    
    if (type === selectedType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  })

  return world;
}

const restartGame = () => {
  resetGameOver();
  world = initWorld();
  resetEconomy();
  resetWaves();
  lastTime = 0;
  gameLoopRunning = true;
  
  requestAnimationFrame(gameLoop);
}

let lastTime = 0;
let gameLoopRunning = true;

const gameLoop = (currentTime) => {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  if (isGameOver()) {
    if (gameLoopRunning) {
      gameLoopRunning = false;
    }
    return; 
  }

  world = {
    ...world,
    time: currentTime,
    deltaTime: deltaTime
  }


  world = inputSystem(world);
  world = waveSystem(world, PATH_WAYPOINTS);
  world = movementSystem(world);
  world = towerSystem(world);
  world = projectileSystem(world);
  world = cleanupSystem(world);
  world = renderSystem(world);
  world = updateUI(world);

  requestAnimationFrame(gameLoop);
}


window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    startWave();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    restartGame();
  }
})


document.querySelectorAll('button[id^="btn-tower"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if(btn.id.includes('basic'))
      type = 'BASIC'
    else if (btn.id.includes('sniper'))
      type = 'SNIPER'
    else
      type ='AOE'

    setSelectedTowerType(type);

    document.querySelectorAll('button[id^="btn-tower"]').forEach(b =>
      b.classList.remove('active')
    )
    btn.classList.add('active');
  })
})


requestAnimationFrame(gameLoop);