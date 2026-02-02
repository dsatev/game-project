import * as R from 'ramda';
import { createWorld, createEntity, addComponent} from './core/esc.js';
import { initRenderSystem, renderSystem } from './systems/renderSystem.js';
import { initInput, inputSystem, initUIState } from './systems/inputSystem.js';
import { Path } from './components/index.js';
import { towerSystem } from './systems/towerSystem.js';
import { movementSystem } from './systems/simpleMovementSystem.js';
import { projectileSystem } from './systems/projectileSystem.js';
import { waveSystem, startWave, initWaveState } from './systems/waveSystem.js';
import { cleanupSystem, isGameOver, initGameState } from './systems/cleanupSystem.js';
import { getGold, getLives, initEconomyState } from './systems/economySystem.js';
import { TOWER_TYPES, PATH_WAYPOINTS } from './game/config.js';
import { getSelectedTowerType, setSelectedTowerType } from './systems/inputSystem.js';

const canvas = document.getElementById('gameCanvas');
initRenderSystem(canvas);
initInput(canvas);

const createInitialWorld = () => {
  let world = createWorld();

  world = R.assoc('economyState', initEconomyState(), world);
  world = R.assoc('gameState', initGameState(), world);
  world = R.assoc('uiState', initUIState(), world);
  world = R.assoc('waveState', initWaveState(), world);

  world = createEntity(world);
  const pathEntityId = world.nextEntityId - 1;
  world = addComponent(pathEntityId, 'path', Path(PATH_WAYPOINTS), world);

  return world;
};

let world = createInitialWorld();

const updateUI = (world) => {
  if (!world || !world.entities) return world;

  const enemies = world.entities.filter(e => e.components.enemy).length;
  const towers = world.entities.filter(e => e.components.tower).length;
  const gold = getGold(world);
  const lives = getLives(world);

  document.getElementById('enemies').textContent = enemies;
  document.getElementById('towers').textContent = towers;
  document.getElementById('gold').textContent = gold;
  document.getElementById('lives').textContent = lives;

  const selectedType = getSelectedTowerType(world);
  
  const updateButtonState = (btn) => {
    const typeMap = {
      'basic': 'BASIC',
      'sniper': 'SNIPER',
      'aoe': 'AOE'
    };
    
    const btnType = Object.entries(typeMap).find(([key]) => 
      btn.id.includes(key)
    )?.[1] || 'BASIC';
    
    const cost = TOWER_TYPES[btnType].cost;
    const canAfford = gold >= cost;
    
    btn.disabled = !canAfford;
    btn.style.opacity = canAfford ? '1' : '0.5';
    
    if (btnType === selectedType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  };

  document.querySelectorAll('button[id^="btn-tower"]').forEach(updateButtonState);

  return world;
};

const restartGame = () => {
  lastTime = 0;
  world = createInitialWorld();
  gameLoopRunning = true;
  document.getElementById('gameOverModal').classList.add('hidden');
  requestAnimationFrame(gameLoop);
};

// Funkcija za prikaz game over poruke
const showGameOverScreen = () => {
  console.log('showGameOverScreen pozvan!');
  const modal = document.getElementById('gameOverModal');
  const title = document.getElementById('gameOverTitle');
  const message = document.getElementById('gameOverMessage');
  
  if (!modal || !title || !message) {
    console.error('Modal elementi nisu pronađeni! modal:', modal, 'title:', title, 'message:', message);
    return;
  }
  
  const waveInfo = world.waveState;
  const totalWaves = 4; // WAVES.length
  const currentWave = waveInfo ? waveInfo.currentWaveIndex : 0;
  const lives = getLives(world);
  
  console.log('currentWave:', currentWave, 'totalWaves:', totalWaves, 'lives:', lives);
  console.log('waveState:', waveInfo);
  
  // Pobjeđujemo ako su svi valovi završeni (currentWave >= totalWaves) i još imamo živote
  const isVictory = currentWave >= totalWaves && lives > 0;
  
  console.log('isVictory:', isVictory);
  console.log('Removing hidden class from modal');
  
  modal.classList.remove('hidden');
  
  console.log('Modal classList:', modal.classList);
  
  if (isVictory) {
    title.textContent = 'VICTORY!';
    title.className = 'victory';
    message.innerHTML = `
      <strong>You defeated all waves!</strong><br>
      Final Gold: ${getGold(world)}<br>
      Lives Remaining: ${lives}<br>
      <br>Press R or click Restart to play again.
    `;
  } else {
    title.textContent = 'DEFEAT!';
    title.className = 'defeat';
    message.innerHTML = `
      <strong>You ran out of lives!</strong><br>
      Final Gold: ${getGold(world)}<br>
      Wave Reached: ${currentWave} / ${totalWaves}<br>
      <br>Press R or click Restart to try again.
    `;
  }
  
  console.log('Game Over screen displayed!');
};

let lastTime = 0;
let gameLoopRunning = true;

const systemsPipeline = R.curry((deltaTime, pathWaypoints) => 
  R.pipe(
    inputSystem,
    w => waveSystem(w, pathWaypoints),
    movementSystem,
    towerSystem,
    projectileSystem,
    cleanupSystem,
    renderSystem,
    updateUI
  )
);

const gameLoop = (currentTime) => {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  if (isGameOver(world)) {
    console.log('GAME OVER DETECTED! calling showGameOverScreen()');
    if (gameLoopRunning) {
      gameLoopRunning = false;
      showGameOverScreen();
    }
    // Keep rendering the final frame, don't return
  } else {
    // Only run systems if game is not over
    world = R.assoc('time', currentTime, world);
    world = R.assoc('deltaTime', deltaTime, world);
    world = systemsPipeline(deltaTime, PATH_WAYPOINTS)(world);
  }

  requestAnimationFrame(gameLoop);
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    world = startWave(world);
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    restartGame();
  } else if (e.code === 'KeyT') {
    // Test - simulira pobjedu
    e.preventDefault();
    world.waveState.currentWaveIndex = 5;
    console.log('Test mode - skipped to wave 5 (victory condition)');
  }
});

const handleTowerButtonClick = (btn) => {
  return () => {
    const typeMap = {
      'basic': 'BASIC',
      'sniper': 'SNIPER',
      'aoe': 'AOE'
    };
    
    const btnType = Object.entries(typeMap).find(([key]) => 
      btn.id.includes(key)
    )?.[1] || 'BASIC';

    world = setSelectedTowerType(btnType, world);
  };
};

document.querySelectorAll('button[id^="btn-tower"]').forEach(btn => {
  btn.addEventListener('click', handleTowerButtonClick(btn));
});

// Restart button u modal-u
document.getElementById('restartBtn').addEventListener('click', restartGame);

requestAnimationFrame(gameLoop);