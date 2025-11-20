import * as R from 'ramda';
import { createWorld, createEntity, addComponent, runSystems } from './core/esc.js';
import { initRenderSystem, renderSystem } from './systems/renderSystem.js';
import { initInput, inputSystem } from './systems/inputSystem.js';
import { Position, Renderable, Health, Path, Enemy, Velocity} from './components/index.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ENEMY_TYPES, PATH_WAYPOINTS } from './game/config';
import { towerSystem } from './systems/towerSystem.js';
import { projectileSystem } from './systems/projectileSystem.js';
import { movementSystem } from './systems/simpleMovementSystem.js';
import { getWaveInfo, startWave, waveSystem, resetWaves } from './systems/waveSystem.js';
import { cleanupSystem, isGameOver, resetGameOver } from './systems/cleanupSystem.js';
import { economySystem, getGold, getLives, resetEconomy } from './systems/economySystem.js';
import { TOWER_TYPES } from './game/config.js';
import { getSelectedTowerType, setSelectedTowerType } from './systems/inputSystem.js';




const canvas = document.getElementById('gameCanvas');
initRenderSystem(canvas);
initInput(canvas);

let world = createWorld();

const initWorld = () => {
  world = createWorld();

  // Kreiraj path entitet
  world = createEntity(world);
  const pathEntityId = world.nextEntityId - 1;
  world = addComponent(pathEntityId, 'path', Path(PATH_WAYPOINTS), world);

  console.log('✅ World initialized:', world);
  return world;
};

world = initWorld();

const spawnEnemy = (world, type = ENEMY_TYPES.BASIC) => {
    const config = ENEMY_TYPES[type];
    const StartPos = PATH_WAYPOINTS[0];

    const newWorld = createEntity(world);
    const entityId = newWorld.nextEntityId - 1;

    return R.pipe(
        addComponent(entityId, 'position', Position(StartPos.x, StartPos.y)),
        addComponent(entityId, 'health', Health(config.health, config.health)),
        addComponent(entityId, 'enemy', Enemy(config.speed, config.reward)),
        addComponent(entityId, 'path', Path(PATH_WAYPOINTS)),
        addComponent(entityId, 'renderable', Renderable('circle', config.color, config.size))
    )(newWorld);
}


const updateUI = (world) => {
  if (!world || !world.entities) return world;

  const enemies = world.entities.filter(e => e.components.enemy).length;
  const towers = world.entities.filter(e => e.components.tower).length;
  const gold = getGold();
  console.log('spendGold:', typeof spendGold);
  const lives = getLives();

  
  document.getElementById('enemies').textContent = enemies;
  document.getElementById('towers').textContent = towers;
  document.getElementById('gold').textContent = gold;
  document.getElementById('lives').textContent = lives;

  const selectedType = getSelectedTowerType();
  document.querySelectorAll('button[id^="btn-tower"]').forEach(btn => {
    const type = btn.id.includes('basic') ? 'BASIC' : 'SNIPER';
    const cost = TOWER_TYPES[type].cost;
    
    // Disable ako nema dovoljno golda
    btn.disabled = gold < cost;
    btn.style.opacity = gold < cost ? '0.5' : '1';
    
    // Highlight selected
    if (type === selectedType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  return world;
};

const restartGame = () => {
  console.log('🔄 Restarting game...');

  // Reset all game state
  world = initWorld();
  resetEconomy();
  resetGameOver();
  resetWaves();
  lastTime = 0;

  // Restart game loop
  requestAnimationFrame(gameLoop);

  console.log('✅ Game restarted!');
};

let lastTime = 0;
let gameLoopRunning = true;

const gameLoop = (currentTime) => {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Check for game over
  if (isGameOver()) {
    if (gameLoopRunning) {
      console.log('💀 GAME OVER! Press R to restart');
      gameLoopRunning = false;
    }
    return; // Stop the game loop
  }

  // Update world time
  world = {
    ...world,
    time: currentTime,
    deltaTime: deltaTime
  };


  world = inputSystem(world);
  world = waveSystem(world, PATH_WAYPOINTS);
  world = movementSystem(world);
  world = towerSystem(world);
  world = projectileSystem(world);
  world = economySystem(world);
  world = cleanupSystem(world);
  world = renderSystem(world);
  world = updateUI(world);

  requestAnimationFrame(gameLoop);
};

document.getElementById('btn-spawn-enemy').addEventListener('click', () => {
  startWave();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    startWave();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    gameLoopRunning = true;
    restartGame();
  }
});

document.querySelectorAll('button[id^="btn-tower"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.id.includes('basic') ? 'BASIC' : 'SNIPER';
    console.log('🎯 Tower button clicked:', type);

    // Update selection
    setSelectedTowerType(type);

    document.querySelectorAll('button[id^="btn-tower"]').forEach(b =>
      b.classList.remove('active')
    );
    btn.classList.add('active');
  });
});



// Start game loop
requestAnimationFrame(gameLoop);